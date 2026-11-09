import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React, {act} from 'react';
import {JSDOM} from 'jsdom';

const KEY='dsh-workdock-pinned-workspaces';
const ORDER_KEY='dsh-workdock-workspace-unpinned-order';
const workspaceFixtures=()=>Array.from({length:4},(_,i)=>({workspaceId:`w${i+1}`,title:`Project ${i+1}`,path:`D:/project-${i+1}`,sessionIds:i===0?['s1']:[]}));
const nativeMarkup=(prefix='native')=>`<div class="${prefix}_root"><div class="${prefix}_sectionHeader"><span>Workspaces</span><div class="${prefix}_headerActions"><button id="native-view">View</button><button id="native-add" aria-label="Add workspace">Add</button></div></div><div id="native-list"></div></div>`;

// The real host derives tree groups from snapshot.items. Only this mock host's
// insertBefore/renderNative updates tree order; no synthetic pinned list exists.
async function harness(t,{saved,baseline,locale='en',workspaces=workspaceFixtures(),supported=true}={}) {
  const dom=new JSDOM(`<aside id="tree">${nativeMarkup()}</aside><div id="overlay"></div>`,{url:'https://pins.test/',runScripts:'outside-only'});
  const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  dom.window.structuredClone=structuredClone;dom.window.confirm=()=>true;
  if(saved!==undefined)dom.window.localStorage.setItem(KEY,saved);
  if(baseline!==undefined)dom.window.localStorage.setItem(ORDER_KEY,baseline);
  const {createRoot}=await import('react-dom/client');
  const root=createRoot(document.getElementById('overlay'));
  const entries=new Map(),disposers=[],requests=[],opened=[],started=[],created=[],workspaceWrites=[],panels=[],moves=[];
  const listeners=new Set(),rows=new Map();
  let snapshot={status:'ready',items:workspaces,archivedSessionIds:[]},dictionary,gate=null,moveFailure=null;
  const sessions={status:'ready',byId:{s1:{id:'s1',workspaceId:'w1',updatedAt:10,retainedBy:{mainView:1}}}};
  function renderNative(){
    const list=document.getElementById('native-list');if(!list)return;
    const ordered=snapshot.items.map((workspace,index)=>{
      let row=rows.get(workspace.workspaceId);
      if(!row){row=document.createElement('div');row.dataset.rowKey=`workspace:${workspace.workspaceId}`;row.tabIndex=0;
        const label=document.createElement('span');label.id=`label-${workspace.workspaceId}`;row.append(label);
        const button=document.createElement('button');button.id=`menu-${workspace.workspaceId}`;button.textContent='…';row.append(button);
        for(const sessionId of workspace.sessionIds){const chat=document.createElement('div');chat.dataset.rowKey=`session:${sessionId}`;chat.textContent=`Existing ${sessionId}`;row.append(chat);}
        rows.set(workspace.workspaceId,row);
      }
      row.querySelector(`#label-${workspace.workspaceId}`).textContent=workspace.title;
      row.style.position='absolute';row.style.top=`${index*40}px`;row.style.transform=`translateY(${index*4}px)`;
      return row;
    });
    list.replaceChildren(...ordered);
  }
  function publish(items){snapshot={...snapshot,items};renderNative();for(const fn of listeners)fn();}
  const ctx={
    effect(fn){disposers.push(fn());},
    locale:{register(_ns,values){dictionary=values[locale];return()=>{};},bind(){return key=>dictionary[key];}},
    slots:{inject(_name,fn){fn();},register(options,component){entries.set(options.key||options.id,component);return()=>{};}},
    layout:{selectPanel(id){panels.push(id);}},
    workspaces:{list:{getSnapshot:()=>snapshot,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}},
      create:async args=>{workspaceWrites.push(['create',args]);return workspaces[0];},rename:async(...args)=>workspaceWrites.push(['rename',...args]),delete:async id=>workspaceWrites.push(['delete',id])},
    sessions:{list:{getSnapshot:()=>sessions,subscribe:()=>()=>{}},create:async args=>{created.push(args);return 'unexpected-created-session';}},
    uiWorkspace:{openSession:id=>opened.push(id),startSession:id=>started.push(id)},
    remote:{directoryPicker:{pick:async()=>({ok:false})}},
  };
  if(supported)ctx.workspaces.insertBefore=async(workspaceId,beforeWorkspaceId)=>{
    moves.push({workspaceId,beforeWorkspaceId,pinsAtCall:dom.window.localStorage.getItem(KEY),orderAtCall:dom.window.localStorage.getItem(ORDER_KEY)});
    if(gate)await gate;const failure=typeof moveFailure==='function'?moveFailure(moves.length):moveFailure;if(failure)throw new Error(failure);
    const item=snapshot.items.find(item=>item.workspaceId===workspaceId);assert.ok(item,`Unknown move source ${workspaceId}`);
    const remaining=snapshot.items.filter(item=>item.workspaceId!==workspaceId);
    const index=beforeWorkspaceId===undefined?remaining.length:remaining.findIndex(item=>item.workspaceId===beforeWorkspaceId);
    assert.ok(index>=0,`Unknown move target ${beforeWorkspaceId}`);remaining.splice(index,0,item);publish(remaining);
  };
  dom.window.fetch=async(_url,options)=>{const request=JSON.parse(options.body);requests.push(request);return {ok:true,json:async()=>({ok:true,value:{projects:[],activeProjectId:null,directoryWarnings:[]}})};};
  dom.window.__ModuleLoader__={load({factory}){factory(()=>React).apply(ctx);}};
  let disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;for(const fn of disposers.splice(0).reverse())fn?.();};
  t.after(async()=>{await act(async()=>{root.unmount();dispose();});dom.window.close();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
  renderNative();dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
  await act(async()=>root.render(React.createElement(React.Fragment,null,
    React.createElement(entries.get('dsh-workdock-tree-menu')),
    React.createElement(entries.get('dsh-workdock-experience')))));
  const ids=()=>snapshot.items.map(item=>item.workspaceId);
  const nativeIds=()=>[...document.querySelectorAll('#native-list > [data-row-key]')].map(row=>row.dataset.rowKey.slice('workspace:'.length));
  const context=async id=>{let event;await act(async()=>{event=new dom.window.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:40,clientY:60});document.getElementById(`label-${id}`).dispatchEvent(event);});return event;};
  const click=async target=>act(async()=>{const node=typeof target==='string'?document.querySelector(target):target;assert.ok(node,`Missing click target ${target}`);node.click();});
  const menuLabels=()=>[...document.querySelectorAll('[role=menuitem]')].map(node=>node.textContent);
  const menuAction=label=>{const node=[...document.querySelectorAll('[role=menuitem]')].find(node=>node.textContent===label);assert.ok(node,`Missing menu action ${label}; got ${menuLabels().join(', ')}`);return node;};
  const action=async label=>click(menuAction(label));
  const pin=async id=>{await context(id);await action(locale==='zh'?'置顶':'Pin');};
  const unpin=async id=>{await context(id);await action(locale==='zh'?'取消置顶':'Unpin');};
  const storage=async(value,{key=KEY}={})=>act(async()=>{
    const oldValue=dom.window.localStorage.getItem(key);
    if(value===null)dom.window.localStorage.removeItem(key);else dom.window.localStorage.setItem(key,value);
    dom.window.dispatchEvent(new dom.window.StorageEvent('storage',{key,oldValue,newValue:value,storageArea:dom.window.localStorage,url:'https://pins.test/other-tab'}));
  });
  const assertNative=()=>{
    assert.deepEqual(nativeIds(),ids(),'only the host model determines native group order');
    assert.equal(document.querySelectorAll('.dpm-tree-pins,[data-dpm-pinned-workspace],.dpm-tree-pin-remove').length,0,'no additional pinned list, shortcuts or duplicate section');
    for(const [index,id]of ids().entries()){
      assert.equal(document.querySelectorAll(`[data-row-key="workspace:${id}"]`).length,1);
      assert.equal(document.querySelector(`[data-row-key="workspace:${id}"]`),rows.get(id),'host workspace rows retain identity');
      assert.equal(rows.get(id).style.top,`${index*40}px`);assert.equal(rows.get(id).style.transform,`translateY(${index*4}px)`,'virtual row geometry belongs to host');
    }
    assert.equal(document.querySelector('[data-row-key="session:s1"]')?.textContent,ids().includes('w1')?'Existing s1':undefined);
  };
  const assertNoChatMutation=()=>{
    assert.deepEqual(opened,[]);assert.deepEqual(started,[]);assert.deepEqual(created,[]);assert.deepEqual(workspaceWrites,[]);assert.deepEqual(panels,[]);
    assert.ok(requests.every(request=>request.args.action==='list'),'native pinning must not call management backend pin/save/bind/touch or mutate chats');
  };
  return {dom,ctx,ids,nativeIds,rows,moves,context,click,menuLabels,menuAction,action,pin,unpin,storage,dispose,assertNative,assertNoChatMutation,
    get saved(){return JSON.parse(dom.window.localStorage.getItem(KEY)||'[]');},
    setGate(value){gate=value;},setMoveFailure(value){moveFailure=value;},
    async setWorkspaces(items){await act(async()=>publish(items));},
    async remount(prefix='next'){await act(async()=>{document.getElementById('tree').innerHTML=nativeMarkup(prefix);renderNative();});},
  };
}

