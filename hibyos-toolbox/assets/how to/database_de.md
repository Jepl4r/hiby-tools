# Database Updater

Der Database Updater scannt die SD-Karte deines HiBy DAP und erstellt die Musikdatenbank (`usrlocal_media.db`) aus den gefundenen Audiodateien neu.

## Schritt 1 - SD-Karte

Wähle das Stammverzeichnis deiner SD-Karte. Das Tool sucht nach vorhandenen Audiodateien und der `usrlocal_media.db`-Datenbankdatei.

## Schritt 2 - Optionen

- **Album-Cover einbetten (360×360)** - wenn aktiviert, werden Cover-Bilder auf 360×360 Pixel skaliert und direkt in die Audiodateien eingebettet. Dadurch wird verhindert, dass Titel mit großen Album-Covern das Gerät bei der Anzeige überlasten.
- **Ordner-Coverbilder skalieren** - wenn aktiviert, werden Bilder wie `cover.jpg` oder `folder.jpg` neben deiner Musik auf 360×360 Pixel skaliert. Gleicher Vorteil wie oben.

## Schritt 3 - Datenbank aktualisieren

Klicke **Datenbank aktualisieren**, um den Scan zu starten. Das Tool liest Audio-Tags (Titel, Künstler, Album usw.) aus jeder Musikdatei auf der SD-Karte und erstellt die Datenbank von Grund auf neu.

Ein Fortschrittsbalken und die Dateianzahl werden während des Prozesses angezeigt. Nach Abschluss zeigt eine Zusammenfassung, wie viele Titel, Alben und Künstler gefunden wurden. Eventuelle Fehler werden im Terminal unten angezeigt.
