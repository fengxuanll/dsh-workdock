import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, writeFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openLocalPath, resolveLocalPath } from '../folder-opener.js';

function recorder(platform = 'win32') {
  const calls = [];
  return { calls, options: { platform, launch: (...args) => {
    calls.push(args);
    const child = new EventEmitter(); child.unref = () => {};
    queueMicrotask(() => child.emit('spawn')); return child;
  } } };
}

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'workdock-path-'));
  try {
    const current = join(root, 'current'), original = join(root, 'original');
    await mkdir(current); await mkdir(original);
    await writeFile(join(current, 'report & notes.txt'), 'document');
    await writeFile(join(current, 'generated.JS'), 'do not execute');
    const agent = { session: { header: { cwd: original } }, ctx: { get: key => {
      assert.equal(key, 'workingDirectory');
      return { get: session => { assert.equal(session, agent.session); return current; } };
    } } };
    await run({ root, current, original, agent });
  } finally { await rm(root, { recursive: true, force: true }); }
}

test('local files use the active session cwd and one literal non-shell argument on each OS', async () => fixture(async ({ current, agent }) => {
  const expected = await realpath(join(current, 'report & notes.txt'));
  for (const [platform, command] of [['win32', 'explorer.exe'], ['darwin', 'open'], ['linux', 'xdg-open']]) {
    const { calls, options } = recorder(platform);
    assert.deepEqual(await openLocalPath('open_file', 'report & notes.txt', agent, options), { path: expected, openedPath: expected });
    assert.equal(calls[0][0], command);
    assert.deepEqual(calls[0][1], [expected]);
    assert.equal(calls[0][2].shell, false);
  }
}));

test('reveal opens the parent for files and the directory itself for directories', async () => fixture(async ({ current, agent }) => {
  for (const input of ['report & notes.txt', 'generated.JS', '.']) {
    const { calls, options } = recorder();
    const result = await openLocalPath('reveal_file', input, agent, options);
    assert.equal(result.openedPath, await realpath(current));
    assert.deepEqual(calls[0][1], [await realpath(current)]);
  }
}));

test('path resolution accepts absolute paths, header fallback, and editor locations', async () => fixture(async ({ current, agent }) => {
  const expected = await realpath(join(current, 'report & notes.txt'));
  assert.equal((await resolveLocalPath(expected)).path, expected);
  for (const suffix of ['#L12', '#L12-L24', '#L12-24', ':12', ':12:4']) {
    assert.equal((await resolveLocalPath(`report & notes.txt${suffix}`, agent)).path, expected);
  }
  assert.equal((await resolveLocalPath('report & notes.txt', { session: { header: { cwd: current } } })).path, expected);
  assert.equal((await resolveLocalPath('report & notes.txt', { session: { header: { cwd: current } }, ctx: { get: () => ({ get: () => 'relative-not-valid' }) } })).path, expected);
  if (process.platform !== 'win32') {
    await writeFile(join(current, 'literal:12'), 'exact name');
    assert.equal((await resolveLocalPath('./literal:12', agent)).path, await realpath(join(current, 'literal:12')));
  }
}));

test('invalid paths, missing sessions, missing files and Windows scripts never launch', async () => fixture(async ({ current, agent }) => {
  const { calls, options } = recorder();
  for (const input of ['', null, 'bad\0name', 'bad\nname', 'https://example.com/x', 'file:///tmp/x', 'javascript:alert(1)', 'C:relative', '\\\\?\\C:\\device']) {
    await assert.rejects(openLocalPath('open_file', input, agent, options));
  }
  await assert.rejects(openLocalPath('open_file', 'folder-opener.js', undefined, options), /活动聊天/);
  await assert.rejects(openLocalPath('open_file', 'report & notes.txt', { session: { header: {} } }, options), /工作目录/);
  await assert.rejects(openLocalPath('open_file', 'missing.txt', agent, options), /ENOENT/);
  await assert.rejects(openLocalPath('delete_file', '.', agent, options), /未知/);
  for (const extension of ['exe', 'cmd', 'bat', 'ps1', 'com', 'lnk', 'url', 'msi', 'vbs', 'js', 'hta', 'scr', 'reg', 'wsf']) {
    const path = join(current, `unsafe.${extension}`); await writeFile(path, 'do not execute');
    await assert.rejects(openLocalPath('open_file', path, agent, options), /避免执行代码/);
  }
  assert.equal(calls.length, 0);
}));
