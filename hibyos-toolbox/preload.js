const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // File/folder dialogs
  pickFolder: (title) => ipcRenderer.invoke("pick-folder", title),
  pickFile: (title, filters) => ipcRenderer.invoke("pick-file", title, filters),
  pickFiles: (title, filters) => ipcRenderer.invoke("pick-files", title, filters),

  // Filesystem
  listFiles: (dir, ext) => ipcRenderer.invoke("list-files", dir, ext),
  listDirs: (dir) => ipcRenderer.invoke("list-dirs", dir),
  pathExists: (p) => ipcRenderer.invoke("path-exists", p),
  openFolder: (p) => ipcRenderer.invoke("open-folder", p),
  findThemes: (dir) => ipcRenderer.invoke("find-themes", dir),
  findBinaries: (dir) => ipcRenderer.invoke("find-binaries", dir),

  // Firmware modding
  runFirmwareMod: (opts) => ipcRenderer.invoke("run-firmware-mod", opts),
  onFwLog: (callback) => {
    const handler = (_event, msg) => callback(msg);
    ipcRenderer.on("fw-log", handler);
    return () => ipcRenderer.removeListener("fw-log", handler);
  },

  // Database update
  runDbUpdate: (opts) => ipcRenderer.invoke("run-db-update", opts),
  onDbLog: (callback) => {
    const handler = (_event, msg) => callback(msg);
    ipcRenderer.on("db-log", handler);
    return () => ipcRenderer.removeListener("db-log", handler);
  },

  // Dependencies check
  checkDeps: () => ipcRenderer.invoke("check-deps"),
  getPlatformInfo: () => ipcRenderer.invoke("get-platform-info"),

  // Open URL with system browser
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
});
