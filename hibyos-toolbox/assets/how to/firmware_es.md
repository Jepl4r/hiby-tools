# Firmware Modder

El Firmware Modder te permite reempaquetar un archivo de firmware HibyOS (.upt) con modificaciones personalizadas.

## Paso 1 - Carpeta del proyecto

Selecciona la carpeta principal del proyecto en tu ordenador. Esta carpeta debe contener tres subcarpetas:

- **Firmware/** - coloca aquí los archivos de firmware .upt originales
- **Binaries/** - coloca aquí los binarios `hiby_player` parcheados (opcional)
- **Themes/** - coloca aquí las carpetas de temas personalizados (opcional)

**La estructura de carpetas esperada es la siguiente**

```
TuProyecto/
├── Firmware/          # archivos .upt aquí
├── Binaries/          # Subcarpetas con hiby_player parcheado
│   └── mi_parche/
│       └── hiby_player
└── Themes/            # Subcarpetas con archivos del tema
    └── mi_tema/
        ├── usr/
        └── etc/
```

## Paso 2 - Firmware base

Elige el archivo de firmware base (.upt) a modificar. Los archivos disponibles se listan desde la subcarpeta Firmware/.

## Paso 3 - Binario parcheado (opcional)

Activa este interruptor para reemplazar el binario `hiby_player` dentro del firmware con una versión parcheada de la carpeta Binaries/. Útil para habilitar funciones o aplicar correcciones que requieren un binario modificado.

## Paso 4 - Tema personalizado (opcional)

Activa este interruptor para incluir un tema personalizado en el firmware reempaquetado. Los temas se cargan desde la subcarpeta Themes/.

## Paso 5 - Generar firmware

Haz clic en **Generar firmware** para iniciar el proceso de reempaquetado. La herramienta producirá un nuevo archivo `r3proii.upt` en la carpeta del proyecto, listo para ser flasheado en el dispositivo.

La salida del terminal en la parte inferior muestra el progreso y los errores durante el proceso.
