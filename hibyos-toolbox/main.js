const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn, execSync } = require("child_process");
const fs = require("fs");

let mainWindow;

function createWindow() {
  const isMac = process.platform === "darwin";

  const winOptions = {
    width: 960,
    height: 680,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#0f0f13",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  };

  if (isMac) {
    winOptions.titleBarStyle = "hiddenInset";
    winOptions.trafficLightPosition = { x: 16, y: 18 };
  } else {
    winOptions.autoHideMenuBar = true;
  }

  mainWindow = new BrowserWindow(winOptions);
  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ═══════════════════════════════════════════════
// BINARY RESOLUTION — local bin/ first, system fallback
// ═══════════════════════════════════════════════

function getScriptsPath() {
  const resourcePath = path.join(process.resourcesPath, "scripts");
  if (fs.existsSync(resourcePath)) return resourcePath;
  return path.join(__dirname, "scripts");
}

function getBinDir() {
  const arch = process.arch;
  const plat = process.platform;

  const platformDir = path.join(getScriptsPath(), "bin", `${plat}-${arch}`);
  if (fs.existsSync(platformDir)) return platformDir;

  const genericDir = path.join(getScriptsPath(), "bin");
  if (fs.existsSync(genericDir)) return genericDir;

  return null;
}

function resolveCmd(cmd) {
  const binDir = getBinDir();
  const ext = process.platform === "win32" ? ".exe" : "";

  if (binDir) {
    const local = path.join(binDir, cmd + ext);
    if (fs.existsSync(local)) return local;
  }

  return cmd;
}

function getEnv() {
  const env = { ...process.env };
  const binDir = getBinDir();
  const sep = process.platform === "win32" ? ";" : ":";

  const extraPaths = [
    binDir,
    "/opt/homebrew/bin",
    "/opt/homebrew/sbin",
    "/usr/local/bin",
  ].filter(Boolean);

  env.PATH = extraPaths.join(sep) + sep + (env.PATH || "");
  env.PYTHONDONTWRITEBYTECODE = "1";
  return env;
}


ipcMain.handle("pick-folder", async (event, title) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: title || "Select Folder",
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("pick-file", async (event, title, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: title || "Select File",
    filters: filters || [],
    properties: ["openFile"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("pick-files", async (event, title, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: title || "Select Files",
    filters: filters || [],
    properties: ["openFile", "multiSelections"],
  });
  return result.canceled ? null : result.filePaths;
});


ipcMain.handle("list-files", async (event, dirPath, extension) => {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isFile() && (!extension || e.name.endsWith(extension)))
      .map((e) => e.name);
  } catch { return []; }
});

ipcMain.handle("list-dirs", async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch { return []; }
});

ipcMain.handle("path-exists", async (event, p) => fs.existsSync(p));

ipcMain.handle("open-folder", async (event, folderPath) => {
  shell.showItemInFolder(folderPath);
});

ipcMain.handle("open-external", async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle("find-themes", async (event, themesDir) => {
  try {
    if (!fs.existsSync(themesDir)) return [];

    const allDirs = [];
    function walkDirs(dir) {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        if (!e.isDirectory() || e.name.startsWith(".")) continue;
        const full = path.join(dir, e.name);
        allDirs.push(full);
        walkDirs(full);
      }
    }
    walkDirs(themesDir);
    allDirs.sort();

    const validPaths = [];
    const validNames = [];

    for (const dir of allDirs) {
      let isSub = false;
      for (const added of validPaths) {
        if (dir.startsWith(added + "/") || dir === added) {
          isSub = true;
          break;
        }
      }
      if (isSub) continue;

      const hasUsr = fs.existsSync(path.join(dir, "usr"));
      const hasEtc = fs.existsSync(path.join(dir, "etc"));
      if (hasUsr || hasEtc) {
        validPaths.push(dir);
        validNames.push(path.basename(dir));
      }
    }

    return validPaths.map((p, i) => ({ path: p, name: validNames[i] }));
  } catch { return []; }
});

ipcMain.handle("find-binaries", async (event, binariesDir) => {
  try {
    if (!fs.existsSync(binariesDir)) return [];

    const results = [];
    function walk(dir) {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(full);
        } else if (e.isFile() && e.name === "hiby_player") {
          results.push({
            path: dir,
            name: path.basename(dir),
          });
        }
      }
    }
    walk(binariesDir);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  } catch { return []; }
});

// ═══════════════════════════════════════════════
// FIRMWARE MODDER
// ═══════════════════════════════════════════════

