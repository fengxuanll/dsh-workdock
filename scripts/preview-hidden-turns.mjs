// Offline acceptance fixture: real workdock + React/ReactDOM + installed chat CSS.
// Harness service/slot boundaries and message contents are stubbed. No live GUI.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {openSync,readSync,closeSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const [react,reactDOM,client]=await Promise.all(['node_modules/react/umd/react.development.js','node_modules/react-dom/umd/react-dom.development.js','client.js'].map(p=>readFile(new URL(p,root),'utf8')));
function installedChatCss(){
 const path=process.env.DSH_APP_ASAR||'D:/Program Files/DeepseekHarness/resources/app.asar',fd=openSync(path,'r');
 try{
  const head=Buffer.alloc(16);readSync(fd,head,0,16,0);const header=Buffer.alloc(head.readUInt32LE(12));readSync(fd,header,0,header.length,16);
  let entry=JSON.parse(header);for(const name of 'dsh/node_modules/@deepseek-ai/dsh-client-ui-chat/lib/client.js'.split('/'))entry=entry.files[name];
  const bytes=Buffer.alloc(entry.size);readSync(fd,bytes,0,bytes.length,8+head.readUInt32LE(4)+Number(entry.offset));const source=bytes.toString();
  const tag=source.indexOf('MessageIconActions.module.css";');if(tag<0)throw Error('Installed MessageIconActions CSS not found');
  const start=source.lastIndexOf('const css$',tag),literal=source.slice(start,tag).match(/=\s*("(?:\\.|[^"\\])*");/);
  const map=source.match(/var MessageIconActions_module_css_default = (\{[\s\S]*?\});/);
  if(!literal||!map)throw Error('Installed native action CSS format changed');
  return {css:JSON.parse(literal[1]),classes:JSON.parse(map[1])};
 }finally{closeSync(fd);}
}
const native=installedChatCss();
const inline=s=>s.replace(/<\/script/gi,'<\\/script');
const fixture=String.raw`
const h=React.createElement,entries=new Map(),disposers=[],sessionSnapshot={byId:{s1:{id:'s1',retainedBy:{mainView:1}}}};
const classes=NATIVE.classes;
localStorage.removeItem('dsh-workdock-hidden-turns:v1:s1');let dictionary;
const ctx={effect(fn){disposers.push(fn());},locale:{register(_ns,values){dictionary=values.zh;return()=>{};},bind(){return key=>dictionary[key];}},slots:{inject(_name,fn){fn();},register(options,component){entries.set(options.id||options.key,{options,component});return()=>{};}},sessions:{list:{getSnapshot:()=>sessionSnapshot,subscribe:()=>()=>{}}},workspaces:{list:{getSnapshot:()=>({items:[]}),subscribe:()=>()=>{}}},remote:{directoryPicker:{}},uiWorkspace:{}};
window.fetch=()=>{throw Error('Hidden-turn preview must not call Host');};
window.__ModuleLoader__={load({factory}){factory(name=>{if(name==='react')return React;if(name==='react-dom')return ReactDOM;throw Error('Unexpected module '+name);}).apply(ctx);}};
`;
const checks=String.raw`
const Hide=entries.get('dsh-workdock-hide-turn').component,Restore=entries.get('dsh-workdock-restore-turns').component;
const roots=[],results=[];
function icon(path){return h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5},h('path',{d:path}));}
function Bar({turn}){return h('div',{'data-clock':'end',className:classes.actions},
 h('span',null,h('button',{type:'button',className:classes.action,title:'复制','aria-label':'复制','data-copy':turn},icon('M8 8h12v12H8zM4 16V4h12'))),
 h('span',null,h('button',{type:'button',className:classes.action,title:'分支','aria-label':'分支'},icon('M6 4v12a4 4 0 0 0 4 4h8M6 8h8a4 4 0 0 0 4-4'))),
 h('span',{className:classes.endInfo},h('span',{'data-usage':''},'1.2k tokens'),h('span',{className:classes.timeEnd},'21:14')));}
function Seat({turn,kind,children}){return h('div',{'data-chat-flow-key':kind+turn,'data-chat-node-key':kind+turn,'data-chat-flow-kind':kind,'data-chat-turn':turn},h('div',{'data-slot':'conversation.chat.node'},children));}
function Turn({turn}){return h(React.Fragment,null,
 h(Seat,{turn,kind:'user'},h('div',{className:'fixture-user'},turn===5?'这轮保持显示，用来检查底部图标的位置。':'请整理第 '+turn+' 轮的处理结果。')),
 h(Seat,{turn,kind:'assistant-step'},h('div',{className:'fixture-answer'},turn===5?'隐藏按钮位于复制、分支操作之后，时间之前。只改变当前浏览器的显示，不修改历史记录或模型上下文。':'已完成检查，相关记录仍完整保留。')),
 h(Seat,{turn,kind:'turn-tail'},h('div',{'data-turn-tail':turn,'data-actions-reveal':'always'},h('span',{'data-slot':'conversation.chat.turnTail'},h(Hide,{turn:{turn,status:'closed',steps:[],data:new Map()}})),h(Bar,{turn}))));}
const app=ReactDOM.createRoot(document.getElementById('root'));roots.push(app);
app.render(h('main',null,h('header',null,h('h1',null,'会话显示 · 隐藏轮次'),h('p',null,'离线浏览器验收 · 真实插件与宿主操作栏样式 · 非运行中 GUI')),
 h('section',{'data-conversation-session':'s1','data-conversation-region':'chat'},h('div',{'data-conversation-scroll':''},h('div',{'data-chat-flow':'',id:'flow'},[1,2,3,4,5].map(turn=>h(Turn,{key:turn,turn})))),h('div',{id:'dock'},h(Restore,{sessionId:'s1'})),h('footer',null,'隐藏不删除记录；刷新后可恢复。')));
const wait=()=>new Promise(resolve=>setTimeout(resolve,60));
const verify=(name,value)=>{results.push({name,pass:Boolean(value)});if(!value)throw Error(name);};
const hide=n=>document.querySelector('[data-dpm-hide-turn="'+n+'"]');
const rect=n=>n.getBoundingClientRect();
function geometry(n){const button=hide(n),tail=document.querySelector('[data-turn-tail="'+n+'"]'),clock=tail.querySelector('.'+classes.timeEnd),copy=tail.querySelector('[data-copy]');const a=rect(button),b=rect(clock),c=rect(copy);return {a,b,c,tail};}
(async()=>{try{
 for(let i=0;i<30&&!hide(1);i++)await wait();
 verify('one SVG hide control per native bottom action row',document.querySelectorAll('.dpm-turn-hide-button').length===5&&hide(1).querySelector('svg')&&hide(1).textContent==='');
 verify('accessible icon label and explanatory tooltip',hide(1).getAttribute('aria-label')==='隐藏本轮'&&hide(1).title.includes('隐藏本轮')&&hide(1).title.includes('模型上下文不变'));
 for(const turn of [1,5]){const {a,b,c}=geometry(turn);verify('icon and native copy/clock share a row '+turn,Math.abs((a.top+a.bottom-c.top-c.bottom)/2)<2&&Math.abs((a.top+a.bottom-b.top-b.bottom)/2)<2);verify('icon sits immediately before native clock '+turn,hide(turn).parentElement.nextElementSibling?.classList.contains(classes.timeEnd)&&a.right<=b.left+.5&&b.left-a.right<=10);}
 const tail=document.querySelector('[data-turn-tail="1"]'),oldBar=tail.querySelector('[data-clock=end]');const replacement=oldBar.cloneNode(true);replacement.querySelector('.dpm-turn-action-seat')?.remove();oldBar.replaceWith(replacement);await wait();
 verify('native toolbar replacement gets exactly one working portal icon',tail.querySelectorAll('.dpm-turn-hide-button').length===1&&tail.querySelector('.dpm-turn-action-seat').nextElementSibling.classList.contains(classes.timeEnd));
 for(const turn of [1,2,3,4]){hide(turn).click();await wait();}
 const placeholders=[...document.querySelectorAll('.dpm-turn-restore')];
 verify('four complete turns hidden with four compact restore controls',placeholders.length===4&&document.querySelectorAll('.dpm-turn-hidden').length===12);
 const total=rect(placeholders.at(-1)).bottom-rect(placeholders[0]).top;
 verify('four hidden turns occupy at most 100px: '+total.toFixed(1),total<=100&&total>=80);
 verify('stored preferences contain identities only',localStorage.getItem('dsh-workdock-hidden-turns:v1:s1')==='["1","2","3","4"]');
 placeholders[1].querySelector('button').click();await wait();verify('single-turn restore returns original content and icon',document.querySelectorAll('.dpm-turn-restore').length===3&&!document.querySelector('[data-chat-turn="2"]').classList.contains('dpm-turn-hidden')&&hide(2));
 hide(2).click();await wait();
 document.querySelector('#dock button').click();await wait();verify('restore all clears hidden seats and preferences',!document.querySelector('.dpm-turn-hidden')&&localStorage.getItem('dsh-workdock-hidden-turns:v1:s1')===null);
 for(const turn of [1,2,3,4]){hide(turn).click();await wait();}
 document.querySelector('main').style.width='320px';await wait();
 const narrow=geometry(5),main=rect(document.querySelector('main'));
 verify('320px conversation keeps copy/icon/time aligned and inside bounds',Math.abs((narrow.a.top+narrow.a.bottom-narrow.b.top-narrow.b.bottom)/2)<2&&narrow.a.left>=main.left&&narrow.b.right<=main.right+.5);
 verify('narrow conversation introduces no horizontal page overflow',document.documentElement.scrollWidth<=innerWidth);
 if(!new URLSearchParams(location.search).has('narrow'))document.querySelector('main').style.width='';await wait();
 document.documentElement.dataset.selfCheck='passed';
 }catch(error){results.push({name:error.stack||error.message,pass:false});document.documentElement.dataset.selfCheck='failed';}
 const output=document.createElement('pre');output.id='self-check';output.textContent=JSON.stringify(results,null,2);output.hidden=true;document.body.append(output);
})();
`;
const css=`html{color-scheme:dark}body{margin:0;background:#202020;color:#e8e8e8;font:14px "Segoe UI","Microsoft YaHei",sans-serif}*{box-sizing:border-box}main{max-width:760px;width:calc(100% - 32px);margin:24px auto;padding:20px;background:#292929;border:1px solid #414141;border-radius:14px}h1{font-size:19px;margin:0 0 7px}header p,footer{color:#aaa;font-size:12px;line-height:1.6}header{margin-bottom:24px}footer{margin-top:22px}#flow{display:block;min-width:0}[data-chat-flow-key]{min-width:0}[data-chat-flow-kind=user]{margin:16px 0 10px}.fixture-user{background:#363636;padding:10px 14px;border-radius:12px;line-height:1.6}.fixture-answer{padding:3px 0 9px;line-height:1.75;color:#d8d8d8}[data-turn-tail]{padding-bottom:8px}[data-clock=end]{display:flex;align-items:center;justify-content:flex-start;min-height:28px}#dock{padding-top:12px;min-height:24px}svg{display:block}button{font:inherit}`;
const html='<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>隐藏轮次浏览器验证</title><style>'+native.css+'\n'+css+'</style></head><body><div id="root"></div><script>'+inline(react)+'</script><script>'+inline(reactDOM)+'</script><script>const NATIVE='+JSON.stringify(native).replace(/</g,'\\u003c')+';</script><script>'+inline(fixture)+'</script><script>'+inline(client)+'</script><script>'+inline(checks)+'</script></body></html>';
await mkdir(new URL('dist/',root),{recursive:true});
const page=new URL('dist/hidden-turns-preview.html',root);await writeFile(page,html);console.log(fileURLToPath(page));
if(process.argv.includes('--verify')){
 const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
 for(const narrow of [false,true]){
  const suffix=narrow?'-narrow':'',output=new URL('dist/hidden-turns-preview'+suffix+'-dom.html',root),fd=openSync(fileURLToPath(output),'w');let result;
  try{result=spawnSync(chrome,['--headless=new','--disable-gpu','--no-sandbox','--no-first-run','--user-data-dir='+fileURLToPath(new URL('dist/hidden-turns-chrome'+suffix,root)),'--virtual-time-budget=12000','--window-size='+(narrow?'390,900':'1100,1000'),'--dump-dom','--screenshot='+fileURLToPath(new URL('dist/hidden-turns-preview'+suffix+'.png',root)),page.href+(narrow?'?narrow=1':'')],{stdio:['ignore',fd,'inherit']});}finally{closeSync(fd);}
  if(result.error)throw result.error;if(result.status!==0)throw Error('Chrome exited '+result.status);
  const rendered=readFileSync(output,'utf8');console.log((narrow?'NARROW':'DESKTOP')+' '+(rendered.match(/<pre id="self-check"[^>]*>([\s\S]*?)<\/pre>/)?.[1]||'Missing self-check results'));
  if(!rendered.includes('data-self-check="passed"'))process.exitCode=1;
 }
}
