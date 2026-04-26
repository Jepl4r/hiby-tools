#!/usr/bin/env python3
"""
Playlist manager wrapper for Electron.
Reads/writes playlist data from HiBy's usrlocal_media.db.
"""
import sys
import os
import json
import sqlite3


def clean(s):
    if s is None:
        return ""
    return s.replace("\x00", "").strip()


def connect(db_path):
    if not os.path.isfile(db_path):
        print(json.dumps({"error": f"Database not found: {db_path}"}))
        sys.exit(1)
    return sqlite3.connect(db_path)


def fmt_duration(ms):
    if not ms or ms <= 0:
        return ""
    s = ms // 1000
    return f"{s // 60}:{s % 60:02d}"


def track_row(r):
    return {
        "id": r[0],
        "path": clean(r[1]),
        "name": clean(r[2]),
        "album": clean(r[3]),
        "artist": clean(r[4]),
        "genre": clean(r[5]),
        "year": r[6] or 0,
        "duration": fmt_duration(r[10] if len(r) > 10 else 0),
        "duration_ms": r[10] if len(r) > 10 else 0,
        "sample_rate": r[15] if len(r) > 15 else 0,
        "bit_rate": r[16] if len(r) > 16 else 0,
        "bit_depth": r[17] if len(r) > 17 else 0,
        "format": r[19] if len(r) > 19 else 0,
        "quality": clean(r[20]) if len(r) > 20 else "",
    }


def cmd_list(db_path):
    conn = connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, path, name, cn FROM PLAYLIST_TABLE ORDER BY id")
    playlists = []
    for r in cur.fetchall():
        pid = r[0]
        table = f"m3u_{pid}"
        count = 0
        try:
            cur2 = conn.cursor()
            cur2.execute(f'SELECT COUNT(*) FROM "{table}"')
            count = cur2.fetchone()[0]
        except:
            pass
        playlists.append({
            "id": pid,
            "path": clean(r[1]),
            "name": clean(r[2]),
            "count": count,
        })
    conn.close()
    print(json.dumps({"playlists": playlists}))


def cmd_tracks(db_path, playlist_id):
    conn = connect(db_path)
    cur = conn.cursor()
    table = f"m3u_{playlist_id}"
    try:
        cur.execute(f'SELECT * FROM "{table}" ORDER BY id')
    except sqlite3.OperationalError:
        print(json.dumps({"error": f"Playlist table {table} not found"}))
        conn.close()
        sys.exit(1)
    tracks = [track_row(r) for r in cur.fetchall()]
    conn.close()
    print(json.dumps({"tracks": tracks}))


def cmd_favorites(db_path):
    conn = connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM COLLECT_TABLE ORDER BY id")
    tracks = [track_row(r) for r in cur.fetchall()]
    conn.close()
    print(json.dumps({"tracks": tracks, "count": len(tracks)}))


def cmd_history(db_path):
    conn = connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM HISTORY_TABLE ORDER BY id")
    tracks = [track_row(r) for r in cur.fetchall()]
    conn.close()
    print(json.dumps({"tracks": tracks, "count": len(tracks)}))


def cmd_recent(db_path):
    conn = connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM RECENT_TABLE LIMIT 100")
    tracks = [track_row(r) for r in cur.fetchall()]
    conn.close()
    print(json.dumps({"tracks": tracks, "count": len(tracks)}))


def cmd_library(db_path, search=""):
    conn = connect(db_path)
    cur = conn.cursor()
    if search:
        like = f"%{search}%"
        cur.execute(
            "SELECT * FROM MEDIA_TABLE WHERE name LIKE ? OR artist LIKE ? OR album LIKE ? ORDER BY artist, album, name",
            (like, like, like),
        )
    else:
        cur.execute("SELECT * FROM MEDIA_TABLE ORDER BY artist, album, name")
    tracks = [track_row(r) for r in cur.fetchall()]
    conn.close()
    print(json.dumps({"tracks": tracks, "count": len(tracks)}))


def cmd_stats(db_path):
    conn = connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM MEDIA_TABLE")
    total_tracks = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM ALBUM_TABLE")
    total_albums = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM ARTIST_TABLE")
    total_artists = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM PLAYLIST_TABLE")
    total_playlists = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM COLLECT_TABLE")
    total_favorites = cur.fetchone()[0]

    total_duration_ms = 0
    try:
        cur.execute("SELECT SUM(end_time) FROM MEDIA_TABLE WHERE end_time > 0")
        val = cur.fetchone()[0]
        if val:
            total_duration_ms = val
    except:
        pass

    conn.close()

    hours = total_duration_ms // 3600000
    mins = (total_duration_ms % 3600000) // 60000

    print(json.dumps({
        "total_tracks": total_tracks,
        "total_albums": total_albums,
        "total_artists": total_artists,
        "total_playlists": total_playlists,
        "total_favorites": total_favorites,
        "total_duration": f"{hours}h {mins}m",
        "total_duration_ms": total_duration_ms,
    }))


