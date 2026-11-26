# Estado del kernel .me frente a audiencias conjuntas

Investigación y plan propuesto, 26 de septiembre de 2026. No implementa la función ni cambia los contratos actuales.

## Alcance y evidencia

Referencia inspeccionada: submódulo `all.this/me`, commit `fd181d510b2b36fb0961d8567b5c30cca3ec5271`, paquete TypeScript `this.me` 4.0.1. El árbol versionado de `.me` permaneció limpio. Se regeneraron artefactos de build ignorados; las verificaciones principales se ejecutaron contra una compilación nueva en `/private/tmp/me-kernel-audit-20260926`, copiando fuentes y tests y reutilizando las dependencias instaladas. No se modificó código del kernel, Cleaker o Monad.

Se revisaron los dos textos adjuntos del usuario como una auditoría externa, contrastando las afirmaciones importantes con fuentes y reproducciones propias. No se adoptan como evidencia propia sus cifras de experimentos, afirmaciones sobre todo el stack ni su estado de `origin/main`.

Las pruebas existentes ejecutadas pasaron:

| Grupo | Resultado propio | Evidencia |
|---|---|---|
| Build del código actual | Correcto | Vite ES/CJS/UMD y generación de declaraciones |
| Axiomas | 13/13 | [Log](docs/audits/evidence/me-audit-axioms.log) |
| Fases semánticas | 11/11 | [Log](docs/audits/evidence/me-audit-phases.log) |
| Seguridad | 88 casos, 11 archivos, sin fallos | [Log](docs/audits/evidence/me-audit-security.log) |
| Identity-Bound Secrets | 11 casos, sin fallos | [Log](docs/audits/evidence/me-audit-identity.log) |
| Keyspace | Correcto | [Log](docs/audits/evidence/me-audit-keyspace.log) |
| Material y lectura/escritura v3 | Correctos | Logs `me-audit-v3-*` en evidence |
| Runner de contratos actual | Correcto | [Log](docs/audits/evidence/me-audit-contracts.log) |
| Fase de almacenamiento 2.0 | Correcta | [Log](docs/audits/evidence/me-audit-phase2.log) |
| Búsqueda exacta e IVF | Correctas para sus datasets de test | Logs `me-audit-phase3-*` en evidence |
| PoC Ristretto proporcionado | 9/9 y demo correcto en la revisión anterior de esta conversación | Paquete extraído en `/private/tmp/me-intersection-review/intersection-proof` |

No se ejecutó el `npm test` completo, una auditoría formal criptográfica ni todos los benchmarks de escala. El puerto Rust se contrastó con el inventario de compatibilidad y sus fuentes de wrapping; no se ejecutó toda su suite. Que estas pruebas pasen no cubre todas las secuencias de estado: abajo se documenta una regresión adicional reproducida.

## 1. Veredicto de implementación

No existe una abstracción nativa de audiencias OR/AND/umbral en el kernel TypeScript inspeccionado. No están `AudienceBlobV1`, la división XOR por miembros, una clave pública conjunta ni una API de contribuciones. `secretEpoch` es un contador de invalidación de cachés, no una época de membresía. `rotateIdentityRoot` reemplaza una raíz privada local, no una audiencia.

También conviene corregir nuestra formulación inicial de «la unión ya está implementada»: existe **la primitiva de envolver un secreto para un destinatario**. Repetirla puede construir un reparto OR a nivel de aplicación, pero aún faltan el sobre multidestinatario, la semántica, la integración con scopes y su ciclo de vida como contrato del kernel.

| Capacidad | Estado y alcance |
|---|---|
| `_`, `~`, scopes anidados | Implementados; secretos locales, herencia y fronteras de derivación |
| Blobs v3 | Derivación desde transcript de scope/ruta/noise/secretos; no incorpora automáticamente el seed de identidad |
| Blobs v4 | Añade una raíz privada aleatoria de identidad; requiere raíz desbloqueada y secretos correspondientes |
| Raíz de identidad | Creación, bloqueo, desbloqueo, cambio de contraseña, backup y rotación local |
| P-256 wrap/unwrap | ECDH-ES + HKDF-SHA-256 + AES-256-GCM, un destinatario |
| Keyspace | Guarda sobres y resuelve una clave privada instalada o proporcionada para abrirlos |
| OR multidestinatario | Componible con primitivas, no modelado nativamente |
| AND n-de-n | Solo PoC externo y propuesta XOR en la documentación |
| k-de-n / composiciones anidadas | Sin implementación de referencia |
| Revocación de audiencia | Sin transición de membresía autorizada, control de actualidad ni recifrado integrado |

