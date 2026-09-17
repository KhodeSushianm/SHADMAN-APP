const { contextBridge, ipcRenderer } = require('electron');

// UI-only polish. No renderer observers or app logic are injected here.
const icons = {
  home: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyAxMS41IDEyIDRsOSA3LjUiLz48cGF0aCBkPSJNNS41IDEwLjVWMjBoMTN2LTkuNSIvPjxwYXRoIGQ9Ik05LjUgMjB2LTVoNXY1Ii8+PC9zdmc+',
  users: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTYgMjB2LTEuNWE0IDQgMCAwIDAtNC00SDdhNCA0IDAgMCAwLTQgNFYyMCIvPjxjaXJjbGUgY3g9IjkuNSIgY3k9IjciIHI9IjMiLz48cGF0aCBkPSJNMTYgNC41YTMgMyAwIDAgMSAwIDUuOE0yMSAyMHYtMS41YTQgNCAwIDAgMC0zLTMuODciLz48L3N2Zz4=',
  calendar: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSI1IiB3aWR0aD0iMTgiIGhlaWdodD0iMTYiIHJ4PSIyIi8+PHBhdGggZD0iTTE2IDN2NE04IDN2NE0zIDEwaDE4TTggMTRoLjAxTTEyIDE0aC4wMU0xNiAxNGguMDFNOCAxN2guMDFNMTIgMTdoLjAxIi8+PC9zdmc+',
  target: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIvPjxwYXRoIGQ9Ik0xMiAydjJNMTIgMjB2Mk0yIDEyaDJNMjAgMTJoMiIvPjwvc3ZnPg==',
  note: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAzLjVoMTBsNCA0VjIwLjVINXoiLz48cGF0aCBkPSJNMTUgMy41djVoNE04IDEyaDhNOCAxNmg2Ii8+PC9zdmc+',
  settings: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzLjIiLz48cGF0aCBkPSJNMTkgMTJhNyA3IDAgMCAwLS4xMi0xLjI4bDIuMDItMS41Ni0xLjktMy4yOC0yLjM2IDFhNyA3IDAgMCAwLTIuMi0xLjI4TDE0LjEgM2gtNC4ybC0uMzQgMi42YTcgNyAwIDAgMC0yLjIgMS4yOGwtMi4zNi0xLTEuOSAzLjI4IDIuMDIgMS41NkE3IDcgMCAwIDAgNSAxMmMwIC40NC4wNC44Ny4xMiAxLjI4TDMuMSAxNC44NGwxLjkgMy4yOCAyLjM2LTFhNyA3IDAgMCAwIDIuMiAxLjI4bC4zNCAyLjZoNC4ybC0uMzQtMi42YTcgNyAwIDAgMCAyLjItMS4yOGwyLjM2IDF6Ii8+PC9zdmc+',
  edit: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNCAxNi41LS44IDQuMyA0LjMtLjhMMTkuNyA3LjhhMiAyIDAgMCAwLTIuOC0yLjhMNCAxNi41WiIvPjxwYXRoIGQ9Im0xNS41IDYuNSAyLjggMi44Ii8+PC9zdmc+',
  trash: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNCA3aDE2TTkgN1Y0aDZ2M003IDdsLjggMTNoOC40TDE3IDdNMTAgMTF2NU0xNCAxMXY1Ii8+PC9zdmc+',
  eye: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMi41IDEyczMuNS01IDkuNS01IDkuNSA1IDkuNSA1LTMuNSA1LTkuNSA1LTkuNS01LTkuNS01WiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIuNSIvPjwvc3ZnPg==',
  check: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNSAxMiA0LjIgNC4yTDE5IDYuNSIvPjwvc3ZnPg==',
  folder: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMy41IDYuNWg2bDEuOCAyaDkuMnY5LjhhMiAyIDAgMCAxLTIgMkg1LjVhMiAyIDAgMCAxLTItMnoiLz48cGF0aCBkPSJNMy41IDguNWgxNyIvPjwvc3ZnPg==',
  theme: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0Ii8+PHBhdGggZD0iTTEyIDJ2Mk0xMiAyMHYyTTQuOSA0LjlsMS40IDEuNE0xNy43IDE3LjdsMS40IDEuNE0yIDEyaDJNMjAgMTJoMk00LjkgMTkuMWwxLjQtMS40TTE3LjcgNi4zbDEuNC0xLjQiLz48L3N2Zz4=',
  menu: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBiN2FlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNCA3aDE2TTQgMTJoMTZNNCAxN2gxNiIvPjwvc3ZnPg=='
};
const iconUrl = name => `url(data:image/svg+xml;base64,${icons[name]})`;

