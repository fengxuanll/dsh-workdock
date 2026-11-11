// Offline Chromium fixture: production React + plugin JS/CSS; only Host boundaries are stubbed.
// The installed Host Markdown module is unavailable here; its adapter deliberately renders plain text.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('../dist/favorites-preview.html',import.meta.url);
const [react,reactDOM,client]=await Promise.all(['node_modules/react/umd/react.development.js','node_modules/react-dom/umd/react-dom.development.js','client.js'].map(path=>readFile(new URL(path,root),'utf8')));
const inline=text=>text.replace(/<\/script/gi,'<\\/script');
const fixture=String.raw`
const h=React.createElement,entries=new Map();let dictionary;
const sessionSnapshot={byId:{s:{id:'s',displayTitle:'收藏功能设计',retainedBy:{mainView:1}}}};
let items=[{id:'f1',title:'如何设计一个方便查找的回复收藏？',note:'第一版实现范围，后续评审时参考。',content:'# 收藏回复 · 第一版\n\n收藏的是回复原文快照，而不是会随上下文变化的引用。\n\n1. 一键收藏已完成的 AI 回复\n2. 在项目管理中按项目和关键词快速找回\n3. 标题、备注可编辑，快照正文保持原样\n4. 来源删除后，收藏仍可阅读\n\n收藏入口靠近回复，查找入口靠近项目。',projectId:'p1',projectTitle:'项目管理插件',sessionId:'s',sessionTitle:'收藏功能设计',sourceKey:'message:m',turn:3,seq:12,revision:1,createdAt:1794376800000},{id:'f2',title:'项目与会话目录的优先级',note:'',content:'会话覆盖优先，其次是项目主要目录。子会话创建时复制配置，不继承后续变动。',projectId:'p1',projectTitle:'项目管理插件',sessionId:'s2',sessionTitle:'工作目录约定',sourceKey:'message:m2',turn:2,revision:1,createdAt:1794290400000},{id:'f3',title:'测试策略与并发写入',note:'',content:'多个收藏和项目修改共用串行队列，持久化成功后再发布状态。',projectId:'p2',projectTitle:'接口测试',sessionId:'s3',sessionTitle:'可靠性验证',sourceKey:'message:m3',turn:1,revision:1,createdAt:1794204000000}];
const ctx={effect(fn){fn();},locale:{register(_ns,value){dictionary=value.zh;},bind(){return key=>dictionary[key];}},slots:{inject(_name,fn){fn();},register(options,component){entries.set(options.name+':'+(options.id||options.key),{options,component});return()=>{};}},sessions:{list:{getSnapshot:()=>sessionSnapshot,subscribe:()=>()=>{}}},layout:{selectPanel(){}},uiWorkspace:{},workspaces:{list:{getSnapshot:()=>({items:[]}),subscribe:()=>()=>{}}},remote:{directoryPicker:{}}};
window.fetch=async(_url,{body})=>{const {args}=JSON.parse(body);let value={};if(args.action==='list')value={projects:['p1','p2'].map((id,i)=>({id,title:['项目管理插件','接口测试'][i],primary:'E:/Workspace/'+id,folders:['E:/Workspace/'+id],revision:1})),activeProjectId:'p1'};if(args.action==='favorite_list')value={favorites:items};if(args.action==='favorite_update'){const prior=items.find(item=>item.id===args.id),favorite={...prior,title:args.title,note:args.note,revision:prior.revision+1};items=items.map(item=>item.id===args.id?favorite:item);value={favorite};}return{ok:true,json:async()=>({ok:true,value})};};
window.__ModuleLoader__={load({factory}){factory(name=>name==='@deepseek-ai/dsh-client-ui-primitives'?{MarkdownText:({text})=>h('pre',{'data-host-markdown-adapter':'plain-text'},text)}:React).apply(ctx);}};
`;
const checks=String.raw`
const Page=entries.get('main:dsh-workdock-projects').component;
ReactDOM.createRoot(document.getElementById('root')).render(h(Page));
const wait=()=>new Promise(resolve=>setTimeout(resolve,80)),results=[];
function verify(name,value){results.push({name,pass:Boolean(value)});if(!value)throw Error(name);}
(async()=>{try{
 for(let i=0;i<40&&!document.querySelector('.dpm-tabs');i++)await wait();
 [...document.querySelectorAll('.dpm-tabs button')].find(node=>node.textContent===dictionary.favorites).click();await wait();
 for(let i=0;i<40&&!document.querySelector('.dpm-favorite-item');i++)await wait();
 verify('active-project filter',document.querySelector('.dpm-favorites select').value==='p1'&&document.querySelectorAll('.dpm-favorite-item').length===2);
 document.querySelector('.dpm-favorite-item').click();await wait();
 verify('snapshot detail',document.querySelector('.dpm-favorite-content').textContent===items[0].content);
 const columns=document.querySelector('.dpm-favorite-columns'),rect=columns.getBoundingClientRect(),list=document.querySelector('.dpm-favorite-list').getBoundingClientRect(),detail=document.querySelector('.dpm-favorite-detail').getBoundingClientRect();
 verify('no horizontal viewport overflow',document.documentElement.scrollWidth<=innerWidth+1);
 verify('panels within viewport',['.dpm-page','.dpm-favorite-columns','.dpm-favorite-detail','.dpm-page-toolbar'].every(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;}));
 verify(innerWidth<=760?'responsive stacked detail':'desktop two columns',innerWidth<=760?detail.top>=list.bottom-1:detail.left>=list.right-1);
 const title=document.getElementById('dpm-favorite-title');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(title,'收藏功能 · 实现范围');title.dispatchEvent(new Event('input',{bubbles:true}));await wait();
 [...document.querySelectorAll('.dpm-favorite-detail button')].find(node=>node.textContent===dictionary.save).click();await wait();
 verify('real editor updates state',document.querySelector('.dpm-favorite-item strong').textContent==='收藏功能 · 实现范围');
 document.getElementById('checks').textContent=JSON.stringify({ok:true,results});document.body.dataset.result='pass';
}catch(error){document.getElementById('checks').textContent=JSON.stringify({ok:false,error:error.message,results});document.body.dataset.result='fail';}})();
`;
await mkdir(new URL('../dist',import.meta.url),{recursive:true});
await writeFile(out,`<!doctype html><html lang="zh"><meta charset="utf-8"><title>收藏回复 · 离线界面验证</title><style>:root{--fg:#e4e4e7;--muted:#9a9aa4;--border:#36363d;--hover:#29292f;--bg:#18181c;--panel:#202025;--primary:#b7a146;--text:#e4e4e7}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px system-ui,'Microsoft YaHei',sans-serif}header{padding:12px 24px;border-bottom:1px solid var(--border);color:var(--muted);font-size:12px}#root{padding:12px 24px}button,input,select,textarea{font:inherit}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8;font-family:inherit}#checks{font:11px monospace;color:var(--muted);padding:12px 24px;white-space:pre-wrap}button{cursor:pointer}@media(max-width:760px){#root{padding:10px}}</style><header>Harness · 项目管理 / 收藏回复　｜　离线夹具：真实插件界面，宿主服务与 Markdown 渲染适配器为测试替身</header><div id="root"></div><pre id="checks">Running checks…</pre><script>${inline(react)}</script><script>${inline(reactDOM)}</script><script>${fixture}</script><script>${inline(client)}</script><script>${checks}</script></html>`);
console.log(out.pathname);
