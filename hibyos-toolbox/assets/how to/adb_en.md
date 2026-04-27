# ADB Manager

The ADB Manager lets you connect to your HiBy DAP over USB and interact with its filesystem, take screenshots, and run shell commands.

## Connecting

Start ADB from the device by going into `system --> about` then continously **tap** on the about text or on the debug icon if you're using the custom firmware from [hiby-mods](https://github.com/hiby-modding/hiby-mods) and the version is **1.5** or **above**.

Inside the app click **Start** to detect the device. Once connected, you'll see the device model, firmware version, kernel version, battery level, and storage info.

Click **Disconnect** to disconnect from the device. This will also hide ADB-dependent buttons in other pages like Playlist Manager.

## Device Info

Once connected, the info card shows:

- **SD Card / Internal Storage** - click on either to jump to that path in the file browser.
- **Firmware / Kernel** — current firmware and kernel version.
- **Battery** - current battery level and health status.
- **Processes** - view running processes on the device.
- **Kernel Log** - view the dmesg kernel ring buffer.
- **Reboot Device** - reboot the device.

## File Browser

Navigate the device filesystem, push files from your computer, pull files to your computer, or delete files from the SD card. You can also drag and drop files onto the file list to push them.

- **Push File** - upload a file from your computer to the current directory on the device.
- **Pull Selected** - download the selected file to your computer.
- **Delete** - delete selected files (only available on the SD card).

## Screenshots

Capture a screenshot directly from the device framebuffer. Screenshots are saved locally and displayed in a thumbnail grid. Click **Open Folder** to find them on your computer.

## Terminal

A basic shell terminal for running commands directly on the device. Type a command and press Enter to execute it. Useful for quick checks like `ls`, `cat`, `mount`, etc.
