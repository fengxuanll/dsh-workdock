import test from 'node:test';
import assert from 'node:assert/strict';
import { apply } from '../src/index.js';

async function harness(initial = { projects: [], bindings: {} }) {
  let route, state, tool, command, failWrite = false;
  const agents = new Map([['chat', { session: { header: { id: 'chat', cwd: process.cwd() } } }]]);
  const cleanups = [];
  await apply({
    storageDomain: { open: async spec => {
      state = spec.global.schema.parse(initial);
      return { global: { get: () => state, set: async value => {
        await Promise.resolve();
        if (failWrite) throw Error('disk failure');
        state = spec.global.schema.parse(value);
      } }, close() {} };
    } },
    connection: { fetch: { register: value => { route = value; return () => {}; } } },
    agents: { get: id => agents.get(id) },
    workspaceRegistry: { list: () => [], create: async (path, title) => ({ path, title }) },
    commands: { register: value => { command = value; }, execute() { assert.fail('must not execute a command'); } },
    tools: { register: value => { tool = value; } }, systemPrompt: { context() {} }, on() {},
    effect: fn => cleanups.push(fn()),
  });
  const post = async (args, sessionId) => {
    const response = await route.fetch(new Request('https://host/api/dsh-workdock', {
      method: 'POST', body: JSON.stringify({ args, sessionId }),
    }));
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return { status: response.status, ...await response.json() };
  };
  return { post, agents, tool, command, route, state: () => structuredClone(state), fail: value => { failWrite = value; },
    close: async () => { for (const cleanup of cleanups) await cleanup?.(); } };
}
const snapshot = (extra = {}) => ({ action: 'favorite_save', sourceKey: 'assistant:3', turn: 3,
  content: 'A **reply**\nwith details', title: 'Useful reply', sessionTitle: 'My chat', ...extra });

test('favorites upgrade old globals, deduplicate atomically and snapshot server project', async () => {
  const project = { id: 'project', title: 'Server project', folders: [process.cwd()], primary: process.cwd(),
    sessionRoots: [process.cwd()], pinned: false, revision: 1 };
  const h = await harness({ projects: [project], bindings: { chat: project.id }, colors: { 'session:chat': 'red' },
    sessionDirectories: { chat: { path: null, revision: 4 } } });
  try {
    assert.deepEqual((await h.post({ action: 'favorite_list' })).value, { favorites: [] });
    const results = await Promise.all(Array.from({ length: 8 }, () => h.post(snapshot({ projectId: 'spoofed' }), 'chat')));
    assert.ok(results.every(result => result.status === 200));
    assert.equal(results.filter(result => !result.value.duplicate).length, 1);
    const favorite = results[0].value.favorite;
    assert.match(favorite.id, /^[\da-f-]{36}$/);
    assert.equal(favorite.projectId, 'project');
    assert.equal(favorite.projectTitle, 'Server project');
    assert.equal(favorite.sessionTitle, 'My chat');
    assert.equal(favorite.note, '');
    assert.equal(favorite.revision, 1);
    assert.ok(favorite.createdAt > 0);
    assert.equal(h.state().favorites.length, 1);
    assert.deepEqual(h.state().colors, { 'session:chat': 'red' });
    assert.deepEqual(h.state().sessionDirectories, { chat: { path: null, revision: 4 } });
    assert.equal((await h.post(snapshot({ content: 'replacement' }), 'chat')).value.favorite.content, snapshot().content);
    const projectList = JSON.parse((await h.tool.execute({ action: 'list' }, { agent: h.agents.get('chat') })).json);
    assert.equal(projectList.favorites, undefined, 'favorites are not exposed to model project_manager list');
    assert.ok(!h.tool.parameters.properties.action.enum.includes('favorite_list'));
    const commandList = await h.command.handler({ rawInput: '', agent: h.agents.get('chat') });
    assert.equal(JSON.parse(commandList.text).favorites, undefined);
    h.agents.clear();
    assert.equal((await h.post({ action: 'favorite_list' }, 'closed-chat')).value.favorites.length, 1);
    assert.equal((await h.post({ action: 'favorite_list', projectId: 'project' })).value.favorites.length, 1);
    assert.deepEqual((await h.post({ action: 'favorite_list', projectId: null })).value.favorites, []);
    await h.post({ action: 'remove', id: 'project' });
    assert.equal((await h.post({ action: 'favorite_list' })).value.favorites[0].projectTitle, 'Server project');
  } finally { await h.close(); }
});

