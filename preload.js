const { contextBridge, ipcRenderer } = require('electron');

// UI-only polish is injected locally so the desktop app stays fully offline.
const uiStyle = `
html, body, button, input, select, textarea {
  font-family: 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif !important;
}

/* Neutral Matte scrollbars — consistent with the app surface */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(192,183,174,.32) transparent;
}
*::-webkit-scrollbar { width: 9px; height: 9px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb {
  background: rgba(192,183,174,.25);
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}
*::-webkit-scrollbar-thumb:hover { background: rgba(192,183,174,.42); border: 2px solid transparent; background-clip: padding-box; }
*::-webkit-scrollbar-corner { background: transparent; }

.sidebar, .table-wrap, .drawer { scrollbar-color: rgba(192,183,174,.28) transparent; }
.sidebar::-webkit-scrollbar, .table-wrap::-webkit-scrollbar, .drawer::-webkit-scrollbar { width: 8px; height: 8px; }
.sidebar::-webkit-scrollbar-thumb, .table-wrap::-webkit-scrollbar-thumb, .drawer::-webkit-scrollbar-thumb {
  background: rgba(192,183,174,.22);
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}

/* Make scrollable lists feel like part of the same Neutral Matte system */
.table-wrap { border-top: 1px solid rgba(255,255,255,.025); }
.list { overflow: auto; scrollbar-gutter: stable; }
.plan-row, .exam-card, .note-card {
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
}
.plan-row:hover, .exam-card:hover, .note-card:hover {
  background: rgba(255,255,255,.035);
  border-color: rgba(192,183,174,.15);
}

body.light * { scrollbar-color: rgba(94,87,80,.30) transparent; }
body.light *::-webkit-scrollbar-thumb { background: rgba(94,87,80,.24); }
body.light *::-webkit-scrollbar-thumb:hover { background: rgba(94,87,80,.38); }
body.light .plan-row:hover, body.light .exam-card:hover, body.light .note-card:hover {
  background: rgba(38,40,42,.035);
  border-color: rgba(94,87,80,.16);
}
`;

try {
  const injectUiStyle = () => {
    if (document.getElementById('shima-ui-polish')) return;

    // Load the bundled Persian font through Fontsource's local CSS.
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
