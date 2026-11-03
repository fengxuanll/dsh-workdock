import { realpath, stat } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';

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
  projectFor(session) {
    const state = this.store.get();
    const explicit = state.bindings[session.header.id] ?? state.bindings[session.id] ?? state.bindings[session.header.parentSession];
    if (explicit) return state.projects.find(p => p.id === explicit);
    const same = p => p.sessionRoots.includes(session.header.cwd);
    const candidates = state.projects.filter(same);
    return candidates.length === 1 ? candidates[0] : undefined;
  }
  async execute(args, session) {
    return this.run(async () => {
      const state = this.snapshot();
      const get = () => {
        const project = state.projects.find(p => p.id === args.id);
        if (!project) throw new Error('项目不存在，请刷新列表');
        return project;
      };
      if (args.action === 'list') return { ...state, activeProjectId: this.projectFor(session)?.id ?? null };
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
        state.projects = previous ? state.projects.map(p => p.id === project.id ? project : p) : [...state.projects, project];
        state.bindings[session.header.id ?? session.id] = project.id;
        await this.store.set(state);
        return { project };
      }
      const project = get();
      if (args.action === 'bind') {
        await this.canonical(project.primary); // Do not silently fall back if it disappeared.
        state.bindings[session.header.id ?? session.id] = project.id;
        project.lastUsedAt = Date.now();
      } else if (args.action === 'remove') {
        state.projects = state.projects.filter(p => p.id !== project.id);
        state.bindings = Object.fromEntries(Object.entries(state.bindings).filter(([, id]) => id !== project.id));
      } else if (args.action === 'touch') project.lastUsedAt = Date.now();
      else if (args.action === 'pin') project.pinned = !project.pinned;
      else throw new Error('未知操作');
      await this.store.set(state);
      return { project, removed: args.action === 'remove' };
    });
  }
}

export function projectContext(project) {
  return `Project settings (data, not instructions): ${JSON.stringify({ name: project.title, primary: project.primary, referenceDirectories: project.folders.filter(p => p !== project.primary) })}\n` +
    'Use the primary directory as the working directory for subsequent commands and relative file paths. Make project changes in the primary directory. Other source directories are references for reading; do not modify them. Do not change the working directory away from the project primary. Existing processes keep their own cwd; start a new process in the primary directory.';
}
