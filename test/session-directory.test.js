import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProjectManager, projectContext } from '../core.js';
import { apply } from '../src/index.js';

const session = (id, cwd = '/initial', parentSession) => ({ header: { id, cwd, parentSession } });
function coreFixture() {
  let state = { projects: [], bindings: {} };
  const store = { get: () => state, set: async value => { state = structuredClone(value); } };
  const manager = new ProjectManager(store, async path => {
    if (!path || path === '/missing') throw Error('missing directory');
    return path;
  });
  return { manager, store };
}
const save = (m, s, primary, extra = {}) => m.execute({ action: 'save', title: primary, folders: [primary], primary, ...extra }, s);
const set = (m, s, path, directoryRevision, applyDirectory) => m.execute({ action: 'set_session_directory', path, directoryRevision }, s, applyDirectory);

test('resolver precedence, explicit follow, revisions, project switching and removal', async () => {
  const { manager: m, store } = coreFixture();
  const s = session('s');
  assert.equal(m.directoryFor(s).source, 'initial');
  assert.equal((await m.execute({ action: 'list' })).sessionDirectory, null);
  const { project: p } = await save(m, s, '/a');
  assert.equal(m.directoryFor(s).effectivePath, '/a');
  await set(m, s, '/override', 0);
  await assert.rejects(save(m, s, '/b'), /会话目录已更新/);
  await assert.rejects(save(m, s, '/b', { directoryRevision: 1 }), /directoryPolicy/);
  await save(m, s, '/b', { directoryRevision: 1, directoryPolicy: 'keep' });
  assert.equal(m.directoryFor(s).effectivePath, '/override');
  await assert.rejects(m.execute({ action: 'bind', id: p.id, directoryRevision: 0, directoryPolicy: 'follow' }, s), /会话目录已更新/);
  await m.execute({ action: 'bind', id: p.id, directoryRevision: 1, directoryPolicy: 'follow' }, s);
  assert.equal(m.directoryFor(s).path, null);
  assert.equal(m.directoryFor(s).revision, 2);
  await save(m, s, '/new-primary', { id: p.id, revision: p.revision });
  assert.equal(m.directoryFor(s).effectivePath, '/new-primary');
  await set(m, s, '/override', 2);
  await save(m, s, '/edited', { id: p.id, revision: 2 });
  assert.equal(m.directoryFor(s).effectivePath, '/override');
  await m.execute({ action: 'remove', id: p.id }, s);
  assert.equal(new ProjectManager(store).directoryFor(s).effectivePath, '/override');
  assert.equal(m.directoryFor(s).projectId, null);
});

test('first child snapshot is independent, explicit null blocks inheritance, queue does not deadlock', async () => {
  const { manager: m } = coreFixture();
  const p = session('parent'), c = session('child', '/child', 'parent');
  await set(m, p, '/parent-at-birth', 0);
  await Promise.all([m.run(() => m.inherit(c, p)), m.run(() => m.inherit(c, p))]);
  assert.equal(m.directoryFor(c).revision, 1);
  await set(m, p, '/later', 1);
  assert.equal(m.directoryFor(c).effectivePath, '/parent-at-birth');
  await set(m, c, null, 1);
  await m.run(() => m.inherit(c, p));
  assert.equal(m.directoryFor(c).path, null);
  assert.equal(m.directoryFor(c).effectivePath, '/child');
  await assert.rejects(m.run(() => m.inherit(session('orphan', '/child', 'gone'))), /无法可靠继承/);
});

test('concurrent revision checks and storage/apply failures never publish a new config', async () => {
  const { manager: m, store } = coreFixture();
  const s = session('s'); let cwd = '/initial';
  const apply = async path => { cwd = path; };
  const outcomes = await Promise.allSettled([set(m, s, '/a', 0, apply), set(m, s, '/b', 0, apply)]);
  assert.deepEqual(outcomes.map(x => x.status), ['fulfilled', 'rejected']);
  assert.equal(cwd, '/a');
  store.set = async () => { throw Error('disk full'); };
  await assert.rejects(set(m, s, '/b', 1, apply), /disk full/);
  assert.equal(cwd, '/a'); assert.equal(m.directoryFor(s).revision, 1);
  await assert.rejects(set(m, s, '/c', 1, async path => { cwd = path; if (path === '/c') throw Error('apply failed'); }), /apply failed/);
  assert.equal(cwd, '/a'); assert.equal(m.directoryFor(s).path, '/a');
  await assert.rejects(set(m, s, '/missing', 1, apply), /missing directory/);
  assert.equal(m.directoryFor(s).path, '/a');
});

