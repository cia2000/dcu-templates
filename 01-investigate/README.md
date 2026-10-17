# 01 · Investigar

## Brief del problema y del ciclo

- [Plantilla Markdown](brief-problema-y-ciclo.md).
- [Aplicación para completar el brief](app/index.html), disponible al servir estos archivos por HTTP.
- [Documentación de la aplicación](app/README.md).

La plantilla conserva el contenido del [artefacto oficial de referencia](../referencias/brief-oficial.md) y añade instrucciones, metadatos de gobernanza y una revisión final. La aplicación utiliza ese mismo archivo como fuente: no mantiene otra plantilla duplicada.

## Abrir la aplicación en local

Desde este directorio:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000/app/`. Debe servirse también el archivo Markdown del directorio superior a `app`; abrir `index.html` directamente con `file://` no permite descargar la plantilla mediante `fetch`.

El navegador conserva el borrador localmente. Descarga copias `.md` e impórtalas para continuar en otro dispositivo. No hay cuentas, sincronización en la nube ni envío a Canvas. El brief también puede completarse con un editor de texto sin utilizar la aplicación.
