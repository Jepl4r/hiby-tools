# Firmware Modder

Der Firmware Modder ermöglicht es dir, eine HibyOS-Firmware-Datei (.upt) mit eigenen Änderungen neu zu verpacken.

## Schritt 1 - Projektordner

Wähle den Hauptprojektordner auf deinem Computer. Dieser Ordner muss drei Unterordner enthalten:

- **Firmware/** - lege hier die originalen .upt-Firmware-Dateien ab
- **Binaries/** - lege hier gepatchte `hiby_player`-Binärdateien ab (optional)
- **Themes/** - lege hier benutzerdefinierte Theme-Ordner ab (optional)

**Die erwartete Ordnerstruktur ist wie folgt**

```
DeinProjekt/
├── Firmware/          # .upt-Dateien hier
├── Binaries/          # Unterordner mit gepatchtem hiby_player
│   └── mein_patch/
│       └── hiby_player
└── Themes/            # Unterordner mit Theme-Dateien
    └── mein_theme/
        ├── usr/
        └── etc/
```

## Schritt 2 - Basis-Firmware

Wähle die Basis-Firmware-Datei (.upt) zum Modifizieren. Die verfügbaren Dateien werden aus dem Firmware/-Unterordner aufgelistet.

## Schritt 3 - Gepatchte Binärdatei (optional)

Aktiviere diesen Schalter, um die `hiby_player`-Binärdatei innerhalb der Firmware durch eine gepatchte Version aus dem Binaries/-Ordner zu ersetzen. Nützlich zum Aktivieren von Funktionen oder Anwenden von Fixes, die eine modifizierte Binärdatei erfordern.

## Schritt 4 - Benutzerdefiniertes Theme (optional)

Aktiviere diesen Schalter, um ein benutzerdefiniertes Theme in die neu verpackte Firmware einzubinden. Themes werden aus dem Themes/-Unterordner geladen.

## Schritt 5 - Firmware generieren

Klicke **Firmware generieren**, um den Repack-Prozess zu starten. Das Tool erstellt eine neue `r3proii.upt`-Datei im Projektordner, die bereit ist, auf das Gerät geflasht zu werden.

Die Terminal-Ausgabe unten zeigt den Fortschritt und eventuelle Fehler während des Prozesses an.