Fuentes: [crypto.ts](me/Typescript/src/crypto.ts:1422), [core-keyspace.ts](me/Typescript/src/core-keyspace.ts:104), [secret-context.ts](me/Typescript/src/secret-context.ts:261), [selección v3/v4](me/Typescript/src/core-write.ts:606), [rotación de raíz](me/Typescript/src/identity-context.ts:166).

## 2. Hallazgos que cambian el orden del plan

### 2.1 Regresión reproducida: un scope raíz puede perder su protección tras bloqueo y restauración

Secuencia mínima, usando solo datos sintéticos:

```js
const a = new ME();
await a.createIdentityRoot('synthetic-password', 210000);
a['_']('root-secret');
a.privateValue('before');
a.lockIdentity();

const b = new ME();
b.hydrate(a.exportSnapshot());
b.privateValue('after');
// Resultado observado: b('privateValue') === 'after'
// El snapshot de b contiene la nueva escritura en texto claro.
```

No se recuperó el texto cifrado anterior sin clave. El fallo es que **una nueva escritura a una ruta previamente protegida se convierte en pública** después de esa secuencia.

`registerStealthScope` registra `protectedScopeKeys`; `lockIdentity` conserva ese set pero vacía `localSecrets`. `exportSnapshot` no serializa el set y `hydrate` no lo reconstruye. Para un scope raíz, que usa blobs por valor y no un scope nombrado en `branchStore`, se pierde la evidencia que consulta `hasExistingProtectedAncestor`. Un comentario de esa función afirma que hydrate hace el backfill, pero el código inspeccionado no lo hace.

Fuentes: [registro del scope](me/Typescript/src/core-write.ts:305), [snapshot](me/Typescript/src/core-snapshot.ts:43), [hydrate](me/Typescript/src/core-snapshot.ts:73), [guardia de escritura](me/Typescript/src/core-write.ts:816).

Prioridad propuesta: corregir antes de introducir otro tipo de scope protegido. Persistir topología de protección independientemente del secreto de sesión y definir reconstrucción compatible para snapshots antiguos. La regresión debe cubrir scopes raíz, scopes vacíos, nombrados, bloqueo, restauración y transición de identidad.

### 2.2 El resultado de una derivación no hereda automáticamente la confidencialidad del origen

Comprobado: un `finance.price` secreto de 24.5 y un `invoice.fuel` público de 10 producen un `invoice.cost` público de 245. El resultado es legible para un invitado y sobrevive al snapshot/reinicio, aunque el dato secreto de origen quede cerrado. `explain()` enmascara el input, pero no cifra automáticamente el resultado.

Esto coincide con los ejemplos de fases 6 y 8; no debe cambiarse silenciosamente como si fuera un mero detalle de implementación. Para audiencias conjuntas se debe elegir una semántica explícita: propagación de condiciones hacia resultados, prohibición por defecto de publicar derivados, o una operación de desclasificación autorizada. Una expresión `y = x` ilustra por qué ocultar el input de `explain()` no basta.

Fuentes: [fase 6](me/Typescript/tests/phases.test.js:153), [explain](me/Typescript/src/derivation.ts:11), [evaluación y escritura de derivaciones](me/Typescript/src/core-write.ts:980).

### 2.3 Bloquear la raíz no equivale a bloquear todas las claves del kernel

Confirmado: después de `installRecipientKey`, `storeWrappedKey` y `lockIdentity`, `self:open/keys/...` sigue pudiendo desenvolver el secreto con la clave del keyring. Es una separación existente entre mecanismos, no evidencia de ruptura de v4. El futuro contrato de bloqueo de audiencias debe decir qué claves, contribuciones, claves de datos y resultados de sesión invalida; no puede presumir que `lockIdentity()` ya lo hace.

### 2.4 A8 no es una garantía criptográfica de auditoría distribuida