test('a directory disappearing after persistence reports successful mutation plus validation error', async () => {
  let state = { projects: [], bindings: {} }, disappeared = false;
  const m = new ProjectManager({ get: () => state, set: async value => { state = structuredClone(value); disappeared = true; } }, async path => {
    if (disappeared) throw Error('directory disappeared after commit');
    return path;
  });
  const result = await set(m, session('s'), '/chosen', 0, async () => {});
  assert.equal(result.sessionDirectory.revision, 1);
  assert.equal(result.sessionDirectory.path, '/chosen');
  assert.match(result.sessionDirectory.validationError, /after commit/);
});

test('context uses resolved working directory and never grants extra permission', () => {
  const text = projectContext({ title: 'P', primary: '/project', folders: ['/project', '/ref'] }, { effectivePath: '/override', source: 'session' });
  assert.match(text, /"workingDirectory":"\/override"/);
  assert.match(text, /grants no additional filesystem permissions/);
  assert.doesNotMatch(text, /Do not change the working directory away/);
  const referenceCwd = projectContext({ title: 'P', primary: '/project', folders: ['/project', '/ref'] }, { effectivePath: '/ref', source: 'session' });
  assert.match(referenceCwd, /"referenceDirectories":\["\/project"\]/);
  assert.match(referenceCwd, /"workingDirectory":"\/ref"/);
});

