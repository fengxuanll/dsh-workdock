import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

test('project and session color controls persist, stay independent and survive native rerenders',async()=>{
  const dom=new JSDOM('<div id="overlay"></div><div data-row-key="workspace:w1"><span class="host_projectText"><span class="host_title" id="project-label">Project</span></span><button id="native-menu">…</button></div><div data-row-key="session:s1"><span id="session-label" class="host_title" style="color: white">Chat</span><span class="host_time" style="color: gray">12:00</span></div><div data-row-key="workspace:w2"><span class="host_projectText"><span class="host_title">Native project</span></span></div>',{runScripts:'outside-only',url:'https://harness.test/'});
  const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  dom.window.structuredClone=structuredClone;
  const { createRoot }=await import('react-dom/client');
  const root=createRoot(document.getElementById('overlay'));
  const entries=new Map(),disposers=[],calls=[];
  const projects=[{id:'p1',title:'Project',primary:'D:/main',folders:['D:/main'],sessionRoots:['D:/main'],revision:1,pinned:false}];
  let colors={'project:p1':'red','session:s1':'blue'},fail=false,showPage=false,dictionary;
  const sessionSnapshot={byId:{}},workspaceSnapshot={items:[{workspaceId:'w1',path:'D:/main',title:'Project',sessionIds:['s1']},{workspaceId:'w2',path:'D:/native',title:'Native project',sessionIds:[]}]};
  const render=()=>root.render(React.createElement(React.Fragment,null,
    React.createElement(entries.get('dsh-workdock-colors')),
    React.createElement(entries.get('dsh-workdock-tree-menu')),
    showPage&&React.createElement(entries.get('dsh-workdock-projects'))));
  const ctx={
    slots:{inject(_name,fn){fn();},register(options,component){entries.set(options.key||options.id,component);return()=>{};}},
    locale:{register(_ns,values){dictionary=values.zh;return()=>{};},bind(){return key=>dictionary[key];}},
    sessions:{list:{subscribe:()=>()=>{},getSnapshot:()=>sessionSnapshot},create(){assert.fail('color labels must not create chats');}},
    workspaces:{list:{subscribe:()=>()=>{},getSnapshot:()=>workspaceSnapshot}},
    layout:{selectPanel(){assert.fail('color labels must not navigate');}},uiWorkspace:{},remote:{},effect(fn){disposers.push(fn());},
  };
  dom.window.fetch=async(_url,options)=>{
    const payload=JSON.parse(options.body);calls.push(payload);
    if(payload.args.action==='set_color'){
      if(fail)return {ok:false,json:async()=>({ok:false,error:'disk full'})};
      const {target,id,color}=payload.args,key=`${target}:${id}`;
      if(color===null)delete colors[key];else colors[key]=color;
      return {ok:true,json:async()=>({ok:true,value:{colors:{...colors}}})};
    }
    return {ok:true,json:async()=>({ok:true,value:{projects,bindings:{},colors:{...colors},activeProjectId:null}})};
  };
  dom.window.__ModuleLoader__={load({factory}){factory(()=>React).apply(ctx);}};
  const sidebarButton=key=>document.querySelector(`[data-row-key="${key}"] > .dpm-sidebar-color`);
  const click=async label=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent===label);assert.ok(button,`Missing ${label}`);await act(async()=>button.click());};
  const key=async value=>act(async()=>document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true})));
  const input=async(selector,value)=>act(async()=>{
    const element=document.querySelector(selector);
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(element,value);
    element.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    element.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  });
  try{
    await act(async()=>{dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));render();});
    assert.equal(sidebarButton('workspace:w1').dataset.color,'red');
    assert.equal(sidebarButton('session:s1').dataset.color,'blue');
    assert.equal(sidebarButton('workspace:w2').dataset.color,'');
    const row=id=>document.querySelector(`[data-row-key="${id}"]`);
    const labelRule=[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules]).find(rule=>rule.selectorText?.includes('[data-dpm-label-color]'));
    assert.ok(document.getElementById('project-label').matches(labelRule.selectorText));
    assert.ok(document.getElementById('session-label').matches(labelRule.selectorText));
    assert.equal(labelRule.style.getPropertyPriority('color'),'important');
    assert.equal(row('workspace:w1').style.getPropertyValue('--dpm-label-color'),'#e27676');
    assert.equal(row('session:s1').style.getPropertyValue('--dpm-label-color'),'#6d9fe0');
    assert.equal(document.querySelector('.host_time').matches(labelRule.selectorText),false);
    assert.equal(row('workspace:w2').hasAttribute('data-dpm-label-color'),false);
    let rowClicks=0;document.querySelector('[data-row-key="session:s1"]').onclick=()=>rowClicks++;
    await act(async()=>sidebarButton('session:s1').click());
    assert.equal(rowClicks,0);
    assert.equal(document.querySelectorAll('[role=menuitemradio]').length,7);
    assert.equal(document.activeElement.textContent,'蓝色');
    // Native long titles marquee via scrollLeft on hover. Their non-bubbling
    // scroll events must not dismiss a picker anchored to the same session row.
    for(let frame=0;frame<3;frame++){
      await act(async()=>document.getElementById('session-label').dispatchEvent(new dom.window.Event('scroll')));
      assert.ok(document.querySelector('.dpm-color-menu'),'title marquee must not close the session picker');
    }
    await act(async()=>document.getElementById('project-label').dispatchEvent(new dom.window.Event('scroll')));
    assert.ok(document.querySelector('.dpm-color-menu'),'unrelated row animation must not close the picker');
    await act(async()=>document.querySelector('.dpm-color-menu').dispatchEvent(new dom.window.Event('scroll')));
    assert.ok(document.querySelector('.dpm-color-menu'),'scrolling a tall color menu must keep it open');
    await key('End');assert.equal(document.activeElement.textContent,'紫色');
    await key('Home');assert.equal(document.activeElement.textContent,'无颜色');
    await key('ArrowDown');assert.equal(document.activeElement.textContent,'红色');
    await key('Escape');assert.equal(document.querySelector('.dpm-color-menu'),null);
    assert.equal(document.activeElement,sidebarButton('session:s1'));
    // Real anchor-container/page movement must still dismiss the fixed picker.
    const sidebarViewport=document.createElement('div');
    await act(async()=>{row('session:s1').before(sidebarViewport);sidebarViewport.append(row('session:s1'));});
    for(const [source,type]of [[sidebarViewport,'scroll'],[document,'scroll'],[window,'resize']]){
      await act(async()=>sidebarButton('session:s1').click());
      assert.ok(document.querySelector('.dpm-color-menu'),'session picker must reopen after dismissal');
      await act(async()=>source.dispatchEvent(new dom.window.Event(type)));
      assert.equal(document.querySelector('.dpm-color-menu'),null,`${type} moving the anchor must close the picker`);
    }
    await act(async()=>sidebarButton('session:s1').click());
    await click('绿色');
    assert.equal(colors['session:s1'],'green');assert.equal(colors['project:p1'],'red');
    assert.equal(sidebarButton('session:s1').dataset.color,'green');
    assert.equal(row('session:s1').style.getPropertyValue('--dpm-label-color'),'#64ae85');
    assert.equal(document.querySelector('.dpm-color-menu'),null);
    assert.deepEqual(calls.find(c=>c.args.action==='set_color'),{args:{action:'set_color',target:'session',id:'s1',color:'green'}});
    // Existing native session menus remain untouched.
    const context=new dom.window.MouseEvent('contextmenu',{bubbles:true,cancelable:true});
    document.getElementById('session-label').dispatchEvent(context);assert.equal(context.defaultPrevented,false);
    showPage=true;await act(async()=>render());
    await click('颜色标记');await click('紫色');
    assert.equal(colors['project:p1'],'purple');assert.equal(sidebarButton('workspace:w1').dataset.color,'purple');
    assert.equal(document.querySelector('[data-project-id="p1"] .dpm-color-dot').style.getPropertyValue('--dpm-color'),'#ae8bda');
    assert.equal(document.querySelector('[data-project-id="p1"] strong').style.color,'rgb(174, 139, 218)');
    assert.equal(row('workspace:w1').style.getPropertyValue('--dpm-label-color'),'#ae8bda');
    // Replace the context menu at its clamped origin, not below its transient color item.
    // JSDOM has no layout: supply measured sizes/rectangles, keeping the real menu handlers.
    const originalRect=dom.window.HTMLElement.prototype.getBoundingClientRect;
    dom.window.HTMLElement.prototype.getBoundingClientRect=function(){
      if(this.matches('.dpm-menu')){
        const left=parseFloat(this.style.left)||0,top=parseFloat(this.style.top)||0;
        const width=206,height=this.matches('.dpm-color-menu')?430:300;
        return {left,top,right:left+width,bottom:top+height,width,height};
      }
      if(this.matches('[role=menuitem]'))return {left:200,top:400,right:390,bottom:432,width:190,height:32};
      if(this.id==='native-menu'||this.matches('.dpm-sidebar-color'))return {left:220,top:40,right:240,bottom:60,width:20,height:20};
      return originalRect.call(this);
    };
    try{
      for(const point of [{x:120,y:90},{x:window.innerWidth-1,y:window.innerHeight-1},null]){
        await act(async()=>point
          ?document.getElementById('project-label').dispatchEvent(new dom.window.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:point.x,clientY:point.y}))
          :document.getElementById('native-menu').click());
        const treeMenu=document.querySelector('[role=menu]');
        const expectedLeft=point?Math.min(point.x,window.innerWidth-206-8):220;
        const expectedTop=point?Math.min(point.y,window.innerHeight-300-8):60;
        assert.equal(treeMenu.style.left,`${expectedLeft}px`);
        assert.equal(treeMenu.style.top,`${expectedTop}px`);
        const treeColor=[...treeMenu.querySelectorAll('[role=menuitem]')].find(b=>b.textContent==='颜色标记');
        await act(async()=>treeColor.click());
        const picker=document.querySelector('.dpm-color-menu');
        assert.equal(document.querySelectorAll('[role=menu]').length,1);
        assert.equal(picker.style.left,`${expectedLeft}px`);
        assert.equal(picker.style.top,`${Math.min(expectedTop,window.innerHeight-430-8)}px`);
        assert.equal(document.querySelectorAll('[role=menuitemradio]').length,7);
        await key('Escape');
        assert.equal(document.activeElement,document.getElementById('native-menu'));
      }
      // Direct dot clicks still anchor below that dot, not at the old context-menu origin.
      await act(async()=>sidebarButton('session:s1').click());
      assert.equal(document.querySelector('.dpm-color-menu').style.left,'220px');
      assert.equal(document.querySelector('.dpm-color-menu').style.top,'60px');
      await key('Escape');
    }finally{dom.window.HTMLElement.prototype.getBoundingClientRect=originalRect;}
    fail=true;await act(async()=>sidebarButton('workspace:w1').click());await click('黄色');
    assert.match(document.querySelector('[role=alert]').textContent,/disk full/);
    assert.equal(sidebarButton('workspace:w1').dataset.color,'purple');
    assert.equal(document.querySelector('[aria-checked=true]').textContent,'紫色');
    fail=false;await click('黄色');assert.equal(colors['project:p1'],'yellow');
    await act(async()=>sidebarButton('session:s1').click());await click('无颜色');
    assert.equal(colors['session:s1'],undefined);assert.equal(sidebarButton('session:s1').dataset.color,'');
    assert.equal(row('session:s1').hasAttribute('data-dpm-label-color'),false);
    assert.equal(row('session:s1').style.getPropertyValue('--dpm-label-color'),'');
    assert.equal(document.getElementById('session-label').style.color,'white');
    await act(async()=>sidebarButton('workspace:w2').click());await click('橙色');
    assert.equal(colors['workspace:w2'],'orange');
    // Custom HEX input validates locally, synchronizes the picker and only saves on Apply.
    await act(async()=>sidebarButton('workspace:w1').click());
    const customHex=()=>document.querySelector('#dpm-color-hex');
    assert.equal(customHex().value,'#c2ad44');
    const callCount=calls.length;
    await input('#dpm-color-hex','#12zz00');
    assert.equal(customHex().getAttribute('aria-invalid'),'true');
    assert.equal(document.querySelector('.dpm-color-custom button').disabled,true);
    assert.equal(calls.length,callCount);
    await input('#dpm-color-hex','#FF8800');
    assert.equal(document.querySelector('input[type=color]').value,'#ff8800');
    await act(async()=>customHex().focus());
    const arrow=new dom.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true});
    await act(async()=>customHex().dispatchEvent(arrow));
    assert.equal(arrow.defaultPrevented,false);
    const home=new dom.window.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true});
    await act(async()=>customHex().dispatchEvent(home));
    assert.equal(home.defaultPrevented,false);
    await key('Tab');assert.equal(document.activeElement.textContent,'应用');
    await act(async()=>document.querySelector('.dpm-color-custom').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
    assert.equal(colors['project:p1'],'#ff8800');
    assert.equal(sidebarButton('workspace:w1').dataset.color,'#ff8800');
    assert.equal(row('workspace:w1').style.getPropertyValue('--dpm-label-color'),'#ff8800');
    assert.equal(document.querySelector('[data-project-id="p1"] strong').style.color,'rgb(255, 136, 0)');
    assert.equal(document.querySelector('[data-project-id="p1"] .dpm-color-dot').style.getPropertyValue('--dpm-color'),'#ff8800');
    assert.match(sidebarButton('workspace:w1').getAttribute('aria-label'),/#ff8800/);
    await act(async()=>sidebarButton('workspace:w1').click());
    assert.equal(customHex().value,'#ff8800');
    assert.equal(document.activeElement,customHex());
    // Esc discards a draft; another target must not inherit it.
    await input('#dpm-color-hex','#112233');await key('Escape');
    assert.equal(colors['project:p1'],'#ff8800');
    await act(async()=>sidebarButton('session:s1').click());
    await input('input[type=color]','#12ab34');
    assert.equal(customHex().value,'#12ab34');
    fail=true;await click('应用');
    assert.match(document.querySelector('[role=alert]').textContent,/disk full/);
    assert.equal(customHex().value,'#12ab34');
    assert.equal(colors['session:s1'],undefined);
    fail=false;await click('应用');
    assert.equal(colors['session:s1'],'#12ab34');
    assert.equal(row('session:s1').style.getPropertyValue('--dpm-label-color'),'#12ab34');
    await act(async()=>sidebarButton('session:s1').click());await click('无颜色');
    assert.equal(row('session:s1').hasAttribute('data-dpm-label-color'),false);
    await act(async()=>sidebarButton('workspace:w1').click());await click('蓝色');
    assert.equal(colors['project:p1'],'blue');
    // Native redraw removes injected nodes; the observer must restore one button.
    await act(async()=>{document.querySelector('[data-row-key="session:s1"]').innerHTML='<span>Redrawn chat</span>';});
    assert.equal(document.querySelectorAll('[data-row-key="session:s1"] > .dpm-sidebar-color').length,1);
    await act(async()=>{document.querySelector('[data-row-key="session:s1"]').setAttribute('data-row-key','session:s2');});
    await act(async()=>sidebarButton('session:s2').click());await click('蓝色');
    assert.equal(colors['session:s2'],'blue');assert.equal(colors['session:s1'],undefined);
    await act(async()=>sidebarButton('workspace:w1').click());
    await act(async()=>document.body.dispatchEvent(new dom.window.MouseEvent('pointerdown',{bubbles:true})));
    assert.equal(document.querySelector('.dpm-color-menu'),null);
    if(process.env.DPM_COLOR_PREVIEW){
      await act(async()=>sidebarButton('workspace:w1').click());
      await writeFile(process.env.DPM_COLOR_PREVIEW,'<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#242424;color:#eee;font:14px system-ui}#overlay{padding:20px}[data-row-key]{display:flex;align-items:center;gap:8px;margin:6px 20px;max-width:280px}</style></head>'+document.body.outerHTML+'</html>');
    }
    // Disposing removes controls without deleting host content.
    await act(async()=>{root.unmount();for(const dispose of disposers.reverse())dispose?.();});
    assert.equal(document.querySelectorAll('.dpm-sidebar-color').length,0);
    assert.equal(document.querySelectorAll('[data-dpm-label-color]').length,0);
    assert.equal(row('workspace:w1').style.getPropertyValue('--dpm-label-color'),'');
    assert.ok(document.getElementById('native-menu'));
  }finally{
    await act(async()=>root.unmount());dom.window.close();Object.assign(globalThis,previous);
  }
});
