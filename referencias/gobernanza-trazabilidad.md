# Gobernanza de trazabilidad del MVP

## Propósito

Esta guía define cómo mantener relaciones útiles entre los artefactos del MVP sin convertir la documentación en una carga desproporcionada. Se aplica a todos los ciclos y a todas las plantillas del repositorio de artefactos.

La trazabilidad debe permitir responder, para cada elemento prioritario, a estas preguntas:

1. ¿Qué evidencia o necesidad justifica este requisito o decisión?
2. ¿Qué diseño, implementación y pruebas lo materializan?
3. ¿Qué versión del incremento lo incluye y cuál es su estado?
4. ¿Qué cambió, quién lo decidió y qué debe revisarse después?

## Principios

- Mantener una relación solo cuando permite justificar una decisión, comprobar un resultado o gestionar un cambio.
- Enlazar artefactos fuente en lugar de duplicar su contenido.
- Usar identificadores estables y enlaces relativos dentro del repositorio del equipo.
- Actualizar las relaciones al cerrar un ciclo, no solo antes de una entrega final.
- Registrar los elementos pendientes, descartados o sustituidos; no eliminarlos sin conservar contexto.
- Ajustar el detalle al riesgo: permisos, datos sensibles, IA, pagos, seguridad y cambios arquitectónicos requieren mayor evidencia.

## Identificadores normalizados

Cada artefacto o elemento relevante debe tener un identificador único. El número es secuencial dentro de su tipo y no se reutiliza aunque el elemento se descarte.

| Prefijo | Elemento |
| --- | --- |
| `HCM` | Hipótesis de contexto móvil. |
| `EV` | Evidencia de investigación o prueba. |
| `N` | Necesidad u oportunidad. |
| `RF` | Requisito funcional. |
| `RNF` | Requisito no funcional. |
| `RT` | Restricción transversal. |
| `PB` | Elemento de backlog. |
| `AC` | Criterio de aceptación. |
| `ALT` | Alternativa de solución. |
| `ADR` | Decisión de diseño o arquitectura. |
| `FL` | Flujo de usuario. |
| `P` | Pantalla. |
| `CMP` | Componente de interfaz. |
| `API` | Operación o contrato de API. |
| `EVT` | Evento de integración. |
| `T` | Prueba. |
| `INC` | Incidencia. |
| `REL` | Versión o entrega del MVP. |

Ejemplos: `N-003`, `RF-012`, `ADR-004`, `T-021` y `REL-02`.

## Metadatos obligatorios

Toda plantilla que describa un elemento de decisión, diseño, implementación, prueba o entrega debe incluir, como mínimo:

| Metadato | Uso |
| --- | --- |
| Identificador | Referencia única y estable. |
| Título | Descripción breve y comprensible. |
| Ciclo | Ciclo en el que se crea o actualiza. |
| Versión | Versión del artefacto o incremento relacionado. |
| Estado | `Borrador`, `En revisión`, `Aprobado`, `Implementado`, `Verificado`, `Descartado` o `Sustituido`. |
| Responsable | Persona o equipo que mantiene el elemento. |
| Artefactos de origen | Identificadores y enlaces que lo justifican. |
| Artefactos derivados | Identificadores y enlaces que lo implementan o verifican. |
| Fecha de revisión | Próxima fecha o condición de revisión. |

Plantilla de cabecera:

```markdown
| Campo | Contenido |
| --- | --- |
| Identificador | `[TIPO]-NNN` |
| Título | [ ] |
| Ciclo | [ ] |
| Versión | [ ] |
| Estado | [ ] |
| Responsable | [ ] |
| Artefactos de origen | [Enlaces e IDs] |
| Artefactos derivados | [Enlaces e IDs] |
| Próxima revisión | [Fecha o condición] |
```

## Relaciones permitidas

Usar estas expresiones de forma consistente en tablas, enlaces y descripciones:

| Relación | Significado | Ejemplo |
| --- | --- | --- |
| `justifica` | Una evidencia respalda una necesidad o decisión. | `EV-004 justifica N-002`. |
| `deriva en` | Una necesidad o restricción origina un requisito. | `N-002 deriva en RF-007`. |
| `prioriza` | Un elemento de backlog selecciona un requisito para un ciclo. | `PB-003 prioriza RF-007`. |
| `representa` | Un flujo, pantalla o prototipo materializa un requisito. | `FL-002 representa RF-007`. |
| `implementa` | Código, API o configuración realiza un diseño o requisito. | `P-004 implementa RF-007`. |
| `verifica` | Una prueba aporta evidencia sobre un criterio o requisito. | `T-014 verifica AC-011`. |
| `mitiga` | Un control reduce un riesgo o restricción. | `RT-003 es mitigada por ADR-005`. |
| `sustituye` | Un elemento reemplaza una decisión o versión anterior. | `ADR-006 sustituye ADR-002`. |

## Matriz maestra y cierre de ciclo

La [plantilla de matriz maestra](plantilla-matriz-maestra-trazabilidad.md) es la fuente de consulta transversal del equipo. Debe contener una fila por requisito, restricción crítica o decisión de alto impacto incluida en el MVP.

Al cerrar cada ciclo, el equipo debe:

1. Actualizar los enlaces desde evidencia hasta prueba o entrega.
2. Marcar el estado real de cada elemento seleccionado.
3. Registrar relaciones pendientes, incidencias y decisiones sustituidas.
4. Comprobar que los elementos aceptados tienen criterio y evidencia de prueba.
5. Incorporar al siguiente ciclo los elementos no verificados, bloqueados o corregidos.

## Criterios de completitud de un incremento

Un requisito puede considerarse `Verificado` solo si dispone de:

- Una necesidad, restricción o decisión que lo justifique.
- Criterios de aceptación identificados.
- Un flujo, pantalla, contrato o diseño que lo represente cuando corresponda.
- Una implementación o configuración vinculada a una versión.
- Una prueba con evidencia y resultado registrado.

Los requisitos de seguridad, privacidad, accesibilidad, permisos e IA deben añadir las evidencias específicas que exijan sus restricciones transversales.

## Comprobaciones recomendadas

- Ningún identificador duplicado.
- Ningún requisito prioritario sin criterio de aceptación.
- Ningún criterio aceptado sin prueba o evidencia vinculada.
- Ninguna decisión `Sustituida` sin enlace a su reemplazo.
- Ningún enlace relativo roto.
- Ningún secreto, token, certificado o dato personal real en un artefacto.

Estas comprobaciones pueden hacerse mediante revisión del equipo o automatizarse posteriormente en integración continua mediante validación de enlaces e identificadores Markdown.
