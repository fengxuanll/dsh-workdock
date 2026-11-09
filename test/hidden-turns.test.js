import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';

const prefix='dsh-workdock-hidden-turns:v1:';
const key=id=>prefix+encodeURIComponent(id);
// Shape from the installed Harness NodeSeat/ChatGroupSeat: one turn spans
// sibling seats; process members nest beneath a group; tail owns a list slot.
const seat=(id,turn,content,kind='user-message')=>`<div id="${id}" data-chat-flow-key="${id}" data-chat-node-key="${id}" data-chat-flow-kind="${kind}" data-chat-turn="${turn}"><div data-slot="conversation.chat.node">${content}</div></div>`;
const nativeBar=()=>'<div data-clock="end"><button data-native-copy>Copy</button><button data-native-branch>Branch</button><span class="fixture_endInfo"><button data-native-usage>Usage</button><span class="fixture_timeEnd">21:09</span></span></div>';
const tail=(id,turn,action)=>seat(id,turn,`<div data-turn-tail="${turn}"><div id="${action}"></div>${nativeBar()}</div>`,'turn-tail');
const chat=(id,body)=>`<section data-conversation-content data-conversation-session="${id}" data-conversation-region="chat"><div data-conversation-scroll><div data-chat-flow>${body}</div></div></section>`;

