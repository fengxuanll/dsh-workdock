window.__ModuleLoader__.load({
  id: 'dsh-workdock',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useSyncExternalStore } = React;
    const css = `
.dpm button,.dpm input{font:inherit;color:inherit}.dpm button{cursor:pointer;border:1px solid var(--dsw-alias-border-l3,#555);background:transparent;border-radius:9px;padding:7px 11px}.dpm button:hover{background:var(--dsw-alias-bg-hover,#ffffff15)}.dpm button:disabled{opacity:.45;cursor:default}.dpm input{box-sizing:border-box;background:transparent;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:9px;padding:10px;width:100%}.dpm-backdrop{position:fixed;inset:0;background:#0008;display:grid;place-items:center;z-index:1000;padding:20px}.dpm-dialog{box-sizing:border-box;width:min(660px,100%);max-height:85vh;overflow:auto;padding:24px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:20px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-text-primary,#eee);box-shadow:0 24px 90px #0006}.dpm-head,.dpm-row,.dpm-foot{display:flex;align-items:center;gap:10px}.dpm-head{justify-content:space-between;margin-bottom:18px}.dpm h2{font-size:20px;margin:0}.dpm p{opacity:.7;font-size:13px;line-height:1.6}.dpm-list{display:grid;gap:10px;margin:16px 0}.dpm-card{padding:13px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px}.dpm-path{font-size:12px;opacity:.65;word-break:break-all;margin:6px 0 10px}.dpm-row{flex-wrap:wrap}.dpm-row .dpm-grow{flex:1;min-width:100px}.dpm-source{padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l3,#555)}.dpm-source input[type=radio]{width:auto}.dpm-source label{display:flex;gap:9px;align-items:center;word-break:break-all;font-size:13px}.dpm-source button{font-size:12px}.dpm-foot{justify-content:flex-end;margin-top:22px}.dpm .dpm-save{background:var(--dsw-alias-text-primary,#eee);color:var(--dsw-alias-bg-base,#292929)}.dpm .dpm-danger{color:#ef8880}.dpm-error{color:#ef8880;font-size:13px;margin-top:12px;white-space:pre-wrap}.dpm-badge{font-size:11px;color:#8bb6ed;margin-left:8px}.dpm-launch{width:100%;text-align:left}.dpm label.dpm-label{display:block;margin:16px 0 8px;font-size:13px}.dpm-dock{font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dpm-mini{font-size:12px!important;padding:5px 8px!important}
.dpm-menu{position:fixed;z-index:1100;width:228px;box-sizing:border-box;max-height:calc(100vh - 16px);overflow:auto;padding:6px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-label-primary,#eee);border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px;box-shadow:0 12px 42px #0005}.dpm-menu button{display:block;text-align:left;width:100%;border:0;border-radius:7px;padding:9px 12px}.dpm-menu button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:-2px}.dpm-menu-title{padding:7px 12px;font-size:12px;opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dpm-menu-separator{height:1px;margin:5px 8px;background:var(--dsw-alias-border-l3,#555)}
.dpm-edit{width:min(520px,100%);padding:22px;border-radius:18px}.dpm-edit .dpm-head{margin-bottom:14px}.dpm-edit h2{font-size:20px}.dpm-edit .dpm-head button{border:0;padding:2px 6px;opacity:.65;font-size:19px}.dpm-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.dpm-name-field{display:flex;align-items:center;gap:12px;border:1px solid var(--dsw-alias-border-l3,#4c4c4c);border-radius:12px;padding-left:14px}.dpm-name-field:focus-within{border-color:var(--dsw-alias-state-business-primary,#81abc7);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary,#81abc7)}.dpm .dpm-name-field input{border:0;padding:12px 10px 12px 0;outline:0;min-width:0;font-size:13px}.dpm-folder-icon{width:18px;height:18px;flex:none;opacity:.55}.dpm-folder-box{border:1px solid var(--dsw-alias-border-l3,#424242);border-radius:12px;overflow:hidden}.dpm .dpm-source{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l3,#424242)}.dpm-source label{flex:1;min-width:0;cursor:pointer;gap:12px}.dpm-source input[type=radio]{position:absolute;opacity:0;width:1px;height:1px}.dpm-source label:focus-within{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:4px;border-radius:4px}.dpm-folder-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:13px}.dpm-source[data-primary=true] .dpm-folder-icon{color:var(--dsw-alias-state-business-primary,#8bb6ed);opacity:1}.dpm-source .dpm-badge{margin:0;white-space:nowrap;font-size:11px}.dpm .dpm-source .dpm-folder-remove{border:0;padding:4px 6px;opacity:.55;font-size:16px}.dpm .dpm-folder-add{display:flex;align-items:center;gap:12px;border:0;border-radius:0;text-align:left;width:100%;min-height:48px;padding:0 14px;opacity:.7;font-size:13px}.dpm-edit .dpm-foot{margin-top:20px;gap:12px}.dpm-edit .dpm-foot .dpm-danger{margin-right:auto;background:#b04c3a20;border:0;font-size:13px}.dpm-edit .dpm-foot .dpm-cancel{border:0;opacity:.6}.dpm-edit .dpm-foot .dpm-save{padding:7px 15px;border:0;font-size:13px}.dpm-edit .dpm-edit-note{font-size:11px;opacity:.5;margin:6px 0 0}.dpm-primary-tooltip{position:fixed;z-index:900;box-sizing:border-box;width:300px;max-width:calc(100vw - 16px);padding:12px 15px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-label-primary,#eee);box-shadow:0 8px 32px #0004;pointer-events:none}.dpm-primary-tooltip strong{font-size:13px}.dpm-primary-tooltip .dpm-path{margin:7px 0 0;opacity:.8}.dpm-primary-tooltip small{display:block;margin-top:7px;opacity:.5;font-size:11px}
`;
    const folderCss = `
.dpm-menu{width:214px;padding:5px;border-radius:10px}.dpm-menu button{padding:6px 10px;font-size:13px;line-height:20px;border-radius:6px}.dpm-menu-title{padding:5px 10px;font-size:11px}.dpm-menu-separator{margin:4px 7px}
.dpm-folder-main{display:flex;align-items:center;gap:12px;flex:1;min-width:0}.dpm .dpm-source{cursor:default}.dpm-source:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:-3px}.dpm .dpm-set-primary{flex:none;visibility:hidden;opacity:0;pointer-events:none;border:0;padding:5px 8px;font-size:11px;color:var(--dsw-alias-state-business-primary,#8bb6ed);white-space:nowrap;transition:opacity .12s}.dpm-source:hover .dpm-set-primary,.dpm-source:focus-within .dpm-set-primary{visibility:visible;opacity:1;pointer-events:auto}@media(hover:none){.dpm .dpm-set-primary{visibility:visible;opacity:1;pointer-events:auto}}
`;
    const zh = { title:'项目管理', edit:'编辑项目', add:'添加项目', name:'项目名称', folders:'源文件夹', primary:'主要目录', addFolder:'添加文件夹', path:'输入绝对目录路径', save:'保存', cancel:'取消', close:'关闭', remove:'移除本地项目', removeFolder:'移除', bind:'用于当前聊天', active:'当前项目', pin:'置顶', unpin:'取消置顶', group:'分区', newChat:'新建聊天', empty:'暂无项目，添加项目后可设置多个源目录。', needSession:'请先打开或创建一个聊天，再管理项目。', note:'保存后立即用于当前聊天。后续修改与新命令默认使用主要目录；其他源目录作为只读参考。已运行的终端进程保留原目录。', removeConfirm:'仅移除项目配置，不删除磁盘文件。确认移除？', reload:'刷新', conflict:'操作失败', browse:'选择目录', section:'分区名称（留空为默认）' };
    const en = { title:'Projects', edit:'Edit project', add:'Add project', name:'Project name', folders:'Source folders', primary:'Primary', addFolder:'Add folder', path:'Absolute directory path', save:'Save', cancel:'Cancel', close:'Close', remove:'Remove project', removeFolder:'Remove', bind:'Use in this chat', active:'Current project', pin:'Pin', unpin:'Unpin', group:'Section', newChat:'New chat', empty:'No projects. Add one to configure its source folders.', needSession:'Open or create a chat before managing projects.', note:'Subsequent edits and new commands use the primary directory. Other folders are read-only references. Existing terminal processes keep their cwd.', removeConfirm:'Remove project settings? Files on disk will be kept.', reload:'Refresh', conflict:'Operation failed', browse:'Choose directory', section:'Section name (empty for default)' };
    Object.assign(zh,{setPrimary:'设置主要目录',more:'置顶 / 分区 / 更多…',nativeUnavailable:'宿主项目菜单不可用，请使用项目行上的更多按钮。',removeTreeConfirm:'从左侧项目树移除此项目及目录配置？磁盘文件和聊天记录会保留。'});
    Object.assign(en,{setPrimary:'Set primary directory',more:'Pin / section / more…',nativeUnavailable:'The host project menu is unavailable. Use the project row menu button.',removeTreeConfirm:'Remove this project and its directory settings from the sidebar? Files and chat history will be kept.'});
    Object.assign(zh,{manage:'项目管理',openFolder:'在资源管理器中打开',rename:'重命名',deleteWorkspace:'删除工作区'});
    Object.assign(en,{manage:'Project management',openFolder:'Open folder in file manager',rename:'Rename',deleteWorkspace:'Delete workspace'});
    Object.assign(zh,{setPrimaryButton:'设为主要目录',saveNote:'保存后，当前聊天及后续操作将使用主要目录。'});
    Object.assign(en,{setPrimaryButton:'Set as primary',saveNote:'Saving applies the primary directory to this chat and subsequent work.'});
    const folderName = path => path.replace(/[\\/]+$/,'').split(/[\\/]/).pop() || path;
    function FolderIcon({add=false}) {
      return h('svg',{className:'dpm-folder-icon',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,'aria-hidden':true},
        h('path',{d:add?'M14 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v4':'M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2'}),
        add&&h('path',{d:'M18 15v7m-3.5-3.5h7'}));
    }
    return {
      inject: ['slots', 'remote', 'remote.directoryPicker', 'sessions', 'workspaces', 'uiWorkspace', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('dsh-workdock', { zh, en }));
        const t = ctx.locale.bind('dsh-workdock');
        let projectCache = [];
        let projectVersion = 0;
        const projectListeners = new Set();
        const projectSource = {subscribe(fn){projectListeners.add(fn);return()=>projectListeners.delete(fn);},getSnapshot:()=>projectVersion};
        let refreshNativeCards = () => {};
        let hover = null;
        const hoverListeners = new Set();
        const hoverSource = {subscribe(listener){hoverListeners.add(listener);return()=>hoverListeners.delete(listener);},getSnapshot:()=>hover};
        const matchingProject = workspace => projectCache.find(p=>p.primary===workspace.path) ?? projectCache.find(p=>p.sessionRoots.includes(workspace.path));
        function publishHover(value){hover=value;for(const listener of hoverListeners)listener();}
        let treeRequest = null;
        let requestSequence = 0;
        const treeListeners = new Set();
        const treeSource = {
          subscribe(listener) { treeListeners.add(listener); return () => treeListeners.delete(listener); },
          getSnapshot: () => treeRequest,
        };
        function publishTree(value) { publishHover(null);treeRequest = value; for (const listener of treeListeners) listener(); }
        let allowNativeMenu = false;
        ctx.effect(() => {
          // Native HoverCard owns an outer span and renders its card in a portal.
          // Capture both the span and the row; a delayed card that was already
          // armed is hidden only when its copy-path and project title match.
          function projectRow(target) {
            if(!(target instanceof Element)||target.closest('[data-row-key^="session:"]'))return null;
            return target.closest('[data-row-key^="workspace:"]')
              ?? target.querySelector(':scope > [data-row-key^="workspace:"]');
          }
          const hiddenNativeCards=new Map();
          const nativeSelector='[style*="--dsh-hover-preview-fade"][aria-label]';
          function suppressNativeCards() {
            const workspaces=ctx.workspaces.list.getSnapshot().items;
            for(const node of document.querySelectorAll(nativeSelector)) {
              const label=node.getAttribute('aria-label')||'';
              const workspace=workspaces.find(item=>matchingProject(item)&&label.endsWith(': '+item.path)&&node.textContent.startsWith(item.title));
              if(workspace) {
                if(!hiddenNativeCards.has(node))hiddenNativeCards.set(node,{display:node.style.getPropertyValue('display'),priority:node.style.getPropertyPriority('display')});
                node.style.setProperty('display','none','important');
              } else if(hiddenNativeCards.has(node)) {
                const previous=hiddenNativeCards.get(node);node.style.setProperty('display',previous.display,previous.priority);hiddenNativeCards.delete(node);
              }
            }
            for(const node of hiddenNativeCards.keys())if(!node.isConnected)hiddenNativeCards.delete(node);
          }
          refreshNativeCards=suppressNativeCards;
          const observer=new MutationObserver(records=>{
            if(records.some(record=>[...record.addedNodes].some(node=>node instanceof Element && (node.matches(nativeSelector)||node.querySelector(nativeSelector)))))suppressNativeCards();
          });
          observer.observe(document.body,{childList:true,subtree:true});
          function onProjectOver(event) {
            if (!(event.target instanceof Element) || treeRequest) return;
            const row=projectRow(event.target);
            if(!row || event.target.closest('[data-row-key^="session:"]')) {publishHover(null);return;}
            const workspace=ctx.workspaces.list.getSnapshot().items.find(item=>item.workspaceId===row.getAttribute('data-row-key').slice(10));
            const project=workspace&&matchingProject(workspace);
            if(!project)return;
            // The native HoverCard uses immutable Workspace.path; suppress its
            // enter event only for managed projects and render the effective cwd.
            event.stopPropagation();
            suppressNativeCards();
            if(event.target.closest('button')){publishHover(null);return;}
            if(hover?.row!==row)publishHover({row,workspace,project});
          }
          function onProjectOut(event) {
            if(hover && !hover.row.contains(event.relatedTarget)) {event.stopPropagation();publishHover(null);}
          }
          const clearHover=()=>publishHover(null);
          document.addEventListener('pointerover',onProjectOver,true);
          document.addEventListener('pointerenter',onProjectOver,true);
          document.addEventListener('mouseenter',onProjectOver,true);
          document.addEventListener('mouseover',onProjectOver,true);
          document.addEventListener('pointerout',onProjectOut,true);
          document.addEventListener('mouseout',onProjectOut,true);
          document.addEventListener('focusin',onProjectOver,true);
          document.addEventListener('focusout',onProjectOut,true);
          document.addEventListener('scroll',clearHover,true);
          window.addEventListener('resize',clearHover);
          function menuButtonRow(target) {
            if (!(target instanceof Element) || target.closest('[data-row-key^="session:"]')) return null;
            const button = target.closest('button');
            const row = button?.closest('[data-row-key^="workspace:"]');
            return row && row.querySelector('button') === button ? row : null;
          }
          function onMenuPointer(event) {
            if (!allowNativeMenu && event.button === 0 && menuButtonRow(event.target)) event.stopPropagation();
          }
          function onMenuClick(event) {
            if (allowNativeMenu) return;
            const row = menuButtonRow(event.target);
            if (!row) return;
            showTreeMenu(event, row, true);
          }
          function showTreeMenu(event, row, ellipsis = false) {
            const id = row.getAttribute('data-row-key').slice('workspace:'.length);
            const workspace = ctx.workspaces.list.getSnapshot().items.find(item => item.workspaceId === id);
            if (!workspace) return;
            event.preventDefault(); event.stopPropagation();
            const rect = (ellipsis ? row.querySelector('button') : row).getBoundingClientRect();
            publishTree({ workspace, sequence: ++requestSequence, trigger: row, ellipsis,
              nativeMenu: row.querySelector('button'),
              x: ellipsis ? rect.left : event.clientX || rect.left + 20,
              y: ellipsis ? rect.bottom : event.clientY || rect.bottom });
          }
          function onContextMenu(event) {
            if (!(event.target instanceof Element)) return;
            if (event.target.closest('[data-row-key^="session:"]')) return;
            const row = event.target.closest('[data-row-key^="workspace:"]');
            if (!row) return;
            showTreeMenu(event, row);
          }
          function onKeyboard(event) {
            if (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey)) return;
            onContextMenu(event);
          }
          document.addEventListener('contextmenu', onContextMenu, true);
          document.addEventListener('keydown', onKeyboard, true);
          document.addEventListener('pointerdown', onMenuPointer, true);
          document.addEventListener('click', onMenuClick, true);
          return () => {
            observer.disconnect();refreshNativeCards=()=>{};
            for(const [node,previous]of hiddenNativeCards)node.style.setProperty('display',previous.display,previous.priority);
            hiddenNativeCards.clear();
            document.removeEventListener('pointerover',onProjectOver,true);
            document.removeEventListener('pointerenter',onProjectOver,true);
            document.removeEventListener('mouseenter',onProjectOver,true);
            document.removeEventListener('mouseover',onProjectOver,true);
            document.removeEventListener('pointerout',onProjectOut,true);
            document.removeEventListener('mouseout',onProjectOut,true);
            document.removeEventListener('focusin',onProjectOver,true);
            document.removeEventListener('focusout',onProjectOut,true);
            document.removeEventListener('scroll',clearHover,true);
            window.removeEventListener('resize',clearHover);
            document.removeEventListener('contextmenu', onContextMenu, true);
            document.removeEventListener('keydown', onKeyboard, true);
            document.removeEventListener('pointerdown', onMenuPointer, true);
            document.removeEventListener('click', onMenuClick, true);
            publishTree(null);
          };
        });
        async function call(sessionId, args) {
          // Resolve relative to the page so Desktop's dsh-app protocol forwarding
          // and web deployments under a reverse-proxy directory both work.
          const base=new URL(document.baseURI);base.search='';base.hash='';
          if(!base.pathname.endsWith('/'))base.pathname+='/';
          const response=await fetch(new URL('api/dsh-workdock',base),{
            method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},
            body:JSON.stringify({sessionId,args}),
          });
          const result=await response.json();
          if(!response.ok||!result.ok)throw new Error(result.error||t('conflict'));
          const value=result.value;
          if(args.action==='list')projectCache=value.projects;
          else if(args.action==='save'&&value.project)projectCache=[...projectCache.filter(p=>p.id!==value.project.id),value.project];
          else if(args.action==='remove')projectCache=projectCache.filter(p=>p.id!==args.id);
          if(['save','bind','remove'].includes(args.action)){projectVersion++;for(const fn of projectListeners)fn();}
          refreshNativeCards();
          if(hover){const project=matchingProject(hover.workspace);publishHover(project?{...hover,project}:null);}
          return value;
        }
        function Manager({ sessionId: providedId, dock = false, initialProject = null, initialOpen = false, hiddenLauncher = false, workspaceId, onClose }) {
          const version = useSyncExternalStore(projectSource.subscribe, projectSource.getSnapshot);
          const sessions = useSyncExternalStore(ctx.sessions.list.subscribe, ctx.sessions.list.getSnapshot);
          const sessionId = providedId ?? Object.values(sessions.byId).find(s => (s.retainedBy.mainView ?? 0) > 0)?.id;
          const [open, setOpen] = useState(initialOpen), [state, setState] = useState({ projects: [], activeProjectId: null });
          const [draft, setDraft] = useState(initialProject), [error, setError] = useState(''), [busy, setBusy] = useState(false);
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
          }, [sessionId, open, version]);
          function close() { setDraft(null); setOpen(false); onClose?.(); }
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
          function edit(p) { setDraft(p ? structuredClone(p) : { title:'', folders:[], primary:'' }); setError(''); }
          function addPath(value) {
            if (!value?.trim()) return;
            setDraft(d => ({...d, folders:[...new Set([...d.folders, value.trim()])], primary:d.primary || value.trim()}));
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
            if (e.key === 'Escape' && !busy) { e.stopPropagation(); close(); }
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
          return h('div', {className:'dpm'}, h('style',null,css+folderCss),
            !hiddenLauncher && h('button',{ref:launcher,type:'button',className:dock?'dpm-dock dpm-mini':'dpm-launch',onClick:()=>setOpen(true),title:active?.primary}, '▱ '+(dock&&active?active.title:t('title'))),
            open && h('div',{className:'dpm-backdrop',onClick:e=>{if(e.target===e.currentTarget&&!busy)close();}},
              h('section',{className:'dpm-dialog'+(draft?' dpm-edit':''),ref:dialog,tabIndex:-1,role:'dialog','aria-modal':true,'aria-label':t(draft?'edit':'title'),onKeyDown:keyboard},
                h('div',{className:'dpm-head'},h('h2',null,t(draft?'edit':'title')),button('×',close,{'aria-label':t('close')})),
                !sessionId ? h('p',null,t('needSession')) : draft ? h(React.Fragment,null,
                  h('label',{className:'dpm-sr-only',htmlFor:'dpm-name'},t('name')),h('div',{className:'dpm-name-field'},h(FolderIcon),h('input',{id:'dpm-name',value:draft.title,disabled:busy,onChange:e=>setDraft({...draft,title:e.target.value})})),
                  h('label',{className:'dpm-label'},t('folders')),
                  h('div',{className:'dpm-folder-box'},draft.folders.map(folder=>h('div',{key:folder,className:'dpm-source','data-primary':draft.primary===folder,tabIndex:0,'aria-label':folder},
                    h('div',{className:'dpm-folder-main',title:folder},h(FolderIcon),h('span',{className:'dpm-folder-name'},folderName(folder))),
                    draft.primary===folder?h('span',{className:'dpm-badge'},t('primary')):button(t('setPrimaryButton'),()=>setDraft({...draft,primary:folder}),{className:'dpm-set-primary','aria-label':t('setPrimaryButton')+': '+folder}),
                    button('×',()=>setDraft({...draft,folders:draft.folders.filter(f=>f!==folder),primary:draft.primary===folder?'':draft.primary}),{className:'dpm-folder-remove','aria-label':t('removeFolder')+': '+folder,title:t('removeFolder')}))),
                    button(h(React.Fragment,null,h(FolderIcon,{add:true}),h('span',null,t('addFolder'))),pick,{className:'dpm-folder-add'})),
                  h('p',{className:'dpm-edit-note',title:t('note')},t('saveNote')),
                  h('div',{className:'dpm-foot'},draft.id&&button(t('remove'),async()=>{if(window.confirm(t('removeConfirm'))&&await action({action:'remove',id:draft.id}))setDraft(null);},{className:'dpm-danger'}),button(t('cancel'),close,{className:'dpm-cancel'}),button(t('save'),async()=>{if(await action({action:'save',...draft})){setDraft(null);close();}},{className:'dpm-save',disabled:busy||!draft.title.trim()||!draft.primary||!draft.folders.length}))) : h(React.Fragment,null,
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
        function PrimaryDirectoryTooltip() {
          const value=useSyncExternalStore(hoverSource.subscribe,hoverSource.getSnapshot);
          const tip=useRef(null);
          const [position,setPosition]=useState({left:8,top:8});
          useEffect(()=>{
            if(!value)return;
            const rect=value.row.getBoundingClientRect();
            const width=tip.current?.offsetWidth||300,height=tip.current?.offsetHeight||90;
            setPosition({left:Math.max(8,Math.min(rect.right+10,window.innerWidth-width-8)),top:Math.max(8,Math.min(rect.top,window.innerHeight-height-8))});
            const previous=value.row.getAttribute('aria-describedby');
            value.row.setAttribute('aria-describedby','dpm-primary-tooltip');
            return()=>{if(previous===null)value.row.removeAttribute('aria-describedby');else value.row.setAttribute('aria-describedby',previous);};
          },[value]);
          if(!value)return null;
          return h('div',{className:'dpm'},h('style',null,css),h('div',{ref:tip,id:'dpm-primary-tooltip',className:'dpm-primary-tooltip',role:'tooltip',style:position},
            h('strong',null,value.project.title),h('div',{className:'dpm-path'},value.project.primary),h('small',null,t('primary'))));
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
                closeMenu();
                allowNativeMenu = true;
                try { target.nativeMenu.click(); } finally { allowNativeMenu = false; }
                return;
              }
              if (kind === 'newChat') { ctx.uiWorkspace.startSession(workspace.workspaceId); closeMenu(); return; }
              if (kind === 'remove' && !window.confirm(t('removeTreeConfirm'))) return;
              const sessionId = await sessionFor(workspace,kind==='bind' || kind==='openFolder');
              if (kind === 'openFolder') {
                await call(sessionId,{action:'open_folder',workspaceId:workspace.workspaceId});
                if(activeRequest.current===target)closeMenu();
                return;
              }
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
          return h('div',{className:'dpm'},h('style',null,css+folderCss),h('div',{ref:menu,className:'dpm-menu',role:'menu','aria-label':t('title'),style:position,onKeyDown:keyboard},
            h('div',{className:'dpm-menu-title'},request.workspace.title),
            ...(request.ellipsis ? [item('manage'),item('openFolder'),h('div',{key:'separator',className:'dpm-menu-separator',role:'separator'}),item('edit','rename')] : [item('edit'),item('primary','setPrimary'),item('openFolder')]),item('bind'),item('newChat'),
            h('div',{className:'dpm-menu-separator',role:'separator'}),item('more'),item('remove',request.ellipsis?'deleteWorkspace':'remove'),error&&h('div',{className:'dpm-error',role:'alert'},error)));
        }
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({name:'conversation.composer.dock',id:'dsh-workdock-dock',order:10,inject:sessionId=>({sessionId,dock:true})}, Manager));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-tree-menu',order:20}, TreeOverlay));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-primary-tooltip',order:19}, PrimaryDirectoryTooltip));
      }
    };
  }
});