test('update revision conflicts, optional remove revision and offline management', async () => {
  const h = await harness();
  try {
    const original = (await h.post(snapshot({ seq: 42 }), 'chat')).value.favorite;
    assert.equal(original.seq, 42);
    assert.equal(original.projectId, null);
    assert.equal(original.projectTitle, null);
    const other = await h.post(snapshot({ sourceKey: 'second' }), 'chat');
    assert.equal(other.status, 200);
    h.agents.clear();
    const update = { action: 'favorite_update', id: original.id, revision: 1, title: 'New title', note: 'My note' };
    const results = await Promise.all([h.post(update), h.post(update)]);
    assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
    const changed = results.find(result => result.ok).value.favorite;
    assert.equal(changed.revision, 2);
    assert.equal(changed.note, 'My note');
    assert.equal(changed.content, original.content);
    assert.equal(changed.seq, original.seq);
    assert.equal(changed.createdAt, original.createdAt);
    assert.equal((await h.post({ ...update, revision: undefined })).status, 409);
    assert.equal((await h.post({ action: 'favorite_remove', id: original.id, revision: 1 })).status, 409);
    assert.equal((await h.post({ action: 'favorite_remove', id: original.id, revision: 2 })).value.removed, true);
    assert.equal((await h.post({ action: 'favorite_remove', id: original.id, revision: 1 })).value.removed, false);
    assert.equal((await h.post({ action: 'favorite_remove', id: other.value.favorite.id })).value.removed, true);
    assert.deepEqual((await h.post({ action: 'favorite_list' })).value.favorites, []);
  } finally { await h.close(); }
});

test('save validates live session, limits UTF-8 snapshot and survives persistence failures', async () => {
  const h = await harness();
  try {
    assert.equal((await h.post(snapshot())).status, 409);
    assert.equal((await h.post(snapshot(), 'missing')).status, 409);
    h.agents.set('alias', h.agents.get('chat'));
    assert.equal((await h.post(snapshot(), 'alias')).status, 409);
    for (const extra of [{ sourceKey: '' }, { sourceKey: 'x'.repeat(501) }, { turn: -1 }, { turn: 1.5 },
      { seq: -1 }, { seq: 0.5 }, { content: undefined }, { content: 'x'.repeat(1024 * 1024 + 1) },
      { content: '中'.repeat(350000) }, { title: 'x'.repeat(501) }, { sessionTitle: 'x'.repeat(501) }]) {
      assert.equal((await h.post(snapshot(extra), 'chat')).status, 400);
    }
    assert.equal(h.state().favorites, undefined);
    const content = '\u0000'.repeat(1024 * 1024);
    assert.equal((await h.post(snapshot({ content }), 'chat')).status, 200, 'fully escaped 1 MiB is accepted');
    assert.equal(h.state().favorites[0].content, content);
    h.fail(true);
    assert.equal((await h.post(snapshot({ sourceKey: 'failed' }), 'chat')).status, 400);
    assert.equal(h.state().favorites.length, 1);
    h.fail(false);
    assert.equal((await h.post(snapshot({ sourceKey: 'recovered' }), 'chat')).status, 200);
    assert.equal(h.state().favorites.length, 2);
    const tooLarge = await h.route.fetch(new Request('https://host/api/dsh-workdock', {
      method: 'POST', body: 'x'.repeat(6 * 1024 * 1024 + 32769),
    }));
    assert.equal(tooLarge.status, 413);
  } finally { await h.close(); }
});

test('favorites and normal global mutations share serialization without lost fields', async () => {
  const h = await harness();
  try {
    const results = await Promise.all(Array.from({ length: 15 }, (_, i) => [
      h.post(snapshot({ sourceKey: `reply:${i}` }), 'chat'),
      h.post({ action: 'set_color', target: 'session', id: `session:${i}`, color: 'blue' }),
    ]).flat());
    assert.ok(results.every(result => result.status === 200));
    assert.equal(h.state().favorites.length, 15);
    assert.equal(Object.keys(h.state().colors).length, 15);
  } finally { await h.close(); }
});
