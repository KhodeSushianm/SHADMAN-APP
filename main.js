const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let SQL = null;
let db = null;
let dbFolder = null;
let dbPath = null;
let ready = null;
let authenticated = false;

const configPath = () => path.join(app.getPath('userData'), 'config.json');
const defaultFolder = () => path.join(app.getPath('documents'), 'Shadman Academy');

// Local consultant credentials. The password is stored only as a salted scrypt hash.
const AUTH_USERNAME = 'admin';
const AUTH_SALT = 'c216d2f753f4eb946f7efb9f6941187d';
const AUTH_PASSWORD_HASH = 'd668e336e9e8306ff6379f29d1629414315cac13492a2caf8c32d4653b60ddca006c7b31bb02c417816101ea44cb4715831324b50265e3d0f44641201910cead';

function verifyPassword(password) {
  if (typeof password !== 'string') return false;
  const candidate = crypto.scryptSync(password, AUTH_SALT, 64).toString('hex');
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(AUTH_PASSWORD_HASH, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

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

function applyBranding() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.executeJavaScript(`(() => {
    document.title = 'Shadman Academy — پنل مدیریت';
    const name = document.querySelector('.brand-name');
    if (name) name.textContent = 'Shadman Academy';
    const sub = document.querySelector('.brand-sub');
    if (sub) sub.textContent = 'پنل مدیریت';
    const mark = document.querySelector('.brandmark');
    if (mark) {
      mark.innerHTML = '<img src="assets/shadman-academy-logo.svg" alt="Shadman Academy" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block">';
      mark.style.background = 'transparent';
      mark.style.overflow = 'hidden';
      mark.style.padding = '0';
    }
    document.querySelectorAll('img[data-brand-logo]').forEach(img => { img.src = 'assets/shadman-academy-logo.svg'; });
  })()`).catch(() => {});
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500, height: 920, minWidth: 1050, minHeight: 700,
    backgroundColor: '#111315', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  mainWindow.loadFile(path.join(__dirname, authenticated ? 'index.html' : 'login.html'));
  mainWindow.webContents.on('did-finish-load', () => { if (authenticated) applyBranding(); });
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => console.error('Renderer load failed:', code, desc));
}

ipcMain.handle('auth:login', async (_event, username, password) => {
  const valid = String(username || '') === AUTH_USERNAME && verifyPassword(password);
  if (!valid) return { ok: false };
  authenticated = true;
  if (mainWindow && !mainWindow.isDestroyed()) await mainWindow.loadFile(path.join(__dirname, 'index.html'));
  return { ok: true };
});
ipcMain.handle('auth:status', () => ({ authenticated }));
ipcMain.handle('app:ready', async () => { await ready; return { ok: true }; });
ipcMain.handle('db:query', async (_event, sql, params) => {
  if (!authenticated) throw new Error('Unauthorized');
  await ready;
  const stmt = db.prepare(String(sql));
  try { stmt.bind(safeParams(params)); return resultRows(stmt); }
  finally { try { stmt.free(); } catch (_) {} }
});
ipcMain.handle('db:run', async (_event, sql, params) => {
  if (!authenticated) throw new Error('Unauthorized');
  await ready;
  const stmt = db.prepare(String(sql));
  try { stmt.run(safeParams(params)); }
  finally { try { stmt.free(); } catch (_) {} }
  persist();
  return { ok: true };
});
ipcMain.handle('db:transaction', async (_event, statements) => {
  if (!authenticated) throw new Error('Unauthorized');
  await ready;
  db.run('BEGIN TRANSACTION');
  try {
    for (const item of (Array.isArray(statements) ? statements : [])) db.run(String(item.sql), safeParams(item.params));
    db.run('COMMIT'); persist(); return { ok: true };
  } catch (e) { try { db.run('ROLLBACK'); } catch (_) {} throw e; }
});
ipcMain.handle('db:info', async () => { if (!authenticated) throw new Error('Unauthorized'); await ready; return { folder: dbFolder, file: dbPath }; });
ipcMain.handle('db:choose-folder', async () => {
  if (!authenticated) throw new Error('Unauthorized');
  const r = await dialog.showOpenDialog(mainWindow, { title: 'انتخاب پوشه ذخیره‌سازی دیتابیس', properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled || !r.filePaths[0]) return { cancelled: true };
  persist(); dbFolder = r.filePaths[0]; dbPath = path.join(dbFolder, 'shima-academy.sqlite'); writeConfig();
  ready = initDatabase(); await ready;
  return { cancelled: false, folder: dbFolder, file: dbPath };
});
ipcMain.handle('db:export', async () => {
  if (!authenticated) throw new Error('Unauthorized');
  await ready;
  const r = await dialog.showSaveDialog(mainWindow, { title: 'خروجی دیتابیس', defaultPath: path.join(dbFolder, 'shima-academy-backup.sqlite'), filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }] });
  if (r.canceled || !r.filePath) return { cancelled: true };
  fs.writeFileSync(r.filePath, Buffer.from(db.export())); return { cancelled: false, file: r.filePath };
});
ipcMain.handle('db:import', async () => {
  if (!authenticated) throw new Error('Unauthorized');
  await ready;
  const r = await dialog.showOpenDialog(mainWindow, { title: 'بازیابی دیتابیس', properties: ['openFile'], filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }] });
  if (r.canceled || !r.filePaths[0]) return { cancelled: true };
  const imported = new SQL.Database(new Uint8Array(fs.readFileSync(r.filePaths[0])));
  imported.run('PRAGMA foreign_keys = ON;'); db = imported; persist();
  return { cancelled: false, file: r.filePaths[0] };
});
ipcMain.handle('app:open-folder', async () => { if (!authenticated) throw new Error('Unauthorized'); await ready; await shell.openPath(dbFolder); return { ok: true }; });

app.whenReady().then(async () => {
  readConfig(); ready = initDatabase(); await ready; createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