// Actual TurnTail owner: node.location.turn is a Turn object; NodeSeat writes
// location.turn.turn (a number) into data-chat-turn. Keep this boundary realistic.
async function harness({storage={},language='zh',turnOwner=turn=>Object.freeze({turn,data:new Map()})}={}){
 const dom=new JSDOM(chat('s1',seat('user1',1,'Question')+seat('reply1',1,'Answer','assistant-message')+tail('tail1',1,'action1')+seat('user2',2,'Keep me')+tail('tail2',2,'action2'))+chat('s2',seat('other',1,'Other session')+tail('tail-other',1,'action-other'))+'<div id="dock"></div><div id="feedback"></div>',{url:'https://harness.test/',runScripts:'outside-only'});
 for(const [k,v] of Object.entries(storage))dom.window.localStorage.setItem(k,v);
 const old={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');
 const ReactDOM=await import('react-dom');
 const entries=new Map(),disposers=[],roots=[],snapshot={byId:{}};let dictionary;
 const ctx={effect(fn){disposers.push(fn());},locale:{register(_n,values){dictionary=values[language];return()=>{};},bind(){return k=>dictionary[k];}},slots:{inject(_n,fn){fn();},register(options,component){entries.set(options.id,{options,component});return()=>{};}},sessions:{list:{subscribe:()=>()=>{},getSnapshot:()=>snapshot}},workspaces:{list:{subscribe:()=>()=>{},getSnapshot:()=>({items:[]})}},remote:{directoryPicker:{}},uiWorkspace:{}};
 dom.window.fetch=()=>{throw Error('Hiding must never send a host request');};
 dom.window.__ModuleLoader__={load({factory}){factory(name=>name==='react-dom'?ReactDOM:React).apply(ctx);}};
 dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
 async function mount(target,id,owner){
  const entry=entries.get(id);assert.ok(entry,`Missing slot ${id}`);const host=document.querySelector(target),root=createRoot(host);roots.push(root);
  // A session-scoped slot injects using sessionId, not its render owner. Owner
  // props (turn/seq for turnTail) are passed separately by renderSlot.
  const sessionId=typeof owner==='string'?owner:host.closest('[data-conversation-session]')?.getAttribute('data-conversation-session');
  const props={...entry.options.inject?.(sessionId),...(typeof owner==='object'?owner:{})};
  await act(async()=>root.render(React.createElement(entry.component,props)));
 }
 await mount('#action1','dsh-workdock-hide-turn',{turn:turnOwner(1)});
 await mount('#action2','dsh-workdock-hide-turn',{turn:turnOwner(2)});
 await mount('#action-other','dsh-workdock-hide-turn',{turn:turnOwner(1)});
 await mount('#dock','dsh-workdock-restore-turns','s1');
 await mount('#feedback','dsh-workdock-experience');
 return {dom,ctx,entries,disposers,async click(selector){const node=document.querySelector(selector);assert.ok(node,selector);await act(async()=>node.click());},async flush(fn=()=>{}){await act(async()=>{fn();});},async close(){await act(async()=>{for(const root of roots)root.unmount();});assert.equal(document.querySelectorAll('.dpm-turn-action-seat').length,0,'unmount cleans owned portal containers');for(const dispose of disposers.reverse())if(typeof dispose==='function')dispose();dom.window.close();Object.assign(globalThis,old);}};
}

test('hide a whole turn, keep original DOM and other turns/sessions, restore individually and all',async()=>{
 const app=await harness();
 try{
  assert.equal(app.entries.get('dsh-workdock-hide-turn').options.name,'conversation.chat.turnTail');
  const restoreEntry=app.entries.get('dsh-workdock-restore-turns').options;
   const projectEntry=app.entries.get('dsh-workdock-dock').options;
   assert.equal(restoreEntry.name,'conversation.composer.dock');
   assert.equal(restoreEntry.name,projectEntry.name,'restore shares the bottom status slot with the project');
   assert.equal(restoreEntry.order,projectEntry.order+1,'restore is immediately after the project entry');
   assert.equal([...app.entries.values()].some(entry=>entry.options.name==='conversation.input.dock'),false,'no restore entry above the input');
  assert.equal(document.querySelector('#tail1 [data-dpm-hide-turn]').getAttribute('data-dpm-hide-turn'),'1','scoped Turn owner must normalize to its numeric id');
  assert.equal(document.querySelector('#tail1 [data-dpm-hide-turn]').disabled,false);
  await app.flush(()=>{const child=document.createElement('div');child.id='native-hidden';child.hidden=true;document.querySelector('#reply1').append(child);});
  await app.click('#tail1 [data-dpm-hide-turn]');
  for(const id of ['user1','reply1','tail1'])assert.equal(document.getElementById(id).classList.contains('dpm-turn-hidden'),true);
  assert.equal(document.querySelector('#user1 > [data-slot]').textContent,'Question');
  assert.equal(document.querySelector('#reply1 > [data-slot]').textContent,'Answer');
  assert.equal(document.querySelectorAll('.dpm-turn-restore').length,1);
  assert.equal(document.activeElement,document.querySelector('.dpm-turn-restore button'));
  assert.notEqual(domStyle(app,'#reply1'),'none','outer zero-height seats retain ordered scroll positions');
  assert.equal(app.dom.window.getComputedStyle(document.querySelector('#reply1')).height,'0px');
  assert.equal(domStyle(app,'#user1 > [data-slot]'),'none');
  assert.equal(document.querySelector('#reply1 > [data-slot]').hidden,true);
  assert.notEqual(domStyle(app,'#user1'),'none');
  for(const id of ['user2','other'])assert.equal(document.getElementById(id).classList.contains('dpm-turn-hidden'),false);
  assert.deepEqual(JSON.parse(app.dom.window.localStorage.getItem(key('s1'))),['1']);
  const restoreAll=document.querySelector('#dock button');
   assert.equal(restoreAll.textContent,'','restore all is icon-only, without a standalone label');
   assert.equal(restoreAll.title,'恢复全部隐藏轮次 (1)');
   assert.equal(restoreAll.getAttribute('aria-label'),restoreAll.title);
   assert.ok(restoreAll.querySelector('svg[aria-hidden="true"]'));
   assert.equal(app.dom.window.getComputedStyle(restoreAll).width,'24px');
   assert.equal(app.dom.window.getComputedStyle(restoreAll).height,'24px');
  await app.click('.dpm-turn-restore button');assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0);assert.equal(document.querySelector('#dock').textContent,'');
  assert.equal(document.activeElement,document.querySelector('#tail1 [data-dpm-hide-turn]'));
  assert.equal(document.querySelector('#reply1 > [data-slot]').hasAttribute('hidden'),false);
  assert.equal(document.querySelector('#native-hidden').hidden,true,'native hidden state survives restore');
  await app.click('#tail1 [data-dpm-hide-turn]');await app.click('#tail2 [data-dpm-hide-turn]');
  await app.click('#tail-other [data-dpm-hide-turn]');
  assert.equal(document.querySelectorAll('.dpm-turn-restore').length,3);
  assert.equal(document.querySelector('#dock button').title,'恢复全部隐藏轮次 (2)','tooltip counts only the current session');
  await app.click('#dock button');assert.equal(document.querySelector('#user1').classList.contains('dpm-turn-hidden'),false);
  assert.equal(document.querySelector('#user2').classList.contains('dpm-turn-hidden'),false);
  assert.equal(document.querySelector('#other').classList.contains('dpm-turn-hidden'),true);
  assert.equal(app.dom.window.localStorage.getItem(key('s1')),null);
 }finally{await app.close();}
});
test('legacy numeric turn owners still hide and restore using the same persisted identity',async()=>{
 const app=await harness({turnOwner:turn=>turn});
 try{
  await app.click('#tail1 [data-dpm-hide-turn]');
  assert.equal(document.querySelectorAll('.dpm-turn-placeholder').length,1);
  assert.deepEqual(JSON.parse(app.dom.window.localStorage.getItem(key('s1'))),['1']);
  await app.click('.dpm-turn-restore button');
  assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0);
 }finally{await app.close();}
});