const uiStyle = `
html, body, button, input, select, textarea { font-family: 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif !important; }

/* Neutral Matte scrollbars: subtle thumb, transparent track, consistent everywhere. */
* { scrollbar-width: thin; scrollbar-color: rgba(192,183,174,.34) transparent; }
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: rgba(192,183,174,.24); border: 2px solid transparent; background-clip: padding-box; border-radius: 999px; }
*::-webkit-scrollbar-thumb:hover { background: rgba(192,183,174,.42); border: 2px solid transparent; background-clip: padding-box; }
*::-webkit-scrollbar-corner { background: transparent; }

.sidebar, .table-wrap, .drawer, .list, .note-grid { scrollbar-color: rgba(192,183,174,.30) transparent; }
.sidebar::-webkit-scrollbar, .table-wrap::-webkit-scrollbar, .drawer::-webkit-scrollbar, .list::-webkit-scrollbar, .note-grid::-webkit-scrollbar { width: 7px; height: 7px; }
.sidebar::-webkit-scrollbar-thumb, .table-wrap::-webkit-scrollbar-thumb, .drawer::-webkit-scrollbar-thumb, .list::-webkit-scrollbar-thumb, .note-grid::-webkit-scrollbar-thumb { background: rgba(192,183,174,.22); border: 2px solid transparent; background-clip: padding-box; border-radius: 999px; }

/* Navigation: replace the old text glyphs with a consistent line-icon system. */
.nav-btn .ico { width: 18px !important; height: 18px !important; flex: 0 0 18px; display:block !important; font-size:0 !important; line-height:0; position:relative; }
.nav-btn .ico::before { content:""; display:block; width:18px; height:18px; background-repeat:no-repeat; background-position:center; background-size:18px 18px; opacity:.82; }
.nav-btn[data-page="dashboard"] .ico::before { background-image:${iconUrl('home')}; }
.nav-btn[data-page="students"] .ico::before { background-image:${iconUrl('users')}; }
.nav-btn[data-page="plans"] .ico::before { background-image:${iconUrl('calendar')}; }
.nav-btn[data-page="exams"] .ico::before { background-image:${iconUrl('target')}; }
.nav-btn[data-page="notes"] .ico::before { background-image:${iconUrl('note')}; }
.nav-btn[data-page="settings"] .ico::before { background-image:${iconUrl('settings')}; }
.nav-btn:hover .ico::before, .nav-btn.active .ico::before { opacity:1; }

/* Action icons. Text glyphs remain in HTML only as fallback; CSS renders the clean icons. */
.row-btn { font-size:0 !important; position:relative; }
.row-btn::before { content:""; display:block; width:15px; height:15px; background-repeat:no-repeat; background-position:center; background-size:15px 15px; opacity:.72; }
.row-btn:hover::before { opacity:1; }
.row-btn[data-action="student-view"]::before { background-image:${iconUrl('eye')}; }
.row-btn[data-action="student-edit"]::before, .row-btn[data-action="plan-edit"]::before, .row-btn[data-action="exam-edit"]::before, .row-btn[data-action="note-edit"]::before { background-image:${iconUrl('edit')}; }
.row-btn[data-action="student-delete"]::before, .row-btn[data-action="plan-delete"]::before, .row-btn[data-action="exam-delete"]::before, .row-btn[data-action="note-delete"]::before { background-image:${iconUrl('trash')}; }
.row-btn[data-action="plan-toggle"]::before { background-image:${iconUrl('check')}; }

/* Other icon-only controls. */
.workspace .icon-btn[data-action="choose-folder"], .top-actions .icon-btn[data-action="toggle-theme"], #mobileMenu, .brandmark { font-size:0 !important; position:relative; }
.workspace .icon-btn[data-action="choose-folder"]::before, .top-actions .icon-btn[data-action="toggle-theme"]::before, #mobileMenu::before, .brandmark::before { content:""; display:block; width:18px; height:18px; background-repeat:no-repeat; background-position:center; background-size:18px 18px; margin:auto; }
.workspace .icon-btn[data-action="choose-folder"]::before { background-image:${iconUrl('settings')}; }
.top-actions .icon-btn[data-action="toggle-theme"]::before { background-image:${iconUrl('theme')}; }
#mobileMenu::before { background-image:${iconUrl('menu')}; }
.brandmark::before { background-image:${iconUrl('home')}; width:20px; height:20px; background-size:20px 20px; }

/* Lists/tables: quiet surfaces, no browser-default bright edges. */
.table-wrap { border-top:1px solid rgba(255,255,255,.025); border-bottom:1px solid rgba(255,255,255,.025); }
.list { scrollbar-gutter:stable; }
.plan-row, .exam-card, .note-card { transition:background .18s ease,border-color .18s ease,transform .18s ease; }
.plan-row:hover, .exam-card:hover, .note-card:hover { background:rgba(255,255,255,.035); border-color:rgba(192,183,174,.15); }
select option { background:#1b1e20; color:#f2f0ec; }
input[type="date"]::-webkit-calendar-picker-indicator { opacity:.65; filter:grayscale(1); }

/* Light theme keeps the same hierarchy and icon language. */
body.light * { scrollbar-color:rgba(94,87,80,.30) transparent; }
body.light *::-webkit-scrollbar-thumb { background:rgba(94,87,80,.24); }
body.light *::-webkit-scrollbar-thumb:hover { background:rgba(94,87,80,.38); }
body.light .plan-row:hover, body.light .exam-card:hover, body.light .note-card:hover { background:rgba(38,40,42,.035); border-color:rgba(94,87,80,.16); }
body.light .nav-btn .ico::before, body.light .row-btn::before, body.light .workspace .icon-btn::before, body.light .top-actions .icon-btn::before, body.light #mobileMenu::before, body.light .brandmark::before { filter:brightness(.58); }
body.light select option { background:#f2f1ee; color:#252729; }
`;

