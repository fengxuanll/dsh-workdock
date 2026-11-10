import { defineDomain } from '@deepseek-ai/dsh-storage-domain';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { z } from 'zod';
import { ProjectManager, projectContext, LABEL_COLORS, HEX_COLOR } from '../core.js';
import { openDirectory } from '../folder-opener.js';

export const inject = ['storageDomain', 'commands', 'tools', 'systemPrompt', 'workspaceRegistry', 'connection', 'agents'];
const project = z.object({ id: z.string(), title: z.string(), folders: z.array(z.string()).min(1), primary: z.string(), sessionRoots: z.array(z.string()), pinned: z.boolean(), revision: z.number(), lastUsedAt: z.number().nonnegative().optional() });
const labelColor = z.union([z.enum(LABEL_COLORS), z.string().length(7).regex(HEX_COLOR)]);
const spec = defineDomain({ name: 'dsh_project_manager', version: 1, tables: {}, global: {
  schema: z.object({ projects: z.array(project), bindings: z.record(z.string(), z.string()), colors: z.record(z.string(), labelColor).optional(), sessionDirectories: z.record(z.string(), z.object({ path: z.string().nullable(), revision: z.number().int().nonnegative() })).optional() }),
  initial: { projects: [], bindings: {} }
} });

export async function apply(ctx) {
  const domain = await ctx.storageDomain.open(spec);
  ctx.effect(() => () => domain.close());
  const manager = new ProjectManager(domain.global);
  let syncTail = Promise.resolve();
  function syncWorkspaces() {
    const operation = syncTail.then(async () => {
      const warnings = [];
      for (const project of manager.snapshot().projects) {
        try {
          // Reuse the original Workspace across primary-directory changes so
          // existing sessions keep their tree membership and history.
          const workspaces = ctx.workspaceRegistry.list();
          const workspace = workspaces.find(item => item.path === project.primary)
            ?? workspaces.find(item => project.sessionRoots.includes(item.path))
            ?? await ctx.workspaceRegistry.create(project.primary, project.title);
          if (workspace.title !== project.title) await workspace.setTitle(project.title);
        } catch (error) {
          warnings.push(`${project.title}: ${error.message}`);
        }
      }
      return warnings;
    });
    syncTail = operation.catch(() => {});
    return operation;
  }
  // Backfill projects created by earlier versions immediately on activation.
  await syncWorkspaces();
  function directoryApplier(agent, signal) {
    return async path => {
      if (path === null) return;
      const working = agent.ctx.get('workingDirectory');
      if (!working) throw new Error('当前 Agent 未提供 workingDirectory 服务');
      if (working.get(agent.session) !== path) await working.set(agent, path, signal);
      if (working.get(agent.session) !== path) throw new Error('workingDirectory.set 未应用目标目录，请重试');
    };
  }
  const inheritanceWarnings = new Map();
  async function initialize(agent, source) {
    if (!agent) return;
    await manager.run(async () => {
      const session = agent.session, id = session.header.id ?? session.id;
      if (!session.header.parentSession || Object.hasOwn(manager.snapshot().sessionDirectories ?? {}, id)) return;
      // Core subagent setup sets child cwd before agent/created, including an
      // explicitly requested child cwd. Do not require its parent to stay live.
      const creationPath = agent.ctx.get('workingDirectory')?.get(session) ?? session.header.cwd;
      await manager.inherit(session, undefined, creationPath, source !== 'startup');
      if (source !== 'startup') inheritanceWarnings.set(id, '旧会话或插件激活前创建的子会话无法追溯创建时目录；已独立保存首次观察到的当前目录');
    });
  }
  async function enforce(agent, signal) {
    if (!agent) return;
    await initialize(agent);
    await manager.run(async () => {
      const directory = await manager.validatedDirectory(agent.session);
      await directoryApplier(agent, signal)(directory.effectivePath);
    });
  }
  async function operate(args, agent, signal) {
    await initialize(agent);
    const changesDirectory = ['save', 'bind', 'remove', 'set_session_directory'].includes(args.action);
    const result = await manager.execute(args, agent?.session, changesDirectory && agent ? directoryApplier(agent, signal) : undefined);
    const warning = agent && inheritanceWarnings.get(agent.session.header.id ?? agent.session.id);
    if (warning) result.inheritanceWarnings = [warning];
    if (args.action === 'list' || args.action === 'save' || args.action === 'bind') {
      const syncWarnings = await syncWorkspaces();
      if (syncWarnings.length) result.syncWarnings = syncWarnings;
    }
    return result;
  }
  async function checkDirectories(folders) {
    return (await Promise.all([...new Set(folders)].map(async path => {
      try { await manager.canonical(path); return null; }
      catch (error) { return { path, error: error.message }; }
    }))).filter(Boolean);
  }
  async function perform(args, agent, signal) {
    if (args.action === 'check_directories') return { directoryWarnings: await checkDirectories(args.folders ?? []) };
    if (args.action === 'open_folder') {
      const workspace = args.workspaceId ? ctx.workspaceRegistry.list().find(item => item.id === args.workspaceId) : null;
      const projects = manager.snapshot().projects;
      const project = args.id ? projects.find(item => item.id === args.id)
        : workspace && (projects.find(item => item.primary === workspace.path)
          ?? projects.find(item => item.sessionRoots.includes(workspace.path)));
      if (!project && !workspace) throw new Error('项目或工作区不存在，请刷新项目列表');
      const path = await manager.canonical(project?.primary ?? workspace.path);
      await openDirectory(path);
      return { path };
    }
    const result = await operate(args, agent, signal);
    if (args.action === 'list') {
      result.directoryWarnings = (await Promise.all(result.projects.map(async project =>
        (await checkDirectories(project.folders)).map(warning => ({ ...warning, projectId: project.id }))
      ))).flat();
    }
    return result;
  }
  const apiSchema = z.object({
    sessionId:z.string().min(1).max(500).optional(),
    args:z.object({
      action:z.enum(['list','save','bind','remove','pin','open_folder','check_directories','touch','set_color','get_session_directory','set_session_directory']),
       path:z.string().max(32768).nullable().optional(), directoryRevision:z.number().int().nonnegative().optional(),
       directoryPolicy:z.enum(['keep','follow']).optional(),
      target:z.enum(['project','workspace','session']).optional(),color:labelColor.nullable().optional(),
      id:z.string().max(500).optional(),title:z.string().max(500).optional(),
      folders:z.array(z.string().max(32768)).max(128).optional(),primary:z.string().max(32768).optional(),
      revision:z.number().int().nonnegative().optional(),workspaceId:z.string().max(500).optional(),
    }),
  });
  // Exact Fetch routes are admitted by Connection's authenticated owner-only
  // transport. They do not execute Commands or append command/run|done events.
  ctx.effect(()=>ctx.connection.fetch.register({
    path:'/api/dsh-workdock',methods:['POST'],requestBody:'buffered',
    async fetch(request) {
      const json=(status,value)=>Response.json(value,{status,headers:{'cache-control':'no-store'}});
      try {
        if(request.signal.aborted)return json(499,{ok:false,error:'请求已取消'});
        const text=await request.text();
        if(text.length>131072)return json(413,{ok:false,error:'项目配置过大'});
        let payload;
        try{payload=apiSchema.parse(JSON.parse(text));}catch{return json(400,{ok:false,error:'项目管理请求参数无效'});}
        const agent=payload.sessionId?ctx.agents.get(payload.sessionId):undefined;
        if ((payload.sessionId && (!agent || (agent.session.header.id ?? agent.session.id) !== payload.sessionId)) || (!agent && ['save','bind','get_session_directory','set_session_directory'].includes(payload.args.action))) return json(409,{ok:false,error:'当前聊天尚未就绪，请打开聊天后重试'});
        const mutation = ['save','bind','remove','set_session_directory'].includes(payload.args.action);
        let value;
        if (mutation && agent) {
          if (!agent.runMaintenance) return json(409,{ok:false,error:'当前会话无法安全修改配置，请重新打开聊天后重试'});
          try { value = await agent.runMaintenance(signal => perform(payload.args, agent, AbortSignal.any([signal, request.signal]))); }
          catch (error) {
            if (/already has active work/.test(error.message)) return json(409,{ok:false,error:'当前会话正在执行任务，请完成后重试'});
            throw error;
          }
        } else value=await perform(payload.args,agent,request.signal);
        return json(200,{ok:true,value});
      }catch(error){return json(400,{ok:false,error:error.message});}
    },
  }));
  // Explicitly typed slash commands retain their normal visible command result.
  ctx.commands.register({ name: 'projects', description: '管理多目录项目和主要目录', input: { hint: 'JSON 操作参数；留空查看项目' },
    async handler({ rawInput, agent, signal }) {
      try {
        const value = await perform(rawInput.trim() ? JSON.parse(rawInput) : { action: 'list' }, agent, signal);
        return { kind: 'success', text: JSON.stringify(value) };
      } catch (error) { return { kind: 'error', text: error.message }; }
    }
  });
  ctx.tools.register(defineTool({ name: 'project_manager', description: 'List, save, bind, pin or remove projects; get_session_directory or set_session_directory manages this session working directory. Set path=null to explicitly follow project primary, otherwise use a canonical absolute existing directory. Set requires directoryRevision from get/list. Switching projects with a session override requires explicit user choice directoryPolicy keep/follow and matching directoryRevision; editing the same project preserves it. Directory selection grants no extra permissions. Only change configuration with normal user authorization. Removing a project never deletes files or session overrides.',
    parameters: {
      action: { type: 'string', required: true, enum: ['list', 'save', 'bind', 'remove', 'pin', 'get_session_directory', 'set_session_directory'] },
      id: { type: 'string' }, title: { type: 'string' }, folders: { type: 'array', items: { type: 'string' } },
      primary: { type: 'string' }, revision: { type: 'number' },
      path: { oneOf: [{ type: 'string' }, { type: 'null' }] }, directoryRevision: { type: 'integer' },
      directoryPolicy: { type: 'string', enum: ['keep', 'follow'] }
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { json: { type: 'string', required: true } } },
      render: (_args, value) => [{ type: 'text', text: value.json }] },
    async execute(args, exec) {
      if (!exec.agent) throw new Error('需要活动会话');
      return { json: JSON.stringify(await operate(args, exec.agent, exec.signal)) };
    }
  }));
  ctx.systemPrompt.context({ name: 'dsh-workdock:project', order: 41, required: true, interpolate: false,
    text(context) { const session = context.agent?.session; return session ? projectContext(manager.projectFor(session), manager.directoryFor(session)) : ''; }
  });
  // AgentRegistry awaits this serial event before creation completes. Queue the
  // inheritance snapshot with project/directory mutations, so children diverge.
  ctx.on('agent/created', async ({ agent, source }) => { await initialize(agent, source); }, { prepend: true });
  ctx.on('system-prompt/assemble', async (_assembly, context, next) => { await enforce(context.agent, context.signal); return next(); }, { prepend: true });
  ctx.on('tools/execute', async (exec, next) => {
    await enforce(exec.agent, exec.signal);
    return next();
  }, { prepend: true });
}