test('icon is immediately before native time, survives toolbar replacement and waits for a valid target',async()=>{
 const app=await harness();
 try{
  const button=document.querySelector('#tail1 .dpm-turn-hide-button'),clock=document.querySelector('#tail1 .fixture_timeEnd');
  const copy=document.querySelector('#tail1 [data-native-copy]'),branch=document.querySelector('#tail1 [data-native-branch]');
  assert.equal(button.parentElement.nextElementSibling,clock);
  assert.equal(copy.nextElementSibling,branch,'native button order is unchanged');
  assert.equal(branch.nextElementSibling,clock.parentElement,'native end info remains in place');
  assert.equal(button.parentElement.previousElementSibling.hasAttribute('data-native-usage'),true,'usage remains before hide, then time');
  assert.equal(button.closest('[data-clock]').getAttribute('data-clock'),'end');
  assert.equal(button.textContent,'');assert.equal(button.getAttribute('aria-label'),'隐藏本轮');assert.match(button.title,/隐藏本轮/);
  assert.ok(button.querySelector('svg[aria-hidden="true"]'));
  assert.equal(document.querySelector('#action1').textContent,'','no extra row of text');
  await app.flush(()=>{const next=document.createElement('div');next.innerHTML=nativeBar();document.querySelector('#tail1 [data-clock]').replaceWith(next.firstChild);});
  assert.equal(document.querySelectorAll('#tail1 .dpm-turn-hide-button').length,1);
  assert.equal(document.querySelector('#tail1 .dpm-turn-action-seat').nextElementSibling.className,'fixture_timeEnd');
  await app.flush(()=>document.querySelector('#tail1 [data-clock]').remove());
  assert.equal(document.querySelectorAll('#tail1 .dpm-turn-hide-button').length,0,'no detached or separate fallback control');
  await app.flush(()=>document.querySelector('#tail1 [data-turn-tail]').insertAdjacentHTML('beforeend',nativeBar()));
  assert.equal(document.querySelectorAll('#tail1 .dpm-turn-hide-button').length,1);
  await app.click('#tail1 .dpm-turn-hide-button');
  const control=document.querySelector('.dpm-turn-restore'),style=app.dom.window.getComputedStyle(control);
  assert.equal(style.minHeight,'22px');assert.equal(style.marginTop,'0px');assert.equal(style.paddingTop,'0px');
  await app.click('.dpm-turn-restore button');
 }finally{await app.close();}
});

test('malformed turn owners are disabled and never persist an object as an identity',async()=>{
 for(const owner of [undefined,null,{}, {turn:-1},{turn:'not-a-turn'}]){
  const app=await harness({turnOwner:()=>owner});
  try{
   assert.equal(document.querySelector('#tail1 .dpm-turn-hide-button').disabled,true);
   await app.click('#tail1 .dpm-turn-hide-button');
   assert.equal(app.dom.window.localStorage.getItem(key('s1')),null);
   assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0);
  }finally{await app.close();}
 }
});
function domStyle(app,selector){return app.dom.window.getComputedStyle(document.querySelector(selector)).display;}

