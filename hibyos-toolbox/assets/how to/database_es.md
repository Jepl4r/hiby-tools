# Database Updater

El Database Updater escanea la tarjeta SD de tu DAP HiBy y reconstruye la base de datos musical (`usrlocal_media.db`) a partir de los archivos de audio encontrados.

## Paso 1 - Tarjeta SD

Selecciona la raíz de tu tarjeta SD. La herramienta buscará archivos de audio existentes y el archivo de base de datos `usrlocal_media.db`.

## Paso 2 - Opciones

- **Incrustar carátulas de álbum (360×360)** - cuando está activado, la herramienta redimensiona las imágenes de portada y las incrusta directamente en tus archivos de audio. Esto asegura que las pistas con carátulas grandes no sobrecarguen el dispositivo durante la visualización.
- **Redimensionar imágenes de portada en carpetas** - cuando está activado, las imágenes como `cover.jpg` o `folder.jpg` encontradas junto a tu música serán redimensionadas a 360×360 píxeles. Mismo beneficio que arriba.

## Paso 3 - Actualizar base de datos

Haz clic en **Actualizar base de datos** para iniciar el escaneo. La herramienta lee las etiquetas de audio (título, artista, álbum, etc.) de cada archivo musical en la tarjeta SD y reconstruye la base de datos desde cero.

Una barra de progreso y el recuento de archivos se muestran durante el proceso. Al finalizar, un resumen muestra cuántas pistas, álbumes y artistas se encontraron. Los errores encontrados se muestran en el terminal de abajo.
