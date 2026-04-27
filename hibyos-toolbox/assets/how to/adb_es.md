# ADB Manager

El ADB Manager te permite conectarte a tu DAP HiBy por USB e interactuar con su sistema de archivos, tomar capturas de pantalla y ejecutar comandos shell.

## Conexión

Inicia ADB desde el dispositivo yendo a `system --> about` y luego toca repetidamente el texto "about" o el icono de debug si estás usando el firmware personalizado de [hiby-mods](https://github.com/hiby-modding/hiby-mods) en versión **1.5** o **superior**.

En la app, haz clic en **Iniciar** para detectar el dispositivo. Una vez conectado, verás el modelo, la versión del firmware, la versión del kernel, el nivel de batería y la información de almacenamiento.

Haz clic en **Desconectar** para desconectar el dispositivo. Esto también ocultará los botones que dependen de ADB en otras páginas como el Playlist Manager.

## Información del dispositivo

Una vez conectado, la tarjeta de información muestra:

- **Tarjeta SD / Almacenamiento interno** - haz clic en cualquiera de los dos para ir a esa ruta en el navegador de archivos.
- **Firmware / Kernel** — versión actual del firmware y del kernel.
- **Batería** - nivel de batería actual y estado de salud.
- **Procesos** - ver los procesos en ejecución en el dispositivo.
- **Log del Kernel** - ver el buffer dmesg del kernel.
- **Reiniciar dispositivo** - reiniciar el dispositivo.

## Navegador de archivos

Navega por el sistema de archivos del dispositivo, sube archivos desde tu ordenador, descarga archivos a tu ordenador o elimina archivos de la tarjeta SD. También puedes arrastrar y soltar archivos sobre la lista para subirlos.

- **Subir archivo** - sube un archivo desde tu ordenador al directorio actual en el dispositivo.
- **Descargar seleccionado** - descarga el archivo seleccionado a tu ordenador.
- **Eliminar** - elimina los archivos seleccionados (solo disponible en la tarjeta SD).

## Capturas de pantalla

Captura una captura de pantalla directamente desde el framebuffer del dispositivo. Las capturas se guardan localmente y se muestran en una cuadrícula de miniaturas. Haz clic en **Abrir carpeta** para encontrarlas en tu ordenador.

## Terminal

Un terminal shell básico para ejecutar comandos directamente en el dispositivo. Escribe un comando y pulsa Enter para ejecutarlo. Útil para comprobaciones rápidas como `ls`, `cat`, `mount`, etc.
