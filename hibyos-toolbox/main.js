const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn, execSync, execFileSync } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");

let mainWindow;
let topProc = null;

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
  if (topProc) { try { topProc.kill(); } catch {} topProc = null; }
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

const CMD_ALIASES = {
  "7z":      ["7zz", "7za"],
  "mkisofs": ["genisoimage"],
  "ffmpeg":  [],
  "adb":     [],
};

function resolveCmd(cmd) {
  const binDir = getBinDir();
  const ext = process.platform === "win32" ? ".exe" : "";
  const aliases = CMD_ALIASES[cmd] || [];

  if (binDir) {
    for (const name of [cmd, ...aliases]) {
      const local = path.join(binDir, name + ext);
      if (fs.existsSync(local)) return local;
    }
  }

  const systemOrder = [...aliases, cmd];
  if (process.platform !== "win32") {
    for (const name of systemOrder) {
      try {
        execFileSync("which", [name], { stdio: "pipe", encoding: "utf8" });
        return name;
      } catch {}
    }
  } else {
    for (const name of systemOrder) {
      try {
        execFileSync("where", [name + ext], { stdio: "pipe", encoding: "utf8" });
        return name + ext;
      } catch {}
    }
  }

  return cmd;
}

function getEnv() {
  const env = { ...process.env };
  const binDir = getBinDir();
  const sep = process.platform === "win32" ? ";" : ":";

  const extraPaths = [binDir];

  if (process.platform === "win32") {
    const localAppData = env.LOCALAPPDATA || "";
    if (localAppData) {
      try {
        const pyBase = path.join(localAppData, "Programs", "Python");
        if (fs.existsSync(pyBase)) {
          for (const d of fs.readdirSync(pyBase).sort().reverse()) {
            if (d.startsWith("Python")) {
              extraPaths.push(path.join(pyBase, d));
              extraPaths.push(path.join(pyBase, d, "Scripts"));
            }
          }
        }
      } catch {}
      extraPaths.push(path.join(localAppData, "Microsoft", "WindowsApps"));
    }
    for (const drv of ["C", "D"]) {
      try {
        const base = `${drv}:\\Python`;
        if (fs.existsSync(base)) {
          for (const d of fs.readdirSync(base).sort().reverse()) {
            extraPaths.push(path.join(base, d));
            extraPaths.push(path.join(base, d, "Scripts"));
          }
        }
      } catch {}
    }
  } else {
    extraPaths.push("/opt/homebrew/bin", "/opt/homebrew/sbin", "/usr/local/bin");
  }

  env.PATH = extraPaths.filter(Boolean).join(sep) + sep + (env.PATH || "");
  env.PYTHONDONTWRITEBYTECODE = "1";
  env.PYTHONUNBUFFERED = "1";
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
    const resolved = resolvePath(dirPath);
    if (!fs.existsSync(resolved)) return [];
    return fs.readdirSync(resolved, { withFileTypes: true })
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
    const resolved = resolvePath(themesDir);
    if (!fs.existsSync(resolved)) return [];

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
    walkDirs(resolved);
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
    const resolved = resolvePath(binariesDir);
    if (!fs.existsSync(resolved)) return [];

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
    walk(resolved);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  } catch { return []; }
});

// ═══════════════════════════════════════════════
// CROSS-PLATFORM HELPERS
// ═══════════════════════════════════════════════

function computeMd5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (d) => hash.update(d));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function resolveSubdir(parentDir, name) {
  const exact = path.join(parentDir, name);
  if (fs.existsSync(exact)) return exact;
  try {
    const lower = name.toLowerCase();
    const match = fs.readdirSync(parentDir, { withFileTypes: true })
      .find(e => e.isDirectory() && e.name.toLowerCase() === lower);
    if (match) return path.join(parentDir, match.name);
  } catch {}
  return exact;
}

function resolvePath(fullPath) {
  if (fs.existsSync(fullPath)) return fullPath;
  return resolveSubdir(path.dirname(fullPath), path.basename(fullPath));
}