test('native tree right-click and ellipsis share Pin/Unpin; pin reorders actual model groups without extra rows or chat mutations',async t=>{
  const h=await harness(t);assert.equal((await h.context('w3')).defaultPrevented,true);
  const labels=h.menuLabels();assert.ok(labels.includes('Pin'));assert.ok(!labels.includes('Unpin'));
  await h.click('#menu-w3');assert.deepEqual(h.menuLabels(),labels);
  await h.action('Pin');assert.deepEqual(h.saved,['w3']);assert.deepEqual(h.ids(),['w3','w1','w2','w4']);assert.ok(h.moves.length>0);
  assert.deepEqual(JSON.parse(h.dom.window.localStorage.getItem(ORDER_KEY)),['w1','w2','w3','w4']);
  assert.deepEqual(JSON.parse(h.moves[0].pinsAtCall),['w3'],'pin persistence is validated before the first native model write');
  h.assertNative();await h.context('w3');const pinned=h.menuLabels();assert.ok(pinned.includes('Unpin'));assert.ok(!pinned.includes('Pin'));
  await h.click('#menu-w3');assert.deepEqual(h.menuLabels(),pinned);await h.action('Unpin');
  assert.deepEqual(h.saved,[]);assert.deepEqual(h.ids(),['w1','w2','w3','w4']);h.assertNative();h.assertNoChatMutation();
});