`hashFn` es FNV-1a de 32 bits. Los registros incluyen `effectiveSecret` en la entrada del hash, pero lo eliminan al exportar la memoria pública. En `commitMemoryOnly`, `seq` y `timestamp` se asignan después del hash y no forman parte de ese compromiso.

Por tanto, la cadena actual no debe usarse como prueba de autorización, integridad resistente a un adversario o frescura de una época compartida. Sustituir FNV por otro hash tampoco resuelve por sí solo autoría ni rollback: se requieren compromisos canónicos versionados, reglas de firma/autorización y un ancla de estado confiable cuando se prometa actualidad.

No cambiar globalmente `hashFn` sin una migración: además de los registros, participa en comportamiento legado, secretos efectivos y desempates. Un formato de eventos nuevo puede coexistir con el anterior sin recalcular la historia.

Fuentes: [hashFn](me/Typescript/src/utils.ts:7), [hash de memoria](me/Typescript/src/core-write.ts:466), [redacción](me/Typescript/src/memory-redaction.ts:7).

### 2.5 El sobre de wrapping no autentica sus metadatos

Confirmado: cambiar `kid`, `class` y `policy` no invalida `unwrapSecretV1`. El contenido sigue protegido por AES-GCM, pero esos campos no pueden usarse como autoridad autenticada. Parte de `policy` es explícitamente declarativa; no se debe exagerar el hallazgo como si ya existiera una comprobación de privilegios que se haya eludido.

Para un sobre de audiencias nuevo, autenticar el contexto completo seleccionado por la especificación: versión, suite, identificador de espacio, ruta, condición, miembros/claves, versión de membresía e identificador del sobre. AAD autentica el contexto, pero no acredita por sí sola quién estaba autorizado a crear una nueva política o rotarla.

### 2.6 El test negativo Base64URL puede no modificar bytes

La sustitución del último carácter puede cambiar solo bits de relleno. En una comprobación propia de 96 modificaciones, 15 conservaban los bytes; las otras 81 fueron rechazadas. Las frecuencias cambian con el azar. La explicación del informe externo es consistente con el código; sus 800 muestras y 40 ejecuciones no son mediciones propias.

Acción: alterar bytes decodificados, recodificar y comprobar primero que los bytes cambiaron. Definir además codificación canónica para futuros sobres firmados o direccionados por contenido.

Las reproducciones de 2.1–2.3, 2.5 y 2.6 están en [audience-readiness-repro.mjs](docs/audits/evidence/audience-readiness-repro.mjs) y su [salida](docs/audits/evidence/audience-readiness-repro.log). Sus asserts caracterizan la línea base observada; no son requisitos deseables del producto.

## 3. Lectura de los axiomas frente a esta función

Las dos listas de axiomas deben reconciliarse, no declarar que ambas están actualizadas: `docs/Axioms.md` mantiene A9 basado en timestamp; `Typescript/typedocs/Axioms.md` ya explica seq. Los 13 casos incluyen A-struct-0, A0–A9 y las extensiones A3b/A3c.

| Axioma | Qué garantiza hoy / límite | Contrato requerido para audiencias |
|---|---|---|
| A-struct-0 | Proxy invocable y navegable; lecturas ordinarias síncronas | Mantener la lectura local. Abrir explícitamente y después leer. La espera de red ocurre fuera del kernel; una combinación con contribuciones ya disponibles puede ser local y síncrona. |
| A0 | Raíz secreta invisible en la superficie de lectura | Un sobre cerrado no expone su contenido por rutas, selección o punteros. Decidir por separado la privacidad de miembros y metadatos, hoy no prometida en disco. |
| A1 | Normaliza una etiqueta de identidad | No prueba control de una clave ni identidad humana. Vincular un principal y sus claves por un contrato criptográfico; una PoP no es una identidad. |
| A2 | Derivación ligada a scope/ruta y linaje local | El sobre compartido necesita un contexto canónico equivalente. No compartir la raíz privada v4 para hacer funcionar el reparto. |
| A3 | `~` corta herencia de derivación e invalida cachés | No reinterpretarlo como revocación o complemento. Definir cómo afecta al contexto de audiencias, a claves abiertas y a datos previos. |
| A3b/A3c | Anidamiento y noise en scopes | Definir composición padre/hijo: una condición hija no debe ampliar accidentalmente el acceso que el modelo promete heredar. |
| A4 | Punteros estructurales y recorrido limitado frente a ciclos | Un puntero no concede material criptográfico. No debe disparar solicitudes de contribuciones implícitas ni eludir la condición del destino. |
| A5 | Consultas como eventos | Registrar decisiones y compromisos seguros, no plaintext protegido ni contribuciones suficientes para abrir. |
| A6 | Tombstones en la vista local | Borrar no revoca copias ni claves conservadas. Tampoco supone borrado criptográfico de backups. |
| A7 | Separación del plano público y las ramas cifradas | Preservarla en errores, bloqueo, restauración, cachés y derivaciones; la propagación de restricciones a resultados sigue siendo una decisión pendiente. |
| A8 | Cadena funcional local FNV-32, con límites de verificabilidad pública | Definir eventos autenticados de política y sobre, sin elevar la cadena existente a garantía de seguridad distribuida. |
| A9 | Orden local determinista `(seq, hash)` con compatibilidad legado | No decide quién puede rotar, ni consenso entre kernels, ni detección de rollback. Una época autenticada antigua sigue siendo antigua y válida criptográficamente. |

