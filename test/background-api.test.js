import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apply } from '../index.js';

test('background route reads and saves projects without executing commands or appending chat events',async()=>{
  const root=await mkdtemp(join(tmpdir(),'dpm-background-'));
  const disposers=[];
  let route,state,cwd=root;
  const workspaces=[];
  const agent={session:{header:{id:'chat',cwd:root},append(){assert.fail('background UI must not append command records');}},
    ctx:{get:()=>({get:()=>cwd,set:async(_agent,path)=>{cwd=path;}})}};
  try{
    const primary=join(root,'primary');await mkdir(primary);
    await apply({
      connection:{fetch:{register:value=>{route=value;return()=>{route=null;};}}},agents:{get:id=>id==='chat'?agent:undefined},
      storageDomain:{open:async spec=>{
        state=spec.global.schema.parse(spec.global.initial);
        return {global:{get:()=>state,set:async value=>{state=spec.global.schema.parse(value);}},close(){}};
      }},
      workspaceRegistry:{list:()=>workspaces,create:async(path,title)=>{const workspace={id:'native',path,title};workspaces.push(workspace);return workspace;}},
      commands:{register(){},execute(){assert.fail('background UI must not call commands.execute');}},tools:{register(){}},systemPrompt:{context(){}},on(){},effect:fn=>disposers.push(fn()),
    });
    assert.equal(route.path,'/api/dsh-project-manager');assert.deepEqual(route.methods,['POST']);
    const post=async payload=>route.fetch(new Request('https://host/api/dsh-project-manager',{method:'POST',body:JSON.stringify(payload)}));
    assert.equal((await post({args:{action:'list'}})).status,200);
    const saved=await post({sessionId:'chat',args:{action:'save',title:'Quiet project',folders:[primary],primary}});
    assert.equal(saved.status,200);assert.equal(saved.headers.get('cache-control'),'no-store');
    assert.equal((await saved.json()).value.project.title,'Quiet project');
    assert.equal(cwd,primary);assert.equal(workspaces.length,1);
    const listed=await (await post({sessionId:'chat',args:{action:'list'}})).json();
    assert.equal(listed.value.projects.length,1);
    assert.equal((await post({sessionId:'missing',args:{action:'bind',id:listed.value.projects[0].id}})).status,409);
    assert.equal((await post({args:{action:'unknown'}})).status,400);
    const oversized=await route.fetch(new Request('https://host/api/dsh-project-manager',{method:'POST',body:'x'.repeat(131073)}));
    assert.equal(oversized.status,413);
    await (await post({sessionId:'chat',args:{action:'remove',id:listed.value.projects[0].id}})).json();
    assert.equal(state.projects.length,0);
  }finally{for(const dispose of disposers)await dispose?.();await rm(root,{recursive:true,force:true});}
});

const connectionModule=new URL('../.reference/runtime/node_modules/@deepseek-ai/dsh-client-connection/lib/index.js',import.meta.url);
test('actual Harness Connection admits background routes only for the authenticated owner peer',{
  skip:!await access(connectionModule).then(()=>true,()=>false),
},async()=>{
  const {HostConnectionService}=await import(connectionModule);
  let called=0;
  const handler=HostConnectionService.prototype.createSharedFetchHandler.call({
    fetchRoutes:new Map([['/api/dsh-project-manager',{methods:new Set(['POST']),requestBody:'buffered',fetch:async()=>{called++;return Response.json({ok:true});}}]]),interceptors:new Map(),
  },'/api');
  const request=new Request('https://host/api/dsh-project-manager',{method:'POST'});
  assert.equal((await handler.fetch(request,{principal:{kind:'guest'}})).status,403);
  assert.equal(called,0);
  assert.equal((await handler.fetch(request,{principal:{kind:'owner'}})).status,200);
  assert.equal(called,1);
});
