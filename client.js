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
.dpm .dpm-dock{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:none;width:24px;height:24px;padding:3px;border:0;border-radius:5px;color:var(--dsw-alias-label-secondary,#aaa);vertical-align:middle}.dpm-dock svg{width:16px;height:16px;pointer-events:none}.dpm .dpm-dock:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:2px}
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
.dpm-removed-folder{font-size:11px;line-height:1.45;margin-top:6px;color:var(--dsw-alias-label-secondary,#aaa);overflow-wrap:anywhere}.dpm .dpm-removed-folder .dpm-undo{font-size:11px;line-height:16px;padding:2px 6px}
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
    // A workspace index, not a marketing dashboard: inherit Harness typography and
    // theme, reserve blue for current/pinned state, and give paths the most room.
    const pageCss = `
.dpm-page{box-sizing:border-box;display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;height:100%;padding:calc(24px + var(--dsh-frame-top-clearance,0px)) 28px 24px max(28px,var(--dsh-frame-leading-clearance,0px));color:var(--dsw-alias-text-primary,#eee);background:var(--dsw-alias-bg-base,#292929)}
.dpm-page-content{display:flex;flex:1;flex-direction:column;min-height:0;min-width:0}.dpm-table tr.dpm-card{border-radius:0;padding:0;border:0}.dpm-page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}.dpm-page h1{font-weight:600;font-size:22px;line-height:1.3;margin:0}.dpm-page-header p{margin:5px 0 0}.dpm-page-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.dpm-page-toolbar input{flex:1;min-width:160px;max-width:540px}.dpm-page-toolbar label{display:flex;align-items:center;gap:8px;font-size:12px}.dpm-page-toolbar .dpm-save{margin-left:auto}
.dpm-table-scroll{flex:1;min-height:0;overflow:auto;border-top:1px solid var(--dsw-alias-border-l3,#555);border-bottom:1px solid var(--dsw-alias-border-l3,#555)}.dpm-table{width:100%;border-collapse:collapse;text-align:left;font-size:13px}.dpm-table th{position:sticky;top:0;z-index:1;background:var(--dsw-alias-bg-base,#292929);font-weight:500;font-size:12px;color:var(--dsw-alias-label-secondary,#aaa);padding:11px 12px;border-bottom:1px solid var(--dsw-alias-border-l3,#555)}.dpm-table td{padding:13px 12px;vertical-align:top;border-bottom:1px solid var(--dsw-alias-border-l3,#555)}.dpm-table tr:last-child td{border-bottom:0}.dpm-table tbody tr:hover{background:var(--dsw-alias-bg-hover,#ffffff09)}.dpm-table td:first-child{min-width:140px;max-width:240px;overflow-wrap:anywhere}.dpm-table strong{font-weight:600}.dpm-table .dpm-path{min-width:180px;max-width:460px;opacity:.8;margin:0;line-height:1.6}.dpm-table .dpm-count{white-space:nowrap}.dpm-table .dpm-actions{min-width:230px;max-width:330px}.dpm-table .dpm-row{gap:4px}.dpm-table .dpm-row button{font-size:12px;padding:3px 7px}.dpm-table .dpm-badge{display:inline-block}.dpm-table-empty{text-align:center;padding:48px 16px!important}
.dpm-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:14px;font-size:12px}.dpm-pagination label,.dpm-pagination nav{display:flex;align-items:center;gap:8px}.dpm-page :is(button,input,select):focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:2px}.dpm-page .dpm-error{margin:6px 0}.dpm-page-nav{display:flex;align-items:center;gap:8px;width:100%;text-align:left}
@media(max-width:700px){.dpm-page{padding:16px 12px}.dpm-page-header{align-items:flex-start;margin-bottom:14px}.dpm-page h1{font-size:18px}.dpm-page-toolbar input{max-width:none}.dpm-page-toolbar .dpm-save{margin-left:0}.dpm-pagination{gap:10px}.dpm-table td,.dpm-table th{padding:10px 8px}}
`;
    const palette = {red:'#e27676',orange:'#df994f',yellow:'#c2ad44',green:'#64ae85',blue:'#6d9fe0',purple:'#ae8bda'};
    const isHexColor = color => typeof color==='string' && color.length===7 && /^#[0-9a-f]{6}$/i.test(color);
    const colorValue = color => palette[color] || (isHexColor(color)?color:undefined);
    const colorCss = `
[data-dpm-label-color] > span[class*="_title"],[data-dpm-label-color] > span[class*="_projectText"] > span[class*="_title"]{color:var(--dpm-label-color)!important}
.dpm-color-dot{display:inline-block;width:9px;height:9px;flex:none;border-radius:50%;background:var(--dpm-color,transparent);border:1px solid currentColor;box-sizing:border-box;vertical-align:middle;margin-right:7px}.dpm-sidebar-color{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#aaa);border-radius:5px;cursor:pointer}.dpm-sidebar-color .dpm-color-dot{margin:0}.dpm-sidebar-color:hover{background:var(--dsw-alias-bg-hover,#ffffff15)}.dpm-sidebar-color:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:-2px}.dpm-color-menu button[aria-checked=true]{background:var(--dsw-alias-bg-hover,#ffffff15)}
.dpm-color-custom{display:grid;gap:7px;margin:4px 6px;padding:9px 0 2px;border-top:1px solid var(--dsw-alias-border-l3,#555);font-size:12px}.dpm-color-inputs{display:grid;grid-template-columns:30px minmax(0,1fr);align-items:center;gap:7px}.dpm-color-custom input{height:30px;padding:4px 7px;border-radius:5px;min-width:0;font-size:12px}.dpm-color-custom input[type=color]{padding:2px;cursor:pointer}.dpm-color-custom input:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:1px}.dpm-color-custom input[aria-invalid=true]{border-color:#ef8880}.dpm-color-hint{font-size:11px;color:var(--dsw-alias-label-secondary,#aaa)}.dpm-color-custom button{border:1px solid var(--dsw-alias-border-l3,#555);padding:3px 8px;text-align:center}
`;
    const turnCss = `
.dpm-turn-hidden{display:block!important}.dpm-turn-hidden:not(.dpm-turn-placeholder){height:0!important;min-height:0!important;margin-block:0!important;padding-block:0!important;border-block-width:0!important;overflow:hidden!important}.dpm-turn-hidden > :not(.dpm-turn-restore){display:none!important}
.dpm-turn-placeholder{margin-block:0!important;padding-block:0!important}.dpm-turn-restore{display:flex;align-items:center;gap:8px;min-height:22px;padding:0;margin:0;color:var(--dsw-alias-label-secondary,#aaa);font-size:12px;line-height:22px}.dpm-turn-restore button,.dpm-turn-action{font:inherit;color:var(--dsw-alias-label-secondary,#aaa);background:transparent;border:0;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px}.dpm-turn-restore button:hover,.dpm-turn-action:hover{background:var(--dsw-alias-bg-hover,#ffffff15)}.dpm-turn-restore button:focus-visible,.dpm-turn-action:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:2px}
.dpm-turn-restore button{padding:0 4px;line-height:22px}.dpm-turn-action-seat{display:inline-flex;align-items:center;flex:none}.dpm-turn-hide-button{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:4px;flex:none}.dpm-turn-hide-button:disabled{opacity:.4;cursor:default}.dpm-turn-restore-all{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:24px;height:24px;padding:4px;flex:none;vertical-align:middle}
`;
    const directoryCss = `
.dpm-directory-button{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:24px;height:24px;padding:3px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary,#aaa);cursor:pointer;vertical-align:middle;flex:none}.dpm-directory-button .dpm-folder-icon{width:16px;height:16px;opacity:1}.dpm-directory-button[data-override=true]{color:var(--dsw-alias-state-business-primary,#8bb6ed)}.dpm-directory-button:hover{background:var(--dsw-alias-bg-hover,#ffffff15)}.dpm-directory-button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:2px}.dpm-directory-button:disabled{opacity:.4;cursor:default}.dpm-directory-mode{display:flex;align-items:center;gap:9px;margin:12px 0;cursor:pointer}.dpm .dpm-directory-mode input{width:auto;margin:0;accent-color:var(--dsw-alias-state-business-primary,#8bb6ed)}.dpm-directory-summary{padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l3,#444);font-size:12px}.dpm-directory-path{display:block;overflow-wrap:anywhere;margin:6px 0;line-height:1.5}.dpm .dpm-directory-folders{width:100%;max-width:100%;margin:0 0 8px}.dpm-directory-selected{font-size:12px;overflow-wrap:anywhere;line-height:1.6}.dpm .dpm-directory-note{margin:12px 0 0;line-height:1.6}.dpm .dpm-directory-restore{margin-right:auto}.dpm .dpm-directory-policy{display:grid;gap:8px;margin-top:14px;font-size:12px}.dpm-directory-policy select{max-width:100%}
`;
    const css = baseCss + folderCss + compactCss + pageCss + colorCss + turnCss + directoryCss;
    const zh = { title:'项目管理', edit:'编辑项目', add:'添加项目', name:'项目名称', folders:'源文件夹', primary:'主要目录', addFolder:'添加文件夹', path:'输入绝对目录路径', save:'保存', cancel:'取消', close:'关闭', remove:'移除本地项目', removeFolder:'移除', bind:'用于当前聊天', active:'当前项目', pin:'置顶', unpin:'取消置顶', newChat:'新建会话', empty:'暂无项目，添加项目后可设置多个源目录。', needSession:'请先打开或创建一个聊天，再管理项目。', note:'保存后立即用于当前聊天。后续修改与新命令默认使用主要目录；其他源目录作为只读参考。已运行的终端进程保留原目录。', removeConfirm:'仅移除项目配置，不删除磁盘文件。确认移除？', reload:'刷新', conflict:'操作失败', browse:'选择目录' };
    const en = { title:'Projects', edit:'Edit project', add:'Add project', name:'Project name', folders:'Source folders', primary:'Primary', addFolder:'Add folder', path:'Absolute directory path', save:'Save', cancel:'Cancel', close:'Close', remove:'Remove project', removeFolder:'Remove', bind:'Use in this chat', active:'Current project', pin:'Pin', unpin:'Unpin', newChat:'New session', empty:'No projects. Add one to configure its source folders.', needSession:'Open or create a chat before managing projects.', note:'Subsequent edits and new commands use the primary directory. Other folders are read-only references. Existing terminal processes keep their cwd.', removeConfirm:'Remove project settings? Files on disk will be kept.', reload:'Refresh', conflict:'Operation failed', browse:'Choose directory' };
    Object.assign(zh,{more:'更多…',treeOrderUnavailable:'当前宿主不支持项目排序，请升级 Harness。',treeProjectUnavailable:'项目已不存在，请刷新后重试。',nativeUnavailable:'宿主项目菜单不可用，请使用项目行上的更多按钮。',removeTreeConfirm:'从左侧项目树移除此项目及目录配置？磁盘文件和聊天记录会保留。'});
    Object.assign(en,{more:'More…',treeOrderUnavailable:'This host does not support workspace ordering. Update Harness.',treeProjectUnavailable:'This project no longer exists. Refresh and try again.',nativeUnavailable:'The host project menu is unavailable. Use the project row menu button.',removeTreeConfirm:'Remove this project and its directory settings from the sidebar? Files and chat history will be kept.'});
    Object.assign(zh,{manage:'项目管理',openFolder:'在资源管理器中打开',rename:'重命名',deleteWorkspace:'删除工作区'});
    Object.assign(en,{manage:'Project management',openFolder:'Open folder in file manager',rename:'Rename',deleteWorkspace:'Delete workspace'});
    Object.assign(zh,{setPrimaryButton:'设为主要目录',saveNote:'保存后关联当前聊天；会话专属目录优先于项目主要目录。'});
    Object.assign(en,{setPrimaryButton:'Set as primary',saveNote:'Saving associates this chat with the project. A session directory takes priority over the project primary.'});
    Object.assign(en,{discard:'Discard unsaved changes?',search:'Search projects',noResults:'No matching projects.',sort:'Sort projects',orderName:'Name',orderRecent:'Recently used',copy:'Copy primary path',copied:'Path copied',clipboardUnavailable:'Clipboard is unavailable.',undo:'Undo',removedFolder:'Folder removed',bound:'Project applied',syncWarning:'Sidebar sync needs attention',retrySync:'Retry sidebar sync'});
    Object.assign(zh,{discard:'放弃未保存的修改？',search:'搜索项目',noResults:'没有匹配的项目。',sort:'项目排序',orderName:'名称',orderRecent:'最近使用',copy:'复制主要目录路径',copied:'已复制路径',clipboardUnavailable:'剪贴板不可用。',undo:'撤销',removedFolder:'已移除目录',bound:'已应用项目',syncWarning:'侧边栏同步需要重试',retrySync:'重试侧边栏同步'});
    Object.assign(zh,{needSession:'请先打开或创建一个聊天，再添加、编辑或切换项目。'});
    Object.assign(en,{needSession:'Open or create a chat to add, edit or apply a project.'});
    Object.assign(zh,{backToChat:'返回聊天',pageHint:'集中管理项目与工作目录',projectCount:'项目总数',folderCount:'源目录数',actions:'操作',pageSize:'每页',previousPage:'上一页',nextPage:'下一页',pageStatus:'第 {page} / {pages} 页，共 {count} 个项目',loading:'正在加载项目…'});
    Object.assign(en,{backToChat:'Back to chat',pageHint:'Manage projects and working directories',projectCount:'Total projects',folderCount:'Folders',actions:'Actions',pageSize:'Per page',previousPage:'Previous page',nextPage:'Next page',pageStatus:'Page {page} / {pages}, {count} projects',loading:'Loading projects…'});
    Object.assign(zh,{colorLabel:'颜色标记',colorNone:'无颜色',colorSaved:'颜色标记已更新',colorCustom:'自定义颜色',colorPicker:'选择自定义颜色',colorHex:'HEX 色值',colorHexHint:'格式：#RRGGBB，如 #FF8800',colorApply:'应用',red:'红色',orange:'橙色',yellow:'黄色',green:'绿色',blue:'蓝色',purple:'紫色'});
    Object.assign(en,{colorLabel:'Color label',colorNone:'No color',colorSaved:'Color label updated',colorCustom:'Custom color',colorPicker:'Choose custom color',colorHex:'HEX color',colorHexHint:'Format: #RRGGBB, e.g. #FF8800',colorApply:'Apply',red:'Red',orange:'Orange',yellow:'Yellow',green:'Green',blue:'Blue',purple:'Purple'});
    Object.assign(zh,{hideTurn:'隐藏本轮',hiddenTurn:'本轮对话已隐藏',restoreTurn:'恢复显示',restoreTurns:'恢复全部隐藏轮次',hideTurnNote:'仅在当前浏览器隐藏；原始历史和模型上下文不变，不减少上下文用量。',hideStorageError:'无法保存隐藏状态，请检查浏览器本地存储权限。'});
    Object.assign(en,{hideTurn:'Hide turn',hiddenTurn:'This turn is hidden',restoreTurn:'Show turn',restoreTurns:'Show all hidden turns',hideTurnNote:'Hidden only in this browser. History and model context are unchanged; context usage is not reduced.',hideStorageError:'Cannot save hidden turns. Check browser local storage permissions.'});
    Object.assign(zh,{sessionDirectory:'会话工作目录',setSessionDirectory:'设置工作目录…',directoryFollow:'跟随项目目录',directoryCustom:'会话专属目录',directoryInitial:'会话初始目录',directoryCurrent:'当前生效目录',directoryChoose:'选择其他目录…',directoryPick:'选择会话工作目录',directorySaved:'会话工作目录已更新，对后续操作生效',directoryNote:'仅影响当前会话后续操作；其他会话、项目主要目录及已运行进程不变。选择其他目录不会自动获得额外访问权限。',directoryOutside:'该目录不在项目源目录中；实际访问仍受 Harness 权限和沙箱策略限制。',directoryLoading:'正在读取工作目录…',directoryRestore:'恢复跟随项目',directorySwitch:'切换项目时如何处理会话专属目录？',directoryKeep:'保留会话专属目录',directoryPolicy:'请选择处理方式',directoryRetry:'重新读取目录',directorySource:'来源'});
    Object.assign(en,{sessionDirectory:'Session working directory',setSessionDirectory:'Set working directory…',directoryFollow:'Follow project directory',directoryCustom:'Session-specific directory',directoryInitial:'Initial session directory',directoryCurrent:'Effective directory',directoryChoose:'Choose another directory…',directoryPick:'Choose session working directory',directorySaved:'Session working directory updated for subsequent work',directoryNote:'Only subsequent work in this session changes. Other sessions, the project primary and running processes are unchanged. Choosing a directory does not grant additional access.',directoryOutside:'This directory is outside the project folders. Harness permissions and sandbox rules still apply.',directoryLoading:'Loading working directory…',directoryRestore:'Follow project again',directorySwitch:'How should the session directory change with this project?',directoryKeep:'Keep session-specific directory',directoryPolicy:'Choose how to proceed',directoryRetry:'Reload directory',directorySource:'Source'});
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
      inject: ['slots', 'layout', 'remote', 'remote.directoryPicker', 'sessions', 'workspaces', 'uiWorkspace', 'locale', 'contextMenus'],
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
        // Presentation-only preferences: never touch Session events, model surfaces,
        // summaries or host persistence. Store identities only, not message text.
        const HIDDEN_TURNS_KEY='dsh-workdock-hidden-turns:v1:';
        const validTurn=value=>typeof value==='string'&&/^(0|[1-9]\d*)$/.test(value)&&Number.isSafeInteger(Number(value));
        const hiddenTurns=new Map(),hiddenListeners=new Set();
        let hiddenVersion=0,refreshHiddenTurns=()=>{};
        const hiddenSource={subscribe(fn){hiddenListeners.add(fn);return()=>hiddenListeners.delete(fn);},getSnapshot:()=>hiddenVersion};
        const hiddenKey=sessionId=>HIDDEN_TURNS_KEY+encodeURIComponent(sessionId);
        function readHiddenTurns(sessionId){
          try{const value=JSON.parse(localStorage.getItem(hiddenKey(sessionId))||'[]');return new Set(Array.isArray(value)?value.filter(validTurn):[]);}catch{return new Set();}
        }
        function turnsFor(sessionId){if(!hiddenTurns.has(sessionId))hiddenTurns.set(sessionId,readHiddenTurns(sessionId));return hiddenTurns.get(sessionId);}
        function publishHiddenTurns(){hiddenVersion++;refreshHiddenTurns();for(const fn of hiddenListeners)fn();}
        function changeHiddenTurns(sessionId,turn,hidden){
          if(!sessionId||(turn!==null&&!validTurn(String(turn))))return;
          // Re-read before writes so another tab's unrelated hidden turns survive.
          const next=readHiddenTurns(sessionId);
          if(turn===null)next.clear();else if(hidden)next.add(String(turn));else next.delete(String(turn));
          try{if(next.size)localStorage.setItem(hiddenKey(sessionId),JSON.stringify([...next]));else localStorage.removeItem(hiddenKey(sessionId));}
          catch{announce(t('hideStorageError'),true);return;}
          hiddenTurns.set(sessionId,next);publishHiddenTurns();return true;
        }
        function HideTurn({turn}){
          const {createPortal}=require('react-dom');
          // turnTail receives a scoped Turn location, not the numeric DOM turn.
          // Keep numeric owners working for older hosts and lightweight previews.
          const turnId=turn!==null&&typeof turn==='object'?turn.turn:turn;
          const origin=useRef(null),[target,setTarget]=useState(null);
          useEffect(()=>{
            // The public turnTail slot sits above the native action row. Portal
            // only our own control; never move React-owned native buttons/time.
            const tail=origin.current?.closest('[data-turn-tail]');if(!tail)return;
            const mount=document.createElement('span');mount.className='dpm-turn-action-seat';
            const sync=()=>{
              const row=[...tail.querySelectorAll('[data-clock="end"]')].find(node=>node.closest('[data-turn-tail]')===tail);
              const endInfo=row?.lastElementChild,clock=endInfo?.lastElementChild;
              if(endInfo?.tagName==='SPAN'&&[...endInfo.classList].some(name=>name.endsWith('_endInfo'))&&clock?.tagName==='SPAN'&&[...clock.classList].some(name=>name.endsWith('_timeEnd'))){
                if(mount.parentNode!==endInfo||mount.nextSibling!==clock)endInfo.insertBefore(mount,clock);
                setTarget(current=>current===mount?current:mount);
              }else{mount.remove();setTarget(current=>current===null?current:null);}
            };
            const observer=new MutationObserver(sync);observer.observe(tail,{childList:true,subtree:true});sync();
            return()=>{observer.disconnect();mount.remove();};
          },[]);
          const button=h('button',{type:'button',className:'dpm-turn-action dpm-turn-hide-button','data-dpm-hide-turn':turnId,disabled:!validTurn(String(turnId)),'aria-label':t('hideTurn'),title:`${t('hideTurn')} — ${t('hideTurnNote')}`,onClick:event=>{
            const occurrence=event.currentTarget.closest('[data-conversation-session]');
            const sessionId=occurrence?.getAttribute('data-conversation-session');
            if(changeHiddenTurns(sessionId,turnId,true)){
              const first=[...occurrence.querySelectorAll('.dpm-turn-placeholder')].find(node=>node.getAttribute('data-chat-turn')===String(turnId)&&node.closest('[data-conversation-session]')===occurrence);
              first?.querySelector('.dpm-turn-restore button')?.focus();
            }
          }},h('svg',{width:16,height:16,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},h('path',{d:'m3 3 18 18M10.58 10.58a2 2 0 0 0 2.84 2.84M9.88 5.09A10.94 10.94 0 0 1 12 5c5.5 0 9 7 9 7a17 17 0 0 1-3.42 4.42M6.53 6.53A18.35 18.35 0 0 0 3 12s3.5 7 9 7a10.94 10.94 0 0 0 5.47-1.53'})));
          return h(React.Fragment,null,h('span',{ref:origin,hidden:true,'data-dpm-turn-origin':''}),target?createPortal(button,target):null);
        }
        function RestoreHiddenTurns({sessionId}){
          useSyncExternalStore(hiddenSource.subscribe,hiddenSource.getSnapshot);
          const count=sessionId?turnsFor(sessionId).size:0;
          const label=`${t('restoreTurns')} (${count})`;
          return count?h('button',{type:'button',className:'dpm-turn-action dpm-turn-restore-all',title:label,'aria-label':label,onClick:()=>changeHiddenTurns(sessionId,null,false)},h('svg',{width:16,height:16,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},h('path',{d:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z'}),h('circle',{cx:12,cy:12,r:3}))):null;
        }
        ctx.effect(()=>{
          const marked=new Set(),restores=new Map(),hiddenChildren=new Map();
          const style=document.createElement('style');style.textContent=turnCss;document.head.append(style);
          const clean=node=>{
            node.classList.remove('dpm-turn-hidden','dpm-turn-placeholder');restores.get(node)?.remove();restores.delete(node);
            for(const child of hiddenChildren.get(node)??[])child.removeAttribute('hidden');hiddenChildren.delete(node);
          };
          const options={childList:true,subtree:true,attributes:true,attributeFilter:['data-chat-turn','data-conversation-session','class']};
          const observer=new MutationObserver(sync);
          function sync(){
            observer.disconnect();
            try{
              const current=new Set();
              for(const occurrence of document.querySelectorAll('[data-conversation-session][data-conversation-region="chat"]')){
                const sessionId=occurrence.getAttribute('data-conversation-session');if(!sessionId)continue;
                const hidden=turnsFor(sessionId),groups=new Map();
                for(const node of occurrence.querySelectorAll('[data-chat-turn][data-chat-flow-key]')){
                  // Embedded conversations and nested process members own separate
                  // seats. Only hide outer seats within this exact occurrence.
                  if(node.closest('[data-conversation-session]')!==occurrence||node.closest('[data-conversation-region]')!==occurrence)continue;
                  const turn=node.getAttribute('data-chat-turn');if(!validTurn(turn))continue;
                  const parent=node.parentElement?.closest('[data-chat-turn]');
                  if(parent&&occurrence.contains(parent)&&parent.getAttribute('data-chat-turn')===turn)continue;
                  if(!groups.has(turn))groups.set(turn,[]);groups.get(turn).push(node);
                }
                for(const [turn,nodes] of groups){
                  for(const [index,node] of nodes.entries()){
                    if(!hidden.has(turn)){if(marked.has(node))clean(node);continue;}
                    current.add(node);if(!node.classList.contains('dpm-turn-hidden'))node.classList.add('dpm-turn-hidden');
                    const first=index===0;if(node.classList.contains('dpm-turn-placeholder')!==first)node.classList.toggle('dpm-turn-placeholder',first);
                    // Keep outer seats in flow with zero-height boxes so native
                    // binary-search scrolling still sees monotonic positions.
                    // Native anchor queries exclude [hidden] descendants.
                    let children=hiddenChildren.get(node);if(!children){children=new Set();hiddenChildren.set(node,children);}
                    for(const child of children)if(child.parentElement!==node){child.removeAttribute('hidden');children.delete(child);}
                    for(const child of node.children)if(child!==restores.get(node)&&!child.hasAttribute('hidden')){child.setAttribute('hidden','');children.add(child);}
                    if(!first){restores.get(node)?.remove();restores.delete(node);continue;}
                    let control=restores.get(node);
                    if(!control){control=document.createElement('div');control.className='dpm-turn-restore';const label=document.createElement('span'),button=document.createElement('button');button.type='button';control.append(label,button);restores.set(node,control);}
                    if(control.firstChild.textContent!==t('hiddenTurn'))control.firstChild.textContent=t('hiddenTurn');
                    const button=control.lastChild;if(button.textContent!==t('restoreTurn'))button.textContent=t('restoreTurn');button.title=t('hideTurnNote');button.onclick=()=>{
                      if(changeHiddenTurns(sessionId,turn,false))occurrence.querySelector(`[data-dpm-hide-turn="${turn}"]`)?.focus();
                    };
                    if(control.parentElement!==node)node.append(control);
                  }
                }
              }
              for(const node of marked)if(!current.has(node))clean(node);
              marked.clear();for(const node of current)marked.add(node);
            }finally{observer.observe(document.body,options);}
          }
          function storage(event){if(event.key===null||event.key.startsWith(HIDDEN_TURNS_KEY)){hiddenTurns.clear();publishHiddenTurns();}}
          refreshHiddenTurns=sync;window.addEventListener('storage',storage);sync();
          return()=>{refreshHiddenTurns=()=>{};observer.disconnect();window.removeEventListener('storage',storage);for(const node of marked)clean(node);marked.clear();style.remove();};
        });
        let projectCache = [];
        let projectVersion = 0;
        const projectListeners = new Set();
        const projectSource = {subscribe(fn){projectListeners.add(fn);return()=>projectListeners.delete(fn);},getSnapshot:()=>projectVersion};
        let colorCache = {}, colorRequest = null, colorVersion = 0;
        const colorListeners = new Set();
        const colorSource = {subscribe(fn){colorListeners.add(fn);return()=>colorListeners.delete(fn);},getSnapshot:()=>colorVersion};
        function publishColor(request){colorRequest=request;colorVersion++;for(const fn of colorListeners)fn();}
        const workspaceColorTarget = workspace => {const project=matchingProject(workspace);return project?{target:'project',id:project.id}:{target:'workspace',id:workspace.workspaceId};};
        const colorFor = target => colorCache[`${target.target}:${target.id}`] ?? null;
        function openColor(target,trigger,position){
          const rect=position?null:trigger.getBoundingClientRect();
          publishColor({...target,trigger,x:position?.left??rect.left,y:position?.top??rect.bottom});
        }
        function ColorDot({color}){return h('span',{className:'dpm-color-dot',style:{'--dpm-color':colorValue(color)},'aria-hidden':true});}
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
        async function openNewSession(workspaceId,beforeOpen) {
          // startSession is fire-and-forget and may reuse a blank session. Closing
          // the main panel immediately after it also aborts its pending navigation.
          const sessionId=await ctx.sessions.create({workspaceId});
          beforeOpen();
          ctx.layout.selectPanel(null);
          ctx.uiWorkspace.openSession(sessionId);
        }
        // Reorder the host model, not its virtualized DOM: this moves each native
        // workspace together with its sessions, expansion and keyboard state.
        const TREE_PINS_KEY='dsh-workdock-pinned-workspaces',TREE_ORDER_KEY='dsh-workdock-workspace-unpinned-order';
        function readWorkspaceIds(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&id.length>0&&id.length<=500))]:[];}catch{return [];}}
        let treePins=readWorkspaceIds(TREE_PINS_KEY),treeOrderBusy=false,treeOrderDisposed=false,reconcileTreePins=()=>{};
        const treePinListeners=new Set();
        const treePinSource={subscribe(fn){treePinListeners.add(fn);return()=>treePinListeners.delete(fn);},getSnapshot:()=>treePins};
        const workspaceIds=()=>ctx.workspaces.list.getSnapshot().items.map(w=>w.workspaceId);
        function pinnedOrder(ids,pins){const valid=pins.filter(id=>ids.includes(id));return [...valid,...ids.filter(id=>!valid.includes(id))];}
        async function applyWorkspaceOrder(order){
          if(typeof ctx.workspaces.insertBefore!=='function')throw new Error(t('treeOrderUnavailable'));
          for(let i=0;i<order.length;i++){
            if(treeOrderDisposed)return;
            const current=workspaceIds();
            if(!current.includes(order[i])||current[i]===order[i])continue;
            await ctx.workspaces.insertBefore(order[i],current[i]);
          }
        }
        async function setTreePin(id,pinned){
          if(treeOrderBusy||treeOrderDisposed)return;
          if(typeof ctx.workspaces.insertBefore!=='function')throw new Error(t('treeOrderUnavailable'));
          const original=workspaceIds();if(!original.includes(id))throw new Error(t('treeProjectUnavailable'));
          const next=pinned?[id,...treePins.filter(value=>value!==id)]:treePins.filter(value=>value!==id);
          const previousPins=localStorage.getItem(TREE_PINS_KEY),previousOrder=localStorage.getItem(TREE_ORDER_KEY);
          const baseline=treePins.length?readWorkspaceIds(TREE_ORDER_KEY):original;
          const desired=pinnedOrder(original,next);
          if(!pinned){
            desired.splice(desired.indexOf(id),1);
            const anchor=baseline.slice(baseline.indexOf(id)+1).find(value=>desired.includes(value)&&!next.includes(value));
            desired.splice(anchor?desired.indexOf(anchor):desired.length,0,id);
          }
          treeOrderBusy=true;
          try{
            // Validate storage before any remote write; publish the new state only
            // after the authoritative native reorder has succeeded.
            localStorage.setItem(TREE_ORDER_KEY,JSON.stringify(baseline));
            localStorage.setItem(TREE_PINS_KEY,JSON.stringify(next));
            await applyWorkspaceOrder(desired);
            if(!treeOrderDisposed){treePins=next;for(const fn of treePinListeners)fn();}
          }catch(error){
            try{if(previousOrder===null)localStorage.removeItem(TREE_ORDER_KEY);else localStorage.setItem(TREE_ORDER_KEY,previousOrder);if(previousPins===null)localStorage.removeItem(TREE_PINS_KEY);else localStorage.setItem(TREE_PINS_KEY,previousPins);}catch{/* Preserve the original failure when storage itself is unavailable. */}
            try{if(original.join('\0')!==workspaceIds().join('\0'))await applyWorkspaceOrder(original);}catch{/* Host reports rollback failure through its own state; never publish a successful pin. */}
            throw error;
          }finally{treeOrderBusy=false;reconcileTreePins();}
        }
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
            return row && row.querySelector('button:not(.dpm-sidebar-color)') === button ? row : null;
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
              nativeMenu: row.querySelector('button:not(.dpm-sidebar-color)'),
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
        const directoryCache=new Map(),directoryEpochs=new Map(),directoryListeners=new Set();
        let directoryVersion=0,directoryRequest=null;
        const directorySource={subscribe(fn){directoryListeners.add(fn);return()=>directoryListeners.delete(fn);},getSnapshot:()=>directoryVersion};
        function publishDirectory(){directoryVersion++;for(const fn of directoryListeners)fn();}
        function openSessionDirectory(sessionId,trigger){
          if(!sessionId)return;
          const sessions=ctx.sessions.list.getSnapshot().byId;
          if(!(sessions[sessionId]?.retainedBy?.mainView>0))ctx.uiWorkspace.openSession(sessionId);
          directoryRequest={sessionId,trigger};publishDirectory();
        }
        async function call(sessionId, args) {
          const directoryRead=sessionId&&['list','get_session_directory','set_session_directory'].includes(args.action);
          const directoryEpoch=directoryRead?(directoryEpochs.get(sessionId)||0)+1:0;
          if(directoryRead)directoryEpochs.set(sessionId,directoryEpoch);
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
          if(sessionId&&value.sessionDirectory&&(directoryEpochs.get(sessionId)===directoryEpoch||args.action==='set_session_directory')){
            if(args.action==='set_session_directory')directoryEpochs.set(sessionId,(directoryEpochs.get(sessionId)||0)+1);
            directoryCache.set(sessionId,value.sessionDirectory);publishDirectory();
          }
          if(['list','save','bind'].includes(args.action))updateWarnings(value.syncWarnings||[]);
          if(args.action==='list')projectCache=value.projects;
          if(args.action==='list'||args.action==='set_color') {colorCache=value.colors||{};colorVersion++;for(const fn of colorListeners)fn();}
          else if(args.action==='save'&&value.project)projectCache=[...projectCache.filter(p=>p.id!==value.project.id),value.project];
          else if(args.action==='remove')projectCache=projectCache.filter(p=>p.id!==args.id);
          if(args.action==='remove'){delete colorCache[`project:${args.id}`];colorVersion++;for(const fn of colorListeners)fn();}
          if(['save','bind','remove'].includes(args.action)){projectVersion++;for(const fn of projectListeners)fn();}
          refreshNativeCards();
          if(hover){const project=matchingProject(hover.workspace);publishHover(project?{...hover,project}:null);}
          return value;
        }
        function SessionDirectoryButton({sessionId}){
          useSyncExternalStore(directorySource.subscribe,directorySource.getSnapshot);
          const version=useSyncExternalStore(projectSource.subscribe,projectSource.getSnapshot);
          const [error,setError]=useState('');
          useEffect(()=>{
            let alive=true;
            const refresh=()=>{if(sessionId)call(sessionId,{action:'get_session_directory'}).then(()=>{if(alive)setError('');}).catch(e=>{if(alive)setError(e.message);});};
            refresh();window.addEventListener('focus',refresh);
            return()=>{alive=false;window.removeEventListener('focus',refresh);};
          },[sessionId,version]);
          const info=directoryCache.get(sessionId),source=info?.source==='session'?'directoryCustom':info?.source==='project'?'directoryFollow':'directoryInitial';
          const title=t('sessionDirectory')+'\n'+(error||info?.validationError||(!info?t('directoryLoading'):(info.effectivePath||'—')+'\n'+t('directorySource')+': '+t(source)));
          return h('button',{type:'button',className:'dpm-directory-button',disabled:!sessionId,title,'aria-label':t('sessionDirectory'),'aria-haspopup':'dialog','data-override':info?.source==='session',onClick:e=>openSessionDirectory(sessionId,e.currentTarget)},h(FolderIcon));
        }
        function SessionDirectoryOverlay(){
          useSyncExternalStore(directorySource.subscribe,directorySource.getSnapshot);
          const request=directoryRequest,dialog=useRef(null),current=useRef(request),lock=useRef(false);current.current=request;
          const [info,setInfo]=useState(null),[path,setPath]=useState(null),[mode,setMode]=useState('follow'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
          const dirty=Boolean(info)&&((mode==='custom'?path:null)!==info.path);
          const close=(force=false)=>{
            if(lock.current)return;
            if(!force&&dirty&&!window.confirm(t('discard')))return;
            directoryRequest=null;publishDirectory();request?.trigger?.focus({preventScroll:true});
          };
          async function load(target=request){
            if(!target||lock.current)return;
            lock.current=true;setLoading(true);setError('');
            try{
              const value=await call(target.sessionId,{action:'get_session_directory'});
              if(current.current!==target)return;
              if(!value.sessionDirectory)throw new Error(t('needSession'));
              setInfo(value.sessionDirectory);setPath(value.sessionDirectory.path);setMode(value.sessionDirectory.path?'custom':'follow');setError(value.sessionDirectory.validationError||'');
            }catch(e){if(current.current===target)setError(e.message);}
            finally{if(current.current===target){lock.current=false;setLoading(false);}}
          }
          useEffect(()=>{
            current.current=request;setInfo(null);setPath(null);setMode('follow');setError('');setBusy(false);setLoading(false);lock.current=false;
            if(request){load(request);dialog.current?.focus();}
            return()=>{current.current=null;};
          },[request]);
          useEffect(()=>{
            if(!request||!dirty)return;
            const unload=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',unload);return()=>window.removeEventListener('beforeunload',unload);
          },[request,dirty]);
          async function pick(){
            if(lock.current)return;
            const target=request;lock.current=true;setBusy(true);setError('');
            try{const response=await ctx.remote.directoryPicker.pick();if(!response.ok)throw new Error(response.error.message);if(current.current===target&&response.value?.trim()){setPath(response.value.trim());setMode('custom');}}
            catch(e){if(current.current===target)setError(e.message);}
            finally{if(current.current===target){lock.current=false;setBusy(false);}}
          }
          async function save(follow=false){
            if(lock.current||!info||(!follow&&mode==='custom'&&!path))return;
            const target=request;lock.current=true;setBusy(true);setError('');
            try{
              await call(target.sessionId,{action:'set_session_directory',path:follow||mode==='follow'?null:path,directoryRevision:info.revision});
              if(current.current===target){lock.current=false;close(true);announce(t('directorySaved'));}
            }catch(e){if(current.current===target)setError(e.message);}
            finally{if(current.current===target){lock.current=false;setBusy(false);}}
          }
          function keyboard(e){
            if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
            if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();if(dirty)save();}
            if(e.key==='Tab'){
              const nodes=[...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')];
              if(!nodes.length){e.preventDefault();return;}
              const first=nodes[0],last=nodes[nodes.length-1];
              if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last.focus();}
              else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog.current)){e.preventDefault();first.focus();}
            }
          }
          if(!request)return null;
          const disabled=busy||loading,folders=info?.folders||[];
          const button=(label,onClick,props={})=>h('button',{type:'button',disabled,onClick,...props},label);
          return h('div',{className:'dpm'},h('style',null,css),h('div',{className:'dpm-backdrop',onClick:e=>{if(e.target===e.currentTarget)close();}},h('section',{className:'dpm-dialog dpm-edit',ref:dialog,role:'dialog','aria-modal':true,'aria-label':t('sessionDirectory'),'aria-busy':disabled,tabIndex:-1,onKeyDown:keyboard},
            h('div',{className:'dpm-head'},h('h2',null,t('sessionDirectory')),button('×',()=>close(),{'aria-label':t('close')})),
            loading&&h('p',{role:'status'},t('directoryLoading')),
            info&&h(React.Fragment,null,
              h('div',{className:'dpm-directory-summary'},t('directoryCurrent'),h('strong',{className:'dpm-directory-path'},info.effectivePath||'—'),t('directorySource')+': '+t(info.source==='session'?'directoryCustom':info.source==='project'?'directoryFollow':'directoryInitial')),
              h('label',{className:'dpm-directory-mode'},h('input',{type:'radio',name:'dpm-directory-mode',value:'follow',checked:mode==='follow',disabled,onChange:()=>setMode('follow')}),t('directoryFollow')),
              h('div',{className:'dpm-path'},info.projectPrimary||t('directoryInitial')),
              h('label',{className:'dpm-directory-mode'},h('input',{type:'radio',name:'dpm-directory-mode',value:'custom',checked:mode==='custom',disabled,onChange:()=>{setMode('custom');if(!path)setPath(info.effectivePath||folders[0]||null);}}),t('directoryCustom')),
              mode==='custom'&&h('div',null,
                folders.length>0&&h('select',{className:'dpm-directory-folders','aria-label':t('directoryCustom'),disabled,value:folders.includes(path)?path:'',onChange:e=>setPath(e.target.value||null)},h('option',{value:'',disabled:true},t('directoryChoose')),folders.map(folder=>h('option',{key:folder,value:folder},folder))),
                h('div',{className:'dpm-directory-selected'},path||t('directoryPick')),button(t('directoryChoose'),pick),
                path&&!folders.includes(path)&&h('p',{className:'dpm-directory-note'},t('directoryOutside'))),
              h('p',{className:'dpm-directory-note'},t('directoryNote'))),
            error&&h('div',{className:'dpm-error',role:'alert'},error),
            h('div',{className:'dpm-foot'},
              info?.path&&button(t('directoryRestore'),()=>save(true),{className:'dpm-directory-restore'}),
              error&&button(t('directoryRetry'),()=>load()),button(t('cancel'),()=>close(),{className:'dpm-cancel'}),
              button(t('save'),()=>save(),{className:'dpm-save',disabled:disabled||!info||!dirty||(mode==='custom'&&!path)})))));
        }
        const PAGE_ID = 'dsh-workdock-projects';
        // This is a native main-panel switch: the sidebar and existing chat stay
        // 原生树会虚拟化和重绘；仅管理自己注入的按钮，不替换状态图标。
        ctx.effect(()=>{
          const mounted=new Map();
          const clearLabel=row=>{row.removeAttribute('data-dpm-label-color');row.style.removeProperty('--dpm-label-color');};
          const style=document.createElement('style');style.textContent=colorCss;document.head.append(style);
          const sync=()=>{
            for(const [row,button] of mounted)if(!row.isConnected){clearLabel(row);button.remove();mounted.delete(row);}
            const workspaces=ctx.workspaces.list.getSnapshot().items;
            for(const row of document.querySelectorAll('[data-row-key^="workspace:"],[data-row-key^="session:"]')){
              const key=row.getAttribute('data-row-key'),isSession=key.startsWith('session:');
              const workspace=isSession?null:workspaces.find(w=>w.workspaceId===key.slice(10));
              if(!isSession&&!workspace){clearLabel(row);mounted.get(row)?.remove();mounted.delete(row);continue;}
              const target=isSession?{target:'session',id:key.slice(8)}:workspaceColorTarget(workspace);
              let button=mounted.get(row);
              if(!button){
                button=document.createElement('button');button.type='button';button.className='dpm-sidebar-color';
                button.setAttribute('aria-haspopup','menu');
                const dot=document.createElement('span');dot.className='dpm-color-dot';dot.setAttribute('aria-hidden','true');button.append(dot);
                button.addEventListener('pointerdown',e=>e.stopPropagation());
                button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openColor(button.colorTarget,button);});
                mounted.set(row,button);
              }
              button.colorTarget=target;
              const color=colorFor(target),label=t('colorLabel')+': '+(isHexColor(color)?color:t(color||'colorNone'));
              if(color){row.dataset.dpmLabelColor=color;row.style.setProperty('--dpm-label-color',colorValue(color));}
              else clearLabel(row);
              if(button.title!==label){button.title=label;button.setAttribute('aria-label',label);}
              if(button.dataset.color!==(color||'')){button.dataset.color=color||'';button.firstChild.style.setProperty('--dpm-color',colorValue(color)||'transparent');}
              if(button.parentElement!==row)row.append(button);
            }
          };
          const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-row-key']});
          colorListeners.add(sync);projectListeners.add(sync);
          const unsubscribe=ctx.workspaces.list.subscribe?.(sync);
          sync();call(undefined,{action:'list'}).catch(e=>announce(e.message,true));
          return()=>{observer.disconnect();unsubscribe?.();colorListeners.delete(sync);projectListeners.delete(sync);for(const [row,button] of mounted){clearLabel(row);button.remove();}mounted.clear();style.remove();};
        });
        function ColorOverlay(){
          useSyncExternalStore(colorSource.subscribe,colorSource.getSnapshot);
          const request=colorRequest,menu=useRef(null),lock=useRef(false),current=useRef(request);current.current=request;
          const [busy,setBusy]=useState(false),[error,setError]=useState(''),[position,setPosition]=useState({left:8,top:8});
          const [custom,setCustom]=useState('#6d9fe0');
          const validCustom=isHexColor(custom);
          const close=(focus=false)=>{publishColor(null);if(focus)request?.trigger?.focus({preventScroll:true});};
          useEffect(()=>{
            setError('');setBusy(false);lock.current=false;
            if(!request)return;
            setCustom(colorValue(colorFor(request))||palette.blue);
            const rect=menu.current?.getBoundingClientRect();
            setPosition({left:Math.max(8,Math.min(request.x,window.innerWidth-(rect?.width||206)-8)),top:Math.max(8,Math.min(request.y,window.innerHeight-(rect?.height||260)-8))});
            (menu.current?.querySelector('[aria-checked=true]')||menu.current?.querySelector('input[type=text]'))?.focus({preventScroll:true});
            const outside=e=>{if(!menu.current?.contains(e.target))close();};
            const escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}};
            const dismiss=()=>close();
            // Native session titles marquee via scrollLeft while hovered. Capture
            // sees those non-bubbling events too, but they do not move the anchor.
            // Likewise, scrolling the picker or another pane must not dismiss it.
            const onScroll=e=>{
              if(menu.current?.contains(e.target))return;
              if(e.target===document||e.target===window||e.target?.contains?.(request.trigger))close();
            };
            document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);window.addEventListener('resize',dismiss);document.addEventListener('scroll',onScroll,true);
            return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);window.removeEventListener('resize',dismiss);document.removeEventListener('scroll',onScroll,true);};
          },[request]);
          async function select(color){
            if(lock.current)return;lock.current=true;setBusy(true);setError('');
            try{await call(undefined,{action:'set_color',target:request.target,id:request.id,color});if(current.current===request){close(true);announce(t('colorSaved'));}}
            catch(e){if(current.current===request)setError(e.message);}
            finally{if(current.current===request){lock.current=false;setBusy(false);}}
          }
          function keyboard(e){
            if(!['ArrowDown','ArrowUp','Home','End','Tab'].includes(e.key))return;
            if(e.key!=='Tab'&&e.target.matches('input'))return;
            const items=[...menu.current.querySelectorAll(e.key==='Tab'?'button:not(:disabled),input:not(:disabled)':'[role=menuitemradio]:not(:disabled)')];if(!items.length)return;e.preventDefault();
            const index=items.indexOf(document.activeElement),back=e.key==='ArrowUp'||e.key==='Tab'&&e.shiftKey;
            items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(back?-1:1)+items.length)%items.length].focus();
          }
          if(!request)return null;
          return h('div',{className:'dpm'},h('style',null,css),h('div',{ref:menu,className:'dpm-menu dpm-color-menu',role:'menu','aria-label':t('colorLabel'),style:position,onKeyDown:keyboard},
            h('div',{className:'dpm-menu-title'},t('colorLabel')),
            [null,...Object.keys(palette)].map(color=>h('button',{key:color||'none',type:'button',role:'menuitemradio','aria-checked':colorFor(request)===color,disabled:busy,onClick:()=>select(color)},h(ColorDot,{color}),t(color||'colorNone'))),
            h('form',{className:'dpm-color-custom','aria-label':t('colorCustom'),onSubmit:e=>{e.preventDefault();if(validCustom)select(custom.toLowerCase());}},
              h('label',{htmlFor:'dpm-color-hex'},t('colorCustom')),
              h('div',{className:'dpm-color-inputs'},
                h('input',{type:'color','aria-label':t('colorPicker'),disabled:busy,value:validCustom?custom.toLowerCase():palette.blue,onChange:e=>setCustom(e.target.value)}),
                h('input',{id:'dpm-color-hex',type:'text','aria-label':t('colorHex'),'aria-describedby':'dpm-color-hint','aria-invalid':!validCustom,disabled:busy,value:custom,placeholder:'#FF8800',maxLength:7,spellCheck:false,onChange:e=>setCustom(e.target.value)})),
              h('span',{id:'dpm-color-hint',className:'dpm-color-hint'},t('colorHexHint')),
              h('button',{type:'submit',disabled:busy||!validCustom},t('colorApply'))),
            error&&h('div',{className:'dpm-error',role:'alert'},error)));
        }
        // owned by Harness, rather than being covered by a fullscreen overlay.
        function openProjects(){publishTree(null);ctx.layout.selectPanel(PAGE_ID);}
        function ProjectPage(){return h(Manager,{page:true,initialOpen:true,hiddenLauncher:true});}
        function Manager({ sessionId: providedId, dock = false, page = false, initialProject = null, initialOpen = false, hiddenLauncher = false, workspaceId, onClose }) {
          const version = useSyncExternalStore(projectSource.subscribe, projectSource.getSnapshot);
          useSyncExternalStore(colorSource.subscribe,colorSource.getSnapshot);
          const sessions = useSyncExternalStore(ctx.sessions.list.subscribe, ctx.sessions.list.getSnapshot);
          const sessionId = providedId ?? Object.values(sessions.byId).find(s => (s.retainedBy.mainView ?? 0) > 0)?.id;
          const [open,setOpen]=useState(initialOpen), [state,setState]=useState({projects:[],activeProjectId:null,directoryWarnings:[]});
          const [draft,setDraft]=useState(initialProject), [error,setError]=useState(''), [busy,setBusy]=useState(false);
          const [search,setSearch]=useState(''), [sort,setSort]=useState(()=>{try {return localStorage.getItem('dsh-workdock-sort')||'name';}catch{return 'name';}});
          const [pageNumber,setPageNumber]=useState(1), [pageSize,setPageSize]=useState(()=>{try {const size=Number(localStorage.getItem('dsh-workdock-page-size'));return [10,25,50,100].includes(size)?size:25;}catch{return 25;}});
          const [loading,setLoading]=useState(true);
          const [directoryWarnings,setDirectoryWarnings]=useState([]), [removed,setRemoved]=useState(null);
          const [directoryPolicy,setDirectoryPolicy]=useState('');
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
            setLoading(true);
            try {const value=await call(id,{action:'list'});
              if(token===generation.current&&id===currentId.current)setState(value);
            } finally {if(token===generation.current&&id===currentId.current)setLoading(false);}
          }
          useEffect(()=>{refresh().catch(e=>setError(e.message));return()=>{generation.current++;};},[sessionId,open,version]);
          function close(force=false){
            if(!force&&dirty&&!window.confirm(t('discard')))return;
            clearUndo();checkGeneration.current++;draftEpoch.current++;setDraft(null);setError('');
            if(page){if(!draft)ctx.layout.selectPanel(null);return;}
            setOpen(false);onClose?.();
          }
          useEffect(()=>{
            if(!open||(page&&!draft))return;
            const before=document.activeElement;
            if(!draft)dialog.current?.focus();
            return()=>{if(before?.isConnected)before.focus();};
          },[open,Boolean(draft)]);
          useEffect(()=>{if(page)dialog.current?.focus();},[]);
          useEffect(()=>{if(open&&draft)nameInput.current?.focus();},[open,Boolean(draft)]);
          async function action(args){
            if(lock.current)return null;
            if(['save','bind'].includes(args.action)&&!sessionId){setError(t('needSession'));return null;}
            lock.current=true;setBusy(true);setError('');
            try {
              const result=await call(sessionId,args);
              if(workspaceId&&args.action==='remove')await ctx.workspaces.delete(workspaceId);
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
            baseline.current=JSON.stringify(next);manualName.current=Boolean(p?.title);setDraft(next);setDirectoryPolicy('');setError('');
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
          const needsDirectoryPolicy=Boolean(state.sessionDirectory?.path&&draft&&draft.id!==state.activeProjectId);
          const valid=Boolean(sessionId&&draft?.title.trim()&&draft.primary&&draft.folders.includes(draft.primary)&&(!needsDirectoryPolicy||directoryPolicy));
          async function save(){if(!valid||lock.current)return;if(await action({action:'save',...draft,...(needsDirectoryPolicy?{directoryPolicy,directoryRevision:state.sessionDirectory.revision}:{})}))close(true);}
          async function newChat(p){
            if(lock.current)return;lock.current=true;setBusy(true);setError('');
            try {await call(undefined,{action:'touch',id:p.id});const workspace=await ctx.workspaces.create({path:p.primary});await openNewSession(workspace.workspaceId,()=>close(true));}
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
          const ordered=state.projects.filter(p=>[p.title,p.primary,...p.folders].some(v=>v.toLowerCase().includes(query))).sort((a,b)=>
            Number(Boolean(b.pinned))-Number(Boolean(a.pinned))||
            (sort==='recent'?(b.lastUsedAt||0)-(a.lastUsedAt||0):compare(a.title,b.title))||compare(a.id,b.id));
          const pages=Math.max(1,Math.ceil(ordered.length/pageSize)), currentPage=Math.min(pageNumber,pages);
          const visible=ordered.slice((currentPage-1)*pageSize,currentPage*pageSize);
          useEffect(()=>{setPageNumber(n=>Math.min(n,pages));},[pages]);
          const warnings=(items,projectId)=>items.filter(w=>!projectId||w.projectId===projectId).map(w=>h('div',{key:w.path,className:'dpm-error',role:'status'},w.path+': '+w.error));
          const projectActions=p=>h('div',{className:'dpm-row'},button(t('edit'),()=>edit(p),{disabled:busy||!sessionId}),button(t('colorLabel'),e=>openColor({target:'project',id:p.id},e.currentTarget)),button(t('newChat'),()=>newChat(p)),button(t(p.pinned?'unpin':'pin'),()=>action({action:'pin',id:p.id})),button(t('openFolder'),()=>action({action:'open_folder',id:p.id})),button(t('copy'),()=>copyPath(p.primary)));
          return h('div',{className:page?'dpm dpm-page':'dpm'},h('style',null,css),
            !hiddenLauncher&&h('button',{type:'button',className:dock?'dpm-dock':'dpm-launch',onClick:dock?()=>publishTree({manage:true,project:active?structuredClone(active):{title:'',folders:[],primary:''},sessionId,sequence:++requestSequence}):openProjects,disabled:dock&&(loading||busy||!sessionId),title:dock?(active?t('edit')+': '+active.title+'\n'+active.primary:t('add')):active?.primary,'aria-label':dock?(active?t('edit')+': '+active.title:t('add')):undefined,'aria-haspopup':dock?'dialog':undefined},dock?h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinejoin:'round',strokeLinecap:'round','aria-hidden':true},h('path',{d:'m12 3-9 5 9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5'})):'▱ '+t('title')),
            page&&h('section',{className:'dpm-page-content',ref:draft?undefined:dialog,tabIndex:-1,'aria-label':t('title'),inert:draft?'':undefined},
              h('header',{className:'dpm-page-header'},h('div',null,h('h1',null,t('title')),h('p',null,t('pageHint')+' · '+t('projectCount')+': '+state.projects.length)),button(t('backToChat'),()=>close())),
              h('div',{className:'dpm-page-toolbar'},h('input',{value:search,type:'search',placeholder:t('search'),'aria-label':t('search'),onChange:e=>{setSearch(e.target.value);setPageNumber(1);}}),
                h('label',null,t('sort'),h('select',{'aria-label':t('sort'),value:sort,onChange:e=>{setSort(e.target.value);setPageNumber(1);try{localStorage.setItem('dsh-workdock-sort',e.target.value);}catch{}}},...['name','recent'].map(key=>h('option',{key,value:key},t('order'+key[0].toUpperCase()+key.slice(1)))))),
                button(t('reload'),()=>action({action:'list'})),button('+ '+t('add'),()=>edit(null),{className:'dpm-save',disabled:busy||!sessionId})),
              !sessionId&&h('p',null,t('needSession')),
              error&&!draft&&h('div',{className:'dpm-error',role:'alert'},error),
              h('div',{className:'dpm-table-scroll','aria-busy':loading},h('table',{className:'dpm-table','aria-label':t('title')},
                h('thead',null,h('tr',null,...['name','primary','folderCount','actions'].map(key=>h('th',{key,scope:'col'},t(key))))),
                h('tbody',null,visible.map(p=>h('tr',{className:'dpm-card',key:p.id,'data-project-id':p.id},
                  h('td',null,h(ColorDot,{color:colorFor({target:'project',id:p.id})}),h('strong',{style:{color:colorValue(colorFor({target:'project',id:p.id}))}},(p.pinned?'⌖ ':'')+p.title),p.id===state.activeProjectId&&h('span',{className:'dpm-badge'},t('active'))),
                  h('td',null,h('div',{className:'dpm-path',title:p.primary},p.primary),warnings(state.directoryWarnings||[],p.id)),
                  h('td',{className:'dpm-count',title:p.folders.join('\n')},p.folders.length),h('td',{className:'dpm-actions'},projectActions(p)))),
                  !visible.length&&h('tr',null,h('td',{colSpan:4,className:'dpm-table-empty',role:'status'},t(loading?'loading':query?'noResults':'empty')))))),
              h('footer',{className:'dpm-pagination'},h('span',{role:'status','aria-live':'polite'},t('pageStatus').replace('{page}',currentPage).replace('{pages}',pages).replace('{count}',ordered.length)),
                h('label',null,t('pageSize'),h('select',{'aria-label':t('pageSize'),value:pageSize,onChange:e=>{const size=Number(e.target.value);setPageSize(size);setPageNumber(1);try{localStorage.setItem('dsh-workdock-page-size',String(size));}catch{}}},...[10,25,50,100].map(size=>h('option',{key:size,value:size},size)))),
                h('nav',{'aria-label':t('title')},button(t('previousPage'),()=>setPageNumber(currentPage-1),{disabled:busy||currentPage<=1}),button(t('nextPage'),()=>setPageNumber(currentPage+1),{disabled:busy||currentPage>=pages})))),
            open&&draft&&h('div',{className:'dpm-backdrop',onClick:e=>{if(e.target===e.currentTarget&&!busy)close();}},
              h('section',{className:'dpm-dialog dpm-edit',ref:dialog,tabIndex:-1,role:'dialog','aria-modal':true,'aria-label':t(draft.id?'edit':'add'),onKeyDown:keyboard},
                h('div',{className:'dpm-head'},h('h2',null,t(draft.id?'edit':'add')),button('×',()=>close(),{'aria-label':t('close')})),
                h(React.Fragment,null,
                  !sessionId&&h('p',null,t('needSession')),
                  h('label',{className:'dpm-sr-only',htmlFor:'dpm-name'},t('name')),h('div',{className:'dpm-name-field'},h(FolderIcon),h('input',{ref:nameInput,id:'dpm-name',value:draft.title,disabled:busy||!sessionId,onChange:e=>{manualName.current=true;setDraft({...draft,title:e.target.value});}})),
                  h('label',{className:'dpm-label'},t('folders')),
                  h('div',{className:'dpm-folder-box'},draft.folders.map(folder=>h('div',{key:folder},h('div',{className:'dpm-source','data-primary':draft.primary===folder,tabIndex:0,'aria-label':folder},
                    h('div',{className:'dpm-folder-main',title:folder},h(FolderIcon),h('span',{className:'dpm-folder-name'},folderLabel(folder,draft.folders))),
                    draft.primary===folder?h('span',{className:'dpm-badge'},t('primary')):button(t('setPrimaryButton'),()=>setDraft({...draft,primary:folder}),{className:'dpm-set-primary','aria-label':t('setPrimaryButton')+': '+folder}),
                    button('×',()=>removeFolder(folder),{className:'dpm-folder-remove','aria-label':t('removeFolder')+': '+folder,title:t('removeFolder')})),
                    warnings(directoryWarnings.filter(w=>w.path===folder)))),
                    button(h(React.Fragment,null,h(FolderIcon,{add:true}),h('span',null,t('addFolder'))),()=>pick(),{className:'dpm-folder-add',disabled:busy||!sessionId})),
                  removed&&h('div',{className:'dpm-removed-folder',role:'status'},t('removedFolder')+': '+removed.folder+' ',button(t('undo'),undo,{className:'dpm-undo'})),
                  needsDirectoryPolicy&&h('label',{className:'dpm-directory-policy'},t('directorySwitch'),h('select',{'aria-label':t('directorySwitch'),value:directoryPolicy,disabled:busy,onChange:e=>setDirectoryPolicy(e.target.value)},h('option',{value:''},t('directoryPolicy')),h('option',{value:'keep'},t('directoryKeep')),h('option',{value:'follow'},t('directoryRestore')))),
                  h('p',{className:'dpm-edit-note',title:t('note')},t('saveNote')),
                  h('div',{className:'dpm-foot'},draft.id&&button(t('remove'),async()=>{if(window.confirm(t('removeConfirm'))&&await action({action:'remove',id:draft.id}))close(true);},{className:'dpm-danger'}),button(t('cancel'),()=>close(),{className:'dpm-cancel'}),button(t('save'),save,{className:'dpm-save',disabled:busy||!valid}))),
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
          const pins=useSyncExternalStore(treePinSource.subscribe,treePinSource.getSnapshot);
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
          async function sessionFor(workspace) {
            const current=Object.values(ctx.sessions.list.getSnapshot().byId).find(s=>(s.retainedBy.mainView??0)>0)?.id;
            if(current&&workspace.sessionIds.includes(current))return current;
            return ctx.sessions.create({workspaceId:workspace.workspaceId});
          }
          async function run(kind) {
            if (!request || busy || (kind==='pin'&&treeOrderBusy)) return;
            const target = request; setBusy(true); setError('');
            try {
              const workspace = target.workspace;
              if(kind==='pin'){
                await setTreePin(workspace.workspaceId,!treePins.includes(workspace.workspaceId));
                closeMenu();return;
              }
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
                await openNewSession(workspace.workspaceId,closeMenu);return;
              }
              if (kind === 'remove') {
                if(project)await call(undefined,{action:'remove',id:project.id});
                await ctx.workspaces.delete(workspace.workspaceId);closeMenu();return;
              }
              const sessionId=await sessionFor(workspace);
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
          if (request.manage) return h(Manager,{key:request.sequence,sessionId:request.sessionId,initialProject:request.add?{title:'',folders:[],primary:''}:request.project??null,initialOpen:true,hiddenLauncher:true,onClose:closeMenu});
          if (editor) return h(Manager,{key:request.sequence,...editor,initialProject:editor.project,initialOpen:true,hiddenLauncher:true,onClose:closeMenu});
          const item = (key,label=key) => h('button',{key,type:'button',role:'menuitem',disabled:busy,onClick:()=>run(key),className:key==='remove'?'dpm-danger':undefined},t(label));
          return h('div',{className:'dpm'},h('style',null,css),h('div',{ref:menu,className:'dpm-menu',role:'menu','aria-label':t('title'),style:position,onKeyDown:keyboard},
            h('div',{className:'dpm-menu-title'},request.workspace.title),
            item('edit'),item('pin',pins.includes(request.workspace.workspaceId)?'unpin':'pin'),item('openFolder'),item('copy'),item('newChat'),
            h('button',{type:'button',role:'menuitem',disabled:busy,onClick:()=>{const target=workspaceColorTarget(request.workspace);openColor(target,request.nativeMenu||request.trigger,position);closeMenu();}},t('colorLabel')),
            h('div',{className:'dpm-menu-separator',role:'separator'}),item('more'),item('remove'),error&&h('div',{className:'dpm-error',role:'alert'},error)));
        }
        function ExperienceOverlay() {
          useSyncExternalStore(noticeSource.subscribe,noticeSource.getSnapshot);
          const sessions=useSyncExternalStore(ctx.sessions.list.subscribe,ctx.sessions.list.getSnapshot);
          const active=Object.values(sessions.byId).some(s=>(s.retainedBy.mainView??0)>0);
          const [retrying,setRetrying]=useState(false);
          return h('div',{className:'dpm'},h('style',null,css),
            !active&&h('button',{className:'dpm-browse dpm-mini',onClick:openProjects},t('title')),
            (notice||syncWarnings.length>0)&&h('div',{className:'dpm-global'},
              notice&&h('div',{role:notice.error?'alert':'status'},notice.text),
              syncWarnings.length>0&&h('div',{role:'status'},h('p',null,t('syncWarning')+': '+syncWarnings.map(w=>typeof w==='string'?w:JSON.stringify(w)).join('\n')),
                h('button',{className:'dpm-mini',disabled:retrying,onClick:async()=>{setRetrying(true);try{await call(undefined,{action:'list'});}catch(e){announce(e.message,true);}finally{setRetrying(false);}}},t('retrySync'))),
              notice&&h('button',{className:'dpm-mini','aria-label':t('close'),onClick:dismissNotice},'×')));
        }
        ctx.slots.inject('main',()=>ctx.slots.register({name:'main',key:PAGE_ID,id:PAGE_ID,locale:'dsh-workdock'},ProjectPage));
        // Keep saved pins leading when the native snapshot reloads or new
        // workspaces arrive; unpinned workspaces retain their current order.
        ctx.effect(()=>{
          let scheduled=false,failedSignature=null;
          function sync(){
            if(scheduled||treeOrderBusy||treeOrderDisposed||!treePins.length||typeof ctx.workspaces.insertBefore!=='function')return;
            const snapshot=ctx.workspaces.list.getSnapshot();
            if(snapshot.phase&&snapshot.phase!=='ready')return;
            scheduled=true;
            queueMicrotask(async()=>{
              scheduled=false;if(treeOrderBusy||treeOrderDisposed)return;
              const ids=workspaceIds(),desired=pinnedOrder(ids,treePins);
              const signature=JSON.stringify([ids,treePins]);
              if(ids.join('\0')===desired.join('\0')||signature===failedSignature)return;
              treeOrderBusy=true;
              try{await applyWorkspaceOrder(desired);failedSignature=null;}
              catch(error){failedSignature=JSON.stringify([workspaceIds(),treePins]);if(!treeOrderDisposed)announce(error.message,true);}
              finally{treeOrderBusy=false;sync();}
            });
          }
          const storage=event=>{if(event.key===TREE_PINS_KEY||event.key===null){treePins=readWorkspaceIds(TREE_PINS_KEY);for(const fn of treePinListeners)fn();}};
          const unsubPins=treePinSource.subscribe(sync),unsubWorkspaces=ctx.workspaces.list.subscribe?.(sync)||(()=>{});
          reconcileTreePins=sync;
          window.addEventListener('storage',storage);sync();
          return()=>{treeOrderDisposed=true;reconcileTreePins=()=>{};unsubPins();unsubWorkspaces();window.removeEventListener('storage',storage);};
        });
        // WorkspaceBrowser exposes no header-action slot. Mount only in its
        // verified CSS-module structure, never by translated text or button order.
        ctx.effect(()=>{
          const mounted=new Map(),addButtons=new Map();
          const openAddProject=()=>publishTree({manage:true,add:true,sequence:++requestSequence});
          const style=document.createElement('style');
          // Native headerActions clips at 60px (two icons). Three actions need
          // their intrinsic width; leave the search-expanded hidden state intact.
          style.textContent='.dpm-workspace-actions:not([class*="_headerActionsHidden"]){max-width:none}.dpm-workspace-manage,.dpm-workspace-add{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}.dpm-workspace-manage:focus-visible,.dpm-workspace-add:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#8bb6ed);outline-offset:2px}.dpm-workspace-manage svg,.dpm-workspace-add svg{width:16px;height:16px;pointer-events:none}';
          document.head.append(style);
          const sync=()=>{
            for(const [host,button] of mounted)if(!host.isConnected){host.classList.remove('dpm-workspace-actions');button.removeEventListener('click',openProjects);button.remove();mounted.delete(host);}
            for(const [host,button] of addButtons)if(!host.isConnected){button.removeEventListener('click',openAddProject);button.remove();addButtons.delete(host);}
            for(const header of document.querySelectorAll('[class*="_sectionHeader"]')){
              const token=[...header.classList].find(c=>c.endsWith('_sectionHeader'));
              if(!token)continue;
              const prefix=token.slice(0,-'_sectionHeader'.length);
              if(!header.parentElement?.classList.contains(prefix+'_root'))continue;
              const host=[...header.children].find(c=>c.classList.contains(prefix+'_headerActions'));
              if(!host)continue;
              host.classList.add('dpm-workspace-actions');
              let button=mounted.get(host);
              if(!button){
                button=document.createElement('button');button.type='button';
                button.className=prefix+'_iconButton dpm-workspace-manage';
                button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/><path d="M8 11h8M8 15h8"/></svg>';
                button.addEventListener('click',openProjects);mounted.set(host,button);
              }
              if(button.title!==t('title')){button.title=t('title');button.setAttribute('aria-label',t('title'));}
              const nativeAdd=host.querySelector('button[aria-label="添加工作区"],button[aria-label="Add workspace"]');
              let add=addButtons.get(host);
              if(nativeAdd){
                if(add){add.removeEventListener('click',openAddProject);add.remove();addButtons.delete(host);}
                add=nativeAdd;
              }else{
                if(!add){
                  add=document.createElement('button');add.type='button';
                  add.className=prefix+'_iconButton dpm-workspace-add';
                  add.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/><path d="M12 10v7m-3.5-3.5h7"/></svg>';
                  add.addEventListener('click',openAddProject);addButtons.set(host,add);
                }
                if(add.title!==t('add')){add.title=t('add');add.setAttribute('aria-label',t('add'));}
                if(add.parentElement!==host||add!==host.lastElementChild)host.append(add);
              }
              // Keep native view options first, management next, and add last.
              if(button.parentElement!==host||button.nextElementSibling!==add)host.insertBefore(button,add);
            }
          };
          const observer=new MutationObserver(sync);
          observer.observe(document.body,{childList:true,subtree:true,characterData:true});sync();
          return()=>{observer.disconnect();for(const [host,button] of mounted){host.classList.remove('dpm-workspace-actions');button.removeEventListener('click',openProjects);button.remove();}mounted.clear();for(const button of addButtons.values()){button.removeEventListener('click',openAddProject);button.remove();}addButtons.clear();style.remove();};
        });
        // Official additive menu contribution: keep rename, fork and archive intact.
        if(ctx.contextMenus)ctx.effect(()=>ctx.contextMenus.register({
          id:'dsh-workdock.set-working-directory',target:'session',order:250,observe:()=>[ctx.locale],
          resolve:({sessionId})=>[{id:'set-working-directory',label:t('setSessionDirectory'),separatorBefore:true,run:()=>openSessionDirectory(sessionId)}],
        }));
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({name:'conversation.composer.dock',id:'dsh-workdock-session-directory',order:10.5,inject:sessionId=>({sessionId})}, SessionDirectoryButton));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-session-directory-dialog',order:24}, SessionDirectoryOverlay));
        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({name:'conversation.chat.turnTail',id:'dsh-workdock-hide-turn',order:90}, HideTurn));
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({name:'conversation.composer.dock',id:'dsh-workdock-restore-turns',order:11,inject:sessionId=>({sessionId})}, RestoreHiddenTurns));
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({name:'conversation.composer.dock',id:'dsh-workdock-dock',order:10,inject:sessionId=>({sessionId,dock:true})}, Manager));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-colors',order:23}, ColorOverlay));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-tree-menu',order:20}, TreeOverlay));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-primary-tooltip',order:19}, PrimaryDirectoryTooltip));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay',id:'dsh-workdock-experience',order:21}, ExperienceOverlay));
      }
    };
  }
});