test('newly pinned native workspace leads other pins; unpin restores captured unpinned order',async t=>{
  const h=await harness(t);await h.pin('w3');await h.pin('w2');
  assert.deepEqual(h.saved,['w2','w3']);assert.deepEqual(h.ids(),['w2','w3','w1','w4']);
  await h.unpin('w2');assert.deepEqual(h.ids(),['w3','w1','w2','w4']);assert.deepEqual(h.saved,['w3']);
  await h.unpin('w3');assert.deepEqual(h.ids(),['w1','w2','w3','w4']);h.assertNative();h.assertNoChatMutation();
});

test('Chinese native menu labels are explicit 置顶 and 取消置顶',async t=>{
  const h=await harness(t,{locale:'zh'});await h.pin('w4');assert.deepEqual(h.ids(),['w4','w1','w2','w3']);
  await h.unpin('w4');assert.deepEqual(h.ids(),['w1','w2','w3','w4']);h.assertNative();h.assertNoChatMutation();
});

test('legacy browser-local pin ids migrate to native order; duplicates, malformed entries and stale ids make no phantom groups',async t=>{
  const h=await harness(t,{saved:JSON.stringify(['w3','stale','w1','w3',null,17,{},''])});
  assert.deepEqual(h.ids(),['w3','w1','w2','w4']);h.assertNative();h.assertNoChatMutation();
  await h.context('w3');assert.ok(h.menuLabels().includes('Unpin'));await h.context('w2');assert.ok(h.menuLabels().includes('Pin'));
});

