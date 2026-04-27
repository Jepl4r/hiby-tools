# ADB Manager

L'ADB Manager ti permette di connetterti al tuo DAP HiBy via USB e interagire con il suo filesystem, fare screenshot e lanciare comandi shell.

## Connessione

Avvia ADB dal dispositivo andando in `system --> about` e poi tocca ripetutamente il testo "about" o l'icona debug se stai usando il firmware personalizzato di [hiby-mods](https://github.com/hiby-modding/hiby-mods) con versione **1.5** o **superiore**.

Nell'app clicca **Start** per rilevare il dispositivo. Una volta connesso, vedrai il modello, la versione firmware, la versione kernel, il livello batteria e le informazioni sullo storage.

Clicca **Disconnetti** per scollegare il dispositivo. Questo nasconderà anche i pulsanti che dipendono da ADB nelle altre pagine, come il Playlist Manager.

## Info Dispositivo

Una volta connesso, la scheda informazioni mostra:

- **SD Card / Memoria Interna** - clicca su uno dei due per aprire quel percorso nel file browser.
- **Firmware / Kernel** — versione attuale del firmware e del kernel.
- **Batteria** - livello batteria attuale e stato di salute.
- **Processi** - visualizza i processi in esecuzione sul dispositivo.
- **Log Kernel** - visualizza il buffer dmesg del kernel.
- **Riavvia Dispositivo** - riavvia il dispositivo.

## File Browser

Naviga il filesystem del dispositivo, carica file dal tuo computer, scarica file sul tuo computer o elimina file dalla SD card. Puoi anche trascinare file sulla lista per caricarli.

- **Carica File** - carica un file dal tuo computer nella directory corrente sul dispositivo.
- **Scarica Selezionato** - scarica il file selezionato sul tuo computer.
- **Elimina** - elimina i file selezionati (disponibile solo sulla SD card).

## Screenshot

Cattura uno screenshot direttamente dal framebuffer del dispositivo. Gli screenshot vengono salvati localmente e mostrati in una griglia di miniature. Clicca **Apri Cartella** per trovarli sul tuo computer.

## Terminale

Un terminale shell di base per eseguire comandi direttamente sul dispositivo. Digita un comando e premi Invio per eseguirlo. Utile per controlli rapidi come `ls`, `cat`, `mount`, ecc.
