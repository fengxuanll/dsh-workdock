import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';

const directory=(extra={})=>({path:null,revision:3,effectivePath:'D:/project',source:'project',projectId:'p',projectTitle:'Project',folders:['D:/project','D:/reference'],projectPrimary:'D:/project',...extra});
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
async function harness({initial=directory(),get,set}={}){
 const dom=new JSDOM('<div id="dock"></div><div id="overlay"></div><div id="manager"></div><button id="native">Native session menu</button>',{url:'https://harness.test/',runScripts:'outside-only'});
 const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 dom.window.structuredClone=structuredClone;
 const {createRoot}=await import('react-dom/client');const ReactDOM=await import('react-dom');
 const entries=new Map(),effects=[],roots=[],calls=[],opened=[],menus=new Map([['native.rename',{target:'session',order:200,resolve:({sessionId})=>[{id:'rename',label:'Rename',run:()=>opened.push('rename:'+sessionId)}]}]]);
 let dictionary,current=initial,picker='D:/outside',confirmResult=false,confirmations=0;
 const projects=[{id:'p',title:'Project',folders:['D:/project','D:/reference'],primary:'D:/project',revision:1,sessionRoots:['D:/project']},{id:'q',title:'Other project',folders:['D:/other'],primary:'D:/other',revision:2,sessionRoots:['D:/other']}];
 const snapshot={byId:{s1:{id:'s1',retainedBy:{mainView:1}},s2:{id:'s2',retainedBy:{mainView:0}}}};
 const ctx={effect(fn){const dispose=fn();effects.push(dispose);return dispose;},locale:{register(_ns,values){dictionary=values.en;return()=>{};},bind:()=>key=>dictionary[key],subscribe:()=>()=>{}},slots:{inject(_slot,fn){fn();},register(options,component){entries.set(options.id||options.key,{options,component});return()=>{};}},sessions:{list:{getSnapshot:()=>snapshot,subscribe:()=>()=>{}}},workspaces:{list:{getSnapshot:()=>({items:[]}),subscribe:()=>()=>{}}},uiWorkspace:{openSession:id=>opened.push(id)},remote:{directoryPicker:{pick:async()=>({ok:true,value:picker})}},contextMenus:{register(input){assert.ok(!menus.has(input.id));menus.set(input.id,input);return()=>menus.delete(input.id);}}};
 dom.window.confirm=()=>{confirmations++;return confirmResult;};
 dom.window.fetch=async(_url,options)=>{
  const request=JSON.parse(options.body);calls.push(request);const {args,sessionId}=request;
  let value={};
  try{
   if(args.action==='get_session_directory')value={sessionDirectory:get?await get(sessionId,calls):current};
   if(args.action==='list')value={projects,activeProjectId:'p',directoryWarnings:[],sessionDirectory:current};
   if(args.action==='check_directories')value={directoryWarnings:[]};
   if(args.action==='set_session_directory'){
    current=set?await set(request):directory({...current,path:args.path,source:args.path?'session':'project',effectivePath:args.path||'D:/project',revision:current.revision+1});value={sessionDirectory:current};
   }
   if(args.action==='save')value={project:{...args,id:args.id||'new',sessionRoots:[]}};
   return {ok:true,json:async()=>({ok:true,value})};
  }catch(error){return {ok:false,json:async()=>({ok:false,error:error.message})};}
 };
 dom.window.__ModuleLoader__={load({factory}){factory(name=>name==='react-dom'?ReactDOM:React).apply(ctx);}};
 dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
 async function mount(id,selector,sessionId){const entry=entries.get(id);assert.ok(entry,id);const root=createRoot(document.querySelector(selector));roots.push(root);await act(async()=>root.render(React.createElement(entry.component,entry.options.inject?.(sessionId))));return root;}
 await mount('dsh-workdock-session-directory','#dock','s1');await mount('dsh-workdock-session-directory-dialog','#overlay');
 const app={dom,ctx,entries,calls,opened,menus,set picker(value){picker=value;},set confirm(value){confirmResult=value;},get confirmations(){return confirmations;},set current(value){current=value;},
  async flush(fn=()=>{}){await act(async()=>{await fn();});},
  async click(selector){const node=typeof selector==='string'?document.querySelector(selector):selector;assert.ok(node,String(selector));await act(async()=>node.click());},
  async button(text,scope=document){const node=[...scope.querySelectorAll('button')].find(n=>n.textContent===text);assert.ok(node,'button '+text);await app.click(node);},
  async select(node,value){assert.ok(node);await act(async()=>{node.value=value;node.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});},
  async key(key,extra={}){const event=new dom.window.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...extra});await act(async()=>document.querySelector('[role=dialog]').dispatchEvent(event));return event;},
  async menu(sessionId){const actions=[...menus.values()].filter(p=>p.target==='session').sort((a,b)=>a.order-b.order).flatMap(p=>p.resolve({sessionId,displayTitle:'Captured '+sessionId}));const action=actions.find(a=>a.id==='set-working-directory');assert.ok(action);await act(async()=>action.run());return actions;},
  async manager(){await mount('dsh-workdock-projects','#manager','s1');},
  async close(){await act(async()=>{for(const root of roots)root.unmount();for(const dispose of effects.reverse())if(typeof dispose==='function')await dispose();});assert.equal(menus.size,1,'owned menu registration disposed, native retained');dom.window.close();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
 };return app;
}

