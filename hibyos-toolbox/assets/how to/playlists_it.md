# Playlist Manager

Il Playlist Manager ti permette di visualizzare, creare, modificare e gestire le playlist memorizzate nel database interno del dispositivo (`usrlocal_media.db`).

## Caricamento del Database

Puoi caricare il database in due modi:

- **Sfoglia…** - seleziona una copia locale di `usrlocal_media.db` dal tuo computer.
- **Scarica dal dispositivo** - scarica il database direttamente dal dispositivo connesso via ADB. Questo pulsante è visibile solo quando un dispositivo è collegato tramite ADB Manager. Il file viene salvato automaticamente nella cartella dati dell'app.

## Statistiche Libreria

Una volta caricato il database, vedrai una panoramica della tua libreria: totale tracce, album, artisti, playlist e preferiti.

## Gestione Playlist

- **Crea** - aggiungi una nuova playlist vuota.
- **Rinomina** - cambia il nome della playlist selezionata.
- **Elimina** - rimuovi completamente la playlist selezionata.
- **Aggiungi tracce** - cerca nella tua libreria e aggiungi tracce alla playlist corrente.
- **Rimuovi tracce** - seleziona le tracce nella lista e rimuovile dalla playlist.
- **Esporta** - esporta la playlist selezionata come file M3U.

Puoi anche sfogliare Preferiti, Cronologia e Aggiunti di Recente dal menu a tendina.

## Invia al Dispositivo

Dopo aver apportato le modifiche, clicca **Invia database** per inviare il database modificato al dispositivo via ADB. Il dispositivo si riavvierà automaticamente per applicare le modifiche.

Questo pulsante è visibile solo quando un dispositivo è collegato tramite ADB Manager.

In alternativa, se stai usando un firmware personalizzato di [hiby-mods](https://github.com/hiby-modding/hiby-mods) con versione **1.4+** o **superiore**, puoi copiare il **database** nella root della SD Card e usare il **Database Manager** nelle impostazioni del dispositivo.
