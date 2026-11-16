**Evaluación prospectiva: FSF-SCOPE-R04-20261116**  
Tarea: `five-search-findings-minimal-corrections`

**La evidencia complementaria versionada es una extensión válida del alcance autorizado**, siempre que forme parte obligatoria de la nueva aceptación. No identifico un impedimento de alcance. Sí hay tres límites concretos que deben quedar decididos en el ExecPlan y en la nueva autoridad: separación entre derivación histórica y prospectiva, tratamiento del resultado v14 pendiente de restauración y adaptación del testigo de entrada al modelo de trabajo v5.

Los mínimos necesarios son:

- **Impedir la derivación alternativa sin evidencia.** La ruta prospectiva debe identificarse explícitamente por contrato y sesión; no puede decidir que una ejecución es histórica porque falta su archivo complementario. Los comandos históricos no deben aceptar automáticamente las sesiones nuevas. El resultado prospectivo debe identificar su contrato y los digests verificados, evitando que un resumen legado aislado parezca satisfacer las nuevas garantías. Los derivadores históricos puros pueden conservarse para reproducir su significado original.
- **Vincular todos los insumos relevantes.** Además de sesión, versión y SHA del raw, la evidencia debe vincular los restantes insumos consumidos —por ejemplo, `loads.json` en v14 y la identidad del baseline aplicable en v5—, junto con ejecución, brazo y autoridad. Validar forma cerrada, límites, unicidad y coherencia; rechazar evidencia ausente, sustituida, duplicada, de otra sesión o contradictoria. Un digest demuestra correspondencia de bytes, no la veracidad de una fase.
- **Separar hechos observados de aceptación.** Los campos `passed`, contadores y resultados deben derivarse de testigos comprobados. La nueva lectura no puede limitarse a reconocer etiquetas o exigir otro booleano afirmativo.

**VF-0077.** La secuencia propuesta es adecuada: observación anterior, consumo único para una ejecución, resultado pendiente y observación posterior explícita. Hay que definir exactamente qué valores AC/DC puede modificar el procedimiento y comparar sus valores efectivos junto con la identidad del esquema. La comprobación previa a ejecutar también debe confirmar el estado requerido para la medición.

La reserva debe consumirse antes de adquirir trabajadores, sin poder reutilizarse para otra ejecución tras un fallo. Una finalización fallida puede repetirse para la misma ejecución y los mismos insumos, conservando la observación original. También debe contemplarse la restauración tras interrupciones que no produzcan raw completo, sin inventar un resultado derivable.

Existe un acoplamiento concreto: `batch_official.py` emite actualmente `sleepSettingRestored: true`, y `batch_result.py` exige ese valor para aprobar limpieza. La nueva ruta debe representar honestamente el estado pendiente y acreditar restauración únicamente desde la evidencia posterior. **No debe resolverlo cambiando silenciosamente ese booleano en el raw antes de pasarlo al derivador histórico.** Debe conservar las demás exigencias de limpieza y publicar éxito solo después de verificar también la eliminación privada requerida. El recibo actual `eligibleForDerivation: true` tampoco puede conservarse para una ejecución pendiente.

**VF-0091.** Las definiciones propuestas discriminan los defectos originales:

- «Queued» requiere observar la tercera ocurrencia dentro del trabajo admitido por el controlador y todavía sin despacho al invalidar; después debe comprobarse ausencia de despacho/publicación. El control emparejado debe demostrar que esa misma ruta la despacha cuando no se invalida.
- «Complete-before-release» requiere una finalización válida y concreta retenida antes de publicación, seguida de rechazo por la puerta real de identidad. Una lista vacía o una excepción no acredita supresión.
- «Active» puede significar entrada al adaptador del hijo, explícitamente sin afirmar entrada al modelo. `both-active` necesita ambos trabajadores observados y todavía en esa fase en el mismo punto de invalidación; dos pruebas individuales sucesivas no equivalen.

Hay un límite técnico observado en `isolation.py`: `cancel_witnessed_batch` posee y termina su intento, y `_witness_batch` exige dos unidades; el runtime v5 genera actualmente una unidad por ocurrencia. Por tanto, **reutilizar el mecanismo requiere una adaptación explícita de ese límite privado**, preservando su identidad, propietario, recepción exclusiva, barreras finitas y limpieza. Duplicar unidades artificialmente o cambiar las condiciones de v14 para acomodar v5 no demuestra la ocurrencia requerida. Tampoco bastaría un testigo aislado desconectado del despacho e invalidación que se pretende certificar.

La verificación mínima debe incluir fallos de evidencia y sustitución, reintento de finalización, controles históricos y de pilotos, y pruebas con hijos sintéticos reales del intercambio de fase, además de los tests del controlador. No exige campañas GPU, acústicas ni descargas.

Esta evaluación no acepta una implementación ni modifica R02. No ejecuté pruebas, ediciones, delegación ni mutaciones Git.
