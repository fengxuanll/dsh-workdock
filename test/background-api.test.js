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
    assert.equal(route.path,'/api/dsh-workdock');assert.deepEqual(route.methods,['POST']);
    const post=async payload=>route.fetch(new Request('https://host/api/dsh-workdock',{method:'POST',body:JSON.stringify(payload)}));
    assert.equal((await post({args:{action:'list'}})).status,200);
    const saved=await post({sessionId:'chat',args:{action:'save',title:'Quiet project',folders:[primary],primary}});
    assert.equal(saved.status,200);assert.equal(saved.headers.get('cache-control'),'no-store');
    assert.equal((await saved.json()).value.project.title,'Quiet project');
    assert.equal(cwd,primary);assert.equal(workspaces.length,1);
    const listed=await (await post({sessionId:'chat',args:{action:'list'}})).json();
    assert.equal(listed.value.projects.length,1);
    assert.equal((await post({sessionId:'missing',args:{action:'bind',id:listed.value.projects[0].id}})).status,409);
    assert.equal((await post({args:{action:'unknown'}})).status,400);
    const oversized=await route.fetch(new Request('https://host/api/dsh-workdock',{method:'POST',body:'x'.repeat(131073)}));
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
    fetchRoutes:new Map([['/api/dsh-workdock',{methods:new Set(['POST']),requestBody:'buffered',fetch:async()=>{called++;return Response.json({ok:true});}}]]),interceptors:new Map(),
  },'/api');
  const request=new Request('https://host/api/dsh-workdock',{method:'POST'});
  assert.equal((await handler.fetch(request,{principal:{kind:'guest'}})).status,403);
  assert.equal(called,0);
  assert.equal((await handler.fetch(request,{principal:{kind:'owner'}})).status,200);
  assert.equal(called,1);
});

test('background project management works without a chat and reports partial sync success',async()=>{
  const root=await mkdtemp(join(tmpdir(),'dpm-experience-'));
  const disposers=[];
  let route,state,cwd=root,failSync=true;
  const workspaces=[];
  const agent={session:{header:{id:'chat',cwd:root}},ctx:{get:()=>({get:()=>cwd,set:async(_agent,path)=>{cwd=path;}})}};
  try {
    const primary=join(root,'primary'),reference=join(root,'reference');
    await mkdir(primary);await mkdir(reference);
    await apply({
      connection:{fetch:{register:value=>{route=value;return()=>{};}}},agents:{get:id=>id==='chat'?agent:undefined},
      storageDomain:{open:async spec=>{
        state=spec.global.schema.parse(spec.global.initial);
        return {global:{get:()=>state,set:async value=>{state=spec.global.schema.parse(value);}},close(){}};
      }},
      workspaceRegistry:{list:()=>workspaces,create:async(path,title)=>{
        if(failSync)throw Error('temporary sidebar failure');
        const workspace={id:'native',path,title};workspaces.push(workspace);return workspace;
      }},
      commands:{register(){}},tools:{register(){}},systemPrompt:{context(){}},on(){},effect:fn=>disposers.push(fn()),
    });
    const post=async(args,sessionId)=>{
      const response=await route.fetch(new Request('https://host/api/dsh-workdock',{method:'POST',body:JSON.stringify({args,sessionId})}));
      return {status:response.status,...await response.json()};
    };
    const saved=await post({action:'save',title:'Partial success',folders:[primary,reference],primary},'chat');
    assert.equal(saved.status,200);
    assert.match(saved.value.syncWarnings[0],/temporary sidebar failure/);
    const project=saved.value.project;
    assert.equal(state.projects[0].id,project.id);
    assert.ok(state.projects[0].lastUsedAt > 0);
    assert.equal(cwd,primary);
    failSync=false;
    const listed=await post({action:'list'});
    assert.equal(listed.status,200);
    assert.equal(listed.value.syncWarnings,undefined);
    assert.deepEqual(listed.value.directoryWarnings,[]);
    assert.equal(listed.value.activeProjectId,null);
    assert.equal(workspaces.length,1);
    await rm(reference,{recursive:true});
    const checked=await post({action:'check_directories',folders:[primary,reference,reference]});
    assert.equal(checked.status,200);
    assert.equal(checked.value.directoryWarnings.length,1);
    assert.equal(checked.value.directoryWarnings[0].path,reference);
    assert.ok(checked.value.directoryWarnings[0].error);
    const warning=(await post({action:'list'})).value.directoryWarnings[0];
    assert.equal(warning.projectId,project.id);
    assert.equal(warning.path,reference);
    for(const args of [{action:'pin',id:project.id},{action:'touch',id:project.id}]) {
      assert.equal((await post(args)).status,200);
    }
    assert.equal(state.projects[0].pinned,true);
    assert.equal((await post({action:'bind',id:project.id})).status,409);
    assert.equal((await post({action:'save',title:'No chat',folders:[primary],primary})).status,409);
    assert.equal((await post({action:'remove',id:project.id})).status,200);
    assert.equal(state.projects.length,0);
    assert.deepEqual(state.bindings,{});
    await access(primary);
  } finally {for(const dispose of disposers)await dispose?.();await rm(root,{recursive:true,force:true});}
});
