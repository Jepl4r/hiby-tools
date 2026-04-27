# ADB Manager

Der ADB Manager ermöglicht es dir, dich über USB mit deinem HiBy DAP zu verbinden und auf das Dateisystem zuzugreifen, Screenshots zu machen und Shell-Befehle auszuführen.

## Verbindung

Starte ADB auf dem Gerät unter `system --> about` und tippe dann wiederholt auf den About-Text oder auf das Debug-Symbol, wenn du die Custom-Firmware von [hiby-mods](https://github.com/hiby-modding/hiby-mods) in Version **1.5** oder **höher** verwendest.

In der App klicke **Start**, um das Gerät zu erkennen. Sobald verbunden, siehst du Gerätemodell, Firmware-Version, Kernel-Version, Akkustand und Speicherinformationen.

Klicke **Trennen**, um die Verbindung zum Gerät zu trennen. Dadurch werden auch ADB-abhängige Schaltflächen auf anderen Seiten wie dem Playlist Manager ausgeblendet.

## Geräteinformationen

Nach der Verbindung zeigt die Info-Karte:

- **SD-Karte / Interner Speicher** - klicke auf eines davon, um im Dateibrowser zu diesem Pfad zu springen.
- **Firmware / Kernel** — aktuelle Firmware- und Kernel-Version.
- **Akku** - aktueller Akkustand und Gesundheitsstatus.
- **Prozesse** - laufende Prozesse auf dem Gerät anzeigen.
- **Kernel-Log** - den dmesg-Kernel-Ringpuffer anzeigen.
- **Gerät neustarten** - das Gerät neu starten.

## Dateibrowser

Navigiere durch das Dateisystem des Geräts, lade Dateien von deinem Computer hoch, lade Dateien auf deinen Computer herunter oder lösche Dateien von der SD-Karte. Du kannst auch Dateien per Drag & Drop auf die Dateiliste ziehen, um sie hochzuladen.

- **Datei hochladen** - lade eine Datei von deinem Computer in das aktuelle Verzeichnis auf dem Gerät.
- **Ausgewählte herunterladen** - lade die ausgewählte Datei auf deinen Computer herunter.
- **Löschen** - lösche ausgewählte Dateien (nur auf der SD-Karte verfügbar).

## Screenshots

Erstelle einen Screenshot direkt vom Framebuffer des Geräts. Screenshots werden lokal gespeichert und in einem Miniaturraster angezeigt. Klicke **Ordner öffnen**, um sie auf deinem Computer zu finden.

## Terminal

Ein einfaches Shell-Terminal zum direkten Ausführen von Befehlen auf dem Gerät. Gib einen Befehl ein und drücke Enter. Nützlich für schnelle Überprüfungen wie `ls`, `cat`, `mount`, usw.
