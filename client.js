window.__ModuleLoader__.load({
  id: 'dsh-project-manager',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useSyncExternalStore } = React;
    const css = `
.dpm button,.dpm input{font:inherit;color:inherit}.dpm button{cursor:pointer;border:1px solid var(--dsw-alias-border-l3,#555);background:transparent;border-radius:9px;padding:7px 11px}.dpm button:hover{background:var(--dsw-alias-bg-hover,#ffffff15)}.dpm button:disabled{opacity:.45;cursor:default}.dpm input{box-sizing:border-box;background:transparent;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:9px;padding:10px;width:100%}.dpm-backdrop{position:fixed;inset:0;background:#0008;display:grid;place-items:center;z-index:1000;padding:20px}.dpm-dialog{box-sizing:border-box;width:min(660px,100%);max-height:85vh;overflow:auto;padding:24px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:20px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-text-primary,#eee);box-shadow:0 24px 90px #0006}.dpm-head,.dpm-row,.dpm-foot{display:flex;align-items:center;gap:10px}.dpm-head{justify-content:space-between;margin-bottom:18px}.dpm h2{font-size:20px;margin:0}.dpm p{opacity:.7;font-size:13px;line-height:1.6}.dpm-list{display:grid;gap:10px;margin:16px 0}.dpm-card{padding:13px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px}.dpm-path{font-size:12px;opacity:.65;word-break:break-all;margin:6px 0 10px}.dpm-row{flex-wrap:wrap}.dpm-row .dpm-grow{flex:1;min-width:100px}.dpm-source{padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l3,#555)}.dpm-source input[type=radio]{width:auto}.dpm-source label{display:flex;gap:9px;align-items:center;word-break:break-all;font-size:13px}.dpm-source button{font-size:12px}.dpm-foot{justify-content:flex-end;margin-top:22px}.dpm .dpm-save{background:var(--dsw-alias-text-primary,#eee);color:var(--dsw-alias-bg-base,#292929)}.dpm .dpm-danger{color:#ef8880}.dpm-error{color:#ef8880;font-size:13px;margin-top:12px;white-space:pre-wrap}.dpm-badge{font-size:11px;color:#8bb6ed;margin-left:8px}.dpm-launch{width:100%;text-align:left}.dpm label.dpm-label{display:block;margin:16px 0 8px;font-size:13px}.dpm-dock{font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dpm-mini{font-size:12px!important;padding:5px 8px!important}
.dpm-menu{position:fixed;z-index:1100;width:228px;box-sizing:border-box;max-height:calc(100vh - 16px);overflow:auto;padding:6px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-label-primary,#eee);border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px;box-shadow:0 12px 42px #0005}.dpm-menu button{display:block;text-align:left;width:100%;border:0;border-radius:7px;padding:9px 12px}.dpm-menu button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:-2px}.dpm-menu-title{padding:7px 12px;font-size:12px;opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dpm-menu-separator{height:1px;margin:5px 8px;background:var(--dsw-alias-border-l3,#555)}
`;
    const zh = { title:'项目管理', edit:'编辑项目', add:'添加项目', name:'项目名称', folders:'源文件夹', primary:'主要目录', addFolder:'添加文件夹', path:'输入绝对目录路径', save:'保存', cancel:'取消', close:'关闭', remove:'移除本地项目', removeFolder:'移除', bind:'用于当前聊天', active:'当前项目', pin:'置顶', unpin:'取消置顶', group:'分区', newChat:'新建聊天', empty:'暂无项目，添加项目后可设置多个源目录。', needSession:'请先打开或创建一个聊天，再管理项目。', note:'保存后立即用于当前聊天。后续修改与新命令默认使用主要目录；其他源目录作为只读参考。已运行的终端进程保留原目录。', removeConfirm:'仅移除项目配置，不删除磁盘文件。确认移除？', reload:'刷新', conflict:'操作失败', browse:'选择目录', section:'分区名称（留空为默认）' };
    const en = { title:'Projects', edit:'Edit project', add:'Add project', name:'Project name', folders:'Source folders', primary:'Primary', addFolder:'Add folder', path:'Absolute directory path', save:'Save', cancel:'Cancel', close:'Close', remove:'Remove project', removeFolder:'Remove', bind:'Use in this chat', active:'Current project', pin:'Pin', unpin:'Unpin', group:'Section', newChat:'New chat', empty:'No projects. Add one to configure its source folders.', needSession:'Open or create a chat before managing projects.', note:'Subsequent edits and new commands use the primary directory. Other folders are read-only references. Existing terminal processes keep their cwd.', removeConfirm:'Remove project settings? Files on disk will be kept.', reload:'Refresh', conflict:'Operation failed', browse:'Choose directory', section:'Section name (empty for default)' };
    Object.assign(zh,{setPrimary:'设置主要目录',more:'置顶 / 分区 / 更多…',nativeUnavailable:'宿主项目菜单不可用，请使用项目行上的更多按钮。',removeTreeConfirm:'从左侧项目树移除此项目及目录配置？磁盘文件和聊天记录会保留。'});
    Object.assign(en,{setPrimary:'Set primary directory',more:'Pin / section / more…',nativeUnavailable:'The host project menu is unavailable. Use the project row menu button.',removeTreeConfirm:'Remove this project and its directory settings from the sidebar? Files and chat history will be kept.'});
    return {
      inject: ['slots', 'remote', 'remote.commands', 'remote.directoryPicker', 'sessions', 'workspaces', 'uiWorkspace', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('dsh-project-manager', { zh, en }));
        const t = ctx.locale.bind('dsh-project-manager');
        let treeRequest = null;
        let requestSequence = 0;
        const treeListeners = new Set();
        const treeSource = {
          subscribe(listener) { treeListeners.add(listener); return () => treeListeners.delete(listener); },
          getSnapshot: () => treeRequest,
        };
        function publishTree(value) { treeRequest = value; for (const listener of treeListeners) listener(); }
        ctx.effect(() => {
          function onContextMenu(event) {
            if (!(event.target instanceof Element)) return;
            if (event.target.closest('[data-row-key^="session:"]')) return;
            const row = event.target.closest('[data-row-key^="workspace:"]');
            if (!row) return;
            const id = row.getAttribute('data-row-key').slice('workspace:'.length);
            const workspace = ctx.workspaces.list.getSnapshot().items.find(item => item.workspaceId === id);
            if (!workspace) return;
            event.preventDefault(); event.stopPropagation();
            const rect = row.getBoundingClientRect();
            publishTree({ workspace, sequence: ++requestSequence, trigger: row,
              nativeMenu: row.querySelector('button'),
              x: event.clientX || rect.left + 20, y: event.clientY || rect.bottom });
          }
          function onKeyboard(event) {
            if (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey)) return;
            onContextMenu(event);
          }
          document.addEventListener('contextmenu', onContextMenu, true);
          document.addEventListener('keydown', onKeyboard, true);
          return () => {
            document.removeEventListener('contextmenu', onContextMenu, true);
            document.removeEventListener('keydown', onKeyboard, true);
            publishTree(null);
          };
        });
        async function call(sessionId, args) {
          const response = await ctx.remote.commands.execute(sessionId, '/projects ' + JSON.stringify(args), []);
          if (!response.ok) throw new Error(response.error.message);
          const result = response.value?.result;
          if (!result || result.kind !== 'success') throw new Error(result?.text ?? t('conflict'));
          return JSON.parse(result.text);
        }
        function Manager({ sessionId: providedId, dock = false, initialProject = null, initialOpen = false, hiddenLauncher = false, workspaceId, onClose }) {
          const sessions = useSyncExternalStore(ctx.sessions.list.subscribe, ctx.sessions.list.getSnapshot);
          const sessionId = providedId ?? Object.values(sessions.byId).find(s => (s.retainedBy.mainView ?? 0) > 0)?.id;
          const [open, setOpen] = useState(initialOpen), [state, setState] = useState({ projects: [], activeProjectId: null });
          const [draft, setDraft] = useState(initialProject), [path, setPath] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
          const [sectionProject, setSectionProject] = useState(null), [section, setSection] = useState('');
          const dialog = useRef(null), launcher = useRef(null), generation = useRef(0);
          const currentId = useRef(sessionId); currentId.current = sessionId;
          async function refresh(id = sessionId) {
            if (!id) return;
            const token = ++generation.current;
            const value = await call(id, { action:'list' });
            if (token === generation.current && id === currentId.current) {
              setState(value);
              if(value.syncWarnings?.length)setError(value.syncWarnings.join('\n'));
            }
          }
          const previousSession = useRef(sessionId);
          useEffect(() => {
            if (previousSession.current !== sessionId) { setDraft(null); previousSession.current = sessionId; }
            setError(''); refresh().catch(e => setError(e.message));
            return () => { generation.current++; };
          }, [sessionId, open]);
          function close() { setOpen(false); onClose?.(); }
          useEffect(() => {
            if (!open) return;
            const before = document.activeElement;
            dialog.current?.focus();
            return () => { if (before?.isConnected) before.focus(); };
          }, [open]);
          async function action(args) {
            if (!sessionId) return;
            setBusy(true); setError('');
            try {
              const result = await call(sessionId, args);
              if (workspaceId && args.action === 'save') await ctx.workspaces.rename(workspaceId, args.title.trim());
              if (workspaceId && args.action === 'remove') {await ctx.workspaces.delete(workspaceId);close();}
              await refresh(); return result;
            }
            catch (e) { setError(e.message); return null; }
            finally { setBusy(false); }
          }
          function edit(p) { setDraft(p ? structuredClone(p) : { title:'', folders:[], primary:'' }); setPath(''); setError(''); }
          function addPath(value) {
            if (!value?.trim()) return;
            setDraft(d => ({...d, folders:[...new Set([...d.folders, value.trim()])], primary:d.primary || value.trim()})); setPath('');
          }
          async function pick() {
            setBusy(true); setError('');
            try {
              const response = await ctx.remote.directoryPicker.pick();
              if (!response.ok) throw new Error(response.error.message);
              if (response.value) addPath(response.value);
            } catch (e) { setError(e.message); } finally { setBusy(false); }
          }
          async function newChat(p) {
            setBusy(true); setError('');
            try {
              const workspace = await ctx.workspaces.create({path:p.primary});
              ctx.uiWorkspace.startSession(workspace.workspaceId);
              setOpen(false);
            } catch(e) {setError(e.message);} finally {setBusy(false);}
          }
          function keyboard(e) {
            if (e.key === 'Escape' && !busy) { e.stopPropagation(); draft ? setDraft(null) : close(); }
            if (e.key === 'Tab') {
              const nodes = [...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')];
              if (!nodes.length) {e.preventDefault();return;}
              const first=nodes[0],last=nodes[nodes.length-1];
              if (e.shiftKey && (document.activeElement===first || document.activeElement===dialog.current)) {e.preventDefault();last.focus();}
              else if (!e.shiftKey && document.activeElement===last) {e.preventDefault();first.focus();}
            }
          }
          const button = (text, onClick, props={}) => h('button', {type:'button', disabled:busy, onClick,...props}, text);
          const active = state.projects.find(p => p.id === state.activeProjectId);
          const ordered = [...state.projects].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||a.section.localeCompare(b.section));
          return h('div', {className:'dpm'}, h('style',null,css),
            !hiddenLauncher && h('button',{ref:launcher,type:'button',className:dock?'dpm-dock dpm-mini':'dpm-launch',onClick:()=>setOpen(true),title:active?.primary}, '▱ '+(dock&&active?active.title:t('title'))),
            open && h('div',{className:'dpm-backdrop',onClick:e=>{if(e.target===e.currentTarget&&!busy)close();}},
              h('section',{className:'dpm-dialog',ref:dialog,tabIndex:-1,role:'dialog','aria-modal':true,'aria-label':t(draft?'edit':'title'),onKeyDown:keyboard},
                h('div',{className:'dpm-head'},h('h2',null,t(draft?'edit':'title')),button('×',close,{'aria-label':t('close')})),
                !sessionId ? h('p',null,t('needSession')) : draft ? h(React.Fragment,null,
                  h('label',{className:'dpm-label',htmlFor:'dpm-name'},t('name')),h('input',{id:'dpm-name',value:draft.title,disabled:busy,onChange:e=>setDraft({...draft,title:e.target.value})}),
                  h('label',{className:'dpm-label'},t('folders')),
                  h('div',{className:'dpm-list'},draft.folders.map(folder=>h('div',{key:folder,className:'dpm-source'},
                    h('label',null,h('input',{type:'radio',name:'dpm-primary',checked:draft.primary===folder,disabled:busy,onChange:()=>setDraft({...draft,primary:folder})}),h('span',{className:'dpm-grow'},folder),draft.primary===folder&&h('span',{className:'dpm-badge'},t('primary'))),
                    button(t('removeFolder'),()=>setDraft({...draft,folders:draft.folders.filter(f=>f!==folder),primary:draft.primary===folder?'':draft.primary}),{className:'dpm-mini'})))),
                  h('div',{className:'dpm-row'},h('input',{className:'dpm-grow',value:path,placeholder:t('path'),'aria-label':t('path'),disabled:busy,onChange:e=>setPath(e.target.value),onKeyDown:e=>{if(e.key==='Enter'){e.preventDefault();addPath(path);}}}),button(t('addFolder'),()=>addPath(path)),button(t('browse'),pick)),
                  h('p',null,t('note')),
                  h('div',{className:'dpm-foot'},draft.id&&button(t('remove'),async()=>{if(window.confirm(t('removeConfirm'))&&await action({action:'remove',id:draft.id}))setDraft(null);},{className:'dpm-danger'}),button(t('cancel'),()=>setDraft(null)),button(t('save'),async()=>{if(await action({action:'save',...draft}))setDraft(null);},{className:'dpm-save',disabled:busy||!draft.title.trim()||!draft.primary||!draft.folders.length}))) : h(React.Fragment,null,
                  h('div',{className:'dpm-row'},button('+ '+t('add'),()=>edit(null)),button(t('reload'),()=>action({action:'list'}))),
                  !ordered.length&&h('p',null,t('empty')),
                  h('div',{className:'dpm-list'},ordered.map(p=>h('article',{className:'dpm-card',key:p.id},
                    h('strong',null,(p.pinned?'⌖ ':'')+p.title),p.id===state.activeProjectId&&h('span',{className:'dpm-badge'},t('active')),
                    p.section&&h('span',{className:'dpm-badge'},p.section),h('div',{className:'dpm-path'},p.primary+' · '+p.folders.length+' '+t('folders')),
                    h('div',{className:'dpm-row'},button(t('bind'),()=>action({action:'bind',id:p.id})),button(t('edit'),()=>edit(p)),button(t(p.pinned?'unpin':'pin'),()=>action({action:'pin',id:p.id})),button(t('group'),()=>{setSectionProject(p);setSection(p.section);}),button(t('newChat'),()=>newChat(p)))))),
                  sectionProject&&h('div',{className:'dpm-row'},h('input',{value:section,placeholder:t('section'),'aria-label':t('section'),onChange:e=>setSection(e.target.value)}),button(t('save'),async()=>{if(await action({action:'section',id:sectionProject.id,section}))setSectionProject(null);}),button(t('cancel'),()=>setSectionProject(null)))) ,
                error&&h('div',{className:'dpm-error',role:'alert'},error)
              )));
        }
        function TreeOverlay() {
          const request = useSyncExternalStore(treeSource.subscribe, treeSource.getSnapshot);
          const [editor, setEditor] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
          const [position, setPosition] = useState({left:8,top:8});
          const menu = useRef(null);
          const editorRef = useRef(editor); editorRef.current = editor;
          const activeRequest = useRef(request); activeRequest.current = request;
          const closeMenu = () => publishTree(null);
          useEffect(() => {
            setEditor(null); setError(''); setBusy(false);
            if (!request) return;
            const node = menu.current;
            const rect = node?.getBoundingClientRect();
            setPosition({left:Math.max(8,Math.min(request.x,window.innerWidth-(rect?.width ?? 228)-8)),top:Math.max(8,Math.min(request.y,window.innerHeight-(rect?.height ?? 300)-8))});
            node?.querySelector('button')?.focus();
            const outside = event => { if (!editorRef.current && !menu.current?.contains(event.target)) closeMenu(); };
            const escape = event => { if(!editorRef.current && event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu();request.trigger?.focus();} };
            document.addEventListener('pointerdown',outside,true);
            document.addEventListener('keydown',escape,true);
            window.addEventListener('resize',closeMenu);
            return () => {document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);window.removeEventListener('resize',closeMenu);};
          }, [request]);
          async function sessionFor(workspace, useCurrent = false) {
            const state = ctx.sessions.list.getSnapshot();
            const current = Object.values(state.byId).find(s => (s.retainedBy.mainView ?? 0) > 0)?.id;
            if (current && (useCurrent || workspace.sessionIds.includes(current))) return current;
            return ctx.sessions.create({workspaceId:workspace.workspaceId});
          }
          async function run(kind) {
            if (!request || busy) return;
            const target = request; setBusy(true); setError('');
            try {
              const workspace = target.workspace;
              if (kind === 'more') {
                if (!target.nativeMenu?.isConnected) throw new Error(t('nativeUnavailable'));
                closeMenu(); target.nativeMenu.click(); return;
              }
              if (kind === 'newChat') { ctx.uiWorkspace.startSession(workspace.workspaceId); closeMenu(); return; }
              if (kind === 'remove' && !window.confirm(t('removeTreeConfirm'))) return;
              const sessionId = await sessionFor(workspace,kind==='bind');
              const state = await call(sessionId,{action:'list'});
              if (activeRequest.current !== target) return;
              const project = state.projects.find(p=>p.primary===workspace.path || p.sessionRoots.includes(workspace.path));
              if (kind === 'remove') {
                if (project) await call(sessionId,{action:'remove',id:project.id});
                await ctx.workspaces.delete(workspace.workspaceId);
                closeMenu(); return;
              }
              if (kind === 'bind') {
                if (project) await call(sessionId,{action:'bind',id:project.id});
                else await call(sessionId,{action:'save',title:workspace.title,folders:[workspace.path],primary:workspace.path});
                ctx.uiWorkspace.openSession(sessionId); closeMenu(); return;
              }
              ctx.uiWorkspace.openSession(sessionId);
              setEditor({sessionId,workspaceId:workspace.workspaceId,project:project ?? {title:workspace.title,folders:[workspace.path],primary:workspace.path}});
            } catch(e) { if(activeRequest.current===target)setError(e.message); }
            finally {if(activeRequest.current===target)setBusy(false);}
          }
          function keyboard(event) {
            const keys=['ArrowDown','ArrowUp','Home','End','Tab'];
            if(!keys.includes(event.key))return;
            const items=[...menu.current.querySelectorAll('[role=menuitem]:not(:disabled)')];
            if(!items.length)return;
            event.preventDefault();
            const current=items.indexOf(document.activeElement);
            const next=event.key==='Home'?0:event.key==='End'?items.length-1:(current+(event.key==='ArrowUp'||(event.key==='Tab'&&event.shiftKey)?-1:1)+items.length)%items.length;
            items[next].focus();
          }
          if (!request) return null;
          if (editor) return h(Manager,{key:request.sequence,...editor,initialProject:editor.project,initialOpen:true,hiddenLauncher:true,onClose:closeMenu});
          const item = (key,label=key) => h('button',{key,type:'button',role:'menuitem',disabled:busy,onClick:()=>run(key),className:key==='remove'?'dpm-danger':undefined},t(label));
          return h('div',{className:'dpm'},h('style',null,css),h('div',{ref:menu,className:'dpm-menu',role:'menu','aria-label':t('title'),style:position,onKeyDown:keyboard},
            h('div',{className:'dpm-menu-title'},request.workspace.title),item('edit'),item('primary','setPrimary'),item('bind'),item('newChat'),
            h('div',{className:'dpm-menu-separator',role:'separator'}),item('more'),item('remove'),error&&h('div',{className:'dpm-error',role:'alert'},error)));
        }
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({name:'sidebar.footer.action',id:'dsh-project-manager',order:10}, Manager));
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({name:'conversation.composer.dock',id:'dsh-project-manager-dock',order:10,inject:sessionId=>({sessionId,dock:true})}, Manager));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-project-manager-tree-menu',order:20}, TreeOverlay));
      }
    };
  }
});