test('directory dock is an icon with effective path/source, override highlight and native slot order',async()=>{
 const app=await harness();try{
  const button=document.querySelector('#dock button');assert.equal(button.textContent,'');assert.ok(button.querySelector('svg[aria-hidden="true"]'));assert.equal(button.getAttribute('aria-label'),'Session working directory');assert.match(button.title,/D:\/project\nSource: Follow project directory/);assert.equal(button.dataset.override,'false');
  assert.equal(app.entries.get('dsh-workdock-session-directory').options.order,10.5);assert.equal(app.entries.get('dsh-workdock-dock').options.order,10);assert.equal(app.entries.get('dsh-workdock-restore-turns').options.order,11);
  app.current=directory({path:'D:/custom',effectivePath:'D:/custom',source:'session'});await app.flush(()=>app.dom.window.dispatchEvent(new app.dom.window.Event('focus')));assert.equal(button.dataset.override,'true');assert.match(button.title,/D:\/custom\nSource: Session-specific directory/);
 }finally{await app.close();}
});

test('dialog loads follow/custom modes, project sources and picker, warns outside and saves captured revision',async()=>{
 let held;const app=await harness({get:async()=>held?await held.promise:directory()});try{
  held=deferred();await app.click('#dock button');assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-busy'),'true');assert.match(document.querySelector('[role=status]').textContent,/Loading working directory/);assert.equal(document.querySelector('.dpm-save').disabled,true);
  await app.flush(()=>held.resolve(directory()));held=null;
  assert.equal(document.querySelector('input[value=follow]').checked,true);assert.equal(document.querySelector('.dpm-directory-summary strong').textContent,'D:/project');
  await app.click('input[value=custom]');const select=document.querySelector('.dpm-directory-folders');assert.deepEqual([...select.options].map(n=>n.value),['','D:/project','D:/reference']);await app.select(select,'D:/reference');assert.equal(document.querySelector('.dpm-directory-selected').textContent,'D:/reference');
  await app.button('Choose another directory…');assert.equal(document.querySelector('.dpm-directory-selected').textContent,'D:/outside');assert.match(document.querySelector('[role=dialog]').textContent,/outside the project folders.*Harness permissions and sandbox rules still apply/);
  await app.button('Save');assert.deepEqual(app.calls.filter(c=>c.args.action==='set_session_directory').at(-1),{sessionId:'s1',args:{action:'set_session_directory',path:'D:/outside',directoryRevision:3}});assert.equal(document.querySelector('[role=dialog]'),null);assert.equal(document.querySelector('#dock button').dataset.override,'true');
 }finally{await app.close();}
});

test('restore follow submits null and the current directory revision',async()=>{
 const app=await harness({initial:directory({path:'D:/custom',source:'session',effectivePath:'D:/custom',revision:8})});try{
  await app.click('#dock button');assert.equal(document.querySelector('input[value=custom]').checked,true);await app.button('Follow project again');assert.deepEqual(app.calls.filter(c=>c.args.action==='set_session_directory').at(-1),{sessionId:'s1',args:{action:'set_session_directory',path:null,directoryRevision:8}});assert.equal(document.querySelector('#dock button').dataset.override,'false');
 }finally{await app.close();}
});

test('load failures and stale revisions stay in dialog and can reload before saving',async()=>{
 let loadError=false,stale=true;const app=await harness({get:async()=>{if(loadError)throw Error('Directory unavailable');return directory({revision:stale?3:9});},set:async request=>{if(stale)throw Error('Stale directory revision');return directory({path:request.args.path,effectivePath:request.args.path,source:'session',revision:10});}});try{
  loadError=true;await app.click('#dock button');assert.match(document.querySelector('[role=alert]').textContent,/Directory unavailable/);loadError=false;await app.button('Reload directory');await app.click('input[value=custom]');await app.button('Save');assert.match(document.querySelector('[role=alert]').textContent,/Stale directory revision/);
  stale=false;await app.button('Reload directory');assert.equal(document.querySelector('input[value=follow]').checked,true);assert.equal(document.querySelector('[role=alert]'),null);await app.click('input[value=custom]');await app.button('Save');assert.equal(app.calls.filter(c=>c.args.action==='set_session_directory').at(-1).args.directoryRevision,9);
 }finally{await app.close();}
});

