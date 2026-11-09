import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProjectManager, canonicalDirectory } from '../core.js';

const session = (id='s1', cwd='/a') => ({ header:{id,cwd} });
function fixture() {
  let state = {projects:[],bindings:{}};
  const store = { get:()=>state, set:async value=>{state=structuredClone(value);} };
  return {manager:new ProjectManager(store,async value=>{if(!value||value==='missing')throw Error('missing');return value;}),store};
}
const save = (m, args={}) => m.execute({action:'save',title:'Demo',folders:['/a','/b'],primary:'/a',...args},session());
test('multiple directories, primary membership, duplicates and immutable snapshots', async()=>{
  const {manager:m}=fixture();
  const {project:p}=await save(m,{folders:['/a','/b','/a']});
  assert.deepEqual(p.folders,['/a','/b']);
  await assert.rejects(save(m,{primary:'/outside'}),/主要目录/);
  await assert.rejects(save(m),/另一个项目/);
  const copy=m.snapshot(); copy.projects.length=0;
  assert.equal(m.snapshot().projects.length,1);
});
test('primary changes affect existing, new and explicitly bound sessions, with restart recovery',async()=>{
  const {manager:m,store}=fixture();const {project:p}=await save(m);
  await m.execute({action:'bind',id:p.id},session('elsewhere','/elsewhere'));
  await save(m,{id:p.id,revision:p.revision,primary:'/b'});
  for(const s of [session(),session('new','/b'),session('elsewhere','/elsewhere')]) assert.equal(m.projectFor(s).primary,'/b');
  const restarted=new ProjectManager(store);
  assert.equal(restarted.projectFor(session('elsewhere','/elsewhere')).primary,'/b');
});
test('simultaneous edits reject stale revisions and storage failures do not publish changes',async()=>{
  const {manager:m,store}=fixture();const {project:p}=await save(m);
  const result=await Promise.allSettled([save(m,{id:p.id,revision:1,title:'one'}),save(m,{id:p.id,revision:1,title:'two'})]);
  assert.deepEqual(result.map(r=>r.status),['fulfilled','rejected']);
  store.set=async()=>{throw Error('disk full');};
  await assert.rejects(m.execute({action:'pin',id:p.id},session()),/disk full/);
  assert.equal(m.snapshot().projects[0].pinned,false);
});
test('remove clears bindings and configuration only',async()=>{
  const {manager:m}=fixture();const {project:p}=await save(m);
  await m.execute({action:'bind',id:p.id},session());
  await m.execute({action:'remove',id:p.id},session());
  assert.deepEqual(m.snapshot(),{projects:[],bindings:{}});
});
test('subagent inherits explicit parent binding',async()=>{
  const {manager:m}=fixture();const {project:p}=await save(m);
  await m.execute({action:'bind',id:p.id},session());
  assert.equal(m.projectFor({header:{id:'child',cwd:'/elsewhere',parentSession:'s1'}}).id,p.id);
});
test('filesystem validation rejects missing paths, files and relative directories',async()=>{
  const root=await mkdtemp(join(tmpdir(),'dpm-test-'));
  try{
    await mkdir(join(root,'main'));await writeFile(join(root,'file'),'x');
    assert.equal(await canonicalDirectory(join(root,'main')),join(root,'main'));
    await assert.rejects(canonicalDirectory('relative'),/绝对/);
    await assert.rejects(canonicalDirectory(join(root,'absent')));
    await assert.rejects(canonicalDirectory(join(root,'file')),/不是目录/);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('recent usage is persisted without changing configuration revisions',async()=>{
  const {manager:m,store}=fixture();
  const {project:p}=await save(m);
  assert.ok(p.lastUsedAt > 0);
  await store.set({...m.snapshot(),projects:[{...p,lastUsedAt:1}]});
  await m.execute({action:'touch',id:p.id},{header:{}});
  const touched=m.snapshot().projects[0];
  assert.ok(touched.lastUsedAt > 1);
  assert.equal(touched.revision,p.revision);
  assert.deepEqual(m.snapshot().bindings,{s1:p.id});
  await store.set({...m.snapshot(),projects:[{...touched,lastUsedAt:1}]});
  await m.execute({action:'bind',id:p.id},session('s2'));
  assert.ok(new ProjectManager(store).snapshot().projects[0].lastUsedAt > 1);
  assert.equal(m.snapshot().bindings.s2,p.id);
});

test('color labels persist independently, clear safely and preserve project revisions',async()=>{
  const {manager:m,store}=fixture();const {project:p}=await save(m);
  const label=(target,id,color)=>m.execute({action:'set_color',target,id,color},{header:{}});
  await Promise.all([label('project',p.id,'red'),label('session','s1','blue'),label('workspace','w1','green')]);
  const expected={[`project:${p.id}`]:'red','session:s1':'blue','workspace:w1':'green'};
  assert.deepEqual(new ProjectManager(store).snapshot().colors,expected);
  assert.equal(m.snapshot().projects[0].revision,p.revision);
  assert.deepEqual(m.snapshot().bindings,{s1:p.id});
  await save(m,{id:p.id,revision:p.revision,title:'Renamed',primary:'/b'});
  assert.deepEqual(m.snapshot().colors,expected);
  await label('session','s1',null);
  assert.equal(m.snapshot().colors['session:s1'],undefined);
  for(const [target,id,color] of [['project','missing','red'],['session','s1','#fff'],['session','','red'],['unknown','s1','red'],['session','s1',undefined]]) {
    await assert.rejects(label(target,id,color));
  }
  for(const [target,id] of [['project',p.id],['session','s2'],['workspace','w2']]) {
    await label(target,id,'#Aa12F0');
    assert.equal(new ProjectManager(store).snapshot().colors[`${target}:${id}`],'#aa12f0');
  }
  for(const color of ['#12345g','#12345678','rgb(1,2,3)','var(--color)',' #123456',123456,{},'#123456\n']) {
    const snapshot=m.snapshot();
    await assert.rejects(label('session','s2',color));
    assert.deepEqual(m.snapshot(),snapshot);
  }
  await label('session','s2',null);
  assert.equal(new ProjectManager(store).snapshot().colors['session:s2'],undefined);
  const before=m.snapshot();store.set=async()=>{throw Error('disk full');};
  await assert.rejects(label('project',p.id,'purple'),/disk full/);
  assert.deepEqual(m.snapshot(),before);
});

test('removing a project cleans its color but keeps independent session labels',async()=>{
  const {manager:m}=fixture();const {project:p}=await save(m);
  for(const [target,id] of [['project',p.id],['session','s1']])await m.execute({action:'set_color',target,id,color:'yellow'},{header:{}});
  await m.execute({action:'remove',id:p.id},{header:{}});
  assert.deepEqual(m.snapshot().colors,{'session:s1':'yellow'});
});
