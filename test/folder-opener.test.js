import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { openDirectory } from '../folder-opener.js';

test('file manager receives a literal folder argument without shell execution', async()=>{
  for(const [platform,command]of [['win32','explorer.exe'],['darwin','open'],['linux','xdg-open']]){
    let invocation,detached=false;
    const path='D:/Projects/space & $(literal)';
    await openDirectory(path,platform,(...args)=>{
      invocation=args;const child=new EventEmitter();child.unref=()=>{detached=true;};
      queueMicrotask(()=>child.emit('spawn'));return child;
    });
    assert.equal(invocation[0],command);
    assert.deepEqual(invocation[1],[path]);
    assert.equal(invocation[2].shell,false);
    assert.equal(detached,true);
  }
});
test('file manager launch failure is returned to the caller',async()=>{
  await assert.rejects(openDirectory('/folder','linux',()=>{
    const child=new EventEmitter();queueMicrotask(()=>child.emit('error',Error('not installed')));return child;
  }),/not installed/);
});