La frase «la intersección no viola ninguno» es prematura: depende de cómo se integren persistencia, exposición, derivación, sincronía y política. Es posible diseñar una extensión compatible, pero hay que probar esas obligaciones.

## 4. Las fases son contratos distintos

### Semánticas 0–8

| Fase | Función y relevancia |
|---|---|
| 0 | Identidad y scope secreto: base para estado cerrado/abierto |
| 1 | Selectores estructurales: no filtrar existencia o contenido de scopes cerrados |
| 2 | Broadcast y derivaciones: no disparar aperturas colectivas por recorrer una colección |
| 3 / 3.1 | Filtros y broadcast filtrado: resultados y cardinalidad pueden revelar datos; definir comportamiento cerrado |
| 4 | Rangos y multiselección: mismas garantías por elemento |
| 5 | Transformación de lectura: publicación de derivados y alcance de permisos |
| 6 | Cómputo entre scopes: decisión explícita sobre confidencialidad del resultado |
| 7A | Replay: memorias públicas/redactadas no restauran por sí solas ramas secretas |
| 7B | Snapshot: ciphertext y topología persistentes; secretos/raíz abierta no se recuperan silenciosamente |
| 8 | Recomputación y explain: invalidar material abierto y decidir qué resultados persisten tras cerrar |

`Phases.md` tiene la sección 3 dañada/incompleta y omite encabezados de 3.1, 4 y 5; también afirma demasiado sobre replay y preservación de secretos. Los tests actuales establecen la redacción y recuperación explícita. Pasaron los 11 bloques; no prueban interacción con audiencias porque la función no existe.

### Rendimiento y otras numeraciones

Las fases de rendimiento 1–3 tratan escritura, almacenamiento con residencia acotada y búsqueda exacta/IVF. Los smoke tests ejecutados validan su comportamiento con sus datasets, no el protocolo de audiencias ni todas las cifras de benchmarks publicadas.

Las fases de malla de Monad, el corte de formato v3 y el trabajo de Identity-Bound Secrets son otras líneas. Que estén cerradas no cierra descubrimiento de claves, contribuciones o revocación. Recomiendo hitos de audiencias con nombres propios para evitar otro «Phase 3» ambiguo.

## 5. Modelo algebraico que debe preceder al formato

Sea `U` el conjunto de principales criptográficos y `S ⊆ U` una coalición. Una condición de apertura `φ` define `Γφ = { S ⊆ U | φ(S) }`.

| Expresión | Conjunto de coaliciones autorizadas |
|---|---|
| `a` | `Γa = {S | a ∈ S}` |
| `a OR b` | `Γa ∪ Γb` |
| `a AND b` | `Γa ∩ Γb` |
| `a AND (b OR c)` | `Γa ∩ (Γb ∪ Γc)` |
| `k-of-n(M)` | `{S | |S ∩ M| ≥ k}` |

Esos son operadores monotónicos: añadir material a una coalición autorizada no le quita capacidad de descifrar. Por eso `A \ B` y «NOT Bob» no se deben añadir como si fueran otro operador criptográfico equivalente. Si Alice ya puede abrir, el hecho de que Bob se junte con ella no hace que olvide la clave. La exclusión se modela como una política nueva de destinatarios y material nuevo, con límites frente a colusión y copias.