def cmd_create(db_path, name):
    conn = connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT MAX(id) FROM PLAYLIST_TABLE")
    max_id = cur.fetchone()[0] or 1
    new_id = max_id + 1

    char = name[0].upper() if name else "?"
    pl_path = "data\\playlist\\" + name + ".m3u\x00"
    pl_name = name + "\x00"

    cur.execute(
        "INSERT INTO PLAYLIST_TABLE (id, path, name, character, cn) VALUES (?, ?, ?, ?, 0)",
        (new_id, pl_path, pl_name, char),
    )

    cur.execute("SELECT MAX(id) FROM M3U_TABLE")
    m3u_id_row = cur.fetchone()
    m3u_id = m3u_id_row[0] if m3u_id_row and m3u_id_row[0] else 0
    if m3u_id == 0:
        cur.execute("SELECT MAX(id) FROM MEDIA_TABLE")
        m3u_id_row = cur.fetchone()
        m3u_id = m3u_id_row[0] if m3u_id_row and m3u_id_row[0] else 0

    m3u_path = "a:\\playlist_data\\" + name + ".m3u\x00"
    m3u_name = name + ".m3u\x00"

    cur.execute(
        "INSERT INTO M3U_TABLE (id, path, name, character) VALUES (?, ?, ?, ?)",
        (m3u_id, m3u_path, m3u_name, char),
    )

    cur.execute(f"""CREATE TABLE IF NOT EXISTS "m3u_{new_id}" (
        id INT, path TEXT, name TEXT, album TEXT, artist TEXT,
        genre TEXT, year INT, dis_id INT, ck_id INT,
        has_child_file INT, begin_time INT, end_time INT,
        cue_id INT, character TEXT, size INT, sample_rate INT,
        bit_rate INT, bit INT, channel INT, format INT,
        quality TEXT, album_pic_path TEXT, lrc_path TEXT,
        track_gain REAL, track_peak REAL, ctime INT, mtime INT
    )""")

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "id": new_id, "name": name}))


def cmd_delete(db_path, playlist_id):
    conn = connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT name FROM PLAYLIST_TABLE WHERE id = ?", (playlist_id,))
    row = cur.fetchone()
    if row:
        pl_name = clean(row[0])
        m3u_name = pl_name + ".m3u\x00"
        cur.execute("DELETE FROM M3U_TABLE WHERE name = ?", (m3u_name,))

    cur.execute("DELETE FROM PLAYLIST_TABLE WHERE id = ?", (playlist_id,))
    try:
        cur.execute(f'DROP TABLE IF EXISTS "m3u_{playlist_id}"')
    except:
        pass

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "deleted": playlist_id}))


def cmd_remove(db_path, playlist_id, track_ids):
    conn = connect(db_path)
    cur = conn.cursor()
    table = f"m3u_{playlist_id}"
    ids = [int(x) for x in track_ids.split(",")]
    placeholders = ",".join("?" * len(ids))
    cur.execute(f'DELETE FROM "{table}" WHERE id IN ({placeholders})', ids)

    cur.execute(f'SELECT COUNT(*) FROM "{table}"')
    remaining = cur.fetchone()[0]
    cur.execute("UPDATE PLAYLIST_TABLE SET cn = ? WHERE id = ?", (remaining, playlist_id))

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "removed": len(ids), "remaining": remaining}))


def cmd_remove_favorites(db_path, track_ids):
    conn = connect(db_path)
    cur = conn.cursor()
    ids = [int(x) for x in track_ids.split(",")]
    placeholders = ",".join("?" * len(ids))
    cur.execute(f"DELETE FROM COLLECT_TABLE WHERE id IN ({placeholders})", ids)

    cur.execute("SELECT COUNT(*) FROM COLLECT_TABLE")
    remaining = cur.fetchone()[0]

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "removed": len(ids), "remaining": remaining}))


def cmd_add(db_path, playlist_id, source_table, track_ids):
    conn = connect(db_path)
    cur = conn.cursor()
    table = f"m3u_{playlist_id}"
    ids = [int(x) for x in track_ids.split(",")]
    placeholders = ",".join("?" * len(ids))

    cols = "id, path, name, album, artist, genre, year, dis_id, ck_id, has_child_file, begin_time, end_time, cue_id, character, size, sample_rate, bit_rate, bit, channel, format, quality, album_pic_path, lrc_path, track_gain, track_peak, ctime, mtime"
    cur.execute(f'SELECT {cols} FROM "{source_table}" WHERE id IN ({placeholders})', ids)
    rows = cur.fetchall()

    for r in rows:
        cur.execute(f'INSERT INTO "{table}" ({cols}) VALUES ({",".join("?" * len(r))})', r)

    cur.execute(f'SELECT COUNT(*) FROM "{table}"')
    total = cur.fetchone()[0]
    cur.execute("UPDATE PLAYLIST_TABLE SET cn = ? WHERE id = ?", (total, playlist_id))

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "added": len(rows), "total": total}))


