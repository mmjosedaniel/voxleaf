La combinación propuesta puede satisfacer el criterio de RSQ-R01-01 sin exigir cambiar privilegios del host. La prueba nativa adicional no es obligatoria si el control sustitutivo demuestra el efecto concreto y declara su alcance.

La evidencia mínima debe cubrir:

- La seam representa únicamente la resolución del enlace: creación exclusiva sobre una entrada existente falla; las aperturas siguientes alcanzan destinos sintéticos mediante I/O real. No debe imponer artificialmente el resultado esperado del propietario.
- El discriminante falla contra el propietario anterior porque crea el destino ausente antes de rechazar el enlace; pasa con la corrección porque ese destino permanece ausente.
- Para un destino existente, tanto su contenido como la entrada de coordinación y el estado completo de la sesión permanecen intactos.
- Las aserciones verifican que la apertura de una entrada existente carece de `O_CREAT` y de truncamiento, y que la validación posterior rechaza enlaces/reparse e identidades incompatibles antes de adquirir autoridad sobre la sesión.
- Los controles reales conservan primera creación, archivo regular vacío existente, rechazo de contenido/enlaces duros, contención, liberación por excepción y muerte del proceso.

Conserva `followup82-link-red-01` como **preparación bloqueada por WinError 1314**, sin atribuirle RED del propietario. La prueba nativa puede quedar disponible para hosts con privilegio; cualquier omisión aquí debe figurar expresamente y no contarse como PASS nativo.

Esta evaluación sólo acepta la estrategia de evidencia propuesta. La corrección, la fidelidad de la seam y sus resultados todavía requieren inspección en el siguiente candidato completo; no renueva ni modifica el dictamen R01.
