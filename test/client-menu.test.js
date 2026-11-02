import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

test('left project tree context menu targets workspace, edits directories and disposes listeners', async () => {
  const dom = new JSDOM('<div id="overlay"></div><div data-row-key="workspace:w1" tabindex="0"><span id="project-label">Project one</span><button id="native-menu">…</button><div data-row-key="session:s1"><span id="session-label">Chat</span></div></div><div data-row-key="workspace:unknown" id="unknown">Unknown</div>',{runScripts:'outside-only',url:'https://harness.test'});
  const previous = {window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  globalThis.window=dom.window; globalThis.document=dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const { createRoot } = await import('react-dom/client');
  const root=createRoot(document.getElementById('overlay'));
  const disposers=[], entries=new Map(), calls=[], renames=[], opens=[], created=[];
  let dictionary, byId={s1:{id:'s1',retainedBy:{mainView:1}}};
  let projects=[{id:'p1',title:'Project one',primary:'D:/main',folders:['D:/main','D:/reference'],sessionRoots:['D:/main'],revision:1,pinned:false,section:''}];
  const workspace={workspaceId:'w1',title:'Project one',path:'D:/main',sessionIds:['s1']};
  const ctx={
    slots:{inject(_name,callback){callback();},register(options,component){entries.set(options.id,component);return()=>{};}},
    locale:{register(_ns,values){dictionary=values.zh;return()=>{};},bind(){return key=>dictionary[key];}},
    sessions:{list:{subscribe:()=>()=>{},getSnapshot:()=>({byId})},create:async options=>{created.push(options);return 'new-session';}},
    workspaces:{list:{getSnapshot:()=>({items:[workspace]})},rename:async(...args)=>{renames.push(args);},delete:async()=>{},create:async()=>workspace},
    uiWorkspace:{openSession:id=>opens.push(id),startSession:()=>{}},
    remote:{directoryPicker:{pick:async()=>({ok:true,value:'D:/extra-reference'})},commands:{execute:async(sessionId,line)=>{
      const args=JSON.parse(line.slice('/projects '.length));calls.push({sessionId,args});
      let value={projects,bindings:{},activeProjectId:'p1'};
      if(args.action==='save'){projects=[{...args,id:'p1',revision:2,sessionRoots:['D:/main']}];value={project:projects[0]};}
      return {ok:true,value:{result:{kind:'success',text:JSON.stringify(value)}}};
    }}},effect(fn){disposers.push(fn());},
  };
  // Snapshot identity must be stable for React.useSyncExternalStore.
  let sessionsSnapshot={byId};ctx.sessions.list.getSnapshot=()=>sessionsSnapshot;
  dom.window.__ModuleLoader__={load({factory}){
    const plugin=factory(name=>{assert.equal(name,'react');return React;});
    // Cordis treats nested services as individual injections. A plain mock used
    // to miss errors such as: cannot get property "remote.commands" without inject.
    ctx.remote=new Proxy(ctx.remote,{get(target,key){
      assert.ok(plugin.inject.includes(`remote.${String(key)}`),`cannot get property "remote.${String(key)}" without inject`);
      return target[key];
    }});
    plugin.apply(ctx);
  }};
  dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
  const Overlay=entries.get('dsh-project-manager-tree-menu');
  function context(target) {
    const event=new dom.window.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:40,clientY:60});
    document.querySelector(target).dispatchEvent(event);return event;
  }
  const click = async text => {const button=[...document.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(button,`Missing button ${text}`);await act(async()=>button.click());};
  try{
    await act(async()=>root.render(React.createElement(Overlay)));
    assert.equal(context('#session-label').defaultPrevented,false);
    assert.equal(context('#unknown').defaultPrevented,false);
    await act(async()=>assert.equal(context('#project-label').defaultPrevented,true));
    assert.ok(document.querySelector('[role=menu]'));
    assert.equal(document.activeElement.textContent,'编辑项目');
    await act(async()=>document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));
    assert.equal(document.activeElement.textContent,'设置主要目录');
    await click('设置主要目录');
    assert.ok(document.querySelector('[role=dialog]'));
    assert.equal(document.querySelector('#dpm-name').value,'Project one');
    assert.deepEqual(opens,['s1']);
    // Clicking inside the editor must not be treated as an outside menu click.
    await act(async()=>document.querySelector('#dpm-name').dispatchEvent(new dom.window.MouseEvent('pointerdown',{bubbles:true})));
    assert.ok(document.querySelector('[role=dialog]'));
    const radio=document.querySelectorAll('input[type=radio]')[1];
    await act(async()=>radio.click());
    await click('选择目录');
    assert.equal(document.querySelectorAll('input[type=radio]').length,3);
    await click('保存');
    const save=calls.find(call=>call.args.action==='save');
    assert.equal(save.sessionId,'s1');assert.equal(save.args.primary,'D:/reference');
    assert.ok(save.args.folders.includes('D:/extra-reference'));
    assert.deepEqual(renames,[['w1','Project one']]);
    await click('×');
    assert.equal(document.querySelector('[role=dialog]'),null);
    // Native pin/section actions retain their existing host implementation.
    let nativeClicks=0;document.getElementById('native-menu').onclick=()=>nativeClicks++;
    await act(async()=>context('#project-label'));
    await click('置顶 / 分区 / 更多…');assert.equal(nativeClicks,1);
    // No active chat: a management click can create an explicit workspace session.
    byId={};sessionsSnapshot={byId};
    await act(async()=>context('#project-label'));
    await click('编辑项目');
    assert.deepEqual(JSON.parse(JSON.stringify(created)),[{workspaceId:'w1'}]);
    assert.ok(calls.some(call=>call.sessionId==='new-session'));
    await click('×');
    await act(async()=>{for(const dispose of disposers)await dispose?.();root.unmount();});
    assert.equal(context('#project-label').defaultPrevented,false);
  }finally{
    await act(async()=>root.unmount());
    dom.window.close();
    for(const [key,value]of Object.entries(previous)) {if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  }
});
