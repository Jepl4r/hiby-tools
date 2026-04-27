# Playlist Manager

The Playlist Manager lets you view, create, edit, and manage playlists stored in the device's internal database (`usrlocal_media.db`).

## Loading the Database

You can load the database in two ways:

- **Browse…** - select a local copy of `usrlocal_media.db` from your computer.
- **Pull from device** - pull the database directly from the connected device via ADB. This button is only visible when a device is connected through ADB Manager. The file is saved automatically in the app's data folder.

## Library Stats

Once the database is loaded, you'll see an overview of your library: total tracks, albums, artists, playlists, and favorites.

## Managing Playlists

- **Create** - add a new empty playlist.
- **Rename** - change the name of the selected playlist.
- **Delete** - remove the selected playlist entirely.
- **Add tracks** - search your library and add tracks to the current playlist.
- **Remove tracks** - select tracks in the list and remove them from the playlist.
- **Export** - export the selected playlist as an M3U file.

You can also browse Favorites, History, and Recently Added from the dropdown menu.

## Push to Device

After making changes, click **Push database** to send the modified database back to the device via ADB. The device will reboot automatically to apply the changes.

This button is only visible when a device is connected through ADB Manager.

Alternatively if you're using a custom firmware from [hiby-mods](https://github.com/hiby-modding/hiby-mods) that's version **1.4+** or **above** you can copy the **database** to the SD Card root and use the **Database Manager** inside the device settings.
