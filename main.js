const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

let mainWindow;
let dbFolder = null;
const configFile = () => path.join(app.getPath('userData'), 'config.json');
const dbFile = () => dbFolder ? path.join(dbFolder, 'shima-academy.sqlite') : null;

function readConfig(){
  try {
    const c = JSON.parse(fs.readFileSync(configFile(), 'utf8'));
    if(c.dbFolder && fs.existsSync(c.dbFolder)) dbFolder = c.dbFolder;
  } catch {}
}
function writeConfig(){
  fs.mkdirSync(app.getPath('userData'), {recursive:true});
  fs.writeFileSync(configFile(), JSON.stringify({dbFolder}, null, 2), 'utf8');
}

function setupOfflineAssets(){
  session.defaultSession.webRequest.onBeforeRequest(
    {urls:['https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/*','https://unpkg.com/lucide@latest*']},
    (details, callback) => {
      try {
        const isSql = details.url.includes('/sql.js/1.13.0/');
        const target = isSql
          ? path.join(app.getAppPath(),'node_modules','sql.js','dist',details.url.endsWith('.wasm')?'sql-wasm.wasm':'sql-wasm.js')
          : path.join(app.getAppPath(),'vendor','lucide-stub.js');
        callback({redirectURL:pathToFileURL(target).href});
      } catch { callback({}); }
    }
  );
}

function bootstrapRenderer(){
  if(!mainWindow) return;
  const sqlAsm = path.join(app.getAppPath(),'node_modules','sql.js','dist','sql-asm.js');
  const sqlAsmUrl = pathToFileURL(sqlAsm).href;

  mainWindow.webContents.on('dom-ready', async () => {
    try {
      const code = `(async()=>{
        try {
          if(typeof window.initSqlJs !== 'function'){
            await new Promise((resolve,reject)=>{
              const s=document.createElement('script');
              s.src=${JSON.stringify(sqlAsmUrl)};
              s.onload=resolve;
              s.onerror=()=>reject(new Error('LOCAL_SQL_JS_LOAD_FAILED'));
              document.head.appendChild(s);
            });
          }
          if(!window.lucide) window.lucide={createIcons:function(){}};
          const content=document.getElementById('content');
          if(content && !content.innerHTML.trim() && typeof window.init==='function') await window.init();
        }catch(e){
          console.error('[Shima Academy bootstrap]',e);
          const content=document.getElementById('content');
          if(content && !content.innerHTML.trim()) content.innerHTML='<div style="padding:40px;font-family:sans-serif;color:#c59898">خطا در راه‌اندازی برنامه. لطفاً برنامه را دوباره باز کنید.</div>';
        }
      })()`;
      await mainWindow.webContents.executeJavaScript(code, true);
    } catch (e) {
      console.error('[Shima Academy executeJavaScript]', e);
    }
  });
}

function createWindow(){
  mainWindow = new BrowserWindow({
    width:1440,
    height:900,
    minWidth:1050,
    minHeight:700,
    backgroundColor:'#111315',
    webPreferences:{
      preload:path.join(__dirname,'preload.js'),
      contextIsolation:true,
      nodeIntegration:false
    }
  });
  bootstrapRenderer();
  mainWindow.loadFile(path.join(__dirname,'index.html'));
}

ipcMain.handle('db:get', async () => {
  if(!dbFile() || !fs.existsSync(dbFile())) return null;
  try { return fs.readFileSync(dbFile()).toString('base64'); } catch { return null; }
});
ipcMain.handle('db:save', async (_e, base64) => {
  if(!dbFolder) return {ok:false, reason:'NO_FOLDER'};
  fs.mkdirSync(dbFolder,{recursive:true});
  fs.writeFileSync(dbFile(), Buffer.from(base64,'base64'));
  return {ok:true, file:dbFile()};
});
ipcMain.handle('db:choose-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow,{title:'انتخاب پوشه ذخیره‌سازی دیتابیس',properties:['openDirectory','createDirectory']});
  if(result.canceled || !result.filePaths[0]) return {cancelled:true};
  dbFolder = result.filePaths[0];
  writeConfig();
  let data=null;
  if(fs.existsSync(dbFile())) { try { data=fs.readFileSync(dbFile()).toString('base64'); } catch {} }
  return {cancelled:false, folder:dbFolder, data};
});
ipcMain.handle('db:info', async () => ({folder:dbFolder, file:dbFile()}));

app.whenReady().then(()=>{
  readConfig();
  setupOfflineAssets();
  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
