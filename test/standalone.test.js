import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

test('release entry activates outside the workspace without node_modules or Harness packages', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dpm-standalone-'));
  try {
    await copyFile(new URL('../index.js', import.meta.url), join(dir, 'index.js'));
    await writeFile(join(dir, 'package.json'), '{"type":"module"}');
    const plugin = await import(pathToFileURL(join(dir, 'index.js')));
    const tools = [], commands = [], contexts = [], hooks = [];
    const disposers = [];
    await plugin.apply({
      connection:{fetch:{register:()=>()=>{}}},agents:{get:()=>undefined},
      workspaceRegistry: { list: () => [], create: async () => { throw Error('Unexpected workspace creation'); } },
      storageDomain: { open: async spec => {
        assert.equal(spec.global.schema.safeParse(null).success, false);
        let state = spec.global.schema.parse(spec.global.initial);
        return { global: { get: () => state, set: async value => { state = spec.global.schema.parse(value); } }, close() {} };
      } },
      tools: { register: value => tools.push(value) },
      commands: { register: value => commands.push(value) },
      systemPrompt: { context: value => contexts.push(value) },
      on: (...args) => hooks.push(args),
      effect: fn => disposers.push(fn()),
    });
    assert.equal(tools[0].parameters.type, 'object');
    assert.ok(tools[0].parameters.properties.action.enum.includes('get_session_directory'));
    assert.ok(tools[0].parameters.properties.action.enum.includes('set_session_directory'));
    assert.deepEqual(tools[0].parameters.properties.path.oneOf, [{ type: 'string' }, { type: 'null' }]);
    assert.equal(commands[0].name, 'projects');
    assert.equal(contexts.length, 1);
    assert.deepEqual(hooks.map(([name]) => name), ['agent/created', 'system-prompt/assemble', 'tools/execute']);
    const result = await commands[0].handler({ rawInput: '', agent: { session: { header: { id: 'standalone' } } } });
    assert.equal(result.kind, 'success');
    assert.deepEqual(JSON.parse(result.text).projects, []);
    for (const dispose of disposers) await dispose?.();
  } finally { await rm(dir, { recursive: true, force: true }); }
});
