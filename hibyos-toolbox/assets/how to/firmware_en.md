# Firmware Modder

The Firmware Modder allows you to repack a HibyOS firmware file (.upt) with custom modifications.

## Step 1 - Project Folder

Select the main project folder on your computer. This folder must contain three subfolders:

- **Firmware/** - place the stock .upt firmware files here
- **Binaries/** - place patched `hiby_player` binaries here (optional)
- **Themes/** - place custom theme folders here (optional)

**The expected folder structure is as follows**

```
YourProject/
├── Firmware/          # .upt files here
├── Binaries/          # Subfolders containing patched hiby_player
│   └── my_patch/
│       └── hiby_player
└── Themes/            # Subfolders containing theme files
    └── my_theme/
        ├── usr/
        └── etc/
```

## Step 2 - Base Firmware

Choose the base firmware (.upt) file to modify. The available files are listed from the Firmware/ subfolder.

## Step 3 - Patched Binary (optional)

Enable this toggle to replace the `hiby_player` binary inside the firmware with a patched version from the Binaries/ folder. This is useful for enabling features or applying fixes that require a modified binary.

## Step 4 - Custom Theme (optional)

Enable this toggle to include a custom theme in the repacked firmware. Themes are loaded from the Themes/ subfolder.

## Step 5 - Generate Firmware

Click **Generate Firmware** to start the repack process. The tool will produce a new `r3proii.upt` file in the project folder, ready to be flashed on the device.

The terminal output at the bottom shows the progress and any errors during the process.
