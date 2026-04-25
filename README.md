# HibyOS Toolbox

Desktop app for modding HibyOS firmware and updating the music database on HiBy DAPs.

Built with Electron. Runs on macOS, Linux, and Windows.

<img src="https://github.com/Jepl4r/hiby-tools/blob/23ee392fef51df29261fced68c8bcc1c0e3465f8/Screenshots/Firmware%20Modder.png" alt="" width="536" height="396">

<img src="https://github.com/Jepl4r/hiby-tools/blob/23ee392fef51df29261fced68c8bcc1c0e3465f8/Screenshots/Database%20Updater.png" alt="" width="536" height="396">

## Features

**Firmware Modder** — Unpack, modify, and repack HibyOS firmware (`.upt` files):
- Select a base firmware
- Optionally replace `hiby_player` with a patched binary
- Optionally apply a custom theme
- Generates a ready-to-flash `r3proii.upt`

**Database Updater** — Rebuild the music database on your SD card:
- Scans audio files and reads metadata tags
- Optionally embeds and resizes album art (360×360)
- Rebuilds `usrlocal_media.db` for your DAP

## Quick Start (Development)

```bash
git clone https://github.com/hiby-modding/hibyos-toolbox.git
cd hibyos-toolbox
npm install
npm start
```

## Building the App

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (comes with Node.js)

---

### 1. Install dependencies

```bash
npm install
```

---

### 2. Bundle native binaries (recommended)

The app can use system-installed tools or bundled binaries. To make the app self-contained, copy the required binaries into `scripts/bin/`.

**Automatic (macOS and Linux):**

```bash
./bundle-bins.sh
```

This detects your platform (e.g. `darwin-arm64`) and copies `7z`, `unsquashfs`, `mksquashfs`, and `mkisofs` from your system.

**Manual:**

```bash
mkdir -p scripts/bin/darwin-arm64   # or linux-x64, win32-x64
cp $(which 7z) scripts/bin/darwin-arm64/
cp $(which unsquashfs) scripts/bin/darwin-arm64/
cp $(which mksquashfs) scripts/bin/darwin-arm64/
cp $(which mkisofs) scripts/bin/darwin-arm64/
```

The app checks for binaries in this order:
1. `scripts/bin/<platform>-<arch>/` (e.g. `darwin-arm64`)
2. `scripts/bin/` (generic fallback)
3. System `PATH`

---

**Windows**

#### 1. `7z.exe` + `7z.dll`

**Source:** [7-Zip](https://www.7-zip.org/download.html)

1. Install 7-Zip (or download the "console version" `.7z` archive).
2. Copy **both** files from `C:\Program Files\7-Zip\`:
   - `7z.exe`
   - `7z.dll` ← required, 7z.exe won't work without it

**Alternative ([MSYS2](https://www.msys2.org/)):**
```bash
pacman -S p7zip
```
This gives you `7z.exe` at `<install location of MSYS2>/usr/bin/`.

---

#### 2. `unsquashfs.exe` and `mksquashfs.exe`

**Source [MSYS2](https://www.msys2.org/) (Recommended):**
```bash
pacman -S squashfs-tools
```
This gives you both `unsquashfs.exe` and `mksquashfs.exe` at `<install location of MSYS2>/usr/bin/`.

**Alternative:** [squashfs-tools-ng](https://infraroot.at/pub/squashfs/windows/)
Download the latest `*-mingw64.zip` from releases. Note that squashfs-tools-ng has a **different CLI** (`rdsquashfs` / `gensquashfs`) than the classic `unsquashfs` / `mksquashfs`, so MSYS2 squashfs-tools is strongly preferred.

### ⚠️ Important: The `unsquashfs.exe` and `mksquashfs.exe` packages are MSYS2 binaries that depend on `msys-2.0.dll` and other MSYS2 runtime DLLs.

To make them work standalone (outside MSYS2), copy these DLLs alongside the `.exe` files:

>From C:/WINDOWS/SYSTEM32/
```
ntdll.dll
xtajit64se.dll
KERNEL32.DLL
KERNELBASE.dll
apphelp.dll
```
>From /usr/bin/ inside the MSYS2 installation folder

```
msys-2.0.dll
msys-lz4-1.dll
msys-lzo2-2.dll
msys-z.dll
msys-lzma-5.dll
msys-gcc_s-seh-1.dll
msys-zstd-1.dll
```

#### 3. `mkisofs.exe`

**⚠️ Not available in MSYS2** — `cdrtools` / `genisoimage` are not packaged.

**Source:** [Schily cdrtools native Windows build](https://opensourcepack.blogspot.com/p/cdrtools.html)

1. Download `schily-cdrtools-3.01a23.7z` 
2. Extract and find `mkisofs.exe` inside.
3. Copy it into `scripts/bin/win32-x64/`.

---

### 3. Add app icons

Place your icons in the `assets/` folder:

```
assets/
├── icon.icns   ← macOS
├── icon.ico    ← Windows
└── icon.png    ← Linux
```

---

### 4. Build

**macOS (Apple Silicon):**
```bash
npm run build:mac-arm64
```

**Windows:**
```bash
npm run build:win
```

**Linux:**
```bash
npm run build:linux
```

**All platforms at once:**
```bash
npm run build:all
```

Output files are in the `dist/` folder.

### Cross-compilation notes

- **macOS → Windows**: Works out of the box with `electron-builder`. You need Windows binaries (`.exe`) in `scripts/bin/win32-x64/`.
- **macOS → Linux**: Works similarly. Place Linux binaries in `scripts/bin/linux-x64/`.

## System Dependencies

If you don't bundle the binaries, the following tools must be installed on the system:

| Tool | macOS (Homebrew) | Linux (apt) | Used for |
|------|-----------------|-------------|----------|
| 7z | `brew install p7zip` | `apt install p7zip-full` | Extract firmware .upt |
| unsquashfs | `brew install squashfs` | `apt install squashfs-tools` | Extract rootfs |
| mksquashfs | *(included with squashfs)* | *(included with squashfs-tools)* | Repack rootfs |
| mkisofs | `brew install cdrtools` | `apt install genisoimage` | Generate final .upt |
| python3 | `brew install python3` | `apt install python3` | Database updater |
| mutagen | `pip3 install mutagen` | `pip3 install mutagen` | Read audio tags |
| Pillow | `pip3 install Pillow` | `pip3 install Pillow` | Resize cover art |

You can check the status of all dependencies inside the app under **Settings → Check dependencies**.

## Project Structure

```
hibyos-toolbox/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── package.json         # Config, scripts & build targets
├── bundle-bins.sh       # Helper to copy system binaries
├── src/
│   └── index.html       # App interface
├── scripts/
│   ├── universal_mod_tool.sh   # Firmware mod script
│   ├── Update_Database.py      # Database update script
│   └── bin/                    # Bundled binaries (done with the script or manually)
│       ├── darwin-arm64/
│       ├── linux-x64/
│       └── win32-x64/
└── assets/
    ├── icon.icns
    ├── icon.ico
    └── icon.png
```

## Firmware Project Folder

The Firmware Modder expects a project folder with this structure:

```
YourProject/
├── Firmware/          # .upt files here
├── Binaries/          # Subfolders containing patched hiby_player
│   └── my_patch/
│       └── hiby_player
└── Themes/            # Subfolders containing theme files (optional)
    └── my_theme/
        ├── usr/
        └── etc/
```

## Special thanks to:

- [noisetta](https://github.com/noisetta)
- [tartarus6](https://github.com/tartarus6)