test('saved baseline restores normal order after reload and unpin',async t=>{
  const fixtures=workspaceFixtures(),h=await harness(t,{saved:'["w3"]',baseline:'["w1","w2","w3","w4"]',workspaces:[fixtures[2],fixtures[0],fixtures[1],fixtures[3]]});
  assert.deepEqual(h.ids(),['w3','w1','w2','w4']);await h.unpin('w3');assert.deepEqual(h.ids(),['w1','w2','w3','w4']);h.assertNative();
});

test('malformed or non-array saved pins do not change native order and can be replaced by a valid pin',async t=>{
  for(const saved of ['{broken','null','{"w1":true}','"w1"','42'])await t.test(saved,async child=>{
    const h=await harness(child,{saved});assert.deepEqual(h.ids(),['w1','w2','w3','w4']);assert.equal(h.moves.length,0);
    await h.pin('w2');assert.deepEqual(h.saved,['w2']);assert.deepEqual(h.ids(),['w2','w1','w3','w4']);h.assertNative();h.assertNoChatMutation();
  });
});

test('cross-tab pin changes reconcile native model order and ignore unrelated storage events',async t=>{
  const h=await harness(t);await h.storage('["w4","w2"]');assert.deepEqual(h.ids(),['w4','w2','w1','w3']);
  const count=h.moves.length;await h.storage('["w1"]',{key:'unrelated-preference'});assert.deepEqual(h.ids(),['w4','w2','w1','w3']);assert.equal(h.moves.length,count);
  await h.storage('["w3","missing","w3"]');assert.deepEqual(h.ids(),['w3','w4','w2','w1'],'autosync keeps the current relative order of normal workspaces');
  await h.storage(null);assert.deepEqual(h.ids(),['w3','w4','w2','w1'],'cross-tab clear does not undo native manual ordering');h.assertNative();h.assertNoChatMutation();
});

test('storage failures show menu errors without changing pin state or starting native reorder',async t=>{
  const h=await harness(t),prototype=h.dom.window.Storage.prototype,original=prototype.setItem;let fail=false;
  prototype.setItem=function(key,value){if(key===KEY&&fail)throw new h.dom.window.DOMException('Storage quota denied','QuotaExceededError');return original.call(this,key,value);};
  t.after(()=>{prototype.setItem=original;});
  await h.context('w3');fail=true;await h.action('Pin');assert.deepEqual(h.ids(),['w1','w2','w3','w4']);assert.equal(h.moves.length,0);assert.equal(h.dom.window.localStorage.getItem(KEY),null);
  assert.match(document.querySelector('[role=menu] [role=alert]')?.textContent||'',/Storage quota denied/);
  fail=false;await h.action('Pin');const count=h.moves.length;await h.context('w3');fail=true;await h.action('Unpin');
  assert.deepEqual(h.saved,['w3']);assert.deepEqual(h.ids(),['w3','w1','w2','w4']);assert.equal(h.moves.length,count);
  assert.match(document.querySelector('[role=menu] [role=alert]')?.textContent||'',/Storage quota denied/);
  fail=false;await h.action('Unpin');assert.deepEqual(h.saved,[]);h.assertNative();h.assertNoChatMutation();
});

test('pending native reorder disables menu actions and double clicks do not duplicate pin requests',async t=>{
  const h=await harness(t);let release;h.setGate(new Promise(resolve=>{release=resolve;}));await h.context('w4');const button=h.menuAction('Pin');
  await act(async()=>{button.click();button.click();});assert.equal(button.disabled,true);assert.ok([...document.querySelectorAll('[role=menuitem]')].every(node=>node.disabled));
  assert.deepEqual(h.ids(),['w1','w2','w3','w4'],'host order is unchanged until insertBefore resolves');
  assert.equal(h.moves.length,1,'only one native reorder request may be in flight');
  h.setGate(null);await act(async()=>release());assert.deepEqual(h.saved,['w4']);assert.deepEqual(h.ids(),['w4','w1','w2','w3']);h.assertNative();h.assertNoChatMutation();
});

