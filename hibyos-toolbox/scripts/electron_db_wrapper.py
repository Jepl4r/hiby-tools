#!/usr/bin/env python3
"""
Wrapper for Electron — calls rebuild_db with progress callbacks
that print structured lines to stdout for the app to parse.

Usage: python3 electron_db_wrapper.py <sd_path> <embed:y/n> <resize:y/n>
"""
import sys
import os

# Add scripts dir to path so we can import the GUI module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from HiBy_Database_Updater_GUI import rebuild_db, DB_NAME, _PIL_AVAILABLE


def on_status(msg):
    print(f"STATUS:{msg}", flush=True)


def on_progress(current, total):
    if total > 0:
        pct = int(current / total * 100)
        print(f"PROGRESS:{pct}:{current}:{total}", flush=True)


def main():
    if len(sys.argv) < 4:
        print("Usage: electron_db_wrapper.py <sd_path> <embed:y/n> <resize:y/n>", file=sys.stderr)
        sys.exit(1)

    sd = sys.argv[1]
    embed = sys.argv[2].lower() in ("y", "yes", "true", "1")
    resize = sys.argv[3].lower() in ("y", "yes", "true", "1")

    if not os.path.isdir(sd):
        print(f"ERROR:SD card path not found: {sd}", flush=True)
        sys.exit(1)

    if not os.path.exists(os.path.join(sd, DB_NAME)):
        print(f"ERROR:{DB_NAME} not found on SD card", flush=True)
        sys.exit(1)

    try:
        result = rebuild_db(
            sd,
            embed_art_enabled=embed and _PIL_AVAILABLE,
            resize_covers_enabled=resize and _PIL_AVAILABLE,
            on_progress=on_progress,
            on_status=on_status,
        )

        # Print structured result
        print(f"RESULT:tracks:{result['tracks']}", flush=True)
        print(f"RESULT:albums:{result['albums']}", flush=True)
        print(f"RESULT:artists:{result['artists']}", flush=True)
        print(f"RESULT:genres:{result['genres']}", flush=True)
        print(f"RESULT:album_artists:{result['album_artists']}", flush=True)
        print(f"RESULT:playlists:{result['playlists']}", flush=True)
        print(f"RESULT:elapsed:{result['elapsed']:.1f}", flush=True)
        if result.get("art_embedded", 0) > 0:
            print(f"RESULT:art_embedded:{result['art_embedded']}", flush=True)
        if result.get("art_failures", 0) > 0:
            print(f"RESULT:art_failures:{result['art_failures']}", flush=True)
        if result.get("covers_resized", 0) > 0:
            print(f"RESULT:covers_resized:{result['covers_resized']}", flush=True)
        if result.get("cover_resize_failures", 0) > 0:
            print(f"RESULT:cover_resize_failures:{result['cover_resize_failures']}", flush=True)
        if result.get("tag_failures"):
            print(f"RESULT:tag_failures:{len(result['tag_failures'])}", flush=True)

        print("DONE", flush=True)
    except Exception as e:
        print(f"ERROR:{e}", flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
