// Build an offline browser fixture from the actual plugin + installed React.
// Only the Harness service/slot boundary and network responses are stubbed.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const [react,reactDOM,client]=await Promise.all(['node_modules/react/umd/react.development.js','node_modules/react-dom/umd/react-dom.development.js','client.js'].map(path=>readFile(new URL(path,root),'utf8')));
const inline=text=>text.replace(/<\/script/gi,'<\\/script');
const fixture=String.raw`
const h=React.createElement,entries=new Map(),disposers=[],requests=[],createdSessions=[],openedSessions=[],navigation=[],shortcutSessions=[];
 localStorage.removeItem('dsh-workdock-pinned-workspaces');
let failSession=false;
 localStorage.removeItem('dsh-workdock-workspace-unpinned-order');
 const workspaceListeners=new Set(),reorderCalls=[];
 let workspaceSnapshot={phase:'ready',items:[{workspaceId:'w0',title:'普通项目',path:'E:/Workspace/Other',sessionIds:[]},{workspaceId:'w1',title:'运营业绩看板 01',path:'E:/Workspace/Projects/project-01',sessionIds:['s1']}]};
let dictionary,selectPanel;
const snapshot={byId:{s1:{id:'s1',retainedBy:{mainView:1}}}};
let projects=Array.from({length:67},(_,i)=>({id:'p'+i,title:['运营业绩看板','报文解析工具','仓储库存服务','订单同步','项目管理插件'][i%5]+' '+String(i+1).padStart(2,'0'),primary:'E:/Workspace/Projects/project-'+String(i+1).padStart(2,'0'),folders:['E:/Workspace/Projects/project-'+String(i+1).padStart(2,'0'),'D:/Reference/shared-'+i],sessionRoots:[],pinned:i===0,lastUsedAt:100-i,revision:1}));
const ctx={
 effect(fn){disposers.push(fn());},
 locale:{register(ns,value){dictionary=value.zh;},bind(){return key=>dictionary[key];}},
 slots:{inject(name,fn){fn();},register(options,component){entries.set(options.id||options.key,{options,component});return()=>{};}},
 layout:{selectPanel(id){navigation.push('panel:'+id);selectPanel(id);}},
 sessions:{list:{getSnapshot:()=>snapshot,subscribe:()=>()=>{}},create:async args=>{createdSessions.push(args);await new Promise(resolve=>setTimeout(resolve,40));if(failSession)throw Error('Session creation failed');return 'new-'+createdSessions.length;}},
 workspaces:{list:{getSnapshot:()=>workspaceSnapshot,subscribe(fn){workspaceListeners.add(fn);return()=>workspaceListeners.delete(fn);}},insertBefore:async(id,before)=>{reorderCalls.push([id,before]);const items=workspaceSnapshot.items.filter(w=>w.workspaceId!==id),row=workspaceSnapshot.items.find(w=>w.workspaceId===id),index=items.findIndex(w=>w.workspaceId===before);items.splice(index<0?items.length:index,0,row);workspaceSnapshot={...workspaceSnapshot,items};for(const fn of workspaceListeners)fn();},create:async()=>({workspaceId:'w1'}),delete:async()=>{}},
 uiWorkspace:{openSession(id){shortcutSessions.push(id);if(id.startsWith('new-')){if(navigation.at(-1)!=='panel:null')throw Error('session opened before leaving project page');navigation.push('open:'+id);openedSessions.push(id);}},startSession(){throw Error('fire-and-forget session creation must not be used');}},
 remote:{directoryPicker:{pick:async()=>({ok:true,value:'E:/Workspace/Projects/new-source'})}}
};
window.fetch=async(url,options)=>{
 const request=JSON.parse(options.body);requests.push(request);const {args}=request;
 let value={};
 if(args.action==='list')value={projects,activeProjectId:'p0',directoryWarnings:[]};
 if(args.action==='check_directories')value={directoryWarnings:[]};
 if(args.action==='save'){const project={...args,sessionRoots:[],revision:2};projects=projects.map(p=>p.id===project.id?project:p);value={project};}
 if(args.action==='pin')projects=projects.map(p=>p.id===args.id?{...p,pinned:!p.pinned}:p);
 if(args.action==='remove')projects=projects.filter(p=>p.id!==args.id);
 return {ok:true,json:async()=>({ok:true,value})};
};
window.__ModuleLoader__={load({factory}){factory(()=>React).apply(ctx);}};
`;
const checks=String.raw`
const root=ReactDOM.createRoot(document.getElementById('root'));
function BrowserHost(){
 const [panel,setPanel]=React.useState(null);selectPanel=setPanel;
 const nativeWorkspaces=React.useSyncExternalStore(ctx.workspaces.list.subscribe,ctx.workspaces.list.getSnapshot);
 const nav=entries.get('dsh-workdock-projects');
 const Page=entries.get('dsh-workdock-projects').component,Dock=entries.get('dsh-workdock-dock').component;
 // Main and nav use the same id; the slots adapter below stores separate keys.
 const Experience=entries.get('dsh-workdock-experience').component,Tree=entries.get('dsh-workdock-tree-menu').component;
 return h('div',{className:'fixture-shell'},h('aside',null,h('div',{className:'fixture-brand'},'Harness'),h('div',{className:'GAkraW_root'},h('div',{className:'GAkraW_sectionHeader'},h('span',null,'工作区'),h('div',{className:'GAkraW_searchSlot'},h('button',{title:'搜索'},'⌕')),h('div',{className:'GAkraW_headerActions'},h('button',{title:'视图'},'☷'),h('button',{title:'添加工作区','aria-label':'添加工作区'},'+'))),h('div',{id:'fixture-native-tree'},nativeWorkspaces.items.map(w=>h('div',{key:w.workspaceId,className:'fixture-path','data-row-key':'workspace:'+w.workspaceId,tabIndex:0},w.title,h('button',{id:w.workspaceId==='w1'?'fixture-project-menu':'fixture-project-menu-'+w.workspaceId,'aria-label':'项目操作'},'…'),...w.sessionIds.map(id=>h('div',{key:id,'data-row-key':'session:'+id},'　会话 '+id))))))),
 h('main',null,panel?h(Page):h('div',{className:'fixture-conversation'},h('h1',null,'聊天'),h(Dock,{dock:true,sessionId:'s1'}))),h(Experience),h(Tree));
}
root.render(h(BrowserHost));
const wait=()=>new Promise(resolve=>setTimeout(resolve,80));
const results=[];
function verify(name,condition){results.push({name,pass:Boolean(condition)});if(!condition)throw Error(name);}
const click=async(text,scope=document)=>{const b=[...scope.querySelectorAll('button')].find(b=>b.textContent===text);if(!b)throw Error('Missing button '+text);b.click();await wait();};
const input=async(node,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));await wait();};
(async()=>{try{
 for(let i=0;i<40&&(!document.querySelector('.dpm-dock')||document.querySelector('.dpm-dock').disabled);i++)await wait();
 document.querySelector('.dpm-dock').click();
 for(let i=0;i<40&&!document.querySelector('[role=dialog]');i++)await wait();
 verify('composer chip opens active project editor only',document.querySelector('[role=dialog]')&&document.getElementById('dpm-name').value==='运营业绩看板 01'&&!document.querySelector('.dpm-page'));
 const editorRect=document.querySelector('[role=dialog]').getBoundingClientRect();
 verify('composer editor is viewport-centered outside transformed input area',!document.querySelector('.fixture-conversation [role=dialog]')&&Math.abs((editorRect.top+editorRect.bottom)/2-innerHeight/2)<2&&Math.abs((editorRect.left+editorRect.right)/2-innerWidth/2)<2);
 await click(dictionary.cancel,document.querySelector('[role=dialog]'));
 verify('composer editor cancel stays in chat',!document.querySelector('[role=dialog]')&&!document.querySelector('.dpm-page'));
 let rowMenuMarkup;
 for(const mode of ['ellipsis','contextmenu']){
  const row=document.querySelector('[data-row-key="workspace:w1"]');
  if(mode==='ellipsis')document.getElementById('fixture-project-menu').click();else row.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:100,clientY:130}));
  await wait();
  const markup=document.querySelector('[role=menu]').innerHTML;
  if(mode==='ellipsis')rowMenuMarkup=markup;else verify('right-click and ellipsis share identical menu markup and styles',markup===rowMenuMarkup);
  verify(mode+' offers edit instead of project-management navigation',![...document.querySelectorAll('[role=menuitem]')].some(b=>b.textContent===dictionary.manage));
  await click(dictionary.edit,document.querySelector('[role=menu]'));
  verify(mode+' edits selected project without opening list',document.querySelector('[role=dialog]')&&document.getElementById('dpm-name').value==='运营业绩看板 01'&&!document.querySelector('.dpm-page'));
  await click(dictionary.cancel,document.querySelector('[role=dialog]'));
 }
 const manage=document.querySelector('.GAkraW_headerActions .dpm-workspace-manage');
 verify('workspace toolbar icon has accessible name and tooltip',manage?.getAttribute('aria-label')===dictionary.title&&manage.title===dictionary.title);
 const actions=manage.parentElement,nativeAdd=actions.querySelector('[aria-label="添加工作区"]');
 const fullyVisible=(button)=>{const b=button.getBoundingClientRect(),p=actions.getBoundingClientRect(),header=actions.parentElement.getBoundingClientRect();return b.width>0&&b.left>=p.left&&b.right<=p.right+.5&&b.left>=header.left&&b.right<=header.right+.5&&button.contains(document.elementFromPoint((b.left+b.right)/2,(b.top+b.bottom)/2));};
 verify('native add is fully visible and clickable, not clipped by 60px host limit',fullyVisible(nativeAdd));
 verify('toolbar order is view, management, add',manage.previousElementSibling?.title==='视图'&&manage.nextElementSibling===nativeAdd&&actions.lastElementChild===nativeAdd&&!actions.querySelector('.dpm-workspace-add'));
 nativeAdd.remove();await wait();
 const fallback=actions.querySelector('.dpm-workspace-add');
 verify('missing native add gets one accessible last-position button',fallback&&fallback.title===dictionary.add&&actions.lastElementChild===fallback&&fallback.previousElementSibling===manage);
 verify('fallback add is fully visible and clickable, not clipped',fullyVisible(fallback));
 fallback.click();await wait();
 verify('add button opens blank editor without page navigation',document.querySelector('[role=dialog]')?.getAttribute('aria-label')===dictionary.add&&document.getElementById('dpm-name').value===''&&!document.querySelector('.dpm-page'));
 await click(dictionary.cancel,document.querySelector('[role=dialog]'));
 actions.append(nativeAdd);await wait();
 verify('native add return removes fallback without duplicates',!actions.querySelector('.dpm-workspace-add')&&manage.nextElementSibling===nativeAdd);
 actions.classList.add('GAkraW_headerActionsHidden');await wait();
 verify('search-expanded actions still collapse with native visibility rules',getComputedStyle(actions).maxWidth==='0px'&&getComputedStyle(actions).visibility==='hidden');
 actions.classList.remove('GAkraW_headerActionsHidden');await wait();
 verify('closing search restores visible add button',fullyVisible(nativeAdd));
 manage.click();await wait();
 verify('native page, not a modal',document.querySelector('.dpm-page')&&!document.querySelector('[role=dialog]'));
 verify('25 rows on first page',document.querySelectorAll('tbody tr[data-project-id]').length===25);
 verify('no apply-to-current-chat action',![...document.querySelectorAll('button')].some(b=>b.textContent==='用于当前聊天'));
 verify('page occupies available main height',document.querySelector('.dpm-page').getBoundingClientRect().height>600);
 await click(dictionary.nextPage);verify('second page',document.querySelector('.dpm-pagination').textContent.includes('2 / 3'));
 await click(dictionary.nextPage);verify('17 rows on last page',document.querySelectorAll('tbody tr[data-project-id]').length===17);
 verify('next disabled at boundary',[...document.querySelectorAll('button')].find(b=>b.textContent===dictionary.nextPage).disabled);
 await input(document.querySelector('input[type=search]'),'shared-66');verify('reference folder search',document.querySelectorAll('tbody tr[data-project-id]').length===1&&document.querySelector('tbody tr').dataset.projectId==='p66');
 await click(dictionary.edit,document.querySelector('tbody tr'));verify('editor over native page',document.querySelector('[role=dialog]')&&document.querySelector('.dpm-page-content').inert);
 ReactDOM.flushSync(()=>document.querySelector('.dpm-folder-remove').click());
 const removed=document.querySelector('.dpm-removed-folder');
 const hintStyle=removed?{font:getComputedStyle(removed).fontSize,color:getComputedStyle(removed).color,button:getComputedStyle(removed.querySelector('button')).fontSize}:null;
 verify('removed folder hint uses compact secondary typography '+JSON.stringify(hintStyle),hintStyle?.font==='11px'&&hintStyle.color==='rgb(170, 170, 170)'&&hintStyle.button==='11px');
 await click(dictionary.undo,removed);verify('undo restores folder',!document.querySelector('.dpm-removed-folder')&&document.querySelectorAll('.dpm-source').length===2);
 await click(dictionary.cancel,document.querySelector('[role=dialog]'));verify('cancel restores filtered list',!document.querySelector('[role=dialog]')&&document.querySelector('input[type=search]').value==='shared-66');
 await input(document.querySelector('input[type=search]'),'');
 verify('header and toolbar do not overlap',document.querySelector('.dpm-page-header').getBoundingClientRect().bottom<=document.querySelector('.dpm-page-toolbar').getBoundingClientRect().top);
 verify('footer stays inside main viewport',document.querySelector('.dpm-pagination').getBoundingClientRect().bottom<=innerHeight);
 verify('only list requests while browsing',requests.filter(r=>!['list','check_directories'].includes(r.args.action)).length===0);
 verify('new-session label replaces new-chat label',dictionary.newChat==='新建会话'&&!document.querySelector('tbody').textContent.includes('新建聊天'));
 failSession=true;await click(dictionary.newChat,document.querySelector('tbody tr'));
 verify('session creation failure stays on page with visible error',document.querySelector('.dpm-page')&&document.querySelector('.dpm-error')?.textContent.includes('Session creation failed')&&openedSessions.length===0);
 failSession=false;await click(dictionary.newChat,document.querySelector('tbody tr'));
 verify('page creates and opens fresh session after returning to conversation',!document.querySelector('.dpm-page')&&createdSessions.at(-1).workspaceId==='w1'&&openedSessions.at(-1)==='new-2'&&navigation.at(-1)==='open:new-2');
 document.querySelector('[data-row-key="workspace:w1"]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:100,clientY:130}));await wait();
 await click(dictionary.newChat,document.querySelector('[role=menu]'));
 verify('project menu creates another fresh session instead of reusing current',openedSessions.at(-1)==='new-3'&&createdSessions.length===3&&!document.querySelector('[role=menu]'));
 const nativeRow=document.querySelector('[data-row-key="workspace:w1"]'),nativeSession=nativeRow.querySelector('[data-row-key="session:s1"]'),createCount=createdSessions.length;
 document.getElementById('fixture-project-menu').click();await wait();
 await click(dictionary.pin,document.querySelector('[role=menu]'));
 verify('pin reorders original host model and tree without extra region',reorderCalls.length>0&&workspaceSnapshot.items[0].workspaceId==='w1'&&document.getElementById('fixture-native-tree').firstElementChild===nativeRow&&!document.querySelector('.dpm-tree-pins')&&document.querySelectorAll('[data-row-key="workspace:w1"]').length===1);
 verify('pin keeps original workspace and session DOM identity without new chats',nativeRow.querySelector('[data-row-key="session:s1"]')===nativeSession&&createdSessions.length===createCount&&JSON.parse(localStorage.getItem('dsh-workdock-pinned-workspaces'))[0]==='w1');
 const pr=nativeRow.getBoundingClientRect(),sr=nativeSession.getBoundingClientRect();verify('project and nested session stay within native row geometry',pr.width>0&&sr.top>=pr.top&&sr.bottom<=pr.bottom);
 nativeRow.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:100,clientY:130}));await wait();
 verify('original project menu offers unpin',!![...document.querySelectorAll('[role=menuitem]')].find(b=>b.textContent===dictionary.unpin));
 await click(dictionary.unpin,document.querySelector('[role=menu]'));
 verify('unpin restores original native position and keeps session',workspaceSnapshot.items.map(w=>w.workspaceId).join(',')==='w0,w1'&&document.getElementById('fixture-native-tree').lastElementChild===nativeRow&&nativeRow.contains(nativeSession)&&localStorage.getItem('dsh-workdock-pinned-workspaces')==='[]');
 document.getElementById('fixture-project-menu').click();await wait();await click(dictionary.pin,document.querySelector('[role=menu]'));
 manage.click();await wait();
 document.documentElement.dataset.selfCheck='passed';
 }catch(error){results.push({name:error.message,pass:false});document.documentElement.dataset.selfCheck='failed';}
 const panel=document.createElement('pre');panel.id='self-check';panel.textContent=JSON.stringify(results,null,2);panel.hidden=true;document.body.append(panel);
})();
`;
// A main keyed slot and a sidebar id are separate namespaces in the real host.
const adjustedFixture=fixture.replace("entries.set(options.id||options.key,{options,component});", "entries.set(options.name==='sidebar.panellist'?'nav-projects':options.id||options.key,{options,component});");
const html='<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{height:100%;margin:0}body{font:14px "Segoe UI","Microsoft YaHei",sans-serif;background:#292929;color:#eee}.fixture-shell{height:100%;display:grid;grid-template-columns:230px minmax(0,1fr)}aside{padding:24px 16px;background:#202020;border-right:1px solid #404040}.fixture-brand{font-size:20px;font-weight:600;margin-bottom:30px}aside button{background:#384658;color:#e3edff;border:0;padding:10px 12px;border-radius:9px;width:100%;text-align:left;font:inherit}.fixture-workspace{color:#aaa;font-size:12px;margin:32px 10px 12px}.fixture-path{padding:10px}.GAkraW_sectionHeader{display:flex;align-items:center;gap:6px;font-size:12px;color:#aaa}.GAkraW_sectionHeader>span{flex:1}.GAkraW_headerActions{display:flex;gap:4px;max-width:60px;overflow:hidden;flex:none}.GAkraW_headerActionsHidden{max-width:0;opacity:0;visibility:hidden;pointer-events:none}.GAkraW_sectionHeader button{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;background:transparent;color:inherit;border-radius:5px}.GAkraW_sectionHeader button:hover{background:#383838}main{display:flex;flex-direction:column;min-width:0;min-height:0}.fixture-conversation{padding:32px;box-sizing:border-box;margin-top:auto;height:160px;transform:translateZ(0)}</style></head><body><div id="root"></div><script>'+inline(react)+'</script><script>'+inline(reactDOM)+'</script><script>'+inline(adjustedFixture)+'</script><script>'+inline(client)+'</script><script>'+inline(checks)+'</script></body></html>';
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/project-page-preview.html',root),html);
console.log(new URL('dist/project-page-preview.html',root).pathname);

