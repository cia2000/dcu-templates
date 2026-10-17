# Aplicación: brief del problema y del ciclo

Web estática en español, sin servidor de respuestas ni dependencias de ejecución. Sigue el estilo y las funciones de la herramienta de análisis inicial DCU: apartados plegables, tarjetas adaptadas a móvil, guardado local, importación y exportación Markdown y botón flotante para volver a las secciones.

## Editor compartido de la fase

`core.js`, `styles.css` y `floating-navigation.css` se reutilizan en las cinco herramientas. El brief conserva `app.js`, su URL y su clave de guardado. Las otras cuatro páginas utilizan `editor.js` y declaran en el HTML su plantilla, nombre de descarga y clave propia. No se duplica el editor para cada artefacto.

Servir siempre `01-investigate` completo. El índice de la fase enlaza todas las aplicaciones. Las referencias y los Markdown exportados deben revisarse antes de compartirlos; el almacenamiento local no convierte el navegador en un repositorio seguro de investigación.

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

No es necesario instalar paquetes para las pruebas de estructura e intercambio Markdown. Para probar las cinco herramientas en navegador:

```sh
npm install
npx playwright install chromium
npm run test:browser
```

Si se utiliza Chrome instalado, indicar `CHROME_PATH=/ruta/a/google-chrome`. Las pruebas crean un servidor temporal y usan datos ficticios. Para probar GitHub Pages, definir `DCU_BASE_URL=https://cia2000.github.io/dcu-templates/01-investigate/`. Si Playwright se encuentra en otra instalación, `PLAYWRIGHT_MODULE` puede indicar la ruta a su módulo ESM.

El indicador de progreso cuenta respuestas, no su calidad ni la validez de los contenidos. Las pruebas no acreditan consentimiento ni calidad metodológica de la investigación.

La aplicación está publicada en https://cia2000.github.io/dcu-templates/01-investigate/app/, desde el repositorio https://github.com/cia2000/dcu-templates. La publicación no modifica Canvas ni se sincroniza automáticamente con los cambios de este repositorio docente. Para un despliegue propio, servir `01-investigate` completo, incluyendo el Markdown junto al directorio `app`; las referencias de distribución requieren adaptar los enlaces del repositorio docente.