El universo cuenta principales/claves, no personas físicas. Dos claves controladas por la misma persona no constituyen automáticamente dos voluntades independientes. La especificación debe distinguir persona, dispositivo, cuenta y clave, y no confundir PoP con esa vinculación.

La tabla del álgebra debe incluir expresión, ecuación, ejemplos, contexto, construcción candidata, capa responsable, estado de implementación y casos que demuestran sus límites. Direcciones compartidas y autorización criptográfica son decisiones separadas: un hash de claves públicas puede identificar una política, pero nunca se convierte por eso en una clave secreta.

## 6. Decisiones arquitectónicas recomendadas

1. **Capa criptográfica local en `.me`.** Tipos de condición y sobre, sellado, producción/verificación/combinación de contribuciones y apertura. Núcleo criptográfico aislado del adaptador de scopes. Sin llamadas de red al navegar o leer.
2. **Estado del scope en `.me`.** Cerrado/abierto en sesión, cachés ligadas a sobre/política/versión/ruta, bloqueo y snapshots. No confundir esta máquina de estados con el estado de transporte de una solicitud pendiente.
3. **Cleaker/identidad.** Propuesta: vincular claves de cifrado con principales/namespaces y gestionar sus versiones. Confirmar el contrato de descubrimiento en un ADR; no presentar como existente una API todavía ausente.
4. **NRP y runtime.** Mensajes autenticados, descubrimiento/ruteo, intercambio confidencial de contribuciones, consentimiento, timeouts y cancelación. El combinador obtiene la clave; un relay que recibe todas las contribuciones sin protección también podría combinar.
5. **Autorización de cambios.** Quien puede cifrar con claves públicas no queda por ello autorizado para escribir contenido aceptado o sustituir la política de un scope. Definir quién firma/aprueba creación y rotación.

No adoptar automáticamente la recomendación externa de derivar la clave de cifrado del seed. Ya hay una raíz aleatoria separada para confidencialidad v4. La elección entre clave aleatoria protegida por esa raíz y clave derivada de material de alta entropía debe considerar recuperación, rotación y separación de usos. Nunca reunir seeds de participantes. El ejemplo `audienceSeed(seeds)` del README TypeScript no es un protocolo distribuido de apertura.

Tampoco es necesario que AND sea inherentemente «multirronda y asíncrono» dentro del kernel: ambas construcciones permiten combinar localmente lo recibido. La orquestación de respuestas remotas sí necesita asincronía. Ya existe una API asíncrona de keyspace.

### Construcción inicial

Recomendación provisional para un MVP local: sobre versionado con DEK aleatoria, OR mediante wraps individuales y AND mediante reparto XOR de la DEK. Reutiliza la infraestructura WebCrypto existente y evita comenzar con agregación de claves y un protocolo Schnorr propio. Sigue necesitando revisión, contexto autenticado, identificación de shares, tratamiento de fallos y transporte confidencial.