try {
  const injectUiStyle = () => {
    if (document.getElementById('shima-ui-polish')) return;
    if (!document.getElementById('shima-vazirmatn')) {
      const link = document.createElement('link');
      link.id = 'shima-vazirmatn';
      link.rel = 'stylesheet';
      link.href = './node_modules/@fontsource/vazirmatn/400.css';
      document.head.appendChild(link);
    }
    const style = document.createElement('style');
    style.id = 'shima-ui-polish';
    style.textContent = uiStyle;
    document.head.appendChild(style);
    // Keep the visible version label aligned with the package/installer version.
    document.querySelectorAll('*').forEach(el => {
      if (el.childElementCount === 0 && el.textContent.includes('Desktop 2.0.0')) el.textContent = el.textContent.replace('Desktop 2.0.0', 'Desktop 2.0.1');
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectUiStyle, { once: true });
  else injectUiStyle();
} catch (_) {}

contextBridge.exposeInMainWorld('electronAPI', {
  ready: () => ipcRenderer.invoke('app:ready'),
  query: (sql, params = []) => ipcRenderer.invoke('db:query', sql, params),
  run: (sql, params = []) => ipcRenderer.invoke('db:run', sql, params),
  transaction: statements => ipcRenderer.invoke('db:transaction', statements),
  getStorageInfo: () => ipcRenderer.invoke('db:info'),
  chooseFolder: () => ipcRenderer.invoke('db:choose-folder'),
  exportDatabase: () => ipcRenderer.invoke('db:export'),
  importDatabase: () => ipcRenderer.invoke('db:import'),
  openFolder: () => ipcRenderer.invoke('app:open-folder')
});
