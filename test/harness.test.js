import test from 'node:test';
import assert from 'node:assert/strict';
import { access, copyFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Optional integration fixture extracted from the user's installed Harness.
const runtime = new URL('../.reference/runtime/', import.meta.url);
const available = await access(runtime).then(()=>true,()=>false);
test('installed Harness APIs: activation, command, tool, context and actual write cwd', {skip:!available}, async()=>{
  for(const name of ['index.js','core.js','package.json']) await copyFile(new URL('../'+name,import.meta.url),new URL(name,runtime));
  const {apply} = await import(new URL('index.js',runtime));
  const {z}=await import(new URL('node_modules/zod/index.js',runtime));
  let state,command,tool,context;
  const hooks=new Map();const cleanups=[];
  const workspaces=[];
  const ctx={
    connection:{fetch:{register:()=>()=>{}}},agents:{get:()=>undefined},
    workspaceRegistry:{list:()=>workspaces,create:async(path,title)=>{
      const workspace={id:`w${workspaces.length}`,path,title,async setTitle(value){this.title=value;}};
      workspaces.push(workspace);return workspace;
    }},
    storageDomain:{open:async spec=>{
      state=spec.global.schema.parse(spec.global.initial);
      return {global:{get:()=>state,set:async v=>{state=spec.global.schema.parse(v);}},close:async()=>{}};
    }},
    effect:fn=>{cleanups.push(fn());},commands:{register:v=>{command=v;}},tools:{register:v=>{tool=v;}},
    systemPrompt:{context:v=>{context=v;}},on:(name,fn)=>{hooks.set(name,fn);}
  };
  await apply(ctx);
  const root=await mkdtemp(join(tmpdir(),'dpm-host-'));
  try {
    const primary=join(root,'primary'),reference=join(root,'reference');
    await mkdir(primary);await mkdir(reference);
    let cwd=reference;
    const agent={session:{header:{id:'session',cwd:reference}},ctx:{get:name=>name==='workingDirectory'?{get:()=>cwd,set:async(_,value)=>{cwd=value;}}:undefined}};
    const signal=new AbortController().signal;
    const run=async args=>{
      const r=await command.handler({rawInput:JSON.stringify(args),agent,signal});
      assert.equal(r.kind,'success',r.text);return JSON.parse(r.text);
    };
    const {project}=await run({action:'save',title:'Host test',folders:[primary,reference],primary});
    assert.equal(workspaces.length,1);
    assert.equal(workspaces[0].path,primary);
    assert.equal(workspaces[0].title,'Host test');
    await run({action:'list'});
    assert.equal(workspaces.length,1,'refresh must not duplicate native workspaces');
    await run({action:'bind',id:project.id});
    assert.equal(cwd,primary);
    cwd=reference;
    await hooks.get('tools/execute')({agent,signal},async()=>{await writeFile(join(cwd,'result.txt'),'correct cwd');return 'done';});
    await access(join(primary,'result.txt'));
    await assert.rejects(access(join(reference,'result.txt')));
    assert.match(context.text({agent}),/referenceDirectories/);
    const result=await tool.execute({action:'list'},{agent,signal});
    assert.equal(JSON.parse(result.json).activeProjectId,project.id);
    // Run schema generation from the actual Harness implementation, not a stub.
    assert.equal(tool.parameters.type,'object');
    assert.equal(tool.output.schema.type,'object');
    await hooks.get('system-prompt/assemble')({}, {agent,signal}, async()=> 'assembly');
    await run({action:'save',id:project.id,revision:1,title:'Renamed',folders:[primary,reference],primary:reference});
    assert.equal(workspaces.length,1,'primary changes retain the existing native Workspace');
    assert.equal(workspaces[0].title,'Renamed');
  } finally {await rm(root,{recursive:true,force:true});for(const cleanup of cleanups)await cleanup?.();}
});