test('native reorder failure is visible in the menu and permits an explicit retry',async t=>{
  const h=await harness(t);h.setMoveFailure('Native order rejected');await h.pin('w3');
  assert.match(document.querySelector('[role=menu] [role=alert]')?.textContent||'',/Native order rejected/);assert.deepEqual(h.ids(),['w1','w2','w3','w4']);assert.deepEqual(h.saved,[],'failed explicit reorder restores previous pin persistence');
  assert.ok([...document.querySelectorAll('[role=menuitem]')].every(node=>!node.disabled),'failure must release busy state');
  h.setMoveFailure(null);await h.action('Pin');assert.deepEqual(h.ids(),['w3','w1','w2','w4']);assert.deepEqual(h.saved,['w3']);h.assertNative();h.assertNoChatMutation();
});

test('partially failed native unpin restores its previous pin preference and original model order',async t=>{
  const h=await harness(t);await h.pin('w4');const count=h.moves.length;
  h.setMoveFailure(index=>index===count+2?'Second native move rejected':null);await h.unpin('w4');
  assert.match(document.querySelector('[role=menu] [role=alert]')?.textContent||'',/Second native move rejected/);
  assert.deepEqual(h.saved,['w4']);assert.deepEqual(h.ids(),['w4','w1','w2','w3'],'best-effort rollback restores already-applied native moves');
  h.setMoveFailure(null);await h.action('Unpin');assert.deepEqual(h.saved,[]);assert.deepEqual(h.ids(),['w1','w2','w3','w4']);h.assertNative();h.assertNoChatMutation();
});

test('unsupported host reorder API reports a menu error, without fallback shortcuts, state changes or chat mutations',async t=>{
  const h=await harness(t,{supported:false});await h.pin('w3');assert.ok(document.querySelector('[role=menu] [role=alert]'));
  assert.deepEqual(h.saved,[]);assert.deepEqual(h.ids(),['w1','w2','w3','w4']);h.assertNative();h.assertNoChatMutation();
});

test('explicit unpin restores its baseline neighbor while preserving other native manual order',async t=>{
  const h=await harness(t),fixtures=workspaceFixtures();await h.pin('w2');
  await h.setWorkspaces([fixtures[1],fixtures[3],fixtures[0],fixtures[2]]);assert.deepEqual(h.ids(),['w2','w4','w1','w3']);
  await h.unpin('w2');assert.deepEqual(h.ids(),['w4','w1','w2','w3'],'only the removed pin moves before its next surviving normal baseline neighbor');
  assert.deepEqual(h.saved,[]);h.assertNative();h.assertNoChatMutation();
});

test('workspace updates stable-partition pins without changing current normal/new workspace order or retaining stale rows',async t=>{
  const h=await harness(t,{saved:'["w3"]'}),fixtures=workspaceFixtures(),added={workspaceId:'new',title:'New workspace',path:'D:/new',sessionIds:[]};
  await h.setWorkspaces([added,fixtures[3],fixtures[2],fixtures[0],fixtures[1]]);
  assert.deepEqual(h.ids(),['w3','new','w4','w1','w2']);h.assertNative();
  await h.setWorkspaces([added,fixtures[3],fixtures[0],fixtures[1]]);assert.deepEqual(h.ids(),['new','w4','w1','w2']);h.assertNative();h.assertNoChatMutation();
});

test('native remount keeps one row per workspace; disposal disconnects storage/model reconciliation and preserves host tree',async t=>{
  const h=await harness(t);await h.pin('w3');await h.remount();h.assertNative();assert.deepEqual(h.ids(),['w3','w1','w2','w4']);
  await act(async()=>h.dispose());const count=h.moves.length;await h.storage('["w2"]');await h.remount('after');
  assert.equal(h.moves.length,count);assert.deepEqual(h.ids(),['w3','w1','w2','w4']);assert.equal((await h.context('w1')).defaultPrevented,false);
  assert.ok(document.getElementById('native-add'));assert.ok(document.getElementById('native-list'));h.assertNative();h.assertNoChatMutation();
});
