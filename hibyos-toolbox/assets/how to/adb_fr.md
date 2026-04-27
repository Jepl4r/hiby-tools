# ADB Manager

L'ADB Manager vous permet de vous connecter à votre DAP HiBy via USB et d'interagir avec son système de fichiers, prendre des captures d'écran et exécuter des commandes shell.

## Connexion

Démarrez ADB depuis l'appareil en allant dans `system --> about` puis appuyez répétitivement sur le texte "about" ou sur l'icône debug si vous utilisez le firmware personnalisé de [hiby-mods](https://github.com/hiby-modding/hiby-mods) en version **1.5** ou **supérieure**.

Dans l'application, cliquez **Démarrer** pour détecter l'appareil. Une fois connecté, vous verrez le modèle, la version du firmware, la version du kernel, le niveau de batterie et les informations de stockage.

Cliquez **Déconnecter** pour vous déconnecter de l'appareil. Cela masquera également les boutons dépendants d'ADB dans les autres pages comme le Playlist Manager.

## Informations de l'appareil

Une fois connecté, la fiche d'informations affiche :

- **Carte SD / Stockage interne** - cliquez sur l'un ou l'autre pour accéder à ce chemin dans le navigateur de fichiers.
- **Firmware / Kernel** — version actuelle du firmware et du kernel.
- **Batterie** - niveau de batterie actuel et état de santé.
- **Processus** - afficher les processus en cours sur l'appareil.
- **Log Kernel** - afficher le tampon circulaire dmesg du kernel.
- **Redémarrer l'appareil** - redémarrer l'appareil.

## Navigateur de fichiers

Parcourez le système de fichiers de l'appareil, envoyez des fichiers depuis votre ordinateur, téléchargez des fichiers sur votre ordinateur ou supprimez des fichiers de la carte SD. Vous pouvez également glisser-déposer des fichiers sur la liste pour les envoyer.

- **Envoyer un fichier** - envoyer un fichier de votre ordinateur vers le répertoire actuel sur l'appareil.
- **Télécharger la sélection** - télécharger le fichier sélectionné sur votre ordinateur.
- **Supprimer** - supprimer les fichiers sélectionnés (disponible uniquement sur la carte SD).

## Captures d'écran

Capturez une capture d'écran directement depuis le framebuffer de l'appareil. Les captures sont enregistrées localement et affichées dans une grille de miniatures. Cliquez **Ouvrir le dossier** pour les trouver sur votre ordinateur.

## Terminal

Un terminal shell basique pour exécuter des commandes directement sur l'appareil. Tapez une commande et appuyez sur Entrée pour l'exécuter. Utile pour des vérifications rapides comme `ls`, `cat`, `mount`, etc.
