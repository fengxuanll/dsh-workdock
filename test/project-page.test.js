import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React, {act} from 'react';
import {JSDOM} from 'jsdom';

const PAGE='dsh-workdock-projects';
const fixtures=()=>Array.from({length:67},(_,i)=>({
  id:`p${String(i).padStart(2,'0')}`,title:`Project ${String(i).padStart(2,'0')}`,
  primary:`D:/work/${String(i).padStart(2,'0')}`,folders:[`D:/work/${String(i).padStart(2,'0')}`,`E:/REFERENCE/Group${i%3}`],
  pinned:i===66,lastUsedAt:i,sessionRoots:[],
}));

async function harness(t,{storage={},projects=fixtures(),session=true,activeProjectId=null}={}) {
  const dom=new JSDOM('<aside id="toolbar-fixture"><div class="GAkraW_root"><div class="GAkraW_sectionHeader"><span>Workspaces</span><div class="GAkraW_searchSlot"><button id="native-search">Search</button></div><div class="GAkraW_headerActions"><button id="native-view">View</button><button id="native-add" aria-label="Add workspace">Add</button></div></div></div></aside><div id="root"></div>',{url:'https://page.test/',runScripts:'outside-only'});
  const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  dom.window.structuredClone=structuredClone;dom.window.confirm=()=>true;
  for(const [key,value]of Object.entries(storage))dom.window.localStorage.setItem(key,value);
  const {createRoot}=await import('react-dom/client');
  const root=createRoot(document.getElementById('root'));
  const entries=new Map(),registrations=[],disposers=[],requests=[],selections=[],created=[],workspaceCalls=[],started=[],opened=[],events=[];
  let selected=null,dictionary,fail=null,createGate;
  const snapshot={byId:session?{s:{id:'s',retainedBy:{mainView:1}}}:{}};
  const render=()=>root.render(React.createElement(React.Fragment,null,
    React.createElement(entries.get('conversation.composer.dock:dsh-workdock-dock'),{dock:true,sessionId:session?'s':undefined}),
    selected&&React.createElement(entries.get(`main:${selected}`)),
    React.createElement(entries.get('shell.overlay:dsh-workdock-tree-menu')),
    React.createElement(entries.get('shell.overlay:dsh-workdock-experience'))));
  const ctx={
    effect(fn){disposers.push(fn());},
    locale:{register(_ns,values){dictionary=values.en;},bind(){return key=>dictionary[key];}},
    slots:{inject(_name,fn){fn();},register(options,component){registrations.push(options);entries.set(`${options.name}:${options.key||options.id}`,component);return()=>{};}},
    layout:{selectPanel(id){selected=id;selections.push(id);events.push('panel:'+id);render();}},
    sessions:{list:{getSnapshot:()=>snapshot,subscribe:()=>()=>{}},create:async args=>{created.push(args);events.push('create');if(createGate)await createGate;if(fail==='session')throw Error('Session creation failed');const id='new-'+created.length;events.push('created:'+id);return id;}},
    workspaces:{list:{getSnapshot:()=>({items:[]})},create:async args=>{workspaceCalls.push(args);return {workspaceId:'w'};},delete:async()=>{}},
    uiWorkspace:{startSession:id=>started.push(id),openSession(id){assert.equal(selected,null,'return to conversation before opening the created session');opened.push(id);events.push('open:'+id);}},
    remote:{directoryPicker:{pick:async()=>({ok:true,value:'D:/picked'})}},
  };
  dom.window.fetch=async(_url,options)=>{
    const request=JSON.parse(options.body);requests.push(request);const {args}=request;
    if(args.action===fail)return {ok:false,json:async()=>({ok:false,error:'Injected failure'})};
    let value={};
    if(args.action==='list')value={projects,activeProjectId,directoryWarnings:[]};
    if(args.action==='check_directories')value={directoryWarnings:[]};
    if(args.action==='save'){const project={...args};projects=projects.map(p=>p.id===args.id?project:p);value={project};}
    if(args.action==='remove')projects=projects.filter(p=>p.id!==args.id);
    if(args.action==='pin')projects=projects.map(p=>p.id===args.id?{...p,pinned:!p.pinned}:p);
    return {ok:true,json:async()=>({ok:true,value})};
  };
  dom.window.__ModuleLoader__={load({factory}){const plugin=factory(()=>React);assert.ok(plugin.inject.includes('layout'));plugin.apply(ctx);}};
  dom.window.eval(await readFile(new URL('../client.js',import.meta.url),'utf8'));
  t.after(async()=>{await act(async()=>{root.unmount();for(const dispose of disposers)dispose?.();});dom.window.close();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
  await act(async()=>render());
  const button=(text,scope=document)=>{const node=[...scope.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(node,`Missing button ${text}`);return node;};
  const click=async(text,scope)=>act(async()=>button(text,scope).click());
  const change=async(label,value)=>act(async()=>{const node=document.querySelector(`select[aria-label="${label}"]`);assert.ok(node,`Missing select ${label}`);node.value=String(value);node.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
  const input=async(node,value)=>act(async()=>{assert.ok(node);Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  const search=async value=>input(document.querySelector('input[aria-label="Search projects"]'),value);
  const rows=()=>[...document.querySelectorAll('.dpm-table .dpm-card')];
  const ids=()=>rows().map(n=>n.dataset.projectId);
  const status=()=>document.querySelector('.dpm-pagination [role=status]').textContent;
  const open=async()=>act(async()=>ctx.layout.selectPanel(PAGE));
  return {dom,ctx,registrations,requests,selections,created,workspaceCalls,started,opened,events,button,click,change,input,search,rows,ids,status,open,
    setProjects(value){projects=value;},setFailure(value){fail=value;},setCreateGate(value){createGate=value;},dispose(){for(const fn of disposers.splice(0))fn?.();}};
}

test('native main page and sidebar entry browse without chat side effects; paging/search/sort are deterministic',async t=>{
  const h=await harness(t,{session:false});
  assert.ok(h.registrations.some(o=>o.name==='main'&&o.key===PAGE));
  assert.ok(!h.registrations.some(o=>o.name==='sidebar.panellist'&&o.id===PAGE),'no duplicate sidebar text link');
  const icon=document.querySelector('.dpm-workspace-manage');assert.ok(icon);
  assert.equal(icon.getAttribute('aria-label'),'Projects');assert.equal(icon.title,'Projects');
  assert.ok(icon.parentElement.classList.contains('GAkraW_headerActions'));
  assert.equal(icon.previousElementSibling.id,'native-view');assert.equal(icon.nextElementSibling.id,'native-add');
  assert.equal(document.querySelectorAll('.dpm-workspace-add').length,0,'native add reused, no duplicate');
  assert.ok(document.querySelector('#native-search'));assert.ok(document.querySelector('#native-add'));
  assert.equal(document.querySelector('.dpm-dock').disabled,true,'no chat disables the current-project editor');
  await act(async()=>icon.click());
  assert.deepEqual(h.selections,[PAGE]);assert.ok(document.querySelector('.dpm-page .dpm-table'));
  assert.equal(document.querySelector('[role=dialog]'),null);
  assert.equal(h.rows().length,25);assert.equal(h.ids()[0],'p66');
  assert.equal(h.status(),'Page 1 / 3, 67 projects');
  assert.equal(h.button('Previous page').disabled,true);
  assert.equal(document.querySelector('select[aria-label="Per page"]').value,'25');
  assert.deepEqual([...document.querySelector('select[aria-label="Per page"]').options].map(o=>o.value),['10','25','50','100']);
  await h.click('Next page');assert.equal(h.rows().length,25);assert.equal(h.status(),'Page 2 / 3, 67 projects');
  await h.click('Next page');assert.equal(h.rows().length,17);assert.equal(h.button('Next page').disabled,true);
  await h.click('Previous page');assert.equal(h.status(),'Page 2 / 3, 67 projects');
  await h.search('pRoJeCt 05');assert.deepEqual(h.ids(),['p05']);assert.equal(h.status(),'Page 1 / 1, 1 projects');
  await h.search('D:/WORK/42');assert.deepEqual(h.ids(),['p42']);
  await h.search('e:/reference/group1');assert.equal(h.rows().length,22);assert.equal(h.status(),'Page 1 / 1, 22 projects');
  await h.search('nonexistent');assert.equal(h.rows().length,0);assert.match(document.querySelector('.dpm-page').textContent,/No matching projects/);assert.equal(h.status(),'Page 1 / 1, 0 projects');
  assert.equal(h.button('Next page').disabled,true);assert.equal(h.button('Previous page').disabled,true);
  await h.search('');await h.change('Per page',10);assert.equal(h.rows().length,10);assert.equal(h.status(),'Page 1 / 7, 67 projects');
  await h.click('Next page');await h.change('Per page',50);assert.equal(h.rows().length,50);assert.equal(h.status(),'Page 1 / 2, 67 projects');
  await h.change('Per page',100);assert.equal(h.rows().length,67);assert.equal(h.button('Next page').disabled,true);
  await h.change('Sort projects','recent');assert.deepEqual(h.ids().slice(0,4),['p66','p65','p64','p63']);
  assert.equal(h.dom.window.localStorage.getItem('dsh-workdock-sort'),'recent');
  assert.equal(h.button('+ Add project').disabled,true);assert.ok(!h.rows()[0].textContent.includes('Use in this chat'));
  assert.ok(h.requests.every(r=>r.args.action==='list'),'browsing must only list projects');
  assert.deepEqual(h.created,[]);assert.deepEqual(h.workspaceCalls,[]);assert.deepEqual(h.started,[]);
  await h.click('Back to chat');assert.equal(h.selections.at(-1),null);assert.equal(document.querySelector('.dpm-page'),null);
});

test('page-size persistence, stable id ties and reload clamp after list shrink',async t=>{
  const tied=fixtures().map(p=>({...p,title:'Same',lastUsedAt:100})).reverse();
  const h=await harness(t,{storage:{'dsh-workdock-page-size':'10'},projects:tied});
  await h.open();assert.equal(h.rows().length,10);assert.deepEqual(h.ids().slice(0,4),['p66','p00','p01','p02']);
  await h.change('Sort projects','recent');assert.deepEqual(h.ids().slice(0,4),['p66','p00','p01','p02']);
  for(let i=0;i<6;i++)await h.click('Next page');
  assert.equal(h.status(),'Page 7 / 7, 67 projects');
  h.setProjects(tied.filter(p=>['p00','p01','p02'].includes(p.id)));await h.click('Refresh');
  assert.equal(h.status(),'Page 1 / 1, 3 projects');assert.deepEqual(h.ids(),['p00','p01','p02']);
  await h.change('Per page',50);assert.equal(h.dom.window.localStorage.getItem('dsh-workdock-page-size'),'50');
  await h.click('Back to chat');await h.open();assert.equal(document.querySelector('select[aria-label="Per page"]').value,'50');
  assert.equal(h.status(),'Page 1 / 1, 3 projects');
});

test('page editor cancel/save/failure retain search and page; deletion clamps last page',async t=>{
  const h=await harness(t,{storage:{'dsh-workdock-page-size':'10'}});
  await h.open();await h.search('Project');await h.change('Sort projects','recent');await h.click('Next page');
  const before=h.ids(),target=before[0];
  const editButton=h.button('Edit project',h.rows()[0]);editButton.focus();
  await h.click('Edit project',h.rows()[0]);assert.ok(document.querySelector('[role=dialog]'));
  assert.ok(document.querySelector('.dpm-page-content').hasAttribute('inert'),'background list is inert while editing');
  assert.equal(document.activeElement.id,'dpm-name');
  await h.input(document.getElementById('dpm-name'),'Project revised');await h.click('Cancel');
  assert.equal(document.querySelector('[role=dialog]'),null);assert.deepEqual(h.ids(),before);
  assert.equal(document.querySelector('.dpm-page-content').hasAttribute('inert'),false);
  assert.equal(document.activeElement,editButton,'cancel restores focus to the row action');
  assert.equal(document.querySelector('input[aria-label="Search projects"]').value,'Project');assert.equal(h.status(),'Page 2 / 7, 67 projects');
  assert.ok(!h.requests.some(r=>r.args.action==='save'));
  await h.click('Edit project',h.rows()[0]);await h.input(document.getElementById('dpm-name'),'Project 09 revised');
  h.setFailure('save');await h.click('Save');
  assert.ok(document.querySelector('[role=dialog]'));assert.equal(document.getElementById('dpm-name').value,'Project 09 revised');
  assert.match(document.querySelector('[role=dialog] [role=alert]').textContent,/Injected failure/);
  assert.equal(h.selections.at(-1),PAGE);assert.deepEqual(h.created,[]);assert.deepEqual(h.workspaceCalls,[]);
  h.setFailure(null);await h.click('Save');assert.equal(document.querySelector('[role=dialog]'),null);
  assert.ok(document.querySelector('.dpm-page'));assert.equal(h.status(),'Page 2 / 7, 67 projects');
  assert.equal(document.querySelector('input[aria-label="Search projects"]').value,'Project');
  assert.ok(h.requests.some(r=>r.args.action==='save'&&r.args.id===target));
  assert.equal(document.querySelector('select[aria-label="Sort projects"]').value,'recent');
  await h.click('Edit project',h.rows()[0]);h.setFailure('save');await h.click('Save');
  assert.match(document.querySelector('[role=dialog] [role=alert]').textContent,/Injected failure/);
  await h.click('Cancel');h.setFailure(null);
  assert.equal(document.querySelector('.dpm-page [role=alert]'),null,'cancel clears the editor failure rather than leaking it into the list');
  assert.equal(h.status(),'Page 2 / 7, 67 projects');
  // Keep 11 matching projects, visit the final page and remove its only item.
  h.setProjects(fixtures().slice(0,11));await h.click('Refresh');assert.equal(h.status(),'Page 2 / 2, 11 projects');
  assert.equal(h.rows().length,1);await h.click('Edit project',h.rows()[0]);await h.click('Remove project');
  assert.equal(document.querySelector('[role=dialog]'),null);assert.equal(h.status(),'Page 1 / 1, 10 projects');assert.equal(h.rows().length,10);
});

test('workspace toolbar survives native rerenders and cleans up without changing native controls',async t=>{
  const h=await harness(t);
  const fixture=document.getElementById('toolbar-fixture');
  const original=document.querySelector('.dpm-workspace-manage');
  await act(async()=>original.remove());
  assert.equal(document.querySelector('.dpm-workspace-manage'),original,'removed icon is restored once');
  await act(async()=>fixture.innerHTML='<div class="next_root"><div class="next_sectionHeader"><span>工作区</span><div class="next_headerActions next_headerActionsHidden"><button id="native-add">+</button></div></div></div><div class="decoy_sectionHeader"><div class="decoy_headerActions"></div></div>');
  assert.equal(document.querySelectorAll('.dpm-workspace-manage').length,1);
  const icon=document.querySelector('.dpm-workspace-manage');assert.ok(icon.classList.contains('next_iconButton'));
  assert.ok(icon.parentElement.classList.contains('next_headerActionsHidden'),'search visibility remains host-owned');
  assert.equal(document.querySelector('.decoy_headerActions').children.length,0);
  icon.focus();assert.equal(document.activeElement,icon,'keyboard focusable native button');
  await act(async()=>icon.click());assert.deepEqual(h.selections,[PAGE]);
  await act(async()=>h.dispose());assert.equal(document.querySelectorAll('.dpm-workspace-manage').length,0);
  await act(async()=>fixture.append(document.createElement('span')));
  assert.equal(document.querySelectorAll('.dpm-workspace-manage').length,0,'observer disconnected');
  assert.ok(document.getElementById('native-add'),'native controls remain after uninstall');
});

test('toolbar keeps view, management, add order and supplies missing native add without duplicates',async t=>{
  const h=await harness(t);
  const host=document.querySelector('.GAkraW_headerActions');
  const native=document.getElementById('native-add');
  assert.ok(host.classList.contains('dpm-workspace-actions'),'toolbar gets scoped width compatibility class');
  await act(async()=>native.remove());
  const fallback=host.querySelector('.dpm-workspace-add');assert.ok(fallback);
  assert.equal(fallback.title,'Add project');assert.equal(fallback.getAttribute('aria-label'),'Add project');
  assert.equal(host.lastElementChild,fallback);assert.ok(fallback.previousElementSibling.classList.contains('dpm-workspace-manage'));
  assert.equal(fallback.previousElementSibling.previousElementSibling.id,'native-view');
  await act(async()=>fallback.querySelector('path').dispatchEvent(new h.dom.window.MouseEvent('click',{bubbles:true})));
  assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-label'),'Add project');
  assert.equal(document.getElementById('dpm-name').value,'');assert.equal(document.querySelector('.dpm-page'),null);assert.deepEqual(h.selections,[]);
  await h.click('Cancel');
  await act(async()=>{native.setAttribute('aria-label','添加工作区');host.append(native);});
  assert.equal(host.querySelector('.dpm-workspace-add'),null,'fallback removed when native add returns');
  assert.equal(host.lastElementChild,native);assert.ok(native.previousElementSibling.classList.contains('dpm-workspace-manage'));
  await act(async()=>native.click());assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-label'),'Add project');
  await h.click('Cancel');
  await act(async()=>native.remove());assert.equal(host.querySelectorAll('.dpm-workspace-add').length,1);
  await act(async()=>h.dispose());assert.equal(host.querySelectorAll('.dpm-workspace-add,.dpm-workspace-manage').length,0);
  assert.ok(!host.classList.contains('dpm-workspace-actions'),'native width restored on unload');
});

test('composer project chip edits the active project without opening the management page',async t=>{
  const h=await harness(t,{activeProjectId:'p10'});
  const chip=h.button('▱ Project 10');chip.focus();
  await h.click('▱ Project 10');
  assert.ok(!chip.parentElement.contains(document.querySelector('[role=dialog]')),'editor renders in shell overlay, outside composer layout');
  assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-label'),'Edit project');
  assert.equal(document.getElementById('dpm-name').value,'Project 10');
  assert.deepEqual([...document.querySelectorAll('.dpm-source')].map(n=>n.getAttribute('aria-label')),fixtures()[10].folders);
  assert.equal(document.querySelector('.dpm-page'),null);assert.deepEqual(h.selections,[]);
  await h.click('Cancel');assert.equal(document.querySelector('[role=dialog]'),null);
  assert.equal(document.activeElement,chip,'closing global editor restores chip focus');
  await h.click('▱ Project 10');await h.input(document.getElementById('dpm-name'),'Renamed active');await h.click('Save');
  assert.ok(h.requests.some(r=>r.args.action==='save'&&r.args.id==='p10'&&r.sessionId==='s'));
  assert.equal(document.querySelector('[role=dialog]'),null);assert.deepEqual(h.selections,[]);
});

test('composer chip without an associated project opens a blank add form, never the list',async t=>{
  const h=await harness(t);
  await h.click('▱ Projects');assert.equal(document.querySelector('[role=dialog]').getAttribute('aria-label'),'Add project');
  assert.equal(document.getElementById('dpm-name').value,'');assert.equal(document.querySelector('.dpm-page'),null);
  assert.deepEqual(h.selections,[]);await h.click('Cancel');
});

test('new session waits for creation, prevents double clicks and keeps page visible on failure',async t=>{
  const h=await harness(t);await h.open();
  let finish;h.setCreateGate(new Promise(resolve=>{finish=resolve;}));
  const row=h.rows()[0],primary=fixtures().find(p=>p.id===row.dataset.projectId).primary;
  await h.click('New session',row);
  assert.equal(h.created.length,1);assert.equal(h.workspaceCalls[0].path,primary);
  assert.ok(document.querySelector('.dpm-page'));assert.deepEqual(h.opened,[]);assert.equal(h.selections.at(-1),PAGE);
  assert.equal(h.button('New session',row).disabled,true);await h.click('New session',row);assert.equal(h.created.length,1);
  await act(async()=>finish());assert.deepEqual(h.opened,['new-1']);assert.equal(h.events.at(-1),'open:new-1');assert.equal(document.querySelector('.dpm-page'),null);
  await h.open();h.setCreateGate(null);h.setFailure('session');await h.click('New session',h.rows()[0]);
  assert.ok(document.querySelector('.dpm-page'));assert.match(document.querySelector('.dpm-error').textContent,/Session creation failed/);assert.equal(h.opened.length,1);
  h.setFailure(null);await h.click('New session',h.rows()[0]);assert.deepEqual(h.opened,['new-1','new-3']);assert.equal(h.created.length,3);assert.equal(h.events.at(-1),'open:new-3');
});

test('invalid stored size defaults safely; removed bind entry stays absent and new session returns to conversation',async t=>{
  const h=await harness(t,{storage:{'dsh-workdock-page-size':'0'}});
  await h.open();assert.equal(document.querySelector('select[aria-label="Per page"]').value,'25');
  assert.ok(![...document.querySelectorAll('button')].some(b=>b.textContent==='Use in this chat'));
  assert.ok(!h.requests.some(r=>r.args.action==='bind'));
  await h.click('New session',h.rows()[0]);assert.equal(h.selections.at(-1),null);
  assert.deepEqual(h.started,[]);assert.equal(h.workspaceCalls.length,1);assert.equal(h.created.length,1);assert.equal(h.created[0].workspaceId,'w');
  assert.deepEqual(h.opened,['new-1']);assert.equal(h.events.at(-1),'open:new-1');
  assert.ok(h.requests.some(r=>r.args.action==='touch'&&!r.sessionId));
});
