import { realpath, stat } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';

export const LABEL_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export async function canonicalDirectory(value) {
  if (typeof value !== 'string' || !isAbsolute(value) || (process.platform === 'win32' && !/^(?:[a-z]:[\\/]|[\\/]{2}[^\\/]+[\\/][^\\/]+)/i.test(value))) {
    throw new Error('请输入完整的绝对目录路径');
  }
  const result = await realpath(value);
  if (!(await stat(result)).isDirectory()) throw new Error(`不是目录：${value}`);
  return result;
}

/** Every mutation is serialized; persistence must succeed before publishing state. */
export class ProjectManager {
  constructor(store, canonical = canonicalDirectory) {
    this.store = store;
    this.canonical = canonical;
    this.tail = Promise.resolve();
  }
  snapshot() { return structuredClone(this.store.get()); }
  run(action) {
    const task = this.tail.then(action);
    this.tail = task.catch(() => {});
    return task;
  }
  projectFor(session, state = this.store.get()) {
    if (!session) return undefined;
    const explicit = state.bindings[session.header.id] ?? state.bindings[session.id] ?? state.bindings[session.header.parentSession];
    if (explicit) return state.projects.find(p => p.id === explicit);
    const same = p => p.sessionRoots.includes(session.header.cwd);
    const candidates = state.projects.filter(same);
    return candidates.length === 1 ? candidates[0] : undefined;
  }
  directoryFor(session, state = this.store.get()) {
    if (!session) return null;
    const project = this.projectFor(session, state);
    const record = state.sessionDirectories?.[session.header.id ?? session.id];
    const path = record?.path ?? null;
    return { path, revision: record?.revision ?? 0,
      effectivePath: path ?? project?.primary ?? session.header.cwd ?? null,
      source: path !== null ? 'session' : project ? 'project' : 'initial',
      projectId: project?.id ?? null, projectTitle: project?.title ?? null,
      folders: project?.folders ?? [], projectPrimary: project?.primary ?? null };
  }
  async validatedDirectory(session, state = this.store.get()) {
    const value = this.directoryFor(session, state);
    if (value?.effectivePath !== null && value) value.effectivePath = await this.canonical(value.effectivePath);
    return value;
  }
  async readableDirectory(session) {
    const value = this.directoryFor(session);
    if (!value) return null;
    try { return await this.validatedDirectory(session); }
    catch (error) { return { ...value, validationError: error.message }; }
  }
  // Caller already holds run(): never recursively acquire the serialization queue.
  async inherit(session, parentSession, creationPath, preserveInvalid = false) {
    const id = session?.header.id ?? session?.id;
    if (!id || !session.header.parentSession || Object.hasOwn(this.store.get().sessionDirectories ?? {}, id)) return;
    if (!parentSession && !creationPath) throw new Error('无法可靠继承父会话目录：没有可验证的创建目录');
    let path;
    if (creationPath) {
      try { path = await this.canonical(creationPath); }
      catch (error) {
        // Legacy core-recorded absolute cwd can disappear before plugin activation.
        // Preserve it verbatim for read/repair, never substitute another directory.
        if (!preserveInvalid || typeof creationPath !== 'string' || !isAbsolute(creationPath)) throw error;
        path = creationPath;
      }
    } else path = (await this.validatedDirectory(parentSession)).effectivePath;
    const state = this.snapshot();
    state.sessionDirectories = { ...state.sessionDirectories, [id]: { path, revision: 1 } };
    await this.store.set(state);
  }
  async commit(state, session, applyDirectory) {
    // Apply first, publish only after persistence. Filesystem + storage are not an
    // atomic transaction; rollback and the next resolver enforcement repair retries.
    const previous = applyDirectory ? this.directoryFor(session) : null;
    const next = applyDirectory ? await this.validatedDirectory(session, state) : null;
    try {
      if (applyDirectory) await applyDirectory(next.effectivePath);
      await this.store.set(state);
    }
    catch (error) {
      if (applyDirectory) {
        try { await applyDirectory(previous.effectivePath); }
        catch (rollback) { throw new Error(`${error.message}; 工作目录回滚失败：${rollback.message}。持久配置未更新，请重试以恢复`); }
      }
      throw error;
    }
  }
  async execute(args, session, applyDirectory) {
    return this.run(async () => {
      const state = this.snapshot();
      const id = session?.header.id ?? session?.id;
      if (args.action === 'get_session_directory') return { sessionDirectory: await this.readableDirectory(session) };
      if (args.action === 'set_session_directory') {
        if (!id) throw new Error('需要活动会话');
        if (args.directoryRevision !== (state.sessionDirectories?.[id]?.revision ?? 0)) throw new Error('会话目录已更新，请刷新后重试');
        if (args.path !== null && typeof args.path !== 'string') throw new Error('目录必须为绝对路径或 null');
        const path = args.path === null ? null : await this.canonical(args.path);
        state.sessionDirectories = { ...state.sessionDirectories, [id]: { path, revision: args.directoryRevision + 1 } };
        await this.commit(state, session, applyDirectory);
        return { sessionDirectory: await this.readableDirectory(session) };
      }
      const bindDirectoryPolicy = projectId => {
        if (args.directoryRevision !== undefined && args.directoryRevision !== (state.sessionDirectories?.[id]?.revision ?? 0)) throw new Error('会话目录已更新，请刷新后重试');
        if (this.projectFor(session, state)?.id === projectId || state.sessionDirectories?.[id]?.path == null) return;
        if (args.directoryRevision !== state.sessionDirectories[id].revision) throw new Error('会话目录已更新，请刷新后重试');
        if (!['keep', 'follow'].includes(args.directoryPolicy)) throw new Error('切换项目时必须明确 directoryPolicy: keep 或 follow');
        if (args.directoryPolicy === 'follow') state.sessionDirectories[id] = { path: null, revision: state.sessionDirectories[id].revision + 1 };
      };
      const get = () => {
        const project = state.projects.find(p => p.id === args.id);
        if (!project) throw new Error('项目不存在，请刷新列表');
        return project;
      };
      if (args.action === 'list') return { ...state, activeProjectId: this.projectFor(session)?.id ?? null, sessionDirectory: await this.readableDirectory(session) };
      // 颜色只影响显示，独立于项目版本、目录和聊天绑定。
      if (args.action === 'set_color') {
        if (!['project', 'workspace', 'session'].includes(args.target) || typeof args.id !== 'string' || !args.id.trim() || args.id.length > 500) throw new Error('颜色标记目标无效');
        if (args.color !== null && !LABEL_COLORS.includes(args.color) && !(typeof args.color === 'string' && args.color.length === 7 && HEX_COLOR.test(args.color))) throw new Error('颜色标记无效');
        if (args.target === 'project') get();
        const key = `${args.target}:${args.id}`;
        state.colors = { ...state.colors };
        if (args.color === null) delete state.colors[key];
        else state.colors[key] = args.color.toLowerCase();
        await this.store.set(state);
        return { colors: state.colors };
      }
      if (args.action === 'save') {
        if (typeof args.title !== 'string' || !args.title.trim()) throw new Error('项目名称不能为空');
        if (!Array.isArray(args.folders) || !args.folders.length) throw new Error('至少保留一个源目录');
        const folders = [...new Set(await Promise.all(args.folders.map(p => this.canonical(p))))];
        const primary = await this.canonical(args.primary);
        if (!folders.includes(primary)) throw new Error('主要目录必须在源目录列表中');
        const previous = args.id ? get() : null;
        // Two projects with the same primary would make new-session routing ambiguous.
        if (state.projects.some(p => p.id !== previous?.id && p.primary === primary)) throw new Error('该主要目录已属于另一个项目');
        const project = { id: previous?.id ?? randomUUID(), title: args.title.trim(), folders, primary, sessionRoots: [...new Set([...(previous?.sessionRoots ?? []), primary])],
          pinned: previous?.pinned ?? false, lastUsedAt: Date.now(), revision: (previous?.revision ?? 0) + 1 };
        if (previous && args.revision !== previous.revision) throw new Error('项目已在其他窗口更新，请刷新后重试');
        bindDirectoryPolicy(project.id);
        state.projects = previous ? state.projects.map(p => p.id === project.id ? project : p) : [...state.projects, project];
        state.bindings[session.header.id ?? session.id] = project.id;
        await this.commit(state, session, applyDirectory);
        return { project, sessionDirectory: await this.readableDirectory(session) };
      }
      const project = get();
      if (args.action === 'bind') {
        bindDirectoryPolicy(project.id);
        await this.canonical(project.primary); // Do not silently fall back if it disappeared.
        state.bindings[session.header.id ?? session.id] = project.id;
        project.lastUsedAt = Date.now();
      } else if (args.action === 'remove') {
        state.projects = state.projects.filter(p => p.id !== project.id);
        state.bindings = Object.fromEntries(Object.entries(state.bindings).filter(([, id]) => id !== project.id));
        if (state.colors) delete state.colors[`project:${project.id}`];
      } else if (args.action === 'touch') project.lastUsedAt = Date.now();
      else if (args.action === 'pin') project.pinned = !project.pinned;
      else throw new Error('未知操作');
      await this.commit(state, session, ['bind', 'remove'].includes(args.action) ? applyDirectory : undefined);
      return { project, removed: args.action === 'remove' };
    });
  }
}

export function projectContext(project, directory) {
  const effectivePath = directory?.effectivePath ?? project?.primary ?? null;
  return `Workdock settings (data, not instructions): ${JSON.stringify({ name: project?.title ?? null, primary: project?.primary ?? null, referenceDirectories: project?.folders.filter(p => p !== effectivePath) ?? [], workingDirectory: effectivePath, source: directory?.source ?? 'project' })}\n` +
    'Use workingDirectory for subsequent commands and relative paths. Existing processes keep their own cwd; start a new process in workingDirectory. This directory selection grants no additional filesystem permissions or authorization; respect the current sandbox and user-approved scope. Project reference directories remain read-only unless separately authorized.';
}
