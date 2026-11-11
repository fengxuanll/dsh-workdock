import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React, {act} from 'react';
import {JSDOM} from 'jsdom';

test('project browsing, draft protection, shortcuts, folder recovery and global feedback', async()=>{
  const dom=new JSDOM('<div id="root"></div><div data-row-key="workspace:w"><span id="row">Workspace</span><button>…</button></div>',{url:'https://test.local/',runScripts:'outside-only'});
  const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  dom.window.structuredClone=structuredClone;
  // Record every timer so the 3s notice lifetime can be fast-forwarded deterministically.
  const pendingTimers=new Map(),realSetTimeout=dom.window.setTimeout.bind(dom.window),realClearTimeout=dom.window.clearTimeout.bind(dom.window);
  dom.window.setTimeout=(fn,delay,...rest)=>{const id=realSetTimeout(fn,delay,...rest);pendingTimers.set(id,{fn,delay});return id;};
  dom.window.clearTimeout=id=>{pendingTimers.delete(id);realClearTimeout(id);};
  const expire=async delay=>{const due=[...pendingTimers].filter(([,timer])=>timer.delay===delay);for(const [id,timer]of due){pendingTimers.delete(id);realClearTimeout(id);}await act(async()=>{for(const [,timer]of due)timer.fn();});};
  const {createRoot}=await import('react-dom/client');
  const root=createRoot(document.getElementById('root'));
  const entries=new Map(),disposers=[],calls=[],sessionListeners=new Set(),started=[],deleted=[],created=[];
  let selectedPanel=null,showManager=false;
  const renderHarness=()=>root.render(React.createElement(React.Fragment,null,
    selectedPanel&&React.createElement(entries.get(selectedPanel)),
    showManager&&React.createElement(entries.get('dsh-workdock-dock')),
    React.createElement(entries.get('dsh-workdock-tree-menu')),
    React.createElement(entries.get('dsh-workdock-experience'))));
  let snapshot={byId:{}},dictionary,selection='D:/one/src',confirmResult=false,confirmations=0,releaseSave=null,warning=true;
  let projects=[
    {id:'z',title:'Zulu',primary:'D:/one/src',folders:['D:/one/src','D:/two/src'],sessionRoots:['D:/one/src'],pinned:false,lastUsedAt:10},
    {id:'a',title:'Alpha',primary:'D:/alpha',folders:['D:/alpha'],sessionRoots:[],pinned:false,lastUsedAt:30},
    {id:'p',title:'Pinned',primary:'D:/pinned',folders:['D:/pinned'],sessionRoots:[],pinned:true},
  ];
  dom.window.confirm=()=>{confirmations++;return confirmResult;};
  const ctx={
    effect(fn){disposers.push(fn());},
    locale:{register(_ns,values){dictionary=values.en;},bind(){return key=>dictionary[key];}},
    slots:{inject(_slot,fn){fn();},register(options,component){if(options.name!=='sidebar.panellist')entries.set(options.key||options.id,component);}},
    layout:{selectPanel(id){selectedPanel=id;renderHarness();}},
    sessions:{list:{subscribe(fn){sessionListeners.add(fn);return()=>sessionListeners.delete(fn);},getSnapshot:()=>snapshot},create:async options=>{created.push(options);return 'workspace-chat';}},
    workspaces:{list:{getSnapshot:()=>({items:[{workspaceId:'w',title:'Zulu',path:'D:/one/src',sessionIds:[]}]})},create:async()=>({workspaceId:'w'}),delete:async id=>deleted.push(id),rename(){throw Error('redundant rename');}},
    uiWorkspace:{openSession:id=>started.push(id),startSession(){throw Error('must await explicit session creation');}},
    remote:{directoryPicker:{pick:async()=>({ok:true,value:selection})}},
  };
  dom.window.fetch=async(_url,options)=>{
    const request=JSON.parse(options.body);calls.push(request);const {args}=request;
    let value={};
    if(args.action==='list')value={projects,activeProjectId:null,...(warning?{syncWarnings:['Sidebar offline']}:{}),directoryWarnings:[{projectId:'z',path:'D:/two/src',error:'Missing directory'}]};
    if(args.action==='check_directories')value={directoryWarnings:args.folders.filter(p=>p==='D:/two/src').map(path=>({path,error:'Missing directory'}))};
    if(args.action==='save'){
      if(releaseSave)await new Promise(resolve=>{releaseSave=resolve;});
      value={project:{...args,id:args.id||'new',sessionRoots:[]},syncWarnings:['Sidebar offline']};
    }
    if(args.action==='bind')value={syncWarnings:['Sidebar offline']};
    return {ok:true,json:async()=>({ok:true,value})};
  };
  dom.window.__ModuleLoader__={load({factory}){factory(()=>React).apply(ctx);}};
  dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
  const Manager=entries.get('dsh-workdock-dock'),Overlay=entries.get('dsh-workdock-tree-menu'),Experience=entries.get('dsh-workdock-experience');
  const render=async(show=false)=>act(async()=>{showManager=show;renderHarness();});
  const click=async(text,scope=document)=>{const node=[...scope.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(node,`Missing button ${text}`);await act(async()=>node.click());};
  const input=async(node,value)=>act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  const key=async(key,extra={})=>{const event=new dom.window.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...extra});await act(async()=>document.querySelector('[role=dialog]').dispatchEvent(event));return event;};
  const names=()=>[...document.querySelectorAll('.dpm-card strong')].map(n=>n.textContent);
  const card=title=>[...document.querySelectorAll('.dpm-card')].find(n=>n.querySelector('strong').textContent===title);
  const context=async()=>act(async()=>document.getElementById('row').dispatchEvent(new dom.window.MouseEvent('contextmenu',{bubbles:true,cancelable:true})));
  try{
    await render();
    await act(async()=>ctx.layout.selectPanel('dsh-workdock-projects'));
    assert.ok(document.querySelector('.dpm-page'));
    assert.equal(document.querySelector('[role=dialog]'),null);
    assert.deepEqual(names(),['⌖ Pinned','Alpha','Zulu']);
    assert.ok(calls.some(c=>c.args.action==='list'&&!c.sessionId));
    assert.equal([...document.querySelectorAll('button')].find(n=>n.textContent==='+ Add project').disabled,true);
    assert.match(card('Zulu').textContent,/Missing directory/);
    const search=document.querySelector('input[aria-label="Search projects"]');
    for(const query of ['ZULU','ONE/SRC']){await input(search,query);assert.ok(card('Zulu'));}
    await input(search,'nothing found');assert.match(document.querySelector('.dpm-page').textContent,/No matching projects/);
    await input(search,'');
    const sort=document.querySelector('select');
    assert.deepEqual([...sort.options].map(o=>o.value),['name','recent']);
    await act(async()=>{sort.value='recent';sort.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
    assert.deepEqual(names(),['⌖ Pinned','Alpha','Zulu']);
    assert.equal(dom.window.localStorage.getItem('dsh-workdock-sort'),'recent');
    await click('Open folder in file manager',card('Zulu'));
    assert.ok(calls.some(c=>c.args.action==='open_folder'&&c.args.id==='z'&&!c.sessionId));
    assert.equal([...card('Zulu').querySelectorAll('button')].some(button=>button.textContent==='Copy primary path'),false,'the project list no longer includes the copy-primary action');
    const actionsStyle=dom.window.getComputedStyle(card('Zulu').querySelector('.dpm-actions'));
    assert.equal(actionsStyle.width,'1%');assert.equal(actionsStyle.whiteSpace,'nowrap');
    assert.equal(dom.window.getComputedStyle(card('Zulu').querySelector('.dpm-actions .dpm-row')).flexWrap,'nowrap');
    for(const button of card('Zulu').querySelectorAll('.dpm-actions button')){
      const style=dom.window.getComputedStyle(button);assert.equal(style.flexShrink,'0');assert.equal(style.whiteSpace,'nowrap');
    }
    await context();await click('Copy primary path');assert.match(document.querySelector('.dpm-global [role=alert]').textContent,/Clipboard is unavailable/);
    await expire(3000);assert.match(document.querySelector('.dpm-global [role=alert]').textContent,/Clipboard is unavailable/,'error notices stay until dismissed');
    let copied='';Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async path=>{copied=path;}},configurable:true});
    await context();await click('Copy primary path');assert.equal(copied,'D:/one/src');
    assert.match(document.querySelector('.dpm-global [role=status]').textContent,/Path copied/);
    await expire(3000);assert.doesNotMatch(document.querySelector('.dpm-global')?.textContent||'',/Path copied/,'status notices dismiss themselves after 3s');
    assert.deepEqual(created,[],'passive browsing must not create sessions');
    await click('New session',card('Zulu'));assert.deepEqual(started,['workspace-chat']);
    assert.equal(created.length,1,'explicit new-session action creates one session');
    assert.equal(calls.find(c=>c.args.action==='touch').sessionId,undefined);
    await context();await click('Open folder in file manager');
    assert.equal(calls.at(-1).args.action,'open_folder');assert.equal(calls.at(-1).sessionId,undefined);
    await context();confirmResult=true;await click('Remove project');assert.deepEqual(deleted,['w']);
    assert.equal(calls.at(-1).sessionId,undefined);
    assert.equal(created.length,1,'opening folders and deleting must not create additional sessions');
    await context();await click('Edit project');
    assert.deepEqual(JSON.parse(JSON.stringify(created)),[{workspaceId:'w'},{workspaceId:'w'}]);
    assert.ok(document.getElementById('dpm-name'));
    await click('Cancel');
    await act(async()=>{snapshot={byId:{s:{id:'s',retainedBy:{mainView:1}}}};for(const fn of sessionListeners)fn();});
    await render(true);await act(async()=>ctx.layout.selectPanel('dsh-workdock-projects'));await click('Edit project',card('Zulu'));
    assert.equal(document.activeElement.id,'dpm-name');
    assert.deepEqual([...document.querySelectorAll('.dpm-folder-name')].map(n=>n.textContent),['one/src','two/src']);
    assert.match(document.querySelector('.dpm-folder-box').textContent,/Missing directory/);
    const initialConfirms=confirmations;
    await click('Cancel');assert.equal(confirmations,initialConfirms,'unchanged drafts do not confirm');
    await act(async()=>ctx.layout.selectPanel('dsh-workdock-projects'));await click('Edit project',card('Zulu'));
    await input(document.getElementById('dpm-name'),'Changed');
    confirmResult=false;
    for(const exit of [()=>click('Cancel'),()=>click('×',document.querySelector('.dpm-head')),()=>key('Escape'),()=>act(async()=>document.querySelector('.dpm-backdrop').click())]){
      await exit();assert.ok(document.getElementById('dpm-name'));
    }
    assert.equal(confirmations,initialConfirms+4);
    const unload=new dom.window.Event('beforeunload',{cancelable:true});dom.window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,true);
    await act(async()=>document.querySelector('.dpm-folder-remove').click());
    const removedNotice=document.querySelector('.dpm-removed-folder');
    assert.equal(removedNotice.getAttribute('role'),'status');
    assert.match(removedNotice.textContent,/Folder removed.*D:\/one\/src/);
    assert.equal(dom.window.getComputedStyle(removedNotice).fontSize,'11px');
    assert.equal(dom.window.getComputedStyle(removedNotice.querySelector('button')).fontSize,'11px');
    await act(async()=>document.querySelector('.dpm-set-primary').click());
    await click('Undo');
    assert.deepEqual([...document.querySelectorAll('.dpm-source')].map(n=>n.getAttribute('aria-label')),['D:/one/src','D:/two/src']);
    assert.equal(document.querySelector('[data-primary=true]').getAttribute('aria-label'),'D:/two/src','undo preserves subsequent primary changes');
    selection='D:/one/src';
    releaseSave=true;
    const beforeSaves=calls.filter(c=>c.args.action==='save').length;
    const shortcut=await key('Enter',{ctrlKey:true});assert.equal(shortcut.defaultPrevented,true);
    await key('Enter',{metaKey:true});assert.equal(calls.filter(c=>c.args.action==='save').length,beforeSaves+1);
    await act(async()=>{releaseSave();releaseSave=null;});
    assert.equal(document.querySelector('[role=dialog]'),null);assert.match(document.querySelector('.dpm-global').textContent,/Sidebar offline/);
    warning=false;await click('Retry sidebar sync');assert.doesNotMatch(document.querySelector('.dpm-global')?.textContent||'',/Sidebar offline/);
    await act(async()=>ctx.layout.selectPanel('dsh-workdock-projects'));await click('+ Add project');selection='D:/suggested';await click('Add folder');
    assert.equal(document.getElementById('dpm-name').value,'suggested');
    await input(document.getElementById('dpm-name'),'');selection='D:/second';await click('Add folder');assert.equal(document.getElementById('dpm-name').value,'');
    assert.equal((await key('Enter',{metaKey:true})).defaultPrevented,true);
    assert.equal(calls.filter(c=>c.args.action==='save').length,beforeSaves+1,'invalid shortcut does not save');
    confirmResult=true;await click('Cancel');
    await act(async()=>ctx.layout.selectPanel('dsh-workdock-projects'));
    assert.ok(![...document.querySelectorAll('button')].some(b=>b.textContent==='Use in this chat'));
    assert.ok(!calls.some(c=>c.args.action==='bind'),'browsing cannot bind the current chat');
    await click('Back to chat');
    await context();await click('Edit project');await click('Remove project');
    assert.deepEqual(deleted,['w','w'],'removing from a tree editor also unregisters its workspace');
  }finally{
    await act(async()=>{root.unmount();for(const dispose of disposers)dispose?.();});dom.window.close();
    for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  }
});