function concatFiles(dir, globPrefix, outPath) {
  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith(globPrefix))
    .sort();
  const out = fs.openSync(outPath, "w");
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    fs.writeSync(out, buf);
  }
  fs.closeSync(out);
}

function splitFile(filePath, chunkSize, outPrefix) {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(chunkSize);
  let index = 0;
  let bytesRead;
  while ((bytesRead = fs.readSync(fd, buf, 0, chunkSize)) > 0) {
    const suffix = String(index).padStart(4, "a".charCodeAt(0) <= 97 ? 4 : 4);
    const label = splitIndexToAlpha(index, 4);
    fs.writeFileSync(outPrefix + label, buf.subarray(0, bytesRead));
    index++;
  }
  fs.closeSync(fd);
}

function splitIndexToAlpha(n, width) {
  let s = "";
  for (let i = 0; i < width; i++) {
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deleteJunkFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      deleteJunkFiles(full);
    } else if (entry.name === ".DS_Store" || entry.name.startsWith("._")) {
      fs.unlinkSync(full);
    }
  }
}

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
          const proc = spawn(resolved, args, {
            cwd,
            env: getEnv(),
            windowsHide: true,
          });
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

      async function execute() {
        const FIRMWARE_DIR = resolveSubdir(projectDir, "Firmware");
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
          try {
            const resolved7z = resolveCmd("7z");
            const verProc = require("child_process").execFileSync(resolved7z, ["--help"], { env: getEnv(), encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
            const verLine = verProc.split("\n").find(l => l.includes("7-Zip") || l.includes("p7zip"));
            if (verLine) sendLog(`Using: ${verLine.trim()}`);
          } catch {}
          await runStep("7z", ["x", path.join(FIRMWARE_DIR, uptFile), `-o${WORK_DIR}`, "-y"], projectDir);

          sendLog("Merging squashfs chunks...");
          concatFiles(OUT_DIR, "rootfs.squashfs.", origSquash);

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
            try { fs.chmodSync(dest, 0o755); } catch {}
            sendLog("Binary applied.");
          }

          if (themePath) {
            sendLog(`Applying theme: ${path.basename(themePath)}...`);
            copyDirRecursive(themePath, SQUASH_DIR);
            sendLog("Theme applied.");
          }

          sendLog("Cleaning .DS_Store and ._ files...");
          deleteJunkFiles(SQUASH_DIR);

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
          const CHUNK_SIZE = 524288;
          splitFile(ROOTFS_NEW, CHUNK_SIZE, path.join(OUT_DIR, "temp_chunk_"));
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

function resolvePython() {
  const env = getEnv();

  const resolved = resolveCmd("python3");
  if (resolved !== "python3") return resolved;

  if (process.platform === "win32") {
    const resolvedPy = resolveCmd("python");
    if (resolvedPy !== "python") return resolvedPy;
  }

  try {
    execFileSync("python3", ["--version"], { env, stdio: "pipe" });
    return "python3";
  } catch {}

  if (process.platform === "win32") {
    try {
      execFileSync("python", ["--version"], { env, stdio: "pipe" });
      return "python";
    } catch {}
  }

  return process.platform === "win32" ? "python" : "python3";
}

ipcMain.handle(
  "run-db-update",
  async (event, { sdPath, embedArt, resizeCovers }) => {
    return new Promise((resolve) => {
      const scriptPath = path.join(getScriptsPath(), "electron_db_wrapper.py");
      const python = resolvePython();

      function sendLog(type, msg) {
        mainWindow.webContents.send("db-log", `${type}:${msg}`);
      }

      const proc = spawn(python, ["-u", scriptPath, sdPath, embedArt ? "y" : "n", resizeCovers ? "y" : "n"], {
        cwd: sdPath,
        env: getEnv(),
        windowsHide: true,
      });

      proc.stdout.on("data", (data) => {
        for (const line of data.toString().split("\n")) {
          const trimmed = line.trim();
          if (trimmed) {
            mainWindow.webContents.send("db-log", trimmed);
          }
        }
      });

      proc.stderr.on("data", (data) => {
        mainWindow.webContents.send("db-log", `ERROR:${data.toString().trim()}`);
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `Exit code: ${code}` });
        }
      });
      proc.on("error", (err) => {
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
  const env = getEnv();

  const required = ["7z", "unsquashfs", "mksquashfs", "mkisofs"];

  for (const cmd of required) {
    const resolved = resolveCmd(cmd);

    if (resolved !== cmd && resolved !== cmd + ".exe" && fs.existsSync(resolved)) {
      deps[cmd] = "bundled";
    } else if (resolved !== cmd) {
      deps[cmd] = "system";
    } else {
      try {
        if (isWin) {
          execFileSync("where", [cmd], { env, stdio: "pipe", encoding: "utf8" });
        } else {
          execFileSync("which", [cmd], { env, stdio: "pipe", encoding: "utf8" });
        }
        deps[cmd] = "system";
      } catch {
        deps[cmd] = null;
      }
    }
  }

  const pythonCmd = resolvePython();
  try {
    execFileSync(pythonCmd, ["--version"], { env, stdio: "pipe" });
    const bundledPy = resolveCmd("python3");
    const isBundled = bundledPy !== "python3" && pythonCmd === bundledPy;
    deps["python3"] = isBundled ? "bundled" : "system";
  } catch {
    deps["python3"] = null;
  }

  const pyExec = deps["python3"] ? pythonCmd : pythonCmd;
  for (const mod of [["mutagen", "import mutagen"], ["Pillow", "from PIL import Image"]]) {
    try {
      execFileSync(pyExec, ["-c", mod[1]], { env, stdio: "pipe" });
      deps[mod[0]] = "installed";
    } catch {
      deps[mod[0]] = null;
    }
  }

  const adbPath = resolveAdb();
  if (adbPath) {
    const binDir = getBinDir();
    if (binDir && adbPath.startsWith(binDir)) {
      deps["adb"] = "bundled";
    } else {
      deps["adb"] = "system";
    }
  } else {
    deps["adb"] = null;
  }

  const ffmpegResolved = resolveCmd("ffmpeg");
  if (ffmpegResolved !== "ffmpeg" && ffmpegResolved !== "ffmpeg.exe" && fs.existsSync(ffmpegResolved)) {
    deps["ffmpeg"] = "bundled";
  } else if (ffmpegResolved !== "ffmpeg") {
    deps["ffmpeg"] = "system";
  } else {
    try {
      if (isWin) {
        execFileSync("where", ["ffmpeg"], { env, stdio: "pipe", encoding: "utf8" });
      } else {
        execFileSync("which", ["ffmpeg"], { env, stdio: "pipe", encoding: "utf8" });
      }
      deps["ffmpeg"] = "system";
    } catch {
      deps["ffmpeg"] = null;
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


// ═══════════════════════════════════════════════
// ADB INTEGRATION
// ═══════════════════════════════════════════════

function resolveAdb() {
  const bundled = resolveCmd("adb");
  if (bundled !== "adb") return bundled;

  const home = process.env.HOME || process.env.USERPROFILE || "";
  const candidates = [];

  if (process.platform === "win32") {
    candidates.push(
      path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk", "platform-tools", "adb.exe"),
      path.join(home, "Android", "Sdk", "platform-tools", "adb.exe"),
      path.join("C:", "Android", "platform-tools", "adb.exe"),
    );
  } else if (process.platform === "darwin") {
    candidates.push(
      path.join(home, "Library", "Android", "sdk", "platform-tools", "adb"),
      "/opt/homebrew/bin/adb",
      "/usr/local/bin/adb",
    );
  } else {
    candidates.push(
      path.join(home, "Android", "Sdk", "platform-tools", "adb"),
      "/usr/bin/adb",
      "/usr/local/bin/adb",
    );
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  try {
    const which = process.platform === "win32" ? "where" : "which";
    execFileSync(which, ["adb"], { stdio: "pipe", encoding: "utf8" });
    return "adb";
  } catch {}

  return null;
}

function adbExec(args) {
  const adb = resolveAdb();
  if (!adb) throw new Error("ADB not found");
  return execFileSync(adb, args, { env: getEnv(), encoding: "utf8", stdio: "pipe", timeout: 10000 });
}

function adbExecLong(args, timeout = 120000) {
  const adb = resolveAdb();
  if (!adb) throw new Error("ADB not found");
  return execFileSync(adb, args, { env: getEnv(), encoding: "utf8", stdio: "pipe", timeout });
}

ipcMain.handle("adb-check", async () => {
  const adb = resolveAdb();
  if (!adb) return { available: false };
  try {
    const ver = execFileSync(adb, ["version"], { encoding: "utf8", stdio: "pipe", timeout: 5000 });
    const line = ver.split("\n").find(l => l.includes("Android Debug Bridge"));
    return { available: true, version: line ? line.trim() : "unknown" };
  } catch {
    return { available: false };
  }
});

ipcMain.handle("adb-detect", async () => {
  try {
    const out = adbExec(["devices", "-l"]);
    const lines = out.split("\n").filter(l => l.includes("device") && !l.startsWith("List"));
    for (const line of lines) {
      if (/ingenic/i.test(line) || /hiby/i.test(line)) {
        const serial = line.split(/\s+/)[0];
        let model = (line.match(/model:(\S+)/) || [])[1] || "HiBy DAP";
        const product = (line.match(/product:(\S+)/) || [])[1] || "";

        let fwVersion = "";
        const configPaths = [
          "/usr/resource/config.json",
          "/usr/share/config.json",
          "/etc/config.json",
          "/resource/config.json",
        ];
        for (const cfgPath of configPaths) {
          try {
            const cfgOut = adbExec(["shell", "cat", cfgPath]);
            const cfg = JSON.parse(cfgOut);
            const entries = Array.isArray(cfg) ? cfg : [cfg];
            const prod = entries.find(e => e.type === "product");
            if (prod) {
              const company = (prod.company || "").trim();
              const device = (prod.device || "").trim();
              if (company || device) {
                model = [company, device].filter(Boolean).join(" ");
              }
              if (prod.version) fwVersion = prod.version.trim();
              break;
            }
          } catch {}
        }

        let kernelVersion = "";
        try {
          kernelVersion = adbExec(["shell", "uname", "-r"]).trim();
        } catch {}

        let battery = null;
        try {
          const batOut = adbExec(["shell", "cat", "/sys/class/power_supply/battery/uevent"]);
          const batProps = {};
          for (const line of batOut.split("\n")) {
            const eq = line.indexOf("=");
            if (eq > 0) batProps[line.substring(0, eq).trim()] = line.substring(eq + 1).trim();
          }
          const capacity = batProps["POWER_SUPPLY_CAPACITY"];
          const health = batProps["POWER_SUPPLY_HEALTH"];
          if (capacity) {
            battery = { capacity, health: health || "Unknown" };
          }
        } catch {}

        return { connected: true, serial, model, product, fwVersion, kernelVersion, battery };
      }
    }
    return { connected: false };
  } catch (err) {
    return { connected: false, error: err.message };
  }
});

ipcMain.handle("adb-ls", async (event, remotePath) => {
  try {
    const escaped = remotePath.replace(/'/g, "'\\''");
    const out = adbExec(["shell", `TERM=dumb ls -la '${escaped}'`]);

    const clean = out.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");

    const entries = [];
    for (const line of clean.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("total ") || trimmed.startsWith("total:")) continue;
      
      const m = trimmed.match(
        /^([d\-lcrwxsStT][\-rwxsStT]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+(\w{3}\s+\d+\s+[\d:]+)\s+(.+)$/
      );

      if (m) {
        let name = m[4].trim();
        if (m[1].startsWith("l")) name = name.replace(/\s*->.*$/, "");
        if (name === "." || name === "..") continue;
        entries.push({
          name,
          isDir: m[1].startsWith("d") || m[1].startsWith("l"),
          size: parseInt(m[2], 10),
          date: m[3],
        });
      }
    }
    entries.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return { ok: true, entries };
  } catch (err) {
    try {
      const escaped = remotePath.replace(/'/g, "'\\''");
      const out2 = adbExec(["shell", `TERM=dumb ls '${escaped}'`]);
      const clean2 = out2.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
      const entries = clean2.split("\n")
        .map(l => l.trim())
        .filter(l => l && l !== "." && l !== "..")
        .map(name => ({ name, isDir: false, size: 0, date: "" }));
      return { ok: true, entries };
    } catch (err2) {
      return { ok: false, error: err2.message };
    }
  }
});

ipcMain.handle("adb-pull", async (event, remotePath, localDir) => {
  try {
    const adb = resolveAdb();
    if (!adb) throw new Error("ADB not found");

    return new Promise((resolve) => {
      const proc = spawn(adb, ["pull", remotePath, localDir], {
        env: getEnv(), windowsHide: true,
      });
      let out = "";
      proc.stdout.on("data", (d) => {
        out += d.toString();
         [ 45%] /path/to/file
        const m = d.toString().match(/\[\s*(\d+)%\]/);
        if (m) mainWindow.webContents.send("adb-transfer-progress", parseInt(m[1]));
      });
      proc.stderr.on("data", (d) => {
        out += d.toString();
        const m = d.toString().match(/\[\s*(\d+)%\]/);
        if (m) mainWindow.webContents.send("adb-transfer-progress", parseInt(m[1]));
      });
      proc.on("close", (code) => {
        mainWindow.webContents.send("adb-transfer-progress", -1);
        if (code === 0) resolve({ ok: true, output: out.trim() });
        else resolve({ ok: false, error: out.trim() || `exit code ${code}` });
      });
      proc.on("error", (err) => {
        mainWindow.webContents.send("adb-transfer-progress", -1);
        resolve({ ok: false, error: err.message });
      });
    });
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("adb-push", async (event, localPath, remotePath) => {
  try {
    const adb = resolveAdb();
    if (!adb) throw new Error("ADB not found");

    return new Promise((resolve) => {
      const proc = spawn(adb, ["push", localPath, remotePath], {
        env: getEnv(), windowsHide: true,
      });
      let out = "";
      proc.stdout.on("data", (d) => {
        out += d.toString();
        const m = d.toString().match(/\[\s*(\d+)%\]/);
        if (m) mainWindow.webContents.send("adb-transfer-progress", parseInt(m[1]));
      });
      proc.stderr.on("data", (d) => {
        out += d.toString();
        const m = d.toString().match(/\[\s*(\d+)%\]/);
        if (m) mainWindow.webContents.send("adb-transfer-progress", parseInt(m[1]));
      });
      proc.on("close", (code) => {
        mainWindow.webContents.send("adb-transfer-progress", -1);
        if (code === 0) resolve({ ok: true, output: out.trim() });
        else resolve({ ok: false, error: out.trim() || `exit code ${code}` });
      });
      proc.on("error", (err) => {
        mainWindow.webContents.send("adb-transfer-progress", -1);
        resolve({ ok: false, error: err.message });
      });
    });
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

(/dev/fb0 → rgb565le → ffmpeg → PNG)
ipcMain.handle("adb-screenshot", async (event, savePath) => {
  try {
    const docsDir = app.getPath("documents");
    const screenshotDir = path.join(docsDir, "HiBy Screenshots");
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const dest = savePath || path.join(screenshotDir, `hiby_${Date.now()}.png`);
    const tmpRaw = path.join(app.getPath("temp"), `fb_${Date.now()}.raw`);

    const adb = resolveAdb();
    if (!adb) throw new Error("ADB not found");

    const fd = fs.openSync(tmpRaw, "w");
    try {
      const fbData = execFileSync(adb, ["shell", "cat /dev/fb0"], {
        env: getEnv(), maxBuffer: 2 * 1024 * 1024, timeout: 15000,
      });
      fs.writeSync(fd, fbData);
    } finally {
      fs.closeSync(fd);
    }

    const ffmpeg = resolveCmd("ffmpeg");
    execFileSync(ffmpeg, [
      "-y",
      "-vcodec", "rawvideo", "-f", "rawvideo",
      "-pix_fmt", "rgb565le",
      "-s", "480x720",
      "-i", tmpRaw,
      "-frames:v", "1", "-update", "1",
      dest,
    ], { env: getEnv(), stdio: "pipe", timeout: 15000 });

    try { fs.unlinkSync(tmpRaw); } catch {}

    return { ok: true, path: dest };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("adb-dmesg", async () => {
  try {
    const out = adbExecLong(["shell", "dmesg"], 30000);
    return { ok: true, output: out };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("save-text-file", async (event, defaultName, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Save file",
    defaultPath: defaultName,
    filters: [{ name: "Log files", extensions: ["log", "txt"] }],
  });
  if (result.canceled || !result.filePath) return { ok: false };
  try {
    fs.writeFileSync(result.filePath, content, "utf8");
    return { ok: true, path: result.filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("adb-processes", async () => {
  try {
    const out = adbExecLong(["shell", "top", "-b", "-n", "1"], 15000);
    return { ok: true, output: out };
  } catch (err) {
    try {
      const out2 = adbExec(["shell", "ps", "-w"]);
      return { ok: true, output: out2 };
    } catch {
      return { ok: false, error: err.message };
    }
  }
});

ipcMain.handle("adb-shell", async (event, cmd) => {
  try {
    const adb = resolveAdb();
    if (!adb) throw new Error("ADB not found");
    const out = execFileSync(adb, ["shell", cmd], { env: getEnv(), encoding: "utf8", stdio: "pipe", timeout: 10000 });
    return { ok: true, output: out.trimEnd() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("adb-storage-info", async () => {
  try {
    const out = adbExec(["shell", "df", "-h"]);
    const result = { ok: true, sd: null, internal: null, ram: null };

    for (const line of out.split("\n")) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 5) continue;

      if (/\/usr\/data\/mnt\/sd|\/mnt\/sd/.test(line)) {
        result.sd = { size: parts[1], used: parts[2], avail: parts[3], pct: parts[4] };
      }
      if (/\/usr\/data\s|\/data\s/.test(line) && !result.internal) {
        result.internal = { size: parts[1], used: parts[2], avail: parts[3], pct: parts[4] };
      }
    }

    try {
      const mountOut = adbExec(["shell", "mount"]);
      const sdDevices = new Set();
      for (const line of mountOut.split("\n")) {
        if (/\/usr\/data\/mnt\/sd|\/mnt\/sd/.test(line)) {
          const devMatch = line.match(/\/dev\/(mmcblk\d+|sd[a-z]|mtdblock\d+)/);
          if (devMatch) sdDevices.add(devMatch[1]);
        }
      }

      const partOut = adbExec(["shell", "cat", "/proc/partitions"]);
      let romBlocks = 0;
      let hasWholeDisk = false;

      for (const line of partOut.split("\n")) {
        const m = line.trim().match(/^\s*\d+\s+\d+\s+(\d+)\s+(\S+)\s*$/);
        if (!m) continue;
        const blocks = parseInt(m[1], 10);
        const dev = m[2];
        if (sdDevices.has(dev)) continue;
        if (/^mmcblk\d+$/.test(dev) && !/p\d+$/.test(dev)) {
          romBlocks = blocks;
          hasWholeDisk = true;
          break;
        }
      }

      if (!hasWholeDisk) {
        for (const line of partOut.split("\n")) {
          const m = line.trim().match(/^\s*\d+\s+\d+\s+(\d+)\s+(\S+)\s*$/);
          if (!m) continue;
          const blocks = parseInt(m[1], 10);
          const dev = m[2];
          if (sdDevices.has(dev)) continue;
          if (/^mtdblock\d+$/.test(dev)) {
            romBlocks += blocks;
          }
        }
      }

      if (romBlocks > 0) {
        const totalBytes = romBlocks * 1024;
        if (totalBytes >= 1073741824) {
          result.romTotal = (totalBytes / 1073741824).toFixed(1) + " GB";
        } else {
          result.romTotal = (totalBytes / 1048576).toFixed(0) + " MB";
        }
      }
    } catch {}

    try {
      const memOut = adbExec(["shell", "cat /proc/meminfo"]);
      let totalKB = 0, availKB = 0;
      for (const line of memOut.split("\n")) {
        const tm = line.match(/^MemTotal:\s+(\d+)\s+kB/);
        if (tm) totalKB = parseInt(tm[1], 10);
        const am = line.match(/^MemAvailable:\s+(\d+)\s+kB/);
        if (am) availKB = parseInt(am[1], 10);
      }
      if (totalKB > 0) {
        const usedKB = totalKB - availKB;
        const fmt = (kb) => {
          if (kb >= 1048576) return (kb / 1048576).toFixed(1) + " GB";
          return (kb / 1024).toFixed(0) + " MB";
        };
        result.ram = { total: fmt(totalKB), used: fmt(usedKB), avail: fmt(availKB) };
      }
    } catch {}

    return result;
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("adb-screenshot-dir", async () => {
  const docsDir = app.getPath("documents");
  return path.join(docsDir, "HiBy Screenshots");
});

ipcMain.handle("adb-list-screenshots", async (event, count) => {
  try {
    const docsDir = app.getPath("documents");
    const screenshotDir = path.join(docsDir, "HiBy Screenshots");
    if (!fs.existsSync(screenshotDir)) return [];
    const files = fs.readdirSync(screenshotDir, { withFileTypes: true })
      .filter(e => e.isFile() && /\.(png|jpg|jpeg|bmp)$/i.test(e.name))
      .map(e => {
        const fullPath = path.join(screenshotDir, e.name);
        const stat = fs.statSync(fullPath);
        return { name: e.name, path: fullPath, mtime: stat.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, count || 5);
    return files;
  } catch { return []; }
});

ipcMain.handle("open-file-native", async (event, filePath) => {
  shell.openPath(filePath);
});

ipcMain.handle("adb-reboot", async () => {
  try {
    adbExec(["reboot"]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

const SD_PATH_PREFIX = "/usr/data/mnt/sd_0";
ipcMain.handle("adb-delete", async (event, remotePath) => {
  try {
    const normalized = remotePath.replace(/\/+/g, "/").replace(/\/$/, "");
    if (!normalized.startsWith(SD_PATH_PREFIX + "/") || normalized === SD_PATH_PREFIX) {
      return { ok: false, error: "Deletion is only allowed on the SD card." };
    }
    if (normalized.includes("/../") || normalized.endsWith("/..")) {
      return { ok: false, error: "Invalid path." };
    }

    const escaped = normalized.replace(/'/g, "'\\''");
    adbExec(["shell", `rm -rf '${escaped}'`]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("adb-push-firmware", async (event, localUptPath) => {
  try {
    let sdMount = "/usr/data/mnt/sd_0";
    try {
      const mounts = adbExec(["shell", "mount"]);
      const sdLine = mounts.split("\n").find(l => /\/usr\/data\/mnt\/sd/i.test(l));
      if (sdLine) {
        const mountPoint = sdLine.match(/on\s+(\S+)/);
        if (mountPoint) sdMount = mountPoint[1];
      }
    } catch {}

    const remotePath = sdMount + "/" + path.basename(localUptPath);
    const out = adbExecLong(["push", localUptPath, remotePath], 600000);
    return { ok: true, output: out.trim(), remotePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
