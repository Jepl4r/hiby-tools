# Playlist Manager

Der Playlist Manager ermöglicht es dir, Playlists in der internen Datenbank des Geräts (`usrlocal_media.db`) anzuzeigen, zu erstellen, zu bearbeiten und zu verwalten.

## Datenbank laden

Du kannst die Datenbank auf zwei Arten laden:

- **Durchsuchen…** - wähle eine lokale Kopie von `usrlocal_media.db` von deinem Computer.
- **Vom Gerät laden** - lade die Datenbank direkt vom verbundenen Gerät via ADB herunter. Diese Schaltfläche ist nur sichtbar, wenn ein Gerät über den ADB Manager verbunden ist. Die Datei wird automatisch im Datenordner der App gespeichert.

## Bibliotheksstatistiken

Sobald die Datenbank geladen ist, siehst du eine Übersicht deiner Bibliothek: Gesamtanzahl der Titel, Alben, Künstler, Playlists und Favoriten.

## Playlists verwalten

- **Erstellen** - füge eine neue leere Playlist hinzu.
- **Umbenennen** - ändere den Namen der ausgewählten Playlist.
- **Löschen** - entferne die ausgewählte Playlist vollständig.
- **Titel hinzufügen** - durchsuche deine Bibliothek und füge Titel zur aktuellen Playlist hinzu.
- **Titel entfernen** - wähle Titel in der Liste aus und entferne sie aus der Playlist.
- **Exportieren** - exportiere die ausgewählte Playlist als M3U-Datei.

Du kannst auch Favoriten, Verlauf und Kürzlich Hinzugefügte über das Dropdown-Menü durchstöbern.

## Zum Gerät senden

Nachdem du Änderungen vorgenommen hast, klicke **Datenbank senden**, um die geänderte Datenbank via ADB an das Gerät zu übertragen. Das Gerät wird automatisch neu gestartet, um die Änderungen zu übernehmen.

Diese Schaltfläche ist nur sichtbar, wenn ein Gerät über den ADB Manager verbunden ist.

Alternativ kannst du, wenn du eine Custom-Firmware von [hiby-mods](https://github.com/hiby-modding/hiby-mods) in Version **1.4+** oder **höher** verwendest, die **Datenbank** auf die SD-Karten-Root kopieren und den **Database Manager** in den Geräteeinstellungen verwenden.
