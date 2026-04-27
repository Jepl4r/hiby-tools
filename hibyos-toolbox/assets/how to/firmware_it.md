# Firmware Modder

Il Firmware Modder ti permette di reimpacchettare un file firmware HibyOS (.upt) con modifiche personalizzate.

## Passo 1 - Cartella Progetto

Seleziona la cartella principale del progetto sul tuo computer. Questa cartella deve contenere tre sottocartelle:

- **Firmware/** - inserisci qui i file firmware .upt originali
- **Binaries/** - inserisci qui i binari `hiby_player` modificati (opzionale)
- **Themes/** - inserisci qui le cartelle dei temi personalizzati (opzionale)

**La struttura delle cartelle prevista è la seguente**

```
TuoProgetto/
├── Firmware/          # file .upt qui
├── Binaries/          # Sottocartelle con hiby_player modificato
│   └── mia_patch/
│       └── hiby_player
└── Themes/            # Sottocartelle con file del tema
    └── mio_tema/
        ├── usr/
        └── etc/
```

## Passo 2 - Firmware Base

Scegli il file firmware base (.upt) da modificare. I file disponibili vengono elencati dalla sottocartella Firmware/.

## Passo 3 - Binario Modificato (opzionale)

Attiva questo toggle per sostituire il binario `hiby_player` all'interno del firmware con una versione modificata dalla cartella Binaries/. Utile per abilitare funzionalità o applicare fix che richiedono un binario modificato.

## Passo 4 - Tema Personalizzato (opzionale)

Attiva questo toggle per includere un tema personalizzato nel firmware reimpacchettato. I temi vengono caricati dalla sottocartella Themes/.

## Passo 5 - Genera Firmware

Clicca **Genera Firmware** per avviare il processo di repack. Lo strumento produrrà un nuovo file `r3proii.upt` nella cartella del progetto, pronto per essere flashato sul dispositivo.

L'output del terminale in basso mostra l'avanzamento e gli eventuali errori durante il processo.
