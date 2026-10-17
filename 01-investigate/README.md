# 01 · Investigar

## Herramientas disponibles

[Abrir el índice de la fase](index.html) · [Índice publicado](https://cia2000.github.io/dcu-templates/01-investigate/).

| Artefacto | Plantilla | Aplicación |
| --- | --- | --- |
| Brief del problema y del ciclo | [Markdown](brief-problema-y-ciclo.md) | [Completar brief](app/index.html) |
| Plan de investigación y consentimiento | [Markdown](plan-investigacion-y-consentimiento/plantilla.md) | [Completar plan](plan-investigacion-y-consentimiento/app/index.html) |
| Guion de investigación | [Markdown](guion-de-investigacion/plantilla.md) | [Completar guion](guion-de-investigacion/app/index.html) |
| Registro de evidencias | [Markdown](registro-de-evidencias/plantilla.md) | [Completar registro](registro-de-evidencias/app/index.html) |
| Análisis de tareas y contexto | [Markdown](analisis-de-tareas-y-contexto/plantilla.md) | [Completar análisis](analisis-de-tareas-y-contexto/app/index.html) |

Cada aplicación mantiene un borrador independiente. El editor de las cuatro herramientas nuevas y los estilos se comparten desde `app/`; debe servirse la fase completa, no una subcarpeta aislada. Los campos y las instrucciones proceden de un único Markdown por artefacto. La dirección y el borrador del brief se conservan.

## Brief del problema y del ciclo

- [Plantilla Markdown](brief-problema-y-ciclo.md).
- [Aplicación para completar el brief](app/index.html), disponible al servir estos archivos por HTTP.
- [Documentación de la aplicación](app/README.md).
- [Abrir la aplicación publicada en GitHub Pages](https://cia2000.github.io/dcu-templates/01-investigate/app/).

La plantilla conserva el contenido del [artefacto oficial de referencia](../referencias/brief-oficial.md) y añade instrucciones, metadatos de gobernanza y una revisión final. La aplicación utiliza ese mismo archivo como fuente: no mantiene otra plantilla duplicada.

## Abrir la aplicación en local

Desde este directorio:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000/app/`. Debe servirse también el archivo Markdown del directorio superior a `app`; abrir `index.html` directamente con `file://` no permite descargar la plantilla mediante `fetch`.

El navegador conserva el borrador localmente. Descarga copias `.md` e impórtalas para continuar en otro dispositivo. No hay cuentas, sincronización en la nube ni envío a Canvas. El brief también puede completarse con un editor de texto sin utilizar la aplicación.
