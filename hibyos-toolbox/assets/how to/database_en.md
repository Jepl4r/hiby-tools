# Database Updater

The Database Updater scans the SD card of your HiBy DAP and rebuilds the music database (`usrlocal_media.db`) from the audio files it finds.

## Step 1 - SD Card

Select the root of your SD card. The tool will look for existing audio files and the `usrlocal_media.db` database file.

## Step 2 - Options

- **Embed album art (360×360)** - when enabled, the tool will resize cover art images and embed them directly into your audio files. This ensures tracks with a big album art don't overload the device during displaying.
- **Resize folder cover images** - when enabled, images like `cover.jpg` or `folder.jpg` found alongside your music will be resized to 360×360 pixels. Same benefit as above.

## Step 3 - Update Database

Click **Update Database** to start the scan. The tool reads audio tags (title, artist, album, etc.) from every music file on the SD card and rebuilds the database from scratch.

A progress bar and file count are shown during the process. When it finishes, a summary shows how many tracks, albums, and artists were found. Any errors encountered are displayed in the terminal at the bottom.