test('source apply: real schema, live-only API, directory application, hooks and recovery', async () => {
  const root = await mkdtemp(join(tmpdir(), 'workdock-directory-'));
  const disposers = [], hooks = new Map(), agents = new Map();
  let route, state, failStore = false, failApply = false, busy = false, tool, prompt;
  try {
    const a = join(root, 'a'), b = join(root, 'b'), override = join(root, 'override');
    await Promise.all([a,b,override].map(path => mkdir(path)));
    const makeAgent = (id, parentSession) => {
      let cwd = root;
      const agent = { runMaintenance: async task => { if (busy) throw Error(`agent "${id}" already has active work`); return task(new AbortController().signal); }, session: session(id, root, parentSession), ctx: { get: () => ({ get: () => cwd, set: async (_agent, path) => { if (failApply) throw Error('working rejected'); cwd = path; } }) } };
      agents.set(id, agent); return { agent, cwd: () => cwd };
    };
    const parent = makeAgent('parent');
    await apply({
      storageDomain: { open: async spec => {
        state = spec.global.schema.parse(spec.global.initial);
        return { global: { get: () => state, set: async value => { if (failStore) throw Error('disk full'); state = spec.global.schema.parse(value); } }, close() {} };
      } },
      connection: { fetch: { register: value => { route = value; return () => {}; } } }, agents: { get: id => agents.get(id) },
      workspaceRegistry: { list: () => [], create: async (path, title) => ({ path, title }) },
      commands: { register() {} }, tools: { register: value => { tool = value; } },
      systemPrompt: { context: value => { prompt = value; } },
      on: (name, fn) => hooks.set(name, fn), effect: fn => disposers.push(fn()),
    });
    const post = async (args, sessionId = 'parent') => {
      const response = await route.fetch(new Request('https://host/api/dsh-workdock', { method: 'POST', body: JSON.stringify({ args, sessionId: sessionId ?? undefined }) }));
      return { status: response.status, ...await response.json() };
    };
    for (const action of ['get_session_directory', 'set_session_directory', 'list']) assert.equal((await post({ action, path: a, directoryRevision: 0 }, 'missing')).status, 409);
    assert.equal((await post({ action: 'list' }, null)).value.sessionDirectory, null);
    assert.equal((await post({ action: 'get_session_directory' })).value.sessionDirectory.source, 'initial');
    busy = true;
    assert.equal((await post({ action: 'set_session_directory', path: a, directoryRevision: 0 })).status, 409);
    assert.equal(state.sessionDirectories, undefined); busy = false;
    assert.equal((await post({ action: 'set_session_directory', path: 'relative', directoryRevision: 0 })).status, 400);
    assert.equal((await post({ action: 'set_session_directory', path: override, directoryRevision: 0 })).status, 200);
    assert.equal(parent.cwd(), await realpath(override));
    assert.equal((await post({ action: 'save', title: 'P', folders: [a], primary: a })).status, 400);
    const saved = await post({ action: 'save', title: 'P', folders: [a,b], primary: a, directoryPolicy: 'keep', directoryRevision: 1 });
    assert.equal(saved.status, 200); const p = saved.value.project;
    assert.equal(parent.cwd(), await realpath(override));
    const explicit = makeAgent('explicit', 'offline-parent');
    await explicit.agent.ctx.get('workingDirectory').set(explicit.agent, await realpath(b));
    await hooks.get('agent/created')({ agent: explicit.agent, source: 'startup' });
    assert.equal(state.sessionDirectories.explicit.path, await realpath(b));
    const legacy = makeAgent('legacy', 'offline-parent');
    const legacyRead = await post({ action: 'get_session_directory' }, 'legacy');
    assert.match(legacyRead.value.inheritanceWarnings[0], /无法追溯创建时目录/);
    assert.equal(state.sessionDirectories.legacy.path, await realpath(root));
    const invalidLegacy = makeAgent('invalid-legacy', 'offline-parent');
    const disappeared = join(root, 'already-gone');
    await invalidLegacy.agent.ctx.get('workingDirectory').set(invalidLegacy.agent, disappeared);
    const invalidLegacyRead = await post({ action: 'get_session_directory' }, 'invalid-legacy');
    assert.equal(invalidLegacyRead.status, 200);
    assert.equal(invalidLegacyRead.value.sessionDirectory.path, disappeared);
    assert.ok(invalidLegacyRead.value.sessionDirectory.validationError);
    assert.equal((await post({ action: 'set_session_directory', path: a, directoryRevision: 1 }, 'invalid-legacy')).status, 200);
    const child = makeAgent('child', 'parent');
    // Real core setup calls workingDirectory.set before announcing the child.
    await child.agent.ctx.get('workingDirectory').set(child.agent, await realpath(override));
    await hooks.get('agent/created')({ agent: child.agent, source: 'startup' });
    assert.equal(state.sessionDirectories.child.path, await realpath(override));
    await post({ action: 'set_session_directory', path: b, directoryRevision: 1 });
    await hooks.get('tools/execute')({ agent: child.agent }, () => {});
    assert.equal(child.cwd(), await realpath(override));
    assert.match(prompt.text({ agent: child.agent }), /"source":"session"/);
    failApply = true;
    assert.equal((await post({ action: 'set_session_directory', path: a, directoryRevision: 2 })).status, 400);
    assert.equal(state.sessionDirectories.parent.revision, 2); failApply = false;
    failStore = true;
    assert.equal((await post({ action: 'set_session_directory', path: a, directoryRevision: 2 })).status, 400);
    assert.equal(parent.cwd(), await realpath(b)); failStore = false;
    assert.equal((await post({ action: 'set_session_directory', path: null, directoryRevision: 2 })).status, 200);
    assert.equal(parent.cwd(), await realpath(a));
    assert.equal((await post({ action: 'save', id: p.id, revision: 1, title: 'P', folders: [a,b], primary: b })).status, 200);
    assert.equal(parent.cwd(), await realpath(b));
    await rm(override, { recursive: true });
    const invalid = await post({ action: 'get_session_directory' }, 'child');
    assert.equal(invalid.status, 200); assert.ok(invalid.value.sessionDirectory.validationError);
    assert.equal(invalid.value.sessionDirectory.path, override);
    await assert.rejects(hooks.get('tools/execute')({ agent: child.agent }, () => {}));
    // Explicit repair remains possible even when the previous directory disappeared.
    assert.equal((await post({ action: 'set_session_directory', path: a, directoryRevision: 1 }, 'child')).status, 200);
    assert.ok(tool.parameters.properties.directoryPolicy); assert.ok(tool.parameters.properties.path.oneOf);
  } finally { for (const dispose of disposers) await dispose?.(); await rm(root, { recursive: true, force: true }); }
});
