const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// ─── Data helpers ────────────────────────────────────────────────────────────
function dataPath()   { return path.join(app.getPath('userData'), 'vault-data.json'); }
function imagesDir()  { return path.join(app.getPath('userData'), 'images'); }

function loadData() {
  try {
    if (fs.existsSync(dataPath())) return JSON.parse(fs.readFileSync(dataPath(), 'utf8'));
  } catch (e) { console.error('loadData error', e); }
  return null;
}

function saveData(data) {
  try { fs.writeFileSync(dataPath(), JSON.stringify(data, null, 2)); }
  catch (e) { console.error('saveData error', e); }
}

function ensureImagesDir() {
  if (!fs.existsSync(imagesDir())) fs.mkdirSync(imagesDir(), { recursive: true });
}

// ─── Window ──────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    // Fully frameless — HTML renders its own traffic lights via .tl-btn
    // (avoids the native/HTML overlap glitch from titleBarStyle:'hidden')
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#060606',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow loading local file:// images stored in userData
      webSecurity: false,
    },
  });

  // Load vault.html — from resources/ when packaged, from parent dir in dev
  const htmlPath = app.isPackaged
    ? path.join(process.resourcesPath, 'vault.html')
    : path.join(__dirname, '..', 'vault.html');
  mainWindow.loadFile(htmlPath);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── App menu ────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: 'Vault',
      submenu: [
        { label: 'About Vault', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences…', accelerator: 'Cmd+,', click: () => mainWindow?.webContents.send('open-prefs') },
        { type: 'separator' },
        { label: 'Hide Vault', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit Vault', role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        { label: 'Import Images…', accelerator: 'Cmd+I', click: () => mainWindow?.webContents.send('menu-import') },
        { label: 'New Collection…', accelerator: 'Cmd+N', click: () => mainWindow?.webContents.send('menu-new-collection') },
        { type: 'separator' },
        { label: 'Reveal in Finder', accelerator: 'Cmd+Shift+R', click: () => mainWindow?.webContents.send('menu-reveal') },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Select All Images', accelerator: 'Cmd+A', click: () => mainWindow?.webContents.send('select-all') },
        { label: 'Deselect All',      accelerator: 'Escape', click: () => mainWindow?.webContents.send('deselect-all') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Grid View',    accelerator: 'Cmd+1', click: () => mainWindow?.webContents.send('set-view', 'grid') },
        { label: 'List View',    accelerator: 'Cmd+2', click: () => mainWindow?.webContents.send('set-view', 'list') },
        { type: 'separator' },
        { label: 'Tagged Mode',  accelerator: 'Cmd+T', click: () => mainWindow?.webContents.send('set-style', 'tagged') },
        { label: 'Minimal Mode', accelerator: 'Cmd+M', click: () => mainWindow?.webContents.send('set-style', 'minimal') },
        { type: 'separator' },
        { label: 'Toggle Dark/Light', accelerator: 'Cmd+Shift+D', click: () => mainWindow?.webContents.send('toggle-theme') },
        { type: 'separator' },
        { role: 'reload' }, { role: 'forceReload' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' }, { role: 'zoom' },
        { type: 'separator' }, { role: 'front' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC handlers ────────────────────────────────────────────────────────────

// Load persisted library data
ipcMain.handle('load-data', () => loadData());

// Save library data (called after every mutation)
ipcMain.handle('save-data', (_e, data) => { saveData(data); return true; });

// Import images via native file dialog
ipcMain.handle('import-images', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Images',
    buttonLabel: 'Import',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','gif','webp','tiff','tif','bmp','heic','heif','avif','svg'] }],
  });
  if (result.canceled || !result.filePaths.length) return [];
  return processFilePaths(result.filePaths);
});

// Handle files dropped from Finder (paths passed from renderer)
ipcMain.handle('import-dropped-files', async (_e, filePaths) => {
  return processFilePaths(filePaths);
});

// Reveal a stored image in Finder
ipcMain.handle('reveal-file', (_e, filePath) => {
  shell.showItemInFolder(filePath);
  return true;
});

// Delete a stored image file from userData
ipcMain.handle('delete-file', (_e, filePath) => {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); return true; }
  catch (e) { console.error('delete-file error', e); return false; }
});

// Window controls (used when app is in frameless mode override)
ipcMain.on('win-close',    () => mainWindow?.close());
ipcMain.on('win-minimize', () => mainWindow?.minimize());
ipcMain.on('win-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());

// ─── File copy helper ─────────────────────────────────────────────────────────
function processFilePaths(srcPaths) {
  ensureImagesDir();
  const imported = [];

  for (const srcPath of srcPaths) {
    try {
      const ext      = path.extname(srcPath).toLowerCase();
      const baseName = path.basename(srcPath, ext);
      const uid      = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const destName = `${uid}${ext}`;
      const destPath = path.join(imagesDir(), destName);

      // Copy image into app's userData/images/
      fs.copyFileSync(srcPath, destPath);

      const stats  = fs.statSync(destPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      const today  = new Date().toISOString().split('T')[0];

      imported.push({
        id:           uid,
        name:         baseName,
        fileUrl:      `file://${destPath}`,   // used for <img src>
        filePath:     destPath,               // used for reveal/delete
        originalName: path.basename(srcPath),
        size:         `${sizeMB} MB`,
        date:         today,
        tags:         [],
        collection:   null,
        favorite:     false,
        colors:       [],
        notes:        '',
        w:            0,    // resolved client-side via Image() load
        h:            0,
      });
    } catch (e) {
      console.error('processFilePaths error for', srcPath, e);
    }
  }
  return imported;
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
