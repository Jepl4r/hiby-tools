# Playlist Manager

El Playlist Manager te permite ver, crear, editar y gestionar las playlists almacenadas en la base de datos interna del dispositivo (`usrlocal_media.db`).

## Carga de la base de datos

Puedes cargar la base de datos de dos formas:

- **Examinar…** - selecciona una copia local de `usrlocal_media.db` desde tu ordenador.
- **Descargar del dispositivo** - descarga la base de datos directamente del dispositivo conectado vía ADB. Este botón solo es visible cuando un dispositivo está conectado a través del ADB Manager. El archivo se guarda automáticamente en la carpeta de datos de la app.

## Estadísticas de la biblioteca

Una vez cargada la base de datos, verás un resumen de tu biblioteca: total de pistas, álbumes, artistas, playlists y favoritos.

## Gestión de playlists

- **Crear** - añadir una nueva playlist vacía.
- **Renombrar** - cambiar el nombre de la playlist seleccionada.
- **Eliminar** - eliminar completamente la playlist seleccionada.
- **Añadir pistas** - busca en tu biblioteca y añade pistas a la playlist actual.
- **Eliminar pistas** - selecciona pistas en la lista y elimínalas de la playlist.
- **Exportar** - exportar la playlist seleccionada como archivo M3U.

También puedes explorar Favoritos, Historial y Añadidos Recientemente desde el menú desplegable.

## Enviar al dispositivo

Después de hacer los cambios, haz clic en **Enviar base de datos** para enviar la base de datos modificada al dispositivo vía ADB. El dispositivo se reiniciará automáticamente para aplicar los cambios.

Este botón solo es visible cuando un dispositivo está conectado a través del ADB Manager.

Alternativamente, si estás usando un firmware personalizado de [hiby-mods](https://github.com/hiby-modding/hiby-mods) en versión **1.4+** o **superior**, puedes copiar la **base de datos** a la raíz de la tarjeta SD y usar el **Database Manager** en los ajustes del dispositivo.
