import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {JSDOM} from 'jsdom';

const source=await readFile(new URL('../client.js',import.meta.url),'utf8');

test('the chat file context menu stays removed: chat right-clicks reach the host untouched',async()=>{
 const dom=new JSDOM(`<div id="overlay"></div><section data-conversation-session="s2"><div data-conversation-region="chat"><button id="file" class="_fileLink_host_1" title="Source/中文 report.sql"><svg><path id="icon"/></svg>Report.sql</button><button id="mention" title='@"D:\\work\\Report.cs"'>Report.cs</button><a id="local" href="Source/file.sql#L12-L20">file</a><a id="resource" href="dsh-resource://file/session/s2/Source/report.sql">resource</a><a id="web" href="https://example.org/a.sql">web</a><code id="plain">Report.sql</code></div><div data-conversation-region="composer"><button id="composer" class="_fileLink_host_1" title="file.sql">composer</button></div></section>`,{runScripts:'outside-only',url:'https://harness.test/proxy/'});
 const old={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const entries=new Map(),disposers=[],calls=[];let dictionary;
 const snapshot={byId:{s1:{id:'s1',retainedBy:{mainView:1}}}};
 const ctx={effect(fn){disposers.push(fn());},locale:{register(_n,v){dictionary=v.zh;return()=>{};},bind(){return k=>dictionary[k];}},slots:{inject(_n,fn){fn();},register(o,c){entries.set(o.id,c);return()=>{};}},sessions:{list:{getSnapshot:()=>snapshot,subscribe:()=>()=>{}}},workspaces:{list:{getSnapshot:()=>({items:[]})}},uiWorkspace:{},remote:{directoryPicker:{}}};
 dom.window.fetch=async(url,options)=>{assert.equal(url.href,'https://harness.test/proxy/api/dsh-workdock');assert.equal(options.credentials,'same-origin');calls.push(JSON.parse(options.body));return {ok:true,json:async()=>({ok:true,value:{path:'ok'}})};};
 dom.window.__ModuleLoader__={load({factory}){factory(()=>React).apply(ctx);}};
 const event=(id,type='contextmenu',options={})=>{const E=type==='keydown'?dom.window.KeyboardEvent:dom.window.MouseEvent;const e=new E(type,{bubbles:true,cancelable:true,clientX:2000,clientY:2000,...options});document.getElementById(id).dispatchEvent(e);return e;};
 try{
  dom.window.eval(source);
  // The overlay, its translations and its actions are gone from the source itself.
  assert.equal(entries.has('dsh-workdock-file-menu'),false);
  for(const token of ['dsh-workdock-file-menu','fileMenu','revealFile','openFile','open_file','reveal_file'])assert.equal(source.includes(token),false,token);
  // Every chat surface keeps the native context menu, including Shift+F10 and the menu key.
  for(const id of ['file','mention','local','resource','web','plain','composer'])assert.equal(event(id).defaultPrevented,false);
  for(const id of ['file','mention','local','resource'])assert.equal(event(id,'keydown',{key:'F10',shiftKey:true}).defaultPrevented,false);
  assert.equal(event('file','keydown',{key:'ContextMenu'}).defaultPrevented,false);
  assert.equal(document.querySelector('[role=menu]'),null);
  // No file action can be requested any more, and left clicks still reach the host.
  assert.deepEqual(calls.filter(c=>['open_file','reveal_file'].includes(c.args?.action)),[]);
  let clicks=0;document.getElementById('file').onclick=()=>clicks++;
  document.getElementById('file').click();assert.equal(clicks,1);
 }finally{
  for(const dispose of disposers.reverse())if(typeof dispose==='function')dispose();
  assert.equal(event('file').defaultPrevented,false);dom.window.close();Object.assign(globalThis,old);
 }
});
