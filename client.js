window.__ModuleLoader__.load({
  id: 'dsh-workdock',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useSyncExternalStore } = React;
    const baseCss = `
.dpm button,.dpm input{font:inherit;color:inherit}.dpm button{cursor:pointer;border:1px solid var(--dsw-alias-border-l3,#555);background:transparent;border-radius:9px;padding:7px 11px}.dpm button:hover{background:var(--dsw-alias-bg-hover,#ffffff15)}.dpm button:disabled{opacity:.45;cursor:default}.dpm input{box-sizing:border-box;background:transparent;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:9px;padding:10px;width:100%}.dpm-backdrop{position:fixed;inset:0;background:#0008;display:grid;place-items:center;z-index:1000;padding:20px}.dpm-dialog{box-sizing:border-box;width:min(660px,100%);max-height:85vh;overflow:auto;padding:24px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:20px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-text-primary,#eee);box-shadow:0 24px 90px #0006}.dpm-head,.dpm-row,.dpm-foot{display:flex;align-items:center;gap:10px}.dpm-head{justify-content:space-between;margin-bottom:18px}.dpm h2{font-size:20px;margin:0}.dpm p{opacity:.7;font-size:13px;line-height:1.6}.dpm-list{display:grid;gap:10px;margin:16px 0}.dpm-card{padding:13px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px}.dpm-path{font-size:12px;opacity:.65;word-break:break-all;margin:6px 0 10px}.dpm-row{flex-wrap:wrap}.dpm-row .dpm-grow{flex:1;min-width:100px}.dpm-source{padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l3,#555)}.dpm-source input[type=radio]{width:auto}.dpm-source label{display:flex;gap:9px;align-items:center;word-break:break-all;font-size:13px}.dpm-source button{font-size:12px}.dpm-foot{justify-content:flex-end;margin-top:22px}.dpm .dpm-save{background:var(--dsw-alias-text-primary,#eee);color:var(--dsw-alias-bg-base,#292929)}.dpm .dpm-danger{color:#ef8880}.dpm-error{color:#ef8880;font-size:13px;margin-top:12px;white-space:pre-wrap}.dpm-badge{font-size:11px;color:#8bb6ed;margin-left:8px}.dpm-launch{width:100%;text-align:left}.dpm label.dpm-label{display:block;margin:16px 0 8px;font-size:13px}.dpm-dock{font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dpm-mini{font-size:12px!important;padding:4px 8px!important}
.dpm-menu{position:fixed;z-index:1100;width:228px;box-sizing:border-box;max-height:calc(100vh - 16px);overflow:auto;padding:6px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-label-primary,#eee);border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px;box-shadow:0 12px 42px #0005}.dpm-menu button{display:block;text-align:left;width:100%;border:0;border-radius:7px;padding:9px 12px}.dpm-menu button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:-2px}.dpm-menu-title{padding:7px 12px;font-size:12px;opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dpm-menu-separator{height:1px;margin:5px 8px;background:var(--dsw-alias-border-l3,#555)}
.dpm-edit{width:min(520px,100%);padding:22px;border-radius:18px}.dpm-edit .dpm-head{margin-bottom:14px}.dpm-edit h2{font-size:20px}.dpm-edit .dpm-head button{border:0;padding:2px 6px;opacity:.65;font-size:19px}.dpm-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.dpm-name-field{display:flex;align-items:center;gap:12px;border:1px solid var(--dsw-alias-border-l3,#4c4c4c);border-radius:12px;padding-left:14px}.dpm-name-field:focus-within{border-color:var(--dsw-alias-state-business-primary,#81abc7);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary,#81abc7)}.dpm .dpm-name-field input{border:0;padding:12px 10px 12px 0;outline:0;min-width:0;font-size:13px}.dpm-folder-icon{width:18px;height:18px;flex:none;opacity:.55}.dpm-folder-box{border:1px solid var(--dsw-alias-border-l3,#424242);border-radius:12px;overflow:hidden}.dpm .dpm-source{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l3,#424242)}.dpm-source label{flex:1;min-width:0;cursor:pointer;gap:12px}.dpm-source input[type=radio]{position:absolute;opacity:0;width:1px;height:1px}.dpm-source label:focus-within{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:4px;border-radius:4px}.dpm-folder-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:13px}.dpm-source[data-primary=true] .dpm-folder-icon{color:var(--dsw-alias-state-business-primary,#8bb6ed);opacity:1}.dpm-source .dpm-badge{margin:0;white-space:nowrap;font-size:11px}.dpm .dpm-source .dpm-folder-remove{border:0;padding:4px 6px;opacity:.55;font-size:16px}.dpm .dpm-folder-add{display:flex;align-items:center;gap:12px;border:0;border-radius:0;text-align:left;width:100%;min-height:48px;padding:0 14px;opacity:.7;font-size:13px}.dpm-edit .dpm-foot{margin-top:20px;gap:12px}.dpm-edit .dpm-foot .dpm-danger{margin-right:auto;background:#b04c3a20;border:0;font-size:13px}.dpm-edit .dpm-foot .dpm-cancel{border:0;opacity:.6}.dpm-edit .dpm-foot .dpm-save{padding:7px 15px;border:0;font-size:13px}.dpm-edit .dpm-edit-note{font-size:11px;opacity:.5;margin:6px 0 0}.dpm-primary-tooltip{position:fixed;z-index:900;box-sizing:border-box;width:300px;max-width:calc(100vw - 16px);padding:12px 15px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:12px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-label-primary,#eee);box-shadow:0 8px 32px #0004;pointer-events:none}.dpm-primary-tooltip strong{font-size:13px}.dpm-primary-tooltip .dpm-path{margin:7px 0 0;opacity:.8}.dpm-primary-tooltip small{display:block;margin-top:7px;opacity:.5;font-size:11px}
`;
    const folderCss = `
.dpm-menu{width:214px;padding:5px;border-radius:10px}.dpm-menu button{padding:6px 10px;font-size:13px;line-height:20px;border-radius:6px}.dpm-menu-title{padding:5px 10px;font-size:11px}.dpm-menu-separator{margin:4px 7px}
.dpm-folder-main{display:flex;align-items:center;gap:12px;flex:1;min-width:0}.dpm .dpm-source{cursor:default}.dpm-source:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:-3px}.dpm .dpm-set-primary{flex:none;visibility:hidden;opacity:0;pointer-events:none;border:0;padding:5px 8px;font-size:11px;color:var(--dsw-alias-state-business-primary,#8bb6ed);white-space:nowrap;transition:opacity .12s}.dpm-source:hover .dpm-set-primary,.dpm-source:focus-within .dpm-set-primary{visibility:visible;opacity:1;pointer-events:auto}@media(hover:none){.dpm .dpm-set-primary{visibility:visible;opacity:1;pointer-events:auto}}
.dpm .dpm-source{flex-wrap:wrap;padding-top:8px;padding-bottom:8px}.dpm-folder-main{min-width:90px}.dpm-error{overflow-wrap:anywhere}.dpm select{font:inherit;color:inherit;background:var(--dsw-alias-bg-base,#292929);border:1px solid var(--dsw-alias-border-l3,#555);border-radius:9px;padding:7px}@media(prefers-reduced-motion:reduce){.dpm .dpm-set-primary{transition:none}}
`;
    const compactCss = `
.dpm-dialog{padding:16px;border-radius:14px}
.dpm-edit{width:min(470px,100%);padding:16px;border-radius:14px}
.dpm-head{margin-bottom:12px;gap:8px}
.dpm h2,.dpm-edit h2{font-size:16px;line-height:1.35}
.dpm-edit .dpm-head{margin-bottom:10px}
.dpm-edit .dpm-head button{font-size:16px;padding:0 5px;line-height:20px}
.dpm button{border-radius:8px;padding:4px 9px;font-size:13px;line-height:18px}
.dpm .dpm-mini{padding:4px 8px;font-size:12px;line-height:16px}
.dpm input{border-radius:8px;padding:7px 9px;font-size:13px}
.dpm select{padding:6px 8px;border-radius:8px;font-size:13px}
.dpm label.dpm-label{display:block;margin:10px 0 6px;font-size:12px;opacity:.72}
.dpm-name-field{gap:10px;border-radius:10px;padding-left:11px}
.dpm .dpm-name-field input{padding:7px 8px 7px 0;font-size:13px}
.dpm-folder-icon{width:16px;height:16px}
.dpm-folder-box{border-radius:10px}
.dpm .dpm-source{box-sizing:border-box;gap:7px;min-height:36px;padding:4px 10px}
.dpm-source label{gap:9px}
.dpm-folder-name{font-size:13px}
.dpm-source .dpm-badge{font-size:10px;padding:1px 0}
.dpm .dpm-source .dpm-folder-remove{font-size:15px;padding:2px 5px;line-height:1}
.dpm .dpm-set-primary{padding:3px 7px;font-size:11px;line-height:16px}
.dpm .dpm-source .dpm-mini{flex:none;border:0;padding:3px 7px;font-size:11px;line-height:16px;opacity:.55}
.dpm .dpm-source .dpm-mini:hover{opacity:.9}
.dpm .dpm-source .dpm-mini:focus-visible{opacity:1}
.dpm .dpm-folder-add{min-height:36px;padding:0 11px;font-size:13px;gap:9px}
.dpm-folder-main{gap:9px}
.dpm-edit .dpm-foot{margin-top:12px;gap:8px}
.dpm-edit .dpm-foot .dpm-danger{font-size:12px;padding:5px 10px}
.dpm p{font-size:12px;line-height:1.5;margin:6px 0}
.dpm-edit-note{font-size:11px;line-height:1.45;margin:8px 0 0;opacity:.6}
.dpm-list{gap:8px;margin:12px 0}
.dpm-card{padding:10px;border-radius:10px}
.dpm-path{font-size:12px;margin:4px 0 8px}
.dpm-row{gap:6px}
.dpm-searchbar{margin-top:7px}
.dpm-row .dpm-grow{min-width:90px}
.dpm-badge{font-size:11px;margin-left:6px}
.dpm-error{font-size:12px;margin-top:8px}
.dpm-menu{width:206px;padding:4px;border-radius:10px}
.dpm-menu button{padding:5px 9px;font-size:13px;line-height:18px;border-radius:6px}
.dpm-menu-title{padding:4px 9px;font-size:11px}
.dpm-menu-separator{margin:3px 6px}
.dpm-primary-tooltip{width:280px;padding:8px 10px;border-radius:10px;font-size:12px;line-height:1.45}
.dpm-primary-tooltip strong{font-size:13px;font-weight:600}
.dpm-primary-tooltip .dpm-path{font-size:11px;margin:3px 0}
.dpm-global{position:fixed;right:16px;bottom:52px;z-index:1200;max-width:min(420px,calc(100vw - 32px));padding:9px 11px;border:1px solid var(--dsw-alias-border-l3,#555);border-radius:10px;background:var(--dsw-alias-bg-base,#292929);color:var(--dsw-alias-text-primary,#eee);white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.5}
.dpm-global p{margin:3px 0}
.dpm .dpm-global .dpm-mini{padding:3px 7px;font-size:11px}
.dpm-browse{position:fixed;right:16px;bottom:16px;z-index:950;padding:5px 10px;font-size:12px;background:var(--dsw-alias-bg-base,#292929)!important}
.dpm-backdrop{padding:16px}
.dpm-dialog{max-height:88vh}
.dpm-edit-note{max-height:3.2em;overflow:auto}
`;
    const css = baseCss + folderCss + compactCss;
    const zh = { title:'项目管理', edit:'编辑项目', add:'添加项目', name:'项目名称', folders:'源文件夹', primary:'主要目录', addFolder:'添加文件夹', path:'输入绝对目录路径', save:'保存', cancel:'取消', close:'关闭', remove:'移除本地项目', removeFolder:'移除', bind:'用于当前聊天', active:'当前项目', pin:'置顶', unpin:'取消置顶', newChat:'新建聊天', empty:'暂无项目，添加项目后可设置多个源目录。', needSession:'请先打开或创建一个聊天，再管理项目。', note:'保存后立即用于当前聊天。后续修改与新命令默认使用主要目录；其他源目录作为只读参考。已运行的终端进程保留原目录。', removeConfirm:'仅移除项目配置，不删除磁盘文件。确认移除？', reload:'刷新', conflict:'操作失败', browse:'选择目录' };
    const en = { title:'Projects', edit:'Edit project', add:'Add project', name:'Project name', folders:'Source folders', primary:'Primary', addFolder:'Add folder', path:'Absolute directory path', save:'Save', cancel:'Cancel', close:'Close', remove:'Remove project', removeFolder:'Remove', bind:'Use in this chat', active:'Current project', pin:'Pin', unpin:'Unpin', newChat:'New chat', empty:'No projects. Add one to configure its source folders.', needSession:'Open or create a chat before managing projects.', note:'Subsequent edits and new commands use the primary directory. Other folders are read-only references. Existing terminal processes keep their cwd.', removeConfirm:'Remove project settings? Files on disk will be kept.', reload:'Refresh', conflict:'Operation failed', browse:'Choose directory' };
    Object.assign(zh,{setPrimary:'设置主要目录',more:'置顶 / 更多…',nativeUnavailable:'宿主项目菜单不可用，请使用项目行上的更多按钮。',removeTreeConfirm:'从左侧项目树移除此项目及目录配置？磁盘文件和聊天记录会保留。'});
    Object.assign(en,{setPrimary:'Set primary directory',more:'Pin / more…',nativeUnavailable:'The host project menu is unavailable. Use the project row menu button.',removeTreeConfirm:'Remove this project and its directory settings from the sidebar? Files and chat history will be kept.'});
    Object.assign(zh,{manage:'项目管理',openFolder:'在资源管理器中打开',rename:'重命名',deleteWorkspace:'删除工作区'});
    Object.assign(en,{manage:'Project management',openFolder:'Open folder in file manager',rename:'Rename',deleteWorkspace:'Delete workspace'});
    Object.assign(zh,{setPrimaryButton:'设为主要目录',saveNote:'保存后，当前聊天及后续操作将使用主要目录。'});
    Object.assign(en,{setPrimaryButton:'Set as primary',saveNote:'Saving applies the primary directory to this chat and subsequent work.'});
    Object.assign(en,{discard:'Discard unsaved changes?',search:'Search projects',noResults:'No matching projects.',sort:'Sort projects',orderName:'Name',orderRecent:'Recently used',copy:'Copy primary path',copied:'Path copied',clipboardUnavailable:'Clipboard is unavailable.',undo:'Undo',removedFolder:'Folder removed',bound:'Project applied',syncWarning:'Sidebar sync needs attention',retrySync:'Retry sidebar sync'});
    Object.assign(zh,{discard:'放弃未保存的修改？',search:'搜索项目',noResults:'没有匹配的项目。',sort:'项目排序',orderName:'名称',orderRecent:'最近使用',copy:'复制主要目录路径',copied:'已复制路径',clipboardUnavailable:'剪贴板不可用。',undo:'撤销',removedFolder:'已移除目录',bound:'已应用项目',syncWarning:'侧边栏同步需要重试',retrySync:'重试侧边栏同步'});
    Object.assign(zh,{needSession:'请先打开或创建一个聊天，再添加、编辑或切换项目。'});
    Object.assign(en,{needSession:'Open or create a chat to add, edit or apply a project.'});
    function folderLabel(path, folders) {
      const parts = path.replace(/[\\/]+$/,'').split(/[\\/]/);
      for(let n=1;n<=parts.length;n++) {
        const suffix=parts.slice(-n).join('/');
        if(folders.filter(other=>other.replace(/[\\/]+$/,'').split(/[\\/]/).slice(-n).join('/').toLowerCase()===suffix.toLowerCase()).length===1)return suffix;
      }
      return path;
    }
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
        let notice = null, syncWarnings = [];
        const noticeListeners = new Set();
        let noticeVersion = 0, noticeTimer = null;
        const NOTICE_LIFETIME = 3000;
        const noticeSource = {subscribe(fn){noticeListeners.add(fn);return()=>noticeListeners.delete(fn);},getSnapshot:()=>noticeVersion};
        function publishNotice() {noticeVersion++;for(const fn of noticeListeners)fn();}
        function clearNoticeTimer() {if(noticeTimer!==null){clearTimeout(noticeTimer);noticeTimer=null;}}
        function dismissNotice() {clearNoticeTimer();notice=null;publishNotice();}
        // Status notices (applied project, copied path) fade on their own; errors stay until dismissed.
        function announce(text, error=false) {clearNoticeTimer();notice={text,error};if(!error&&NOTICE_LIFETIME>0)noticeTimer=setTimeout(dismissNotice,NOTICE_LIFETIME);publishNotice();}
        function updateWarnings(warnings) {syncWarnings=warnings;publishNotice();}
        ctx.effect(() => () => clearNoticeTimer());
        async function copyPath(path) {
          try {if(!navigator.clipboard?.writeText)throw new Error(t('clipboardUnavailable'));await navigator.clipboard.writeText(path);announce(t('copied')+': '+path);}
          catch(e){announce(e.message,true);}
        }
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
          // Match the host toolbar action, not project-row or dialog buttons.
          function addWorkspaceButton(target) {
            if (!(target instanceof Element)) return null;
            return target.closest('button[aria-label="添加工作区"],button[aria-label="Add workspace"]');
          }
          function menuButtonRow(target) {
            if (!(target instanceof Element) || target.closest('[data-row-key^="session:"]')) return null;
            const button = target.closest('button');
            const row = button?.closest('[data-row-key^="workspace:"]');
            return row && row.querySelector('button') === button ? row : null;
          }
          function onMenuPointer(event) {
            if (event.button === 0 && addWorkspaceButton(event.target)) { event.stopPropagation(); return; }
            if (!allowNativeMenu && event.button === 0 && menuButtonRow(event.target)) event.stopPropagation();
          }
          function onMenuClick(event) {
            if (addWorkspaceButton(event.target)) {
              event.preventDefault(); event.stopPropagation();
              publishTree({ manage: true, add: true, sequence: ++requestSequence });
              return;
            }
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
          if(['list','save','bind'].includes(args.action))updateWarnings(value.syncWarnings||[]);
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
          const [open,setOpen]=useState(initialOpen), [state,setState]=useState({projects:[],activeProjectId:null,directoryWarnings:[]});
          const [draft,setDraft]=useState(initialProject), [error,setError]=useState(''), [busy,setBusy]=useState(false);
          const [search,setSearch]=useState(''), [sort,setSort]=useState(()=>{try {return localStorage.getItem('dsh-workdock-sort')||'name';}catch{return 'name';}});
          const [directoryWarnings,setDirectoryWarnings]=useState([]), [removed,setRemoved]=useState(null);
          const dialog=useRef(null), nameInput=useRef(null), generation=useRef(0), lock=useRef(false), checkGeneration=useRef(0);
          const baseline=useRef(JSON.stringify(initialProject)), manualName=useRef(Boolean(initialProject?.title)), undoTimer=useRef(null), draftEpoch=useRef(0);
          const currentId=useRef(sessionId);currentId.current=sessionId;
          const dirty=Boolean(draft)&&JSON.stringify(draft)!==baseline.current;
          function clearUndo(){clearTimeout(undoTimer.current);setRemoved(null);}
          useEffect(()=>()=>{clearTimeout(undoTimer.current);checkGeneration.current++;},[]);
          useEffect(()=>{
            if(!dirty)return;
            const unload=e=>{e.preventDefault();e.returnValue='';};
            window.addEventListener('beforeunload',unload);return()=>window.removeEventListener('beforeunload',unload);
          },[dirty]);
          async function refresh(id=sessionId){
            const token=++generation.current;
            const value=await call(id,{action:'list'});
            if(token===generation.current&&id===currentId.current)setState(value);
          }
          useEffect(()=>{refresh().catch(e=>setError(e.message));return()=>{generation.current++;};},[sessionId,open,version]);
          function close(force=false){
            if(!force&&dirty&&!window.confirm(t('discard')))return;
            clearUndo();checkGeneration.current++;draftEpoch.current++;setDraft(null);setOpen(false);onClose?.();
          }
          useEffect(()=>{
            if(!open)return;
            const before=document.activeElement;
            if(!draft)dialog.current?.focus();
            return()=>{if(before?.isConnected)before.focus();};
          },[open]);
          useEffect(()=>{if(open&&draft)nameInput.current?.focus();},[open,Boolean(draft)]);
          async function action(args){
            if(lock.current)return null;
            if(['save','bind'].includes(args.action)&&!sessionId){setError(t('needSession'));return null;}
            lock.current=true;setBusy(true);setError('');
            try {
              const result=await call(sessionId,args);
              if(workspaceId&&args.action==='remove')await ctx.workspaces.delete(workspaceId);
              if(args.action==='bind'){
                const project=state.projects.find(p=>p.id===args.id);
                announce(t('bound')+': '+project.title+' · '+project.primary);close(true);
              }
              // A successful mutation stays successful even if refreshing fails.
              if(!['save','bind'].includes(args.action))await refresh().catch(e=>setError(e.message));
              return result;
            }catch(e){setError(e.message);return null;}
            finally{lock.current=false;setBusy(false);}
          }
          function edit(p){
            if(!sessionId){setError(t('needSession'));return;}
            clearUndo();draftEpoch.current++;checkGeneration.current++;
            const next=p?structuredClone(p):{title:'',folders:[],primary:''};
            baseline.current=JSON.stringify(next);manualName.current=Boolean(p?.title);setDraft(next);setError('');
            setDirectoryWarnings((state.directoryWarnings||[]).filter(w=>w.projectId===p?.id));
          }
          async function checkPaths(folders){
            const token=++checkGeneration.current;
            try {const value=await call(undefined,{action:'check_directories',folders});if(token===checkGeneration.current)setDirectoryWarnings(value.directoryWarnings||[]);}
            catch(e){if(token===checkGeneration.current)setError(e.message);}
          }
          useEffect(()=>{if(draft)checkPaths(draft.folders);},[draft?.folders]);
          async function pick(){
            if(lock.current)return;
            lock.current=true;setBusy(true);setError('');const epoch=draftEpoch.current;
            try {
              const response=await ctx.remote.directoryPicker.pick();
              if(!response.ok)throw new Error(response.error.message);
              const path=response.value?.trim();
              if(path&&epoch===draftEpoch.current)setDraft(d=>{
                if(!d)return d;
                return {...d,title:!d.title&&!manualName.current?folderName(path):d.title,folders:[...new Set([...d.folders,path])],primary:d.primary||path};
              });
            }catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}
          }
          function removeFolder(folder){
            clearUndo();
            setRemoved({folder,index:draft.folders.indexOf(folder),before:draft.folders[draft.folders.indexOf(folder)-1],after:draft.folders[draft.folders.indexOf(folder)+1],wasPrimary:draft.primary===folder});
            setDraft(d=>({...d,folders:d.folders.filter(f=>f!==folder),primary:d.primary===folder?'':d.primary}));
            undoTimer.current=setTimeout(()=>setRemoved(null),8000);
          }
          function undo(){
            const item=removed;clearUndo();if(!item)return;
            setDraft(d=>{
              const folders=[...d.folders];
              if(!folders.includes(item.folder)){
                const after=folders.indexOf(item.after),before=folders.indexOf(item.before);
                folders.splice(after>=0?after:before>=0?before+1:Math.min(item.index,folders.length),0,item.folder);
              }
              return {...d,folders,primary:item.wasPrimary&&!d.primary?item.folder:d.primary};
            });
          }
          const valid=Boolean(sessionId&&draft?.title.trim()&&draft.primary&&draft.folders.includes(draft.primary));
          async function save(){if(!valid||lock.current)return;if(await action({action:'save',...draft}))close(true);}
          async function newChat(p){
            if(lock.current)return;lock.current=true;setBusy(true);setError('');
            try {await call(undefined,{action:'touch',id:p.id});const workspace=await ctx.workspaces.create({path:p.primary});ctx.uiWorkspace.startSession(workspace.workspaceId);close(true);}
            catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}
          }
          function keyboard(e){
            if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();e.stopPropagation();if(draft)save();return;}
            if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!busy)close();}
            if(e.key==='Tab'){
              const nodes=[...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')];
              if(!nodes.length){e.preventDefault();return;}
              const first=nodes[0],last=nodes[nodes.length-1];
              if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last.focus();}
              else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
            }
          }
          const button=(text,onClick,props={})=>h('button',{type:'button',disabled:busy,onClick,...props},text);
          const active=state.projects.find(p=>p.id===state.activeProjectId);
          const query=search.trim().toLowerCase();
          const compare=(a,b)=>a.localeCompare(b);
          const ordered=state.projects.filter(p=>[p.title,p.primary].some(v=>v.toLowerCase().includes(query))).sort((a,b)=>
            Number(Boolean(b.pinned))-Number(Boolean(a.pinned))||
            (sort==='recent'?(b.lastUsedAt||0)-(a.lastUsedAt||0):compare(a.title,b.title))||compare(a.id,b.id));
          const warnings=(items,projectId)=>items.filter(w=>!projectId||w.projectId===projectId).map(w=>h('div',{key:w.path,className:'dpm-error',role:'status'},w.path+': '+w.error));
          return h('div',{className:'dpm'},h('style',null,css),
            !hiddenLauncher&&h('button',{type:'button',className:dock?'dpm-dock dpm-mini':'dpm-launch',onClick:()=>setOpen(true),title:active?.primary},'▱ '+(dock&&active?active.title:t('title'))),
            open&&h('div',{className:'dpm-backdrop',onClick:e=>{if(e.target===e.currentTarget&&!busy)close();}},
              h('section',{className:'dpm-dialog'+(draft?' dpm-edit':''),ref:dialog,tabIndex:-1,role:'dialog','aria-modal':true,'aria-label':t(draft?(draft.id?'edit':'add'):'title'),onKeyDown:keyboard},
                h('div',{className:'dpm-head'},h('h2',null,t(draft?(draft.id?'edit':'add'):'title')),button('×',()=>close(),{'aria-label':t('close')})),
                draft?h(React.Fragment,null,
                  !sessionId&&h('p',null,t('needSession')),
                  h('label',{className:'dpm-sr-only',htmlFor:'dpm-name'},t('name')),h('div',{className:'dpm-name-field'},h(FolderIcon),h('input',{ref:nameInput,id:'dpm-name',value:draft.title,disabled:busy||!sessionId,onChange:e=>{manualName.current=true;setDraft({...draft,title:e.target.value});}})),
                  h('label',{className:'dpm-label'},t('folders')),
                  h('div',{className:'dpm-folder-box'},draft.folders.map(folder=>h('div',{key:folder},h('div',{className:'dpm-source','data-primary':draft.primary===folder,tabIndex:0,'aria-label':folder},
                    h('div',{className:'dpm-folder-main',title:folder},h(FolderIcon),h('span',{className:'dpm-folder-name'},folderLabel(folder,draft.folders))),
                    draft.primary===folder?h('span',{className:'dpm-badge'},t('primary')):button(t('setPrimaryButton'),()=>setDraft({...draft,primary:folder}),{className:'dpm-set-primary','aria-label':t('setPrimaryButton')+': '+folder}),
                    button('×',()=>removeFolder(folder),{className:'dpm-folder-remove','aria-label':t('removeFolder')+': '+folder,title:t('removeFolder')})),
                    warnings(directoryWarnings.filter(w=>w.path===folder)))),
                    button(h(React.Fragment,null,h(FolderIcon,{add:true}),h('span',null,t('addFolder'))),()=>pick(),{className:'dpm-folder-add',disabled:busy||!sessionId})),
                  removed&&h('div',{role:'status'},t('removedFolder')+': '+removed.folder+' ',button(t('undo'),undo,{className:'dpm-mini'})),
                  h('p',{className:'dpm-edit-note',title:t('note')},t('saveNote')),
                  h('div',{className:'dpm-foot'},draft.id&&button(t('remove'),async()=>{if(window.confirm(t('removeConfirm'))&&await action({action:'remove',id:draft.id}))close(true);},{className:'dpm-danger'}),button(t('cancel'),()=>close(),{className:'dpm-cancel'}),button(t('save'),save,{className:'dpm-save',disabled:busy||!valid}))) : h(React.Fragment,null,
                  h('div',{className:'dpm-row'},button('+ '+t('add'),()=>edit(null),{disabled:busy||!sessionId}),button(t('reload'),()=>action({action:'list'}))),
                  !sessionId&&h('p',null,t('needSession')),
                  h('div',{className:'dpm-row dpm-searchbar'},h('input',{className:'dpm-grow',value:search,placeholder:t('search'),'aria-label':t('search'),onChange:e=>setSearch(e.target.value)}),h('select',{'aria-label':t('sort'),value:sort,onChange:e=>{setSort(e.target.value);try{localStorage.setItem('dsh-workdock-sort',e.target.value);}catch{}}},...['name','recent'].map(key=>h('option',{key,value:key},t('order'+key[0].toUpperCase()+key.slice(1)))))),
                  !ordered.length&&h('p',null,t(query?'noResults':'empty')),
                  h('div',{className:'dpm-list'},ordered.map(p=>h('article',{className:'dpm-card',key:p.id},
                    h('strong',null,(p.pinned?'⌖ ':'')+p.title),p.id===state.activeProjectId&&h('span',{className:'dpm-badge'},t('active')),
                    h('div',{className:'dpm-path'},p.primary+' · '+p.folders.length+' '+t('folders')),
                    warnings(state.directoryWarnings||[],p.id),
                    h('div',{className:'dpm-row'},button(t('bind'),()=>action({action:'bind',id:p.id}),{disabled:busy||!sessionId}),button(t('edit'),()=>edit(p),{disabled:busy||!sessionId}),button(t(p.pinned?'unpin':'pin'),()=>action({action:'pin',id:p.id})),button(t('openFolder'),()=>action({action:'open_folder',id:p.id})),button(t('copy'),()=>copyPath(p.primary)),button(t('newChat'),()=>newChat(p))))))),
                error&&h('div',{className:'dpm-error',role:'alert'},error))));
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
            if (!request || request.manage) return;
            const node = menu.current;
            const rect = node?.getBoundingClientRect();
            setPosition({left:Math.max(8,Math.min(request.x,window.innerWidth-(rect?.width ?? 206)-8)),top:Math.max(8,Math.min(request.y,window.innerHeight-(rect?.height ?? 280)-8))});
            node?.querySelector('button')?.focus();
            const outside = event => { if (!editorRef.current && !menu.current?.contains(event.target)) closeMenu(); };
            const escape = event => { if(!editorRef.current && event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu();request.trigger?.focus();} };
            document.addEventListener('pointerdown',outside,true);
            document.addEventListener('keydown',escape,true);
            window.addEventListener('resize',closeMenu);
            return () => {document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);window.removeEventListener('resize',closeMenu);};
          }, [request]);
          async function sessionFor(workspace,useCurrent=false) {
            const current=Object.values(ctx.sessions.list.getSnapshot().byId).find(s=>(s.retainedBy.mainView??0)>0)?.id;
            if(current&&(useCurrent||workspace.sessionIds.includes(current)))return current;
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
              if (kind === 'openFolder') {
                await call(undefined,{action:'open_folder',workspaceId:workspace.workspaceId});
                if(activeRequest.current===target)closeMenu();return;
              }
              if (kind === 'remove' && !window.confirm(t('removeTreeConfirm'))) return;
              const state = await call(undefined,{action:'list'});
              if (activeRequest.current !== target) return;
              const project = state.projects.find(p=>p.primary===workspace.path || p.sessionRoots.includes(workspace.path));
              if (kind === 'copy') {await copyPath(project?.primary||workspace.path);closeMenu();return;}
              if (kind === 'newChat') {
                if(project)await call(undefined,{action:'touch',id:project.id});
                ctx.uiWorkspace.startSession(workspace.workspaceId);closeMenu();return;
              }
              if (kind === 'remove') {
                if(project)await call(undefined,{action:'remove',id:project.id});
                await ctx.workspaces.delete(workspace.workspaceId);closeMenu();return;
              }
              const sessionId=await sessionFor(workspace,kind==='bind');
              if (kind === 'bind') {
                if(project)await call(sessionId,{action:'bind',id:project.id});
                else await call(sessionId,{action:'save',title:workspace.title,folders:[workspace.path],primary:workspace.path});
                announce(t('bound')+': '+(project?.title||workspace.title)+' · '+(project?.primary||workspace.path));
                closeMenu();return;
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
          if (request.manage) return h(Manager,{key:request.sequence,initialProject:request.add?{title:'',folders:[],primary:''}:null,initialOpen:true,hiddenLauncher:true,onClose:closeMenu});
          if (editor) return h(Manager,{key:request.sequence,...editor,initialProject:editor.project,initialOpen:true,hiddenLauncher:true,onClose:closeMenu});
          const item = (key,label=key) => h('button',{key,type:'button',role:'menuitem',disabled:busy,onClick:()=>run(key),className:key==='remove'?'dpm-danger':undefined},t(label));
          return h('div',{className:'dpm'},h('style',null,css),h('div',{ref:menu,className:'dpm-menu',role:'menu','aria-label':t('title'),style:position,onKeyDown:keyboard},
            h('div',{className:'dpm-menu-title'},request.workspace.title),
            ...(request.ellipsis ? [item('manage'),item('openFolder'),h('div',{key:'separator',className:'dpm-menu-separator',role:'separator'}),item('edit','rename')] : [item('edit'),item('primary','setPrimary'),item('openFolder')]),item('copy'),item('bind'),item('newChat'),
            h('div',{className:'dpm-menu-separator',role:'separator'}),item('more'),item('remove',request.ellipsis?'deleteWorkspace':'remove'),error&&h('div',{className:'dpm-error',role:'alert'},error)));
        }
        function ExperienceOverlay() {
          useSyncExternalStore(noticeSource.subscribe,noticeSource.getSnapshot);
          const sessions=useSyncExternalStore(ctx.sessions.list.subscribe,ctx.sessions.list.getSnapshot);
          const active=Object.values(sessions.byId).some(s=>(s.retainedBy.mainView??0)>0);
          const [retrying,setRetrying]=useState(false);
          return h('div',{className:'dpm'},h('style',null,css),
            !active&&h('button',{className:'dpm-browse dpm-mini',onClick:()=>publishTree({manage:true,sequence:++requestSequence})},t('title')),
            (notice||syncWarnings.length>0)&&h('div',{className:'dpm-global'},
              notice&&h('div',{role:notice.error?'alert':'status'},notice.text),
              syncWarnings.length>0&&h('div',{role:'status'},h('p',null,t('syncWarning')+': '+syncWarnings.map(w=>typeof w==='string'?w:JSON.stringify(w)).join('\n')),
                h('button',{className:'dpm-mini',disabled:retrying,onClick:async()=>{setRetrying(true);try{await call(undefined,{action:'list'});}catch(e){announce(e.message,true);}finally{setRetrying(false);}}},t('retrySync'))),
              notice&&h('button',{className:'dpm-mini','aria-label':t('close'),onClick:dismissNotice},'×')));
        }
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({name:'conversation.composer.dock',id:'dsh-workdock-dock',order:10,inject:sessionId=>({sessionId,dock:true})}, Manager));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-tree-menu',order:20}, TreeOverlay));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-primary-tooltip',order:19}, PrimaryDirectoryTooltip));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-experience',order:21}, ExperienceOverlay));
      }
    };
  }
});
