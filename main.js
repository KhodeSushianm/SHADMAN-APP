const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let SQL = null;
let db = null;
let dbFolder = null;
let dbPath = null;
let ready = null;

const configPath = () => path.join(app.getPath('userData'), 'config.json');
const defaultFolder = () => path.join(app.getPath('documents'), 'Shima Academy');

function readConfig() {
  try {
    const c = JSON.parse(fs.readFileSync(configPath(), 'utf8'));
    if (c.dbFolder && fs.existsSync(c.dbFolder)) dbFolder = c.dbFolder;
  } catch (_) {}
  if (!dbFolder) dbFolder = defaultFolder();
  fs.mkdirSync(dbFolder, { recursive: true });
  dbPath = path.join(dbFolder, 'shima-academy.sqlite');
}

function writeConfig() {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify({ dbFolder }, null, 2), 'utf8');
}

async function initDatabase() {
  SQL = await require('sql.js')({
    locateFile: file => path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'sql.js', 'dist', file)
  }).catch(async () => require('sql.js')({ locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file) }));

  const bytes = dbPath && fs.existsSync(dbPath) ? new Uint8Array(fs.readFileSync(dbPath)) : null;
  db = bytes ? new SQL.Database(bytes) : new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL DEFAULT '', last_name TEXT NOT NULL DEFAULT '', phone TEXT DEFAULT '',
      grade TEXT DEFAULT '', field TEXT DEFAULT '', advisor TEXT DEFAULT '', status TEXT DEFAULT 'active',
      score INTEGER DEFAULT 0, progress INTEGER DEFAULT 0, created_at TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, date TEXT NOT NULL DEFAULT '', subject TEXT DEFAULT '',
      title TEXT DEFAULT '', minutes INTEGER DEFAULT 0, status TEXT DEFAULT 'pending',
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, title TEXT DEFAULT '', date TEXT DEFAULT '', score INTEGER DEFAULT 0,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, body TEXT DEFAULT '', date TEXT DEFAULT '',
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '');
  `);
  persist();
}

function persist() {
  if (!db || !dbPath) return;
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function resultRows(stmt) {
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  return rows;
}
function safeParams(params) { return Array.isArray(params) ? params : []; }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500, height: 920, minWidth: 1050, minHeight: 700,
    backgroundColor: '#111315', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => console.error('Renderer load failed:', code, desc));
  mainWindow.webContents.on('did-finish-load', () => {
    const iconScript = `(() => {
      const ns = 'http://www.w3.org/2000/svg';
      const paths = {
        home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/>',
        users:'<path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H7.4A3.4 3.4 0 0 0 4 18.4V20"/><circle cx="10" cy="7" r="3"/><path d="M17 11a3 3 0 0 0 0-6"/><path d="M20 20v-1.5a3.3 3.3 0 0 0-2.5-3.2"/>',
        plans:'<path d="M7 3v3M17 3v3M4 9h16"/><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 13h3M8 17h5"/>',
        exam:'<path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        notes:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        settings:'<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1A1.8 1.8 0 1 1 4.5 15l.1-.1a1.8 1.8 0 0 0-1.3-3.1h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3.1l-.1-.1A1.8 1.8 0 1 1 7 2.5l.1.1a1.8 1.8 0 0 0 3.1-1.3v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1A1.8 1.8 0 1 1 19.5 5l-.1.1a1.8 1.8 0 0 0 1.3 3.1h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3.1Z"/>',
        dashboard:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
        search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
        edit:'<path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.5 7 3.5 3.5"/>',
        delete:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
        view:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>',
        check:'<path d="m5 12 4 4L19 6"/>',
        close:'<path d="m6 6 12 12M18 6 6 18"/>',
        menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
        theme:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        add:'<path d="M12 5v14M5 12h14"/>',
        folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
        trend:'<path d="m4 16 5-5 4 3 7-8"/><path d="M15 6h5v5"/>'
      };
      function icon(type, size=16){const s=document.createElementNS(ns,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');s.innerHTML=paths[type]||paths.dashboard;s.style.cssText='width:'+size+'px;height:'+size+'px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none';return s}
      const navMap={'داشبورد':'dashboard','دانش‌آموزان':'users','برنامه‌ها':'plans','آزمون‌ها':'exam','یادداشت‌ها':'notes','تنظیمات':'settings'};
      function replace(){
        document.querySelectorAll('.nav-btn .ico').forEach(el=>{const key=(el.parentElement.textContent||'').trim().replace(/\d+$/,'').trim();el.textContent='';el.appendChild(icon(navMap[key]||'dashboard',16))});
        document.querySelectorAll('.brandmark').forEach(el=>{el.textContent='';el.appendChild(icon('home',21))});
        document.querySelectorAll('[data-action="choose-folder"]').forEach(el=>{el.textContent='';el.appendChild(icon('settings',16))});
        document.querySelectorAll('[data-action="toggle-theme"]').forEach(el=>{if(!el.dataset.iconized){const t=el.textContent.trim();el.textContent='';el.appendChild(icon('theme',16));if(t && !/^◐$/.test(t)) {const span=document.createElement('span');span.textContent=t;el.appendChild(span)}el.dataset.iconized='1'}});
        const menu=document.getElementById('mobileMenu');if(menu&&!menu.dataset.iconized){menu.textContent='';menu.appendChild(icon('menu',17));menu.dataset.iconized='1'}
        document.querySelectorAll('.primary').forEach(el=>{if(!el.dataset.iconized){const text=el.textContent.trim();const type=text.includes('دانش‌آموز')?'users':text.includes('برنامه')?'plans':text.includes('آزمون')?'exam':text.includes('یادداشت')?'notes':'add';el.textContent='';el.appendChild(icon(type,15));const span=document.createElement('span');span.textContent=text.replace(/^＋\s*/,'');el.appendChild(span);el.dataset.iconized='1'}});
        document.querySelectorAll('.row-btn').forEach(el=>{if(!el.dataset.iconized){const a=el.dataset.action||'';const type=a.includes('delete')?'delete':a.includes('edit')?'edit':a.includes('view')?'view':a.includes('toggle')?'check':'view';el.textContent='';el.appendChild(icon(type,15));el.dataset.iconized='1';el.setAttribute('aria-label',type)}});
        document.querySelectorAll('.close').forEach(el=>{if(!el.dataset.iconized){el.textContent='';el.appendChild(icon('close',16));el.dataset.iconized='1'}});
        document.querySelectorAll('.stat-icon').forEach((el,i)=>{if(!el.dataset.iconized){const type=['users','plans','exam','trend'][i]||'dashboard';el.textContent='';el.appendChild(icon(type,17));el.dataset.iconized='1'}});
      }
      replace();
      new MutationObserver(replace).observe(document.body,{subtree:true,childList:true});
    })()`;
    mainWindow.webContents.executeJavaScript(iconScript).catch(err => console.error('Icon refinement failed:', err));
  });
}

ipcMain.handle('app:ready', async () => { await ready; return { ok: true }; });
ipcMain.handle('db:query', async (_event, sql, params) => {
  await ready;
  const stmt = db.prepare(String(sql));
  try { stmt.bind(safeParams(params)); return resultRows(stmt); }
  finally { try { stmt.free(); } catch (_) {} }
});
ipcMain.handle('db:run', async (_event, sql, params) => {
  await ready;
  const stmt = db.prepare(String(sql));
  try { stmt.run(safeParams(params)); }
  finally { try { stmt.free(); } catch (_) {} }
  persist();
  return { ok: true };
});
ipcMain.handle('db:transaction', async (_event, statements) => {
  await ready;
  db.run('BEGIN TRANSACTION');
  try {
    for (const item of (Array.isArray(statements) ? statements : [])) db.run(String(item.sql), safeParams(item.params));
    db.run('COMMIT'); persist(); return { ok: true };
  } catch (e) { try { db.run('ROLLBACK'); } catch (_) {} throw e; }
});
ipcMain.handle('db:info', async () => { await ready; return { folder: dbFolder, file: dbPath }; });
ipcMain.handle('db:choose-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { title: 'انتخاب پوشه ذخیره‌سازی دیتابیس', properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled || !r.filePaths[0]) return { cancelled: true };
  persist(); dbFolder = r.filePaths[0]; dbPath = path.join(dbFolder, 'shima-academy.sqlite'); writeConfig();
  ready = initDatabase(); await ready;
  return { cancelled: false, folder: dbFolder, file: dbPath };
});
ipcMain.handle('db:export', async () => {
  await ready;
  const r = await dialog.showSaveDialog(mainWindow, { title: 'خروجی دیتابیس', defaultPath: path.join(dbFolder, 'shima-academy-backup.sqlite'), filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }] });
  if (r.canceled || !r.filePath) return { cancelled: true };
  fs.writeFileSync(r.filePath, Buffer.from(db.export())); return { cancelled: false, file: r.filePath };
});
ipcMain.handle('db:import', async () => {
  await ready;
  const r = await dialog.showOpenDialog(mainWindow, { title: 'بازیابی دیتابیس', properties: ['openFile'], filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }] });
  if (r.canceled || !r.filePaths[0]) return { cancelled: true };
  const imported = new SQL.Database(new Uint8Array(fs.readFileSync(r.filePaths[0])));
  imported.run('PRAGMA foreign_keys = ON;'); db = imported; persist();
  return { cancelled: false, file: r.filePaths[0] };
});
ipcMain.handle('app:open-folder', async () => { await ready; await shell.openPath(dbFolder); return { ok: true }; });

app.whenReady().then(async () => {
  readConfig(); ready = initDatabase(); await ready; createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