ipcMain.handle(
  "run-firmware-mod",
  async (event, { projectDir, uptFile, binaryPath, themePath }) => {
    return new Promise((resolve) => {
      function sendLog(msg) {
        mainWindow.webContents.send("fw-log", msg);
      }

      function runStep(cmd, args, cwd) {
        const resolved = resolveCmd(cmd);
        return new Promise((res, rej) => {
          sendLog(`$ ${path.basename(resolved)} ${args.join(" ")}`);
          const proc = spawn(resolved, args, { cwd, env: getEnv() });
          let out = "";
          proc.stdout.on("data", (d) => {
            out += d.toString();
            sendLog(d.toString().trimEnd());
          });
          proc.stderr.on("data", (d) => sendLog(d.toString().trimEnd()));
          proc.on("close", (code) => {
            if (code !== 0) rej(new Error(`${cmd} exit code ${code}`));
            else res(out);
          });
          proc.on("error", (err) => rej(err));
        });
      }

      async function computeMd5(filePath) {
        try {
          const out = await runStep("md5sum", [filePath], path.dirname(filePath));
          return out.trim().split(/\s+/)[0];
        } catch {
          const out = await runStep("md5", ["-q", filePath], path.dirname(filePath));
          return out.trim();
        }
      }

      async function execute() {
        const FIRMWARE_DIR = path.join(projectDir, "Firmware");
        const WORK_DIR = path.join(projectDir, "temp");
        const OUT_DIR = path.join(WORK_DIR, "ota_v0");
        const SQUASH_DIR = path.join(projectDir, "squashfs-root");
        const origSquash = path.join(projectDir, "rootfs_original.squashfs");

        try {
          sendLog("Cleaning up previous operations...");
          for (const d of [WORK_DIR, SQUASH_DIR]) {
            if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
          }
          if (fs.existsSync(origSquash)) fs.unlinkSync(origSquash);
          fs.mkdirSync(WORK_DIR, { recursive: true });

          sendLog("Extracting firmware...");
          await runStep("7z", ["x", path.join(FIRMWARE_DIR, uptFile), `-o${WORK_DIR}`, "-y"], projectDir);

          sendLog("Merging squashfs chunks...");
          await runStep("bash", ["-c", `cat rootfs.squashfs.* > "${origSquash}"`], OUT_DIR);

          sendLog("Extracting filesystem (rootfs)...");
          await runStep("unsquashfs", ["-f", "-d", SQUASH_DIR, origSquash], projectDir);
          if (fs.existsSync(origSquash)) fs.unlinkSync(origSquash);

          sendLog("Cleaning up old squashfs files...");
          for (const f of fs.readdirSync(OUT_DIR)) {
            if (f.startsWith("ota_md5_rootfs.squashfs.") || f.startsWith("rootfs.")) {
              fs.unlinkSync(path.join(OUT_DIR, f));
            }
          }

          if (binaryPath) {
            sendLog(`Applying patched binary: ${path.basename(binaryPath)}...`);
            const dest = path.join(SQUASH_DIR, "usr", "bin", "hiby_player");
            fs.copyFileSync(path.join(binaryPath, "hiby_player"), dest);
            fs.chmodSync(dest, 0o755);
            sendLog("Binary applied.");
          }

          if (themePath) {
            sendLog(`Applying theme: ${path.basename(themePath)}...`);
            await runStep("cp", ["-a", `${themePath}/.`, SQUASH_DIR], projectDir);
            sendLog("Theme applied.");
          }

          sendLog("Cleaning .DS_Store and ._ files...");
          await runStep("find", [SQUASH_DIR, "-name", ".DS_Store", "-type", "f", "-delete"], projectDir).catch(() => {});
          await runStep("find", [SQUASH_DIR, "-name", "._*", "-type", "f", "-delete"], projectDir).catch(() => {});

          sendLog("Creating new filesystem (squashfs)...");
          const ROOTFS_NEW = path.join(OUT_DIR, "rootfs.squashfs");
          await runStep("mksquashfs", [SQUASH_DIR, ROOTFS_NEW, "-comp", "lzo", "-all-root"], projectDir);

          sendLog("Computing checksums...");
          const ORIGINAL_SUM = await computeMd5(ROOTFS_NEW);
          const SIZE = fs.statSync(ROOTFS_NEW).size;

          const otaIn = path.join(OUT_DIR, "ota_update.in");
          let X_SIZE = "0", X_MD5 = "";
          if (fs.existsSync(otaIn)) {
            const content = fs.readFileSync(otaIn, "utf8");
            const sm = content.match(/img_name=xImage[\s\S]*?img_size=(\S+)/);
            const mm = content.match(/img_name=xImage[\s\S]*?img_md5=(\S+)/);
            if (sm) X_SIZE = sm[1].trim();
            if (mm) X_MD5 = mm[1].trim();
          }

          sendLog("Updating ota_update.in...");
          fs.writeFileSync(otaIn,
            `ota_version=0\n\nimg_type=kernel\nimg_name=xImage\nimg_size=${X_SIZE}\nimg_md5=${X_MD5}\n\nimg_type=rootfs\nimg_name=rootfs.squashfs\nimg_size=${SIZE}\nimg_md5=${ORIGINAL_SUM}\n`
          );

          sendLog("Splitting into chunks and creating MD5 chain...");
          await runStep("split", ["-b", "524288", "-a", "4", ROOTFS_NEW, path.join(OUT_DIR, "temp_chunk_")], projectDir);
          fs.unlinkSync(ROOTFS_NEW);

          const MD5_FILE = path.join(OUT_DIR, `ota_md5_rootfs.squashfs.${ORIGINAL_SUM}`);
          let md5Chain = "", count = 0, currentSum = ORIGINAL_SUM;

          for (const chunk of fs.readdirSync(OUT_DIR).filter((f) => f.startsWith("temp_chunk_")).sort()) {
            const suffix = String(count).padStart(4, "0");
            const newName = `rootfs.squashfs.${suffix}.${currentSum}`;
            fs.renameSync(path.join(OUT_DIR, chunk), path.join(OUT_DIR, newName));
            currentSum = await computeMd5(path.join(OUT_DIR, newName));
            md5Chain += currentSum + "\n";
            count++;
          }
          fs.writeFileSync(MD5_FILE, md5Chain);

          sendLog("Generating firmware file (r3proii.upt)...");
          const uptOut = path.join(projectDir, "r3proii.upt");
          if (fs.existsSync(uptOut)) fs.unlinkSync(uptOut);
          await runStep("mkisofs", ["-o", uptOut, "-J", "-r", "./temp/"], projectDir);

          sendLog("Cleaning up temp files...");
          if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true, force: true });
          if (fs.existsSync(SQUASH_DIR)) fs.rmSync(SQUASH_DIR, { recursive: true, force: true });

          sendLog("");
          sendLog("✅ REPACKING COMPLETE!");
          sendLog(`Firmware saved as: ${uptOut}`);
          resolve({ success: true, outputPath: uptOut });
        } catch (err) {
          sendLog(`❌ ERROR: ${err.message}`);
          resolve({ success: false, error: err.message });
        }
      }

      execute();
    });
  }
);

