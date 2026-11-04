import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';

test('chat file context menu preserves native clicks, targets owning session and cleans up',async()=>{
 const dom=new JSDOM(`<div id="overlay"></div><section data-conversation-session="s2"><div data-conversation-region="chat"><button id="file" class="_fileLink_host_1" title="Source/中文 report.sql"><svg><path id="icon"/></svg>Report.sql</button><button id="mention" title='@"D:\\work\\Report.cs"'>Report.cs</button><a id="local" href="Source/file.sql#L12-L20">file</a><a id="resource" href="dsh-resource://file/session/s2/Source/report.sql">resource</a><a id="web" href="https://example.org/a.sql">web</a><code id="plain">Report.sql</code></div><div data-conversation-region="composer"><button id="composer" class="_fileLink_host_1" title="file.sql">composer</button></div></section>`,{runScripts:'outside-only',url:'https://harness.test/proxy/'});
 const old={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');const root=createRoot(document.querySelector('#overlay'));
 const entries=new Map(),disposers=[],calls=[];let dictionary,fail=false;
 const snapshot={byId:{s1:{id:'s1',retainedBy:{mainView:1}}}};
 const ctx={effect(fn){disposers.push(fn());},locale:{register(_n,v){dictionary=v.zh;return()=>{};},bind(){return k=>dictionary[k];}},slots:{inject(_n,fn){fn();},register(o,c){entries.set(o.id,c);return()=>{};}},sessions:{list:{getSnapshot:()=>snapshot,subscribe:()=>()=>{}}},workspaces:{list:{getSnapshot:()=>({items:[]})}},uiWorkspace:{},remote:{directoryPicker:{}}};
 dom.window.fetch=async(url,options)=>{assert.equal(url.href,'https://harness.test/proxy/api/dsh-workdock');assert.equal(options.credentials,'same-origin');calls.push(JSON.parse(options.body));return {ok:!fail,json:async()=>fail?{ok:false,error:'File is missing'}:{ok:true,value:{path:'ok'}}};};
 dom.window.__ModuleLoader__={load({factory}){factory(()=>React).apply(ctx);}};
 dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
 function event(id,type='contextmenu',options={}){const E=type==='keydown'?dom.window.KeyboardEvent:dom.window.MouseEvent;const e=new E(type,{bubbles:true,cancelable:true,clientX:2000,clientY:2000,...options});document.getElementById(id).dispatchEvent(e);return e;}
 const menu=()=>document.querySelector('[role=menu]');
 const click=async text=>{await act(async()=>{[...menu().querySelectorAll('button')].find(b=>b.textContent===text).click();});};
 try{
  await act(async()=>root.render(React.createElement(entries.get('dsh-workdock-file-menu'))));
  for(const id of ['web','plain','composer'])assert.equal(event(id).defaultPrevented,false);
  const resource=document.getElementById('resource'),original=resource.getAttribute('href');
  for(const href of ['dsh-resource://file/session/another/secret.sql','dsh-resource://file/session/s2/%ZZ','javascript:alert(1)','#L12','//example.org/a.sql']){
   resource.setAttribute('href',href);assert.equal(event('resource').defaultPrevented,false);
  }
  resource.setAttribute('href',original);
  let clicks=0;document.getElementById('file').onclick=()=>clicks++;
  document.getElementById('file').click();assert.equal(clicks,1);assert.equal(menu(),null);
  await act(async()=>assert.equal(event('icon').defaultPrevented,true));
  assert.equal(document.activeElement.textContent,'打开文件');
  assert.ok(parseInt(menu().style.left)<window.innerWidth);assert.ok(parseInt(menu().style.top)<window.innerHeight);
  await act(async()=>document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));
  assert.equal(document.activeElement.textContent,'打开所在文件夹');
  await click('打开所在文件夹');
  assert.deepEqual(calls.at(-1),{sessionId:'s2',args:{action:'reveal_file',path:'Source/中文 report.sql'}});assert.equal(menu(),null);
  await act(async()=>event('local','keydown',{key:'F10',shiftKey:true}));
  await click('打开文件');assert.equal(calls.at(-1).args.path,'Source/file.sql');
  await act(async()=>event('resource'));await click('打开文件');assert.equal(calls.at(-1).args.path,'Source/report.sql');
  await act(async()=>event('mention'));await click('打开所在文件夹');assert.equal(calls.at(-1).args.path,'D:\\work\\Report.cs');
  fail=true;await act(async()=>event('file'));await click('打开文件');
  assert.equal(document.querySelector('[role=alert]').textContent,'File is missing');assert.ok(menu());
  await act(async()=>document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(menu(),null);assert.equal(document.activeElement.id,'file');
  await act(async()=>event('file'));await act(async()=>document.body.dispatchEvent(new dom.window.MouseEvent('pointerdown',{bubbles:true})));assert.equal(menu(),null);
  await act(async()=>event('file'));await act(async()=>window.dispatchEvent(new dom.window.Event('resize')));assert.equal(menu(),null);
 }finally{
  await act(async()=>root.unmount());for(const dispose of disposers.reverse())if(typeof dispose==='function')dispose();
  assert.equal(event('file').defaultPrevented,false);dom.window.close();Object.assign(globalThis,old);
 }
});