def cmd_add_favorites(db_path, track_ids):
    conn = connect(db_path)
    cur = conn.cursor()
    ids = [int(x) for x in track_ids.split(",")]
    placeholders = ",".join("?" * len(ids))

    cols = "id, path, name, album, artist, genre, year, dis_id, ck_id, has_child_file, begin_time, end_time, cue_id, character, size, sample_rate, bit_rate, bit, channel, format, quality, album_pic_path, lrc_path, track_gain, track_peak, ctime, mtime, pinyin_charater, album_artist"
    cur.execute(f'SELECT {cols} FROM MEDIA_TABLE WHERE id IN ({placeholders})', ids)
    rows = cur.fetchall()

    for r in rows:
        try:
            cur.execute(f'INSERT INTO COLLECT_TABLE ({cols}) VALUES ({",".join("?" * len(r))})', r)
        except:
            pass  # skip duplicates

    cur.execute("SELECT COUNT(*) FROM COLLECT_TABLE")
    total = cur.fetchone()[0]

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "added": len(rows), "total": total}))


def cmd_rename(db_path, playlist_id, new_name):
    conn = connect(db_path)
    cur = conn.cursor()
    char = new_name[0].upper() if new_name else "?"
    pl_path = "data\\playlist\\" + new_name + ".m3u\x00"
    pl_name = new_name + "\x00"

    cur.execute("SELECT name FROM PLAYLIST_TABLE WHERE id = ?", (playlist_id,))
    old_row = cur.fetchone()
    old_name = clean(old_row[0]) if old_row else ""

    cur.execute(
        "UPDATE PLAYLIST_TABLE SET path = ?, name = ?, character = ? WHERE id = ?",
        (pl_path, pl_name, char, playlist_id),
    )

    if old_name:
        old_m3u_name = old_name + ".m3u\x00"
        new_m3u_path = "a:\\playlist_data\\" + new_name + ".m3u\x00"
        new_m3u_name = new_name + ".m3u\x00"
        cur.execute(
            "UPDATE M3U_TABLE SET path = ?, name = ?, character = ? WHERE name = ?",
            (new_m3u_path, new_m3u_name, char, old_m3u_name),
        )

    conn.commit()
    conn.close()
    print(json.dumps({"ok": True, "id": playlist_id, "name": new_name}))


def cmd_export(db_path, playlist_id, output_path):
    conn = connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT name FROM PLAYLIST_TABLE WHERE id = ?", (playlist_id,))
    row = cur.fetchone()
    if not row:
        print(json.dumps({"error": f"Playlist {playlist_id} not found"}))
        conn.close()
        sys.exit(1)

    table = f"m3u_{playlist_id}"
    cur.execute(f'SELECT path FROM "{table}" ORDER BY id')
    paths = [clean(r[0]) for r in cur.fetchall()]
    conn.close()

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")
        for p in paths:
            f.write(p + "\n")

    print(json.dumps({"ok": True, "exported": len(paths), "path": output_path}))


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: electron_playlist_wrapper.py <command> <db_path> [args...]"}))
        sys.exit(1)

    cmd = sys.argv[1]
    db_path = sys.argv[2]

    if cmd == "list":
        cmd_list(db_path)
    elif cmd == "tracks":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing playlist_id"}))
            sys.exit(1)
        cmd_tracks(db_path, int(sys.argv[3]))
    elif cmd == "favorites":
        cmd_favorites(db_path)
    elif cmd == "history":
        cmd_history(db_path)
    elif cmd == "recent":
        cmd_recent(db_path)
    elif cmd == "library":
        search = sys.argv[3] if len(sys.argv) > 3 else ""
        cmd_library(db_path, search)
    elif cmd == "stats":
        cmd_stats(db_path)
    elif cmd == "create":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing playlist name"}))
            sys.exit(1)
        cmd_create(db_path, sys.argv[3])
    elif cmd == "delete":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing playlist_id"}))
            sys.exit(1)
        cmd_delete(db_path, int(sys.argv[3]))
    elif cmd == "remove":
        if len(sys.argv) < 5:
            print(json.dumps({"error": "Missing playlist_id or track_ids"}))
            sys.exit(1)
        cmd_remove(db_path, int(sys.argv[3]), sys.argv[4])
    elif cmd == "remove-favorites":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing track_ids"}))
            sys.exit(1)
        cmd_remove_favorites(db_path, sys.argv[3])
    elif cmd == "add":
        if len(sys.argv) < 6:
            print(json.dumps({"error": "Missing args: playlist_id source_table track_ids"}))
            sys.exit(1)
        cmd_add(db_path, int(sys.argv[3]), sys.argv[4], sys.argv[5])
    elif cmd == "add-favorites":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing track_ids"}))
            sys.exit(1)
        cmd_add_favorites(db_path, sys.argv[3])
    elif cmd == "rename":
        if len(sys.argv) < 5:
            print(json.dumps({"error": "Missing playlist_id or new_name"}))
            sys.exit(1)
        cmd_rename(db_path, int(sys.argv[3]), sys.argv[4])
    elif cmd == "export":
        if len(sys.argv) < 5:
            print(json.dumps({"error": "Missing playlist_id or output_path"}))
            sys.exit(1)
        cmd_export(db_path, int(sys.argv[3]), sys.argv[4])
    else:
        print(json.dumps({"error": f"Unknown command: {cmd}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