// ═══════════════════════════════════════════════
// DATABASE UPDATER
// ═══════════════════════════════════════════════

ipcMain.handle(
  "run-db-update",
  async (event, { sdPath, embedArt, resizeCovers }) => {
    return new Promise((resolve) => {
      const scriptPath = path.join(getScriptsPath(), "Update_Database.py");
      const python = resolveCmd("python3");

      function sendLog(msg) {
        mainWindow.webContents.send("db-log", msg);
      }

      sendLog(`$ python3 Update_Database.py "${sdPath}"`);

      const input = [embedArt ? "y" : "n", resizeCovers ? "y" : "n"].join("\n") + "\n";
      const proc = spawn(python, [scriptPath], { cwd: sdPath, env: getEnv() });

      proc.stdin.write(input);
      proc.stdin.end();

      proc.stdout.on("data", (data) => {
        for (const line of data.toString().split("\n")) {
          if (line.trim()) sendLog(line);
        }
      });
      proc.stderr.on("data", (data) => sendLog(data.toString().trimEnd()));

      proc.on("close", (code) => {
        if (code === 0) {
          sendLog("");
          sendLog("✅ Database updated successfully!");
          resolve({ success: true });
        } else {
          sendLog(`❌ Process exited with code ${code}`);
          resolve({ success: false, error: `Exit code: ${code}` });
        }
      });
      proc.on("error", (err) => {
        sendLog(`❌ Failed to start: ${err.message}`);
        resolve({ success: false, error: err.message });
      });
    });
  }
);

// ═══════════════════════════════════════════════
// DEPENDENCY CHECK
// ═══════════════════════════════════════════════

ipcMain.handle("check-deps", async () => {
  const deps = {};
  const isWin = process.platform === "win32";
  const required = ["7z", "unsquashfs", "mksquashfs", "mkisofs", "python3", "md5sum", "split"];

  for (const cmd of required) {
    const resolved = resolveCmd(cmd);

    if (resolved !== cmd && fs.existsSync(resolved)) {
      deps[cmd] = "bundled";
      continue;
    }

    try {
      const which = isWin ? "where" : "which";
      execSync(`${which} ${cmd}`, { env: getEnv(), encoding: "utf8" });
      deps[cmd] = "system";
    } catch {
      deps[cmd] = null;
    }
  }

  const python = resolveCmd("python3");
  for (const mod of [["mutagen", "import mutagen"], ["Pillow", "from PIL import Image"]]) {
    try {
      execSync(`${python} -c "${mod[1]}"`, { env: getEnv() });
      deps[mod[0]] = "installed";
    } catch {
      deps[mod[0]] = null;
    }
  }

  return deps;
});

ipcMain.handle("get-platform-info", async () => ({
  platform: process.platform,
  arch: process.arch,
  binDir: getBinDir(),
  hasBundledBins: (() => {
    const d = getBinDir();
    return d !== null && fs.existsSync(d) && fs.readdirSync(d).length > 0;
  })(),
}));
