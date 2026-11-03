import test from 'node:test';
import assert from 'node:assert/strict';
import { apply } from '../index.js';

test('activation backfills legacy projects and list retries sync failures without duplicate workspaces',async()=>{
  const legacy={id:'legacy',title:'Qizhu',primary:'D:/Qizhu/v1',folders:['D:/Qizhu/v1'],sessionRoots:['D:/Qizhu/v1'],revision:1,pinned:false};
  let state={projects:[legacy],bindings:{}},command,fail=true;
  const workspaces=[],disposers=[];
  const ctx={
    connection:{fetch:{register:()=>()=>{}}},agents:{get:()=>undefined},
    storageDomain:{open:async spec=>{
      state=spec.global.schema.parse(state);
      return {global:{get:()=>state,set:async value=>{state=spec.global.schema.parse(value);}},close(){}};
    }},
    workspaceRegistry:{list:()=>workspaces,create:async(path,title)=>{
      if(fail)throw Error('directory unavailable');
      const workspace={id:'native-qizhu',path,title,async setTitle(value){this.title=value;}};
      workspaces.push(workspace);return workspace;
    }},
    commands:{register:value=>{command=value;}},tools:{register(){}},systemPrompt:{context(){}},on(){},effect:fn=>{disposers.push(fn());},
  };
  await apply(ctx); // An unavailable legacy directory must not deactivate the plugin.
  const list=async()=>{
    const result=await command.handler({rawInput:'',agent:{session:{header:{id:'test'}}}});
    assert.equal(result.kind,'success');return JSON.parse(result.text);
  };
  assert.match((await list()).syncWarnings[0],/Qizhu.*directory unavailable/);
  fail=false;
  assert.equal((await list()).syncWarnings,undefined);
  assert.equal(workspaces.length,1);
  assert.equal(workspaces[0].title,'Qizhu');
  await list();assert.equal(workspaces.length,1);
  for(const dispose of disposers)await dispose?.();
});

test('activation registers already-saved projects before any chat command',async()=>{
  const project={id:'old',title:'Saved project',primary:'D:/Saved',folders:['D:/Saved'],sessionRoots:['D:/Saved'],revision:1,pinned:false};
  const workspaces=[],disposers=[];
  await apply({
    connection:{fetch:{register:()=>()=>{}}},agents:{get:()=>undefined},
    storageDomain:{open:async spec=>({global:{get:()=>spec.global.schema.parse({projects:[project],bindings:{}})},close(){}})},
    workspaceRegistry:{list:()=>workspaces,create:async(path,title)=>{const value={path,title};workspaces.push(value);return value;}},
    commands:{register(){}},tools:{register(){}},systemPrompt:{context(){}},on(){},effect:fn=>{disposers.push(fn());},
  });
  assert.deepEqual(workspaces,[{path:'D:/Saved',title:'Saved project'}]);
  for(const dispose of disposers)await dispose?.();
});