test('official session menu captures a noncurrent session and preserves native contributions',async()=>{
 const app=await harness();try{
  const contribution=app.menus.get('dsh-workdock.set-working-directory');assert.equal(contribution.target,'session');assert.equal(contribution.order,250);
  const actions=await app.menu('s2');assert.deepEqual(actions.map(a=>a.id),['rename','set-working-directory']);assert.deepEqual(app.opened,['s2']);assert.equal(app.calls.filter(c=>c.args.action==='get_session_directory').at(-1).sessionId,'s2');
  await app.click('input[value=custom]');await app.button('Save');assert.equal(app.calls.filter(c=>c.args.action==='set_session_directory').at(-1).sessionId,'s2');assert.equal(document.querySelector('[data-row-key]'),null,'no fabricated session row required');assert.ok(document.querySelector('#native'));
 }finally{await app.close();}
});

test('dialog traps Tab and discards directory edits without confirmation on every close path',async()=>{
 const app=await harness();try{
  const trigger=document.querySelector('#dock button');trigger.focus();await app.click(trigger);const dialog=document.querySelector('[role=dialog]');assert.equal(document.activeElement,dialog);
  assert.equal((await app.key('Tab')).defaultPrevented,true);assert.equal(document.activeElement,dialog.querySelector('button'));
  await app.key('Tab',{shiftKey:true});assert.equal(document.activeElement,dialog.querySelector('.dpm-cancel'),'disabled Save is excluded from focus loop');
  for(const exit of ['cancel','escape','backdrop','close']){
   if(exit!=='cancel')await app.click(trigger);
   assert.equal(document.querySelector('input[value=follow]').checked,true,'reopening discards the unsaved mode');
   await app.click('input[value=custom]');
   if(exit==='cancel')await app.button('Cancel');
   else if(exit==='escape')await app.key('Escape');
   else if(exit==='backdrop')await app.click('.dpm-backdrop');
   else await app.click('button[aria-label="Close"]');
   assert.equal(document.querySelector('[role=dialog]'),null);assert.equal(document.activeElement,trigger);
   assert.equal(app.confirmations,0,'closing never asks for confirmation');
   assert.equal(app.calls.filter(c=>c.args.action==='set_session_directory').length,0,'cancel does not persist edits');
   const unload=new app.dom.window.Event('beforeunload',{cancelable:true});app.dom.window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,false,'closed drafts do not prevent navigation');
  }
 }finally{await app.close();}
});

test('late directory and picker responses cannot overwrite a newly targeted session dialog',async()=>{
 let held=null;const app=await harness({get:async id=>id==='s1'&&held?await held.promise:directory({effectivePath:id==='s2'?'D:/second':'D:/project',revision:id==='s2'?7:3})});try{
  held=deferred();await app.click('#dock button');await app.menu('s2');assert.equal(document.querySelector('.dpm-directory-summary strong').textContent,'D:/second');await app.flush(()=>held.resolve(directory({effectivePath:'D:/late'})));held=null;assert.equal(document.querySelector('.dpm-directory-summary strong').textContent,'D:/second');
  const picker=deferred();app.ctx.remote.directoryPicker.pick=()=>picker.promise;await app.click('input[value=custom]');await app.button('Choose another directory…');await app.menu('s1');await app.flush(()=>picker.resolve({ok:true,value:'D:/late-picker'}));assert.equal(document.querySelector('.dpm-directory-summary strong').textContent,'D:/project');assert.equal(document.querySelector('input[value=follow]').checked,true);
 }finally{await app.close();}
});

test('late save settlement leaves a newer session dialog and its revision intact',async()=>{
 const pending=deferred();const app=await harness({set:async()=>pending.promise,get:async id=>directory({effectivePath:id==='s2'?'D:/second':'D:/project',revision:id==='s2'?17:3})});try{
  await app.click('#dock button');await app.click('input[value=custom]');await app.button('Save');assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-busy'),'true');await app.menu('s2');
  await app.flush(()=>pending.resolve(directory({path:'D:/project',source:'session',revision:4})));assert.equal(document.querySelector('.dpm-directory-summary strong').textContent,'D:/second');assert.equal(document.querySelector('input[value=follow]').checked,true);assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-busy'),'false');
 }finally{await app.close();}
});

for(const policyValue of ['keep','follow'])test(`saving a new project with a session override requires explicit ${policyValue} directory policy and revision`,async()=>{
 const app=await harness({initial:directory({path:'D:/custom',effectivePath:'D:/custom',source:'session',revision:12})});try{
  await app.manager();await app.button('+ Add project');await app.button('Add folder');const policy=document.querySelector('.dpm-directory-policy select');assert.ok(policy);assert.equal(document.querySelector('#manager [role=dialog] .dpm-save').disabled,true);
  assert.deepEqual([...policy.options].map(option=>option.value),['','keep','follow']);await app.select(policy,policyValue);await app.button('Save',document.querySelector('#manager [role=dialog]'));const save=app.calls.find(c=>c.args.action==='save');assert.equal(save.sessionId,'s1');assert.equal(save.args.directoryPolicy,policyValue);assert.equal(save.args.directoryRevision,12);
 }finally{await app.close();}
});
