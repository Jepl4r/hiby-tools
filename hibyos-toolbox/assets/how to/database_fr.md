# Database Updater

Le Database Updater analyse la carte SD de votre DAP HiBy et reconstruit la base de données musicale (`usrlocal_media.db`) à partir des fichiers audio trouvés.

## Étape 1 - Carte SD

Sélectionnez la racine de votre carte SD. L'outil recherchera les fichiers audio existants et le fichier de base de données `usrlocal_media.db`.

## Étape 2 - Options

- **Intégrer les pochettes d'album (360×360)** - lorsqu'activé, l'outil redimensionne les images de pochette et les intègre directement dans vos fichiers audio. Cela garantit que les pistes avec de grandes pochettes ne surchargent pas l'appareil lors de l'affichage.
- **Redimensionner les images de pochette des dossiers** - lorsqu'activé, les images comme `cover.jpg` ou `folder.jpg` trouvées à côté de votre musique seront redimensionnées à 360×360 pixels. Même avantage que ci-dessus.

## Étape 3 - Mettre à jour la base de données

Cliquez **Mettre à jour la base de données** pour lancer l'analyse. L'outil lit les tags audio (titre, artiste, album, etc.) de chaque fichier musical sur la carte SD et reconstruit la base de données à partir de zéro.

Une barre de progression et le nombre de fichiers sont affichés pendant le processus. À la fin, un résumé indique combien de pistes, albums et artistes ont été trouvés. Les erreurs éventuelles sont affichées dans le terminal en bas.
