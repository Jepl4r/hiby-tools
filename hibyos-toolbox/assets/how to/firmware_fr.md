# Firmware Modder

Le Firmware Modder vous permet de reconditionner un fichier firmware HibyOS (.upt) avec des modifications personnalisées.

## Étape 1 - Dossier du projet

Sélectionnez le dossier principal du projet sur votre ordinateur. Ce dossier doit contenir trois sous-dossiers :

- **Firmware/** - placez ici les fichiers firmware .upt d'origine
- **Binaries/** - placez ici les binaires `hiby_player` modifiés (optionnel)
- **Themes/** - placez ici les dossiers de thèmes personnalisés (optionnel)

**La structure de dossiers attendue est la suivante**

```
VotreProjet/
├── Firmware/          # fichiers .upt ici
├── Binaries/          # Sous-dossiers contenant hiby_player modifié
│   └── mon_patch/
│       └── hiby_player
└── Themes/            # Sous-dossiers contenant les fichiers du thème
    └── mon_theme/
        ├── usr/
        └── etc/
```

## Étape 2 - Firmware de base

Choisissez le fichier firmware de base (.upt) à modifier. Les fichiers disponibles sont listés depuis le sous-dossier Firmware/.

## Étape 3 - Binaire modifié (optionnel)

Activez ce toggle pour remplacer le binaire `hiby_player` dans le firmware par une version modifiée du dossier Binaries/. Utile pour activer des fonctionnalités ou appliquer des corrections nécessitant un binaire modifié.

## Étape 4 - Thème personnalisé (optionnel)

Activez ce toggle pour inclure un thème personnalisé dans le firmware reconditionné. Les thèmes sont chargés depuis le sous-dossier Themes/.

## Étape 5 - Générer le firmware

Cliquez **Générer le firmware** pour lancer le processus de reconditionnement. L'outil produira un nouveau fichier `r3proii.upt` dans le dossier du projet, prêt à être flashé sur l'appareil.

La sortie du terminal en bas montre la progression et les erreurs éventuelles pendant le processus.