Mantener Ristretto como candidato experimental bajo el mismo contrato semántico. Su ventaja de tamaño constante aplica al componente de encapsulación conjunta; la lista de miembros, PoP, contribuciones y pruebas no desaparecen. El [RFC 9496](https://www.rfc-editor.org/rfc/rfc9496.html) especifica el grupo, no certifica este protocolo de cifrado conjunto.

No implementar dos suites productivas ni umbrales en el primer corte. Elegir la suite definitiva después de los vectores de aceptación y de definir si el producto necesita colaboración por mensaje, por scope o por sesión. Una apertura n-de-n libera material al combinador; no garantiza presencia simultánea ni consentimiento renovado en cada lectura posterior.

## 7. Plan de acción con criterios de salida

| Orden | Entregable | Criterio para avanzar |
|---|---|---|
| 1 | Regresión de protección persistente | La secuencia raíz→lock→snapshot→hydrate→write no publica ni sobrescribe contenido protegido; tests con compatibilidad legado |
| 2 | Base verificable y documentación honesta | Arreglar test Base64URL, conectar wrapping/keyspace/axiomas/fases al gate adecuado, marcar propuestas y corregir A9/7A/7B; CI reproducible |
| 3 | `Audience-Algebra.md` + ADR | Coaliciones, monotonicidad, identidad, contexto, autoridad de rotación, derivados, estado de apertura y capas definidos; ninguna garantía depende del transporte para guardar el secreto |
| 4 | Contrato de sobre y suite única | Codificación canónica, versión y suite autenticadas; pruebas de sustitución de ruta/política/miembros/época; claves independientes por mensaje/contexto |
| 5 | MVP local TypeScript | OR y AND con identidades sintéticas independientes; positivos/negativos; sin red ni modificación implícita de v3/v4 |
| 6 | Integración con scopes | Matriz de axiomas/fases: cierre, punteros, filtros, derivaciones, replay, snapshot, cachés, errors y reinicio; ningún secreto compartido exige exportar una raíz privada |
| 7 | Estado compartido autorizado | Rotación firmada/autorizada, política de conflictos y garantía explícita de actualidad; no depender de FNV-32 ni de seq local para revocación distribuida |
| 8 | Cleaker + NRP + Monad | Claves vinculadas, solicitudes ligadas a sobre/contexto/combinador, transporte confidencial, cancelación, repetición, retención de contribuciones y consentimiento probados |
| 9 | Paridad y publicación | Vectores TypeScript positivos/negativos para Rust; revisión criptográfica antes de afirmar seguridad de producción; demo y docs reflejan estado real |

La modernización de A8 debe ser una línea explícita de integridad versionada. No bloquea redactar el álgebra ni probar un MVP local, pero sí bloquea usar el historial actual como fundamento de autorización/frescura entre participantes. Debe preservar lectura de historia existente y evitar una sustitución global de hash que cambie secretos legados o ganadores LWW.

### Primera entrega concreta recomendada

Una corrección pequeña de persistencia con regresiones, acompañada de un documento de álgebra y un ADR de capas. El documento puede redactarse mientras se corrige la regresión. La aprobación arquitectónica debe recaer sobre esas decisiones concretas, no sobre 18 preguntas sin propuestas.

En la siguiente entrega se construye el sobre local OR/AND con una sola suite. Solo después se conecta al almacenamiento y a la red. Esta secuencia conserva la posibilidad de elegir Ristretto sin hacer depender la gramática pública de sus operaciones internas.

## 8. Qué conservar y qué corregir del informe adjunto

- Correctos y confirmados: ausencia de audiencias nativas, wrap individual, límites de A8, drift de A9/Phases, error Base64URL, metadatos de wrap no autenticados y separación de transporte.
- Matiz: hay `secretEpoch`, rotación de raíz y controles locales de lectura. Lo ausente es su equivalente como contrato de audiencias; decir que no existe ninguna época o política en el código sería demasiado amplio.
- Matiz: los tests de axiomas/fases no están en el script `npm test`, pero sí en `test:prebuild`. Están conectados a un gate, aunque no al comando habitual. Los contratos de wrapping/keyspace tampoco están en el runner principal inspeccionado.
- Matiz: las claves v4 no son físicamente imposibles de compartir; compartirlas o compartir la raíz sería una exportación de autoridad que el modelo no debe requerir. La integración necesita material compartido separado.
- Matiz: A0 oculta raíces en la superficie semántica; no promete anonimato de membresía ni ausencia de metadatos en disco. Esas garantías necesitan definición propia.
- Matiz: DLEQ prueba consistencia matemática de una contribución; no reemplaza consentimiento, identidad, vínculo al sobre completo ni confidencialidad del canal.
- Hallazgos añadidos por esta revisión: pérdida de protección raíz tras lock/export/hydrate, resultados derivados públicos persistentes y keyring independiente del bloqueo de identidad.

## 9. Límites de esta investigación

Es una revisión de implementación y contratos con pruebas ejecutables, no una certificación criptográfica. No se asume sincronía distribuida, ausencia de colusión, borrado de copias ni control de dispositivos ajenos. Los resultados se refieren a la revisión local indicada, no a todos los despliegues o versiones publicadas.

La integración con Rust sigue el [contrato de compatibilidad](me/compatibility/README.md:43): TypeScript es la referencia y no se deben inventar audiencias en el puerto antes de fijar y verificar ese contrato.
