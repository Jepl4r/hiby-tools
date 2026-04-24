# HibyOS Toolbox

Desktop app for modding HibyOS firmware and updating the music database on HiBy DAPs.

Built with Electron. Runs on macOS, Linux, and Windows.

![](https://github.com/Jepl4r/hiby-tools/Screenshots/Firmware%20Modder.png)

![](https://github.com/Jepl4r/hiby-tools/Screenshots/Database%20Updater.png)


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

### 1. Install dependencies

```bash
npm install
```

### 2. Bundle native binaries (recommended)

The app can use system-installed tools or bundled binaries. To make the app self-contained, copy the required binaries into `scripts/bin/`.

**Automatic (macOS and Linux):**

```bash
./bundle-bins.sh
```

This detects your platform (e.g. `darwin-arm64`) and copies `7z`, `unsquashfs`, `mksquashfs`, and `mkisofs` from your system.

**Manual:**

```bash
mkdir -p scripts/bin/darwin-arm64   # or darwin-x64, linux-x64, win32-x64
cp $(which 7z) scripts/bin/darwin-arm64/
cp $(which unsquashfs) scripts/bin/darwin-arm64/
cp $(which mksquashfs) scripts/bin/darwin-arm64/
cp $(which mkisofs) scripts/bin/darwin-arm64/
```

The app checks for binaries in this order:
1. `scripts/bin/<platform>-<arch>/` (e.g. `darwin-arm64`)
2. `scripts/bin/` (generic fallback)
3. System `PATH`

### 3. Add app icons

Place your icons in the `assets/` folder:

```
assets/
├── icon.icns   ← macOS
├── icon.ico    ← Windows
└── icon.png    ← Linux
```

### 4. Build

**macOS (Apple Silicon):**
```bash
npm run build:mac-arm64
```

**macOS (Intel):**
```bash
npm run build:mac-x64
```

**macOS (Universal — ARM + Intel):**
```bash
npm run build:mac-universal
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
- **Universal macOS build**: Requires both `scripts/bin/darwin-arm64/` and `scripts/bin/darwin-x64/`.

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
│       ├── darwin-x64/
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
