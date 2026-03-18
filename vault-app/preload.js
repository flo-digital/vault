const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, minimal API surface to the renderer (vault.html)
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  // ── Data persistence ──────────────────────────────────────────────────────
  loadData:          ()       => ipcRenderer.invoke('load-data'),
  saveData:          (data)   => ipcRenderer.invoke('save-data', data),

  // ── File import ───────────────────────────────────────────────────────────
  importImages:      ()           => ipcRenderer.invoke('import-images'),
  importDroppedFiles:(filePaths)  => ipcRenderer.invoke('import-dropped-files', filePaths),

  // ── File operations ───────────────────────────────────────────────────────
  revealFile:        (filePath) => ipcRenderer.invoke('reveal-file', filePath),
  deleteFile:        (filePath) => ipcRenderer.invoke('delete-file', filePath),

  // ── Window controls ───────────────────────────────────────────────────────
  // (Native traffic lights handle close/min/max via titleBarStyle:'hidden',
  //  but we keep these for programmatic use if ever needed)
  windowClose:    () => ipcRenderer.send('win-close'),
  windowMinimize: () => ipcRenderer.send('win-minimize'),
  windowMaximize: () => ipcRenderer.send('win-maximize'),

  // ── Menu-driven commands → vault.html listeners ───────────────────────────
  onMenuImport:       (cb) => ipcRenderer.on('menu-import',       () => cb()),
  onMenuNewCollection:(cb) => ipcRenderer.on('menu-new-collection',() => cb()),
  onMenuReveal:       (cb) => ipcRenderer.on('menu-reveal',       () => cb()),
  onSetView:          (cb) => ipcRenderer.on('set-view',  (_e, v) => cb(v)),
  onSetStyle:         (cb) => ipcRenderer.on('set-style', (_e, v) => cb(v)),
  onToggleTheme:      (cb) => ipcRenderer.on('toggle-theme',      () => cb()),
  onSelectAll:        (cb) => ipcRenderer.on('select-all',        () => cb()),
});