test('preferences survive remount/paging and process groups, embedded panes are isolated, unload restores DOM',async()=>{
 const app=await harness({storage:{[key('s1')]:'["1"]'}});
 try{
  assert.equal(document.querySelector('#user1').classList.contains('dpm-turn-hidden'),true);
  await app.flush(()=>{
   const group=document.createElement('div');group.id='process';group.setAttribute('data-chat-turn','1');group.setAttribute('data-chat-flow-key','group');group.setAttribute('data-chat-group-key','group');group.innerHTML=seat('nested-tool',1,'Tool output','tool-call');
   document.getElementById('reply1').before(group);
   const extra=document.createElement('div');extra.innerHTML=chat('embedded',seat('embedded',1,'Embedded child'));document.getElementById('reply1').append(extra);
  });
  assert.equal(document.querySelector('#process').classList.contains('dpm-turn-hidden'),true);
  assert.equal(document.querySelector('#nested-tool').classList.contains('dpm-turn-hidden'),false,'nested process seats inherit outer hiding, no redundant placeholder');
  assert.equal(document.querySelectorAll('#process [data-chat-flow-key]:not([hidden]):not([hidden] *)').length,0,'native anchor queries must exclude invisible process members');
  assert.equal(document.querySelector('#embedded').classList.contains('dpm-turn-hidden'),false,'no preference leaks to child session');
  await app.flush(()=>{document.querySelector('#user1').remove();});
  assert.equal(document.querySelectorAll('.dpm-turn-restore').length,1);assert.ok(document.querySelector('#process > .dpm-turn-restore'));
  await app.flush(()=>{document.querySelector('#process').className='native-updated';});
  assert.equal(document.querySelector('#process').classList.contains('dpm-turn-hidden'),true,'native class updates do not undo hiding');
  await app.click('#dock button');assert.equal(document.querySelector('#process').className,'native-updated');
  await app.click('#tail1 [data-dpm-hide-turn]');
  for(const dispose of app.disposers.splice(0).reverse())if(typeof dispose==='function')dispose();
  assert.equal(document.querySelectorAll('.dpm-turn-hidden,.dpm-turn-placeholder,.dpm-turn-restore').length,0);
  assert.deepEqual(JSON.parse(app.dom.window.localStorage.getItem(key('s1'))),['1'],'unload does not erase user preference');
 }finally{await app.close();}
});

test('same-session panes, late streamed seats, recycled identity and composer exclusion',async()=>{
 const app=await harness();
 try{
  await app.click('#tail1 [data-dpm-hide-turn]');
  await app.flush(()=>{
   const mirror=document.createElement('div');mirror.innerHTML=chat('s1',seat('mirror1',1,'Mirror')+seat('mirror2',2,'Visible'));document.body.append(mirror);
   const late=document.createElement('div');late.innerHTML=seat('streamed',1,'Late tool result','tool-result');document.querySelector('[data-chat-flow]').append(late);
   const composer=document.createElement('div');composer.setAttribute('data-conversation-region','composer');composer.innerHTML=seat('draft',1,'Draft must stay visible');document.querySelector('[data-conversation-session="s1"]').append(composer);
  });
  assert.equal(document.querySelectorAll('.dpm-turn-restore').length,2,'one placeholder per occurrence');
  assert.equal(document.querySelector('#streamed').classList.contains('dpm-turn-hidden'),true);
  assert.equal(document.querySelector('#draft').classList.contains('dpm-turn-hidden'),false);
  assert.equal(document.querySelector('#mirror2').classList.contains('dpm-turn-hidden'),false);
  await app.flush(()=>{document.querySelector('#mirror1').setAttribute('data-chat-turn','2');});
  assert.equal(document.querySelector('#mirror1').classList.contains('dpm-turn-hidden'),false,'recycled seats must lose stale hiding');
  await app.click('#dock button');assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0);
 }finally{await app.close();}
});

test('cross-tab updates and clear, malformed storage, identity-only writes and failed persistence',async()=>{
 const app=await harness({storage:{[key('s1')]:'not JSON',[key('s2')]:'[null,{},"-1","NaN","1x"]'},language:'en'});
 try{
  assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0);
  await app.flush(()=>{app.dom.window.localStorage.setItem(key('s1'),'["2"]');app.dom.window.dispatchEvent(new app.dom.window.StorageEvent('storage',{key:key('s1')}));});
  assert.equal(document.querySelector('#user2').classList.contains('dpm-turn-hidden'),true);
  // A tab that has not yet received the event must merge latest storage at write.
  app.dom.window.localStorage.setItem(key('s1'),'["2","3"]');
  await app.click('#tail1 [data-dpm-hide-turn]');assert.deepEqual(JSON.parse(app.dom.window.localStorage.getItem(key('s1'))),['2','3','1']);
  assert.doesNotMatch(app.dom.window.localStorage.getItem(key('s1')),/Question|Answer/);
  await app.flush(()=>{app.dom.window.localStorage.clear();app.dom.window.dispatchEvent(new app.dom.window.StorageEvent('storage',{key:null}));});
  assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0);assert.equal(document.querySelector('#dock').textContent,'');
  const proto=app.dom.window.Storage.prototype,original=proto.setItem;
  proto.setItem=()=>{throw new Error('QuotaExceededError');};
  try{await app.click('#tail1 [data-dpm-hide-turn]');}finally{proto.setItem=original;}
  assert.equal(document.querySelectorAll('.dpm-turn-hidden').length,0,'failed persistence must not publish a hidden state');
  assert.match(document.querySelector('[role=alert]').textContent,/Cannot save hidden turns/);
 }finally{await app.close();}
});
