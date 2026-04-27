# Playlist Manager

Le Playlist Manager vous permet de visualiser, créer, modifier et gérer les playlists stockées dans la base de données interne de l'appareil (`usrlocal_media.db`).

## Chargement de la base de données

Vous pouvez charger la base de données de deux façons :

- **Parcourir…** - sélectionnez une copie locale de `usrlocal_media.db` depuis votre ordinateur.
- **Télécharger depuis l'appareil** - téléchargez la base de données directement depuis l'appareil connecté via ADB. Ce bouton n'est visible que lorsqu'un appareil est connecté via l'ADB Manager. Le fichier est enregistré automatiquement dans le dossier de données de l'application.

## Statistiques de la bibliothèque

Une fois la base de données chargée, vous verrez un aperçu de votre bibliothèque : total des pistes, albums, artistes, playlists et favoris.

## Gestion des playlists

- **Créer** - ajouter une nouvelle playlist vide.
- **Renommer** - changer le nom de la playlist sélectionnée.
- **Supprimer** - supprimer entièrement la playlist sélectionnée.
- **Ajouter des pistes** - recherchez dans votre bibliothèque et ajoutez des pistes à la playlist en cours.
- **Retirer des pistes** - sélectionnez des pistes dans la liste et retirez-les de la playlist.
- **Exporter** - exporter la playlist sélectionnée en fichier M3U.

Vous pouvez également parcourir les Favoris, l'Historique et les Ajouts Récents depuis le menu déroulant.

## Envoyer à l'appareil

Après avoir effectué vos modifications, cliquez **Envoyer la base de données** pour transférer la base de données modifiée vers l'appareil via ADB. L'appareil redémarrera automatiquement pour appliquer les modifications.

Ce bouton n'est visible que lorsqu'un appareil est connecté via l'ADB Manager.

Alternativement, si vous utilisez un firmware personnalisé de [hiby-mods](https://github.com/hiby-modding/hiby-mods) en version **1.4+** ou **supérieure**, vous pouvez copier la **base de données** à la racine de la carte SD et utiliser le **Database Manager** dans les paramètres de l'appareil.
