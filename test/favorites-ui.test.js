import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

const PAGE = 'dsh-workdock-projects';
const markdown = '# Authored heading\n\n**strong** and [link](https://example.test)\n\n```js\nconst answer = 42;\n```';
const fixtures = () => [
  { id: 'a', title: 'Alpha title', note: 'needle-note', content: markdown, sessionTitle: 'Planning session', projectId: 'p1', projectTitle: 'One', sessionId: 's', sourceKey: 'message:m', turn: 3, seq: 12, revision: 1, createdAt: 30 },
  { id: 'b', title: 'Beta title', note: '', content: 'needle-body', sessionTitle: 'Research session', projectId: 'p2', projectTitle: 'Two', sessionId: 'other', sourceKey: 'message:other', turn: 4, revision: 2, createdAt: 20 },
  { id: 'c', title: 'Unassigned title', note: '', content: 'Third reply', sessionTitle: 'Loose session', projectId: null, projectTitle: null, sessionId: 'gone', sourceKey: 'message:gone', turn: 1, revision: 1, createdAt: 10 },
];
async function harness(t, { items = fixtures(), session = true, activeProjectId = 'p1', mountStar = false, failInitialList = false } = {}) {
  const dom = new JSDOM('<aside><div class="native_sectionHeader"><div class="native_headerActions"><button aria-label="Add workspace">+</button></div></div></aside><div data-conversation-session="s" data-conversation-region="chat"><div data-chat-turn="3" data-chat-flow-key="reply">DOM rendered text, Copy and tools — NOT Markdown<div id="star"></div><div id="star2"></div></div></div><div id="root"></div><div id="feedback"></div>', { url: 'https://favorites.test/', runScripts: 'outside-only' });
  const old = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  dom.window.structuredClone = structuredClone;
  let confirm = true, failure = failInitialList ? 'favorite_list' : null, gate = null, selected = null, retainedFailure = null, readyGate = null;
  const confirmations = [], requests = [], copied = [], events = [], registrations = [], entries = new Map(), disposers = [], roots = [], renderedMarkdown = [];
  dom.window.confirm = text => { confirmations.push(text); return confirm; };
  Object.defineProperty(dom.window.navigator, 'clipboard', { value: { writeText: async text => copied.push(text) } });
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(document.getElementById('root')); roots.push(root);
  const listSnapshot = { byId: session ? { s: { id: 's', retainedBy: { mainView: 1 }, displayTitle: 'Source session' } } : {} };
  const nodes = new Map([
    ['user', { kind: 'user', location: { turn: { turn: 3 } }, data: { content: [{ type: 'text', text: 'Question title\nmore prompt' }] } }],
    ['tail', { kind: 'turn-tail', data: { turn: 3, seq: 12, closing: { finalNode: { messageId: 'm' }, blocks: [{ kind: 'text', text: markdown }, { kind: 'tool-call', text: 'private tools' }] } } }],
  ]);
  const chatSnapshot = { nodes }, chatSource = { subscribe: () => () => {}, getSnapshot: () => chatSnapshot };
  const render = () => root.render(selected ? React.createElement(entries.get('main:' + selected).component) : null);
  let dictionary;
  const ctx = {
    effect(fn) { disposers.push(fn()); }, locale: { register(_ns, values) { dictionary = values.en; }, bind: () => key => dictionary[key] },
    slots: { inject(_name, fn) { fn(); }, register(options, component) { registrations.push(options); entries.set(options.name + ':' + (options.id || options.key), { options, component }); return () => {}; } },
    layout: { selectPanel(id) { selected = id; events.push('panel:' + id); render(); } },
    sessions: { list: { getSnapshot: () => listSnapshot, subscribe: () => () => {} },
      retain(id, options) { events.push(['retain', id, options]); return { ready: retainedFailure ? Promise.reject(Error(retainedFailure)) : readyGate || Promise.resolve(), release() { events.push('release'); } }; },
      binding(id) { return { session: { loadThrough: async seq => events.push(['loadThrough', id, seq]) } }; } },
    uiConversation: { binding(id) { assert.equal(id, 's'); return { target(name) { assert.equal(name, 'chat'); return chatSource; } }; } },
    uiWorkspace: { openSession(id) { events.push(['open', id]); } },
    workspaces: { list: { getSnapshot: () => ({ items: [] }), subscribe: () => () => {} } }, remote: { directoryPicker: {} },
  };
  dom.window.fetch = async (_url, options) => {
    const request = JSON.parse(options.body); requests.push(request); const args = request.args;
    if (args.action === failure) return { ok: false, json: async () => ({ ok: false, error: failure === 'favorite_update' ? 'Revision conflict: refresh before retry' : 'Injected loading failure' }) };
    if (gate && args.action === gate.action) await gate.promise;
    let value = {};
    if (args.action === 'list') value = { projects: ['p1', 'p2'].map((id, i) => ({ id, title: ['One', 'Two'][i], primary: 'D:/' + id, folders: ['D:/' + id] })), activeProjectId, directoryWarnings: [] };
    if (args.action === 'favorite_list') value = { favorites: structuredClone(items) };
    if (args.action === 'favorite_save') { const previous = items.find(item => item.sessionId === request.sessionId && item.sourceKey === args.sourceKey); const favorite = previous || { ...args, id: 'saved', sessionId: request.sessionId, projectId: 'p1', projectTitle: 'One', note: '', revision: 1, createdAt: 100 }; if (!previous) items.push(favorite); value = { favorite, duplicate: Boolean(previous) }; }
    if (args.action === 'favorite_update') { const previous = items.find(item => item.id === args.id); const favorite = { ...previous, title: args.title, note: args.note, revision: previous.revision + 1 }; items = items.map(item => item.id === args.id ? favorite : item); value = { favorite }; }
    if (args.action === 'favorite_remove') { items = items.filter(item => item.id !== args.id); value = { removed: true }; }
    return { ok: true, json: async () => ({ ok: true, value }) };
  };
  const MarkdownText = ({ text }) => { renderedMarkdown.push(text); return React.createElement('article', { 'data-markdown-text': text }, React.createElement('h1', null, 'Authored heading'), React.createElement('pre', null, React.createElement('code', null, 'const answer = 42;'))); };
  dom.window.__ModuleLoader__ = { load({ factory }) { factory(name => name === '@deepseek-ai/dsh-client-ui-primitives' ? { MarkdownText } : React).apply(ctx); } };
  dom.window.eval(await readFile(new URL('../client.js', import.meta.url), 'utf8'));
  async function mount(id, host) { const entry = [...entries.values()].find(entry => entry.options.id === id); assert.ok(entry, id); const r = createRoot(document.getElementById(host)); roots.push(r); await act(async () => r.render(React.createElement(entry.component, { ...entry.options.inject?.('s'), messageId: 'm' }))); }
  await mount('dsh-workdock-experience', 'feedback');
  if (mountStar) await mount('dsh-workdock-save-reply', 'star');
  const disposePlugin = () => { for (const dispose of disposers.splice(0).reverse()) dispose?.(); };
  t.after(async () => { await act(async () => { for (const r of roots) r.unmount(); disposePlugin(); }); dom.window.close(); for (const [key, value] of Object.entries(old)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  const button = (label, scope = document) => { const node = [...scope.querySelectorAll('button')].find(node => node.textContent === label || node.getAttribute('aria-label') === label); assert.ok(node, 'Missing button ' + label); return node; };
  const click = async (label, scope) => act(async () => button(label, scope).click());
  const input = async (selector, value) => act(async () => { const node = document.querySelector(selector); assert.ok(node, selector); const proto = node.tagName === 'TEXTAREA' ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, value); node.dispatchEvent(new dom.window.Event('input', { bubbles: true })); });
  const filter = async value => act(async () => { const node = document.querySelector('select[aria-label="Project"]'); node.value = value; node.dispatchEvent(new dom.window.Event('change', { bubbles: true })); });
  const rows = () => [...document.querySelectorAll('.dpm-favorite-item')];
  return { dom, ctx, requests, events, registrations, copied, confirmations, renderedMarkdown, rows, button, click, input, filter, mount, disposePlugin,
    search: value => input('input[aria-label="Search content, title, notes or session"]', value),
    open: async () => { await act(async () => ctx.layout.selectPanel(PAGE)); await click('Saved replies'); },
    confirm: value => { confirm = value; }, fail: value => { failure = value; }, gate: value => { gate = value; },
    failRetain: value => { retainedFailure = value; }, readyGate: value => { readyGate = value; } };
}

test('assistant action saves authored Markdown snapshot, deduplicates pending clicks, and toggles unsave', async t => {
  const h = await harness(t, { items: [], mountStar: true });
  const registration = h.registrations.find(item => item.id === 'dsh-workdock-save-reply');
  assert.equal(registration.name, 'conversation.chat.assistant-actions');
  assert.equal(h.registrations.some(item => item.name === 'sidebar.panellist' && /favorite|saved/i.test(item.id || item.key || '')), false);
  let finish; h.gate({ action: 'favorite_save', promise: new Promise(resolve => { finish = resolve; }) });
  await act(async () => { h.button('Save reply').click(); h.button('Save reply').click(); });
  assert.equal(h.button('Save reply').disabled, true);
  assert.equal(h.requests.filter(item => item.args.action === 'favorite_save').length, 1);
  const request = h.requests.find(item => item.args.action === 'favorite_save');
  assert.equal(request.sessionId, 's');
  assert.deepEqual(request.args, { action: 'favorite_save', sourceKey: 'message:m', turn: 3, seq: 12, content: markdown, title: 'Question title', sessionTitle: 'Source session' });
  await act(async () => finish());
  assert.equal(h.button('Unsave reply').getAttribute('aria-pressed'), 'true');
  await h.mount('dsh-workdock-save-reply', 'star2');
  assert.equal(document.querySelectorAll('[aria-label="Unsave reply"]').length, 2, 'all instances share durable favorite state');
  await h.click('Unsave reply');
  assert.equal(document.querySelectorAll('[aria-label="Save reply"]').length, 2);
  assert.equal(h.requests.filter(item => item.args.action === 'favorite_remove').length, 1);
  assert.equal(h.dom.window.localStorage.length, 0, 'snapshots are not put in localStorage');
});

test('star reports loading and save errors and supports a safe retry', async t => {
  const h = await harness(t, { items: [], mountStar: true, failInitialList: true });
  assert.equal(h.button('Reload saved replies').disabled, false);
  h.fail(null); await h.click('Reload saved replies');
  assert.equal(h.requests.some(item => item.args.action === 'favorite_save'), false, 'loading retry never blindly creates a favorite');
  h.fail('favorite_save'); await h.click('Save reply');
  assert.match(document.querySelector('[role=alert]').textContent, /Injected loading failure/);
  assert.equal(h.button('Save reply').disabled, false);
  h.fail(null); await h.click('Save reply'); assert.ok(h.button('Unsave reply'));
  assert.equal(h.button('Unsave reply').title, 'Unsave reply', 'successful retry clears a stale error tooltip');
});

test('saved replies default to active project, search every field, and browse offline across projects', async t => {
  const h = await harness(t); await h.open();
  assert.equal(document.querySelector('select[aria-label="Project"]').value, 'p1');
  assert.equal(h.rows().length, 1);
  await h.filter('*'); assert.equal(h.rows().length, 3);
  for (const [query, title] of [['aLpHa', 'Alpha title'], ['needle-note', 'Alpha title'], ['Research session', 'Beta title'], ['needle-body', 'Beta title']]) {
    await h.search(query); assert.equal(h.rows().length, 1); assert.equal(h.rows()[0].querySelector('strong').textContent, title);
  }
  await h.search('no matches'); assert.equal(h.rows().length, 0); assert.match(document.querySelector('.dpm-favorites').textContent, /No matching replies/);
  await h.search(''); await h.filter(''); assert.equal(h.rows()[0].querySelector('strong').textContent, 'Unassigned title');
  assert.ok(h.requests.filter(item => item.args.action === 'favorite_list').every(item => !item.sessionId));
});

test('without a live session saved replies remain browsable and default to all projects', async t => {
  const h = await harness(t, { session: false, activeProjectId: null }); await h.open();
  assert.equal(document.querySelector('select[aria-label="Project"]').value, '*');
  assert.equal(h.rows().length, 3);
  await act(async () => h.rows()[0].click());
  assert.equal(document.querySelector('.dpm-favorite-content article h1').textContent, 'Authored heading');
  assert.equal(h.renderedMarkdown.at(-1), markdown);
  assert.ok(!h.requests.some(item => item.sessionId));
});

test('detail preserves dirty drafts through conflicts, guards navigation, updates, copies and removes', async t => {
  const h = await harness(t); await h.open(); await act(async () => h.rows()[0].click());
  await h.input('#dpm-favorite-title', 'My revised title'); await h.input('#dpm-favorite-note', 'A new note');
  h.confirm(false); await h.click('Back to chat'); assert.ok(document.querySelector('.dpm-favorites'));
  await h.click('Projects', document.querySelector('.dpm-tabs')); assert.ok(document.querySelector('.dpm-favorites'));
  await h.filter('*'); assert.equal(document.querySelector('select[aria-label="Project"]').value, 'p1');
  h.fail('favorite_update'); await h.click('Save');
  assert.match(document.querySelector('.dpm-favorites [role=alert]').textContent, /Revision conflict/);
  assert.equal(document.getElementById('dpm-favorite-title').value, 'My revised title');
  assert.equal(document.getElementById('dpm-favorite-note').value, 'A new note');
  h.fail(null); await h.click('Save');
  const update = h.requests.filter(item => item.args.action === 'favorite_update').at(-1);
  assert.deepEqual(update.args, { action: 'favorite_update', id: 'a', revision: 1, title: 'My revised title', note: 'A new note' });
  assert.equal(h.button('Save').disabled, true);
  await h.click('Copy reply'); assert.deepEqual(h.copied, [markdown]);
  await h.click('Unsave reply');
  assert.equal(h.rows().length, 0); assert.equal(document.getElementById('dpm-favorite-title'), null);
  assert.equal(h.requests.find(item => item.args.action === 'favorite_remove').args.revision, 2);
  assert.ok(h.confirmations.length >= 3);
});

test('source jump retains source, pages history before opening, highlights turn and releases reference', async t => {
  const h = await harness(t); await h.open(); await act(async () => h.rows()[0].click());
  let finish; h.readyGate(new Promise(resolve => { finish = resolve; }));
  await h.click('Back to original chat');
  assert.ok(!h.events.some(event => Array.isArray(event) && ['loadThrough', 'open'].includes(event[0])), 'source history and navigation wait for retain.ready');
  assert.ok(document.querySelector('.dpm-page'));
  await act(async () => finish());
  assert.deepEqual(JSON.parse(JSON.stringify(h.events.slice(-5))), [['retain', 's', { source: 'mainView' }], ['loadThrough', 's', 12], 'panel:null', ['open', 's'], 'release']);
  assert.ok(document.querySelector('[data-chat-turn="3"]').classList.contains('dpm-favorite-highlight'));
  assert.equal(document.querySelector('.dpm-page'), null);
});

test('superseded source jump cannot navigate after a newer jump completes', async t => {
  const h = await harness(t); await h.open(); await act(async () => h.rows()[0].click());
  let finishFirst; h.readyGate(new Promise(resolve => { finishFirst = resolve; }));
  await h.click('Back to original chat');
  assert.equal(h.events.filter(event => Array.isArray(event) && event[0] === 'retain').length, 1);
  h.readyGate(null); await h.click('Back to original chat');
  const opens = () => h.events.filter(event => Array.isArray(event) && event[0] === 'open');
  const history = () => h.events.filter(event => Array.isArray(event) && event[0] === 'loadThrough');
  assert.equal(opens().length, 1); assert.equal(history().length, 1);
  await act(async () => finishFirst());
  assert.equal(opens().length, 1, 'late first ready must not reopen its superseded source');
  assert.equal(history().length, 1, 'superseded-before-ready jump must not page history');
  assert.equal(h.events.filter(event => event === 'release').length, 2, 'both jump references are released');
});

test('plugin disposal cancels a source jump still waiting for readiness', async t => {
  const h = await harness(t); await h.open(); await act(async () => h.rows()[0].click());
  let finish; h.readyGate(new Promise(resolve => { finish = resolve; }));
  await h.click('Back to original chat');
  await act(async () => h.disposePlugin());
  await act(async () => finish());
  assert.equal(h.events.some(event => Array.isArray(event) && ['loadThrough', 'open'].includes(event[0])), false);
  assert.equal(h.events.filter(event => event === 'release').length, 1);
});

test('saved reply list loading failures remain visible and refresh recovers offline', async t => {
  const h = await harness(t, { session: false, activeProjectId: null, failInitialList: true }); await h.open();
  assert.match(document.querySelector('.dpm-favorites [role=alert]').textContent, /Injected loading failure/);
  assert.equal(h.rows().length, 0);
  h.fail(null); await h.click('Refresh', document.querySelector('.dpm-favorites'));
  assert.equal(document.querySelector('.dpm-favorites [role=alert]'), null);
  assert.equal(h.rows().length, 3);
});

test('missing source failure keeps snapshot readable and releases retained reference', async t => {
  const h = await harness(t); await h.open(); await act(async () => h.rows()[0].click());
  h.failRetain('session deleted'); await h.click('Back to original chat');
  assert.match(document.querySelector('[role=alert]').textContent, /source is unavailable or deleted/);
  assert.equal(h.events.at(-1), 'release');
  assert.equal(document.querySelector('.dpm-favorite-content article').getAttribute('data-markdown-text'), markdown);
});
