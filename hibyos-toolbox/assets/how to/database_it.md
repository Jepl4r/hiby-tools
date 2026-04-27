# Database Updater

Il Database Updater scansiona la SD card del tuo DAP HiBy e ricostruisce il database musicale (`usrlocal_media.db`) partendo dai file audio trovati.

## Passo 1 - SD Card

Seleziona la root della tua SD card. Lo strumento cercherà i file audio esistenti e il file `usrlocal_media.db`.

## Passo 2 - Opzioni

- **Incorpora copertine album (360×360)** - quando attivo, lo strumento ridimensiona le immagini di copertina e le incorpora direttamente nei file audio. Questo assicura che le tracce con copertine grandi non sovraccarichino il dispositivo durante la visualizzazione.
- **Ridimensiona immagini di copertina nelle cartelle** - quando attivo, le immagini come `cover.jpg` o `folder.jpg` trovate accanto alla tua musica verranno ridimensionate a 360×360 pixel. Stesso beneficio di sopra.

## Passo 3 - Aggiorna Database

Clicca **Aggiorna Database** per avviare la scansione. Lo strumento legge i tag audio (titolo, artista, album, ecc.) da ogni file musicale sulla SD card e ricostruisce il database da zero.

Una barra di progresso e il conteggio dei file vengono mostrati durante il processo. Al termine, un riepilogo mostra quante tracce, album e artisti sono stati trovati. Eventuali errori vengono mostrati nel terminale in basso.
