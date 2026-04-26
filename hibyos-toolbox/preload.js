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

  // ADB
  adbCheck: () => ipcRenderer.invoke("adb-check"),
  adbDetect: () => ipcRenderer.invoke("adb-detect"),
  adbLs: (remotePath) => ipcRenderer.invoke("adb-ls", remotePath),
  adbPull: (remotePath, localDir) => ipcRenderer.invoke("adb-pull", remotePath, localDir),
  adbPush: (localPath, remotePath) => ipcRenderer.invoke("adb-push", localPath, remotePath),
  adbScreenshot: (savePath) => ipcRenderer.invoke("adb-screenshot", savePath),
  adbShell: (cmd) => ipcRenderer.invoke("adb-shell", cmd),
  adbStorageInfo: () => ipcRenderer.invoke("adb-storage-info"),
  adbReboot: () => ipcRenderer.invoke("adb-reboot"),
  adbDelete: (remotePath) => ipcRenderer.invoke("adb-delete", remotePath),
  adbPushFirmware: (localPath) => ipcRenderer.invoke("adb-push-firmware", localPath),
  adbScreenshotDir: () => ipcRenderer.invoke("adb-screenshot-dir"),
  adbListScreenshots: (count) => ipcRenderer.invoke("adb-list-screenshots", count),
  adbDmesg: () => ipcRenderer.invoke("adb-dmesg"),
  adbProcesses: () => ipcRenderer.invoke("adb-processes"),
  saveTextFile: (name, content) => ipcRenderer.invoke("save-text-file", name, content),
  openFileNative: (p) => ipcRenderer.invoke("open-file-native", p),
  onAdbTransferProgress: (callback) => {
    const handler = (_event, pct) => callback(pct);
    ipcRenderer.on("adb-transfer-progress", handler);
    return () => ipcRenderer.removeListener("adb-transfer-progress", handler);
  },
});
