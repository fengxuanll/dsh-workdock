import { defineDomain } from '@deepseek-ai/dsh-storage-domain';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { z } from 'zod';
import { ProjectManager, projectContext } from '../core.js';

export const inject = ['storageDomain', 'commands', 'tools', 'systemPrompt', 'workspaceRegistry'];
const project = z.object({ id: z.string(), title: z.string(), folders: z.array(z.string()).min(1), primary: z.string(), sessionRoots: z.array(z.string()), pinned: z.boolean(), section: z.string(), revision: z.number() });
const spec = defineDomain({ name: 'dsh_project_manager', version: 1, tables: {}, global: {
  schema: z.object({ projects: z.array(project), bindings: z.record(z.string(), z.string()) }),
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
  async function enforce(agent, signal) {
    if (!agent) return;
    const project = manager.projectFor(agent.session);
    if (!project) return;
    // Resolve from the agent composition: execution services can be agent-scoped.
    const working = agent.ctx.get('workingDirectory');
    if (!working) throw new Error('当前 Agent 未提供 workingDirectory 服务');
    await manager.canonical(project.primary);
    if (working.get(agent.session) !== project.primary) await working.set(agent, project.primary, signal);
  }
  async function operate(args, agent, signal) {
    const result = await manager.execute(args, agent.session);
    if (args.action !== 'list') await enforce(agent, signal);
    if (args.action === 'list' || args.action === 'save' || args.action === 'bind') {
      const syncWarnings = await syncWorkspaces();
      if (syncWarnings.length && args.action !== 'list') {
        throw new Error(`项目配置已保存，但同步左侧工作区失败：\n${syncWarnings.join('\n')}`);
      }
      if (syncWarnings.length) result.syncWarnings = syncWarnings;
    }
    return result;
  }
  ctx.commands.register({ name: 'projects', description: '管理多目录项目和主要目录', input: { hint: 'JSON 操作参数；留空查看项目' },
    async handler({ rawInput, agent, signal }) {
      try {
        const value = await operate(rawInput.trim() ? JSON.parse(rawInput) : { action: 'list' }, agent, signal);
        return { kind: 'success', text: JSON.stringify(value) };
      } catch (error) { return { kind: 'error', text: error.message }; }
    }
  });
  ctx.tools.register(defineTool({ name: 'project_manager', description: 'List, save, bind, pin, group or remove multi-directory projects. The primary directory controls subsequent work. Removing a project never deletes files.',
    parameters: {
      action: { type: 'string', required: true, enum: ['list', 'save', 'bind', 'remove', 'pin', 'section'] },
      id: { type: 'string' }, title: { type: 'string' }, folders: { type: 'array', items: { type: 'string' } },
      primary: { type: 'string' }, revision: { type: 'number' }, section: { type: 'string' }
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { json: { type: 'string', required: true } } },
      render: (_args, value) => [{ type: 'text', text: value.json }] },
    async execute(args, exec) {
      if (!exec.agent) throw new Error('需要活动会话');
      return { json: JSON.stringify(await operate(args, exec.agent, exec.signal)) };
    }
  }));
  ctx.systemPrompt.context({ name: 'dsh-project-manager:project', order: 41, required: true, interpolate: false,
    text(context) { const p = context.agent && manager.projectFor(context.agent.session); return p ? projectContext(p) : ''; }
  });
  ctx.on('system-prompt/assemble', async (_assembly, context, next) => { await enforce(context.agent, context.signal); return next(); }, { prepend: true });
  ctx.on('tools/execute', async (exec, next) => {
    await enforce(exec.agent, exec.signal);
    return next();
  }, { prepend: true });
}

