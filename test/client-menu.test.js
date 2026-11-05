import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

test('left project tree context menu targets workspace, edits directories and disposes listeners', async () => {
  const dom = new JSDOM('<div id="overlay"></div><div data-row-key="workspace:w1" tabindex="0"><span id="project-label">Project one</span><button id="native-menu">…</button><div data-row-key="session:s1"><span id="session-label">Chat</span></div></div><div data-row-key="workspace:unknown" id="unknown">Unknown</div>',{runScripts:'outside-only',url:'https://harness.test/proxy/'});
  dom.window.structuredClone=structuredClone;
  dom.window.confirm=()=>true;
  const previous = {window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  globalThis.window=dom.window; globalThis.document=dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const { createRoot } = await import('react-dom/client');
  const root=createRoot(document.getElementById('overlay'));
  const disposers=[], entries=new Map(), calls=[], renames=[], opens=[], created=[];
  let selectedPanel=null, showManager=false;
  const renderHarness=()=>root.render(React.createElement(React.Fragment,null,
    selectedPanel&&React.createElement(entries.get(selectedPanel)),
    showManager&&React.createElement(entries.get('dsh-workdock-dock')),
    React.createElement(entries.get('dsh-workdock-tree-menu')),
    React.createElement(entries.get('dsh-workdock-primary-tooltip'))));
  let dictionary, failAction = null, activeProjectId = 'p1', byId={s1:{id:'s1',retainedBy:{mainView:1}}};
  let projects=[{id:'p1',title:'Project one',primary:'D:/main',folders:['D:/main','D:/reference'],sessionRoots:['D:/main'],revision:1,pinned:false}];
  const workspace={workspaceId:'w1',title:'Project one',path:'D:/main',sessionIds:['s1']};
  const ctx={
    slots:{inject(_name,callback){callback();},register(options,component){if(options.name!=='sidebar.panellist')entries.set(options.key||options.id,component);return()=>{};}},
    layout:{selectPanel(id){selectedPanel=id;renderHarness();}},
    locale:{register(_ns,values){dictionary=values.zh;return()=>{};},bind(){return key=>dictionary[key];}},
    sessions:{list:{subscribe:()=>()=>{},getSnapshot:()=>({byId})},create:async options=>{created.push(options);return 'new-session';}},
    workspaces:{list:{getSnapshot:()=>({items:[workspace]})},rename:async(...args)=>{renames.push(args);},delete:async()=>{},create:async()=>workspace},
    uiWorkspace:{openSession:id=>opens.push(id),startSession:()=>{}},
    remote:{directoryPicker:{pick:async()=>({ok:true,value:'D:/extra-reference'})},commands:{execute(){throw Error('UI must not execute visible slash commands');}}},effect(fn){disposers.push(fn());},
  };
  dom.window.fetch=async(url,options)=>{
      assert.equal(url.href,'https://harness.test/proxy/api/dsh-workdock');
      assert.equal(options.credentials,'same-origin');
      assert.equal(options.method,'POST');
      const {sessionId,args}=JSON.parse(options.body);calls.push({sessionId,args});
      if(args.action===failAction)return {ok:false,json:async()=>({ok:false,error:'Test operation failed'})};
      if(args.action==='bind')activeProjectId=args.id;
      let value={projects,bindings:{},activeProjectId};
      if(args.action==='save'){projects=[{...args,id:'p1',revision:2,sessionRoots:['D:/main']}];value={project:projects[0]};}
      return {ok:true,json:async()=>({ok:true,value})};
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
  const Overlay=entries.get('dsh-workdock-tree-menu');
  const Tooltip=entries.get('dsh-workdock-primary-tooltip');
  function context(target) {
    const event=new dom.window.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:40,clientY:60});
    document.querySelector(target).dispatchEvent(event);return event;
  }
  const click = async text => {const button=[...document.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(button,`Missing button ${text}`);await act(async()=>button.click());};
  const addWorkspace=document.createElement('button');
  addWorkspace.setAttribute('aria-label','添加工作区');
  addWorkspace.innerHTML='<span>+</span>';document.body.append(addWorkspace);
  let nativeAddClicks=0,nativeAddPointers=0;
  addWorkspace.onclick=()=>nativeAddClicks++;
  addWorkspace.addEventListener('pointerdown',()=>nativeAddPointers++);
  try{
    await act(async()=>renderHarness());
    // The toolbar action opens a blank add form, including nested icon clicks.
    await act(async()=>{
      addWorkspace.firstChild.dispatchEvent(new dom.window.MouseEvent('pointerdown',{button:0,bubbles:true}));
      addWorkspace.firstChild.click();
    });
    assert.equal(nativeAddClicks,0);assert.equal(nativeAddPointers,0);
    assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-label'),'添加项目');
    assert.equal(document.querySelector('#dpm-name').value,'');
    assert.equal(document.querySelectorAll('.dpm-source').length,0);
    assert.equal(document.querySelector('.dpm-save').disabled,true);
    await act(async()=>document.querySelector('[role=dialog]').dispatchEvent(new dom.window.MouseEvent('pointerdown',{bubbles:true})));
    assert.ok(document.querySelector('[role=dialog]'),'dialog interactions must not close the overlay');
    assert.ok(document.querySelector('#dpm-name'));
    await click('取消');
    assert.equal(document.querySelector('[role=dialog]'),null);
    // Keyboard activation also emits click; the English host label is supported.
    addWorkspace.setAttribute('aria-label','Add workspace');
    await act(async()=>{addWorkspace.focus();addWorkspace.click();});
    await act(async()=>document.querySelector('[role=dialog]').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
    assert.equal(document.querySelector('[role=dialog]'),null);
    assert.equal(document.activeElement,addWorkspace);
    assert.equal(nativeAddClicks,0);
    assert.equal(context('#session-label').defaultPrevented,false);
    assert.equal(context('#unknown').defaultPrevented,false);
    await act(async()=>assert.equal(context('#project-label').defaultPrevented,true));
    assert.ok(document.querySelector('[role=menu]'));
    const contextMenuMarkup=document.querySelector('[role=menu]').innerHTML;
    assert.ok(![...document.querySelectorAll('[role=menuitem]')].some(b=>b.textContent==='用于当前聊天'));
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
    assert.equal(document.querySelector('input[type=radio]'),null);
    const referenceRow=document.querySelectorAll('.dpm-source')[1];
    assert.equal(referenceRow.querySelector('.dpm-set-primary').textContent,'设为主要目录');
    await act(async()=>referenceRow.querySelector('.dpm-folder-name').click());
    assert.equal(referenceRow.getAttribute('data-primary'),'false','clicking the folder name must not select it');
    await act(async()=>{referenceRow.focus();referenceRow.querySelector('.dpm-set-primary').click();});
    assert.equal(document.querySelector('[data-primary=true] .dpm-folder-name').textContent,'reference');
    assert.ok(!document.querySelector('[role=dialog]').textContent.includes('输入路径'));
    assert.ok(document.querySelector('.dpm-folder-box .dpm-folder-add'));
    assert.equal(document.querySelectorAll('.dpm-folder-remove').length,2);
    await click('添加文件夹');
    assert.equal(document.querySelectorAll('.dpm-source').length,3);
    if(process.env.DPM_PREVIEW){
      const body=document.body.cloneNode(true);
      const style=document.createElement('style');style.textContent='body{margin:0;background:#1b1b1b;color:#eee;font:14px system-ui,sans-serif}';
      await writeFile(process.env.DPM_PREVIEW,'<!doctype html><html><head><meta charset="utf-8">'+style.outerHTML+'</head>'+body.outerHTML+'</html>');
    }
    failAction='save';
    await click('保存');
    assert.ok(document.querySelector('#dpm-name'),'failed save must keep the editor open');
    assert.match(document.querySelector('[role=alert]').textContent,/Test operation failed/);
    failAction=null;
    await click('保存');
    const save=calls.find(call=>call.args.action==='save');
    assert.equal(save.sessionId,'s1');assert.equal(save.args.primary,'D:/reference');
    assert.ok(save.args.folders.includes('D:/extra-reference'));
    assert.deepEqual(renames,[],'backend owns sidebar titles');
    assert.equal(document.querySelector('[role=dialog]'),null,'successful save closes rather than revealing the project manager');
    assert.equal(document.querySelector('[role=menu]'),null);
    // The native workspace still has D:/main for history membership. The hover
    // must present the newly saved primary, not that immutable original path.
    let nativeHover=0;
    const row=document.getElementById('project-label').parentElement;
    const wrapper=document.createElement('span');wrapper.id='native-hover-wrapper';row.before(wrapper);wrapper.append(row);
    row.addEventListener('mouseover',()=>nativeHover++);
    wrapper.addEventListener('pointerenter',()=>nativeHover++);
    await act(async()=>wrapper.dispatchEvent(new dom.window.MouseEvent('pointerenter',{bubbles:false})));
    await act(async()=>document.getElementById('project-label').dispatchEvent(new dom.window.MouseEvent('mouseover',{bubbles:true})));
    assert.equal(nativeHover,0);
    assert.match(document.querySelector('[role=tooltip]').textContent,/D:\/reference/);
    assert.equal(row.getAttribute('aria-describedby'),'dpm-primary-tooltip');
    const nativeCard=document.createElement('div');nativeCard.style.setProperty('--dsh-hover-preview-fade','100ms');nativeCard.setAttribute('aria-label','复制: D:/main');nativeCard.textContent='Project one D:/main 创建时间';
    const unrelatedCard=document.createElement('div');unrelatedCard.style.setProperty('--dsh-hover-preview-fade','100ms');unrelatedCard.setAttribute('aria-label','复制: another chat');unrelatedCard.textContent='Other chat';
    await act(async()=>{document.body.append(nativeCard,unrelatedCard);});
    assert.equal(nativeCard.style.display,'none','already-armed native project cards are suppressed');
    assert.notEqual(unrelatedCard.style.display,'none','other native hover cards remain available');
    await act(async()=>row.dispatchEvent(new dom.window.MouseEvent('mouseout',{bubbles:true,relatedTarget:document.body})));
    assert.equal(document.querySelector('[role=tooltip]'),null);
    assert.equal(row.getAttribute('aria-describedby'),null);
    // Both triggers share identical menu entries, order, separators and styles.
    await act(async()=>document.getElementById('native-menu').click());
    assert.equal(document.querySelector('[role=menu]').innerHTML,contextMenuMarkup);
    assert.equal(document.querySelector('[role=menu]').className,'dpm-menu');
    assert.ok(![...document.querySelectorAll('[role=menuitem]')].some(node=>node.textContent==='项目管理'));
    assert.ok([...document.querySelectorAll('[role=menuitem]')].some(node=>node.textContent==='编辑项目'));
    await click('编辑项目');
    assert.equal(selectedPanel,null);
    assert.equal(document.querySelector('.dpm-page'),null);
    assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-label'),'编辑项目');
    assert.equal(document.querySelector('#dpm-name').value,projects[0].title);
    assert.deepEqual([...document.querySelectorAll('.dpm-source')].map(n=>n.getAttribute('aria-label')),projects[0].folders);
    await click('取消');
    assert.equal(document.querySelector('[role=dialog]'),null);
    assert.equal(selectedPanel,null);
    await act(async()=>document.getElementById('native-menu').click());
    await click('在资源管理器中打开');
    assert.ok(calls.some(call=>call.args.action==='open_folder'&&call.args.workspaceId==='w1'));
    assert.equal(document.querySelector('[role=menu]'),null);
    // Native pin actions retain their existing host implementation.
    let nativeClicks=0;document.getElementById('native-menu').onclick=()=>nativeClicks++;
    await act(async()=>context('#project-label'));
    await click('置顶 / 更多…');assert.equal(nativeClicks,1);
    // Explicit editing may create a workspace chat; passive management must not.
    byId={};sessionsSnapshot={byId};
    await act(async()=>context('#project-label'));
    await click('编辑项目');
    assert.deepEqual(JSON.parse(JSON.stringify(created)),[{workspaceId:'w1'}]);
    assert.ok(calls.some(call=>call.sessionId==='new-session'));
    await click('×');
    assert.equal(entries.has('dsh-workdock-switch-project'),false);
    assert.equal(entries.has('dsh-workdock-switch-project-overlay'),false);
    // Cancelling a tree-launched editor closes it without exposing the manager.
    byId={s1:{id:'s1',retainedBy:{mainView:1}}};sessionsSnapshot={byId};
    await act(async()=>context('#project-label'));
    await click('编辑项目');
    const savesBefore=calls.filter(c=>c.args.action==='save').length;
    await click('添加文件夹');
    await click('取消');
    assert.equal(document.querySelector('[role=dialog]'),null);
    assert.equal(document.querySelector('[role=menu]'),null);
    assert.equal(calls.filter(c=>c.args.action==='save').length,savesBefore);
    assert.equal(entries.has('dsh-workdock'),false,'sidebar footer launcher must not be registered');
    showManager=true;
    await act(async()=>renderHarness());
    await act(async()=>ctx.layout.selectPanel('dsh-workdock-projects'));
    assert.equal(selectedPanel,'dsh-workdock-projects');
    await click('编辑项目');
    await click('取消');
    assert.equal(document.querySelector('[role=dialog]'),null);
    assert.ok(document.querySelector('.dpm-page'),'cancel returns to the existing project page');
    await click('编辑项目');
    await click('保存');
    assert.equal(document.querySelector('[role=dialog]'),null);
    assert.ok(document.querySelector('.dpm-page'),'save retains the native list');
    assert.equal(document.querySelector('#dpm-name'),null,'list does not retain a stale editor');
    await click('返回聊天');
    showManager=false;
    await act(async()=>renderHarness());
    byId={};sessionsSnapshot={byId};
    await act(async()=>addWorkspace.click());
    assert.match(document.querySelector('[role=dialog]').textContent,/请先打开或创建一个聊天/);
    await click('×');
    await act(async()=>{for(const dispose of disposers)await dispose?.();root.unmount();});
    assert.equal(nativeCard.style.display,'','native card visibility is restored on plugin disposal');
    assert.equal(context('#project-label').defaultPrevented,false);
    addWorkspace.click();
    addWorkspace.dispatchEvent(new dom.window.MouseEvent('pointerdown',{button:0,bubbles:true}));
    assert.equal(nativeAddClicks,1);assert.equal(nativeAddPointers,1);
  }finally{
    await act(async()=>root.unmount());
    dom.window.close();
    for(const [key,value]of Object.entries(previous)) {if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  }
});