// Optional local acceptance run: production plugin logic in installed Chrome.
if(process.argv.includes('--verify')){
  const {spawnSync}=await import('node:child_process');
  const {openSync,closeSync,readFileSync}=await import('node:fs');
  const {fileURLToPath}=await import('node:url');
  const output=fileURLToPath(new URL('dist/project-page-dom.html',root));
  const fd=openSync(output,'w');
  let result;
  try{
    result=spawnSync(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',[
      '--headless=new','--disable-gpu','--no-sandbox','--no-first-run',
      '--user-data-dir='+fileURLToPath(new URL('dist/preview-chrome',root)),
      '--virtual-time-budget=12000','--window-size=1500,1050','--dump-dom',
      '--screenshot='+fileURLToPath(new URL('dist/project-page-preview.png',root)),
      new URL('dist/project-page-preview.html',root).href
    ],{stdio:['ignore',fd,'inherit']});
  }finally{closeSync(fd);}
  if(result.error)throw result.error;
  if(result.status!==0)throw Error('Chrome exited '+result.status);
  const rendered=readFileSync(output,'utf8');
  console.log(rendered.match(/<pre id="self-check"[^>]*>([\s\S]*?)<\/pre>/)?.[1]||'Missing self-check results');
  if(!rendered.includes('data-self-check="passed"'))process.exitCode=1;
}
