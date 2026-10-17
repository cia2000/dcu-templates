# Aplicación: brief del problema y del ciclo

Web estática en español, sin servidor de respuestas ni dependencias de ejecución. Sigue el estilo y las funciones de la herramienta de análisis inicial DCU: apartados plegables, tarjetas adaptadas a móvil, guardado local, importación y exportación Markdown y botón flotante para volver a las secciones.

## Abrir

Desde `01-investigate`, ejecutar `python3 -m http.server 8000` y abrir `http://localhost:8000/app/`. No abrir como `file://` ni servir únicamente `app`: el formulario descarga `../brief-problema-y-ciclo.md`, su única fuente de estructura e instrucciones.

## Guardado y recuperación

- El borrador se guarda automáticamente en `localStorage`, solo en el navegador y dispositivo actuales. No hay cuentas, telemetría ni sincronización remota.
- La clave del brief es independiente de la utilizada por la aplicación de la actividad de reprografía. También se separa por ruta para no mezclar instalaciones distintas bajo un mismo dominio.
- Descarga copias `.md` periódicamente. Importarlas permite continuar en otro dispositivo.
- Importar sustituye el borrador completo previa confirmación si existe trabajo. Un archivo incompatible se rechaza sin reemplazar las respuestas.
- Borrar o sustituir entradas con contenido requiere confirmación. Un guardado corrupto no se sobrescribe silenciosamente; un cambio desde otra pestaña bloquea sobrescrituras automáticas.
- Si falla el almacenamiento, se avisa y se mantiene la descarga. El modo privado o el borrado de datos puede eliminar el borrador.

## Markdown

Se exporta `ciclo-01-brief-problema-y-ciclo.md`; puede renombrarse según el ciclo. El archivo conserva todos los apartados e instrucciones de la plantilla. No hay otra copia de la plantilla dentro de la aplicación.

Se admite importar la plantilla original, archivos exportados y documentos editados que mantengan títulos, etiquetas y estructura de tablas. Los saltos de línea de las respuestas se guardan como `<br>` y las barras de tablas se escapan. Los cambios estructurales y los párrafos añadidos fuera de los campos pueden requerir adaptar el archivo al formato exportado; no se promete importar cualquier Markdown.

Las respuestas se muestran como texto, no como HTML ejecutable. La importación comprueba la estructura, las etiquetas fijas y el número de columnas. Se limita a 5 MB por archivo y 200 entradas en la tabla variable del historial.

## Pruebas

Con Node.js, desde este directorio:

```sh
npm test
```

No es necesario instalar paquetes para las pruebas de estructura e intercambio Markdown. Para uso final, comprobar también guardado, descarga e importación en el navegador de destino. El indicador de progreso cuenta respuestas, no su calidad ni la validez del problema planteado.

Publicada en https://cia2000.github.io/dcu-templates/01-investigate/app/. No modifica Canvas. Para usarla en local, servir `01-investigate` completo, incluyendo el Markdown junto al directorio `app`; para consultar todas las referencias de distribución, servir el repositorio completo.
