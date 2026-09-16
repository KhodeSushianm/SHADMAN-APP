const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

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
function createWindow(){
  mainWindow = new BrowserWindow({width:1440,height:900,minWidth:1050,minHeight:700,backgroundColor:'#111315',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});
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

app.whenReady().then(()=>{readConfig();createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
