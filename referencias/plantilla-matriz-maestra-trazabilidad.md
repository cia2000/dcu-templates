# Plantilla de matriz maestra de trazabilidad

## Finalidad

Esta matriz proporciona una visión única de las relaciones entre investigación, requisitos, diseño, implementación, pruebas y entregas del MVP. Debe mantenerse por el equipo durante todos los ciclos y enlazar artefactos fuente en lugar de repetir su contenido.

Las reglas de identificadores, estados y relaciones se definen en la [gobernanza de trazabilidad](gobernanza-trazabilidad.md).

## Guía de uso

1. Crear una fila por requisito prioritario, restricción crítica o decisión de alto impacto.
2. Completar los identificadores y enlaces a medida que se elaboran los artefactos.
3. Actualizar estado y evidencias al cierre de cada ciclo.
4. Mantener una sección separada para relaciones incompletas y elementos sustituidos.

## Plantilla

```markdown
# Matriz maestra de trazabilidad: [nombre del MVP]

| Campo | Contenido |
| --- | --- |
| Versión de la matriz | [ ] |
| Ciclo revisado | [ ] |
| Fecha | [AAAA-MM-DD] |
| Responsable | [ ] |

| Evidencia o hipótesis | Necesidad o restricción | Requisito o decisión | Backlog | Diseño o contrato | Implementación | Criterio y prueba | Entrega | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `N-001` | `RF-001` | `PB-001` | `FL-001`, `P-001` | [Enlace a rama, PR o código] | `AC-001`, `T-001` | `REL-001` | Verificado |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Relaciones incompletas

| Elemento | Relación pendiente | Impacto | Responsable | Ciclo previsto |
| --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] |

## Elementos sustituidos o descartados

| Elemento | Estado | Sustituido por o motivo | Fecha | Enlace |
| --- | --- | --- | --- | --- |
| [ ] | [Sustituido / Descartado] | [ ] | [ ] | [ ] |
```

## Revisión de cierre de ciclo

- Cada fila seleccionada para el ciclo tiene un estado actualizado.
- Los requisitos aceptados enlazan criterio de aceptación y prueba con evidencia.
- Las relaciones pendientes tienen impacto, responsable y ciclo previsto.
- Las decisiones reemplazadas conservan enlace hacia la decisión vigente.
- La matriz no contiene información sensible ni duplica contenidos de los artefactos enlazados.
