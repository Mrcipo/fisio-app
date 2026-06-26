# Plan de acción v3 — fisio-app
**Enfoque:** Profundidad clínica MSK  
**Origen:** Análisis clínico musculoesquelético — Junio 2026  
**Objetivo:** Transformar la app de registro básico a herramienta clínica real

---

## Principios de este plan

Cada fase agrega valor clínico independiente. Si se interrumpe el desarrollo en cualquier punto, lo que está hecho sigue siendo útil. Las fases respetan las dependencias técnicas: primero el schema, luego el backend, luego el frontend.

**Leyenda de esfuerzo:** 🟢 Bajo (<2h) · 🟡 Medio (medio día) · 🔴 Alto (1+ día)  
**Leyenda de impacto clínico:** ⭐ Importante · ⭐⭐ Muy importante · ⭐⭐⭐ Crítico

---

## FASE 1 — Anamnesis completa
*Los campos que faltan en la primera consulta y que definen la conducta terapéutica.*

### 1.1 — Comportamiento del dolor en 24 horas 🟡 ⭐⭐⭐
**Schema:** Agregar a `InitialAssessment`:
```prisma
painMorning       String?   // Comportamiento al levantarse
painDayTime       String?   // Comportamiento durante el día
painNight         String?   // Comportamiento nocturno / si despierta
```
**Frontend:** Sección nueva "Comportamiento del dolor" en el formulario de anamnesis con 3 textareas etiquetadas: "Al levantarse", "Durante el día", "Por la noche / ¿Despierta al paciente?".  
**Criterio de cierre:** El fisioterapeuta puede registrar si el dolor es peor de mañana (inflamatorio) o al final del día (mecánico/sobrecarga) y si despierta al paciente.

### 1.2 — Irritabilidad del cuadro 🟡 ⭐⭐⭐
**Schema:** Agregar a `InitialAssessment`:
```prisma
irritability      IrritabilityLevel?  // enum: LOW, MEDIUM, HIGH
irritabilityNotes String?
```
Nuevo enum:
```prisma
enum IrritabilityLevel {
  LOW
  MEDIUM
  HIGH
}
```
**Frontend:** Select con 3 opciones etiquetadas en español + campo de texto para justificación. Incluir tooltip explicativo: "Alta: el dolor se provoca fácilmente y tarda en calmarse. Media: se provoca con esfuerzo moderado. Baja: difícil de provocar y se calma rápido."  
**Criterio de cierre:** La irritabilidad queda registrada y visible en el resumen del paciente.

### 1.3 — Yellow flags (factores psicosociales) 🟡 ⭐⭐
**Schema:** Agregar a `InitialAssessment`:
```prisma
yellowFlags            String?   // Texto libre de factores psicosociales
kinesophobia           Boolean?  // ¿Presenta miedo al movimiento?
workRelated            Boolean?  // ¿Relacionado con el trabajo?
compensationClaim      Boolean?  // ¿Hay reclamo indemnizatorio activo?
```
**Frontend:** Subsección "Factores psicosociales" con checkboxes para los booleanos y un textarea para observaciones libres.  
**Criterio de cierre:** El fisio puede registrar señales de alerta psicosocial que predicen cronicidad.

### 1.4 — Escalas funcionales estandarizadas 🔴 ⭐⭐⭐
**Schema:** Nueva tabla `FunctionalScale`:
```prisma
model FunctionalScale {
  id          String            @id @default(cuid())
  patientId   String
  sessionId   String?           // Puede asociarse a una sesión
  scaleType   FunctionalScaleType
  score       Decimal           @db.Decimal(10, 2)
  maxScore    Decimal           @db.Decimal(10, 2)
  percentage  Decimal?          @db.Decimal(5, 2)
  notes       String?
  date        DateTime          @default(now())
  createdAt   DateTime          @default(now())
  patient     Patient           @relation(...)
  session     Session?          @relation(...)
}

enum FunctionalScaleType {
  DASH          // Hombro/codo/mano (0-100)
  QUICK_DASH    // Versión corta DASH
  NDI           // Neck Disability Index (cervical)
  OSWESTRY      // Oswestry Disability Index (lumbar)
  KOOS          // Knee injury and OA Outcome Score
  LEFS          // Lower Extremity Functional Scale
  FAAM          // Foot and Ankle Ability Measure
  ASES          // American Shoulder and Elbow Surgeons
  PSFS          // Patient-Specific Functional Scale (personalizable)
  OTHER
}
```
**Backend:** CRUD completo + endpoint `GET /patients/:id/functional-scales`.  
**Frontend:** Panel "Escalas funcionales" en el tab de Progreso. Permite registrar una escala con fecha y puntaje, y muestra la evolución en el tiempo con gráfico de línea.  
**Criterio de cierre:** El fisioterapeuta puede registrar DASH inicial y DASH de alta, y ver la mejora porcentual.

### 1.5 — Demanda funcional y deportiva 🟢 ⭐
**Schema:** Agregar a `InitialAssessment`:
```prisma
sportActivity     String?   // Deporte o actividad física
sportLevel        String?   // Recreativo, amateur, competitivo, élite
workPosture       String?   // Descripción de demanda postural laboral
sleepImpact       Boolean?  // ¿El dolor afecta el sueño?
```
**Frontend:** Ampliar la sección de datos del paciente en el formulario de anamnesis.  
**Criterio de cierre:** Se puede registrar si el paciente es un corredor amateur o un trabajador manual, con impacto en la definición de objetivos.

---

## FASE 2 — Evaluación objetiva estructurada
*Pasar de texto libre a datos medibles y comparables.*

### 2.1 — ROM estructurado por región corporal 🔴 ⭐⭐⭐
**Schema:** Nueva tabla `RangeOfMotion` vinculada a `ObjectiveAssessment`:
```prisma
model RangeOfMotion {
  id                    String              @id @default(cuid())
  objectiveAssessmentId String
  movement              String              // "Flexión cervical", "Rotación lumbar derecha"
  activeRange           Decimal?            @db.Decimal(5, 1)   // Grados activo
  passiveRange          Decimal?            @db.Decimal(5, 1)   // Grados pasivo
  normalRange           Decimal?            @db.Decimal(5, 1)   // Valor normal referencia
  endFeel               String?             // Firme, blando, vacío, rígido
  pain                  Boolean?            // ¿Reproduce síntomas?
  painOnset             String?             // Al inicio, al final del rango
  objectiveAssessment   ObjectiveAssessment @relation(...)
}
```
**Frontend:** En la evaluación objetiva, al seleccionar la región corporal, cargar automáticamente los movimientos correspondientes (ej: cervical → flexión, extensión, rotaciones, inclinaciones). Input numérico para activo/pasivo, selector de end-feel, checkbox de reproducción de síntomas.  
**Criterio de cierre:** ROM de flexión cervical de la evaluación inicial vs evaluación de la semana 4 son comparables numéricamente y graficables.

### 2.2 — Fuerza muscular estructurada 🟡 ⭐⭐
**Schema:** Nueva tabla `StrengthAssessment`:
```prisma
model StrengthAssessment {
  id                    String              @id @default(cuid())
  objectiveAssessmentId String
  muscleGroup           String              // "Cuádriceps derecho", "Manguito rotador"
  danielsGrade          Int?                // 0-5 Escala de Daniels
  dynamometerKg         Decimal?            @db.Decimal(5, 2)  // Fuerza en kg
  side                  Side?               // LEFT, RIGHT, BILATERAL
  notes                 String?
  objectiveAssessment   ObjectiveAssessment @relation(...)
}

enum Side {
  LEFT
  RIGHT
  BILATERAL
}
```
**Criterio de cierre:** Se pueden comparar los valores de fuerza de cuádriceps entre la evaluación inicial y el alta.

### 2.3 — Tests especiales por región 🔴 ⭐⭐
**Schema:** Nueva tabla `SpecialTest`:
```prisma
model SpecialTest {
  id                    String              @id @default(cuid())
  objectiveAssessmentId String
  testName              String              // Nombre del test
  result                SpecialTestResult
  notes                 String?
  objectiveAssessment   ObjectiveAssessment @relation(...)
}

enum SpecialTestResult {
  POSITIVE
  NEGATIVE
  INCONCLUSIVE
}
```
**Frontend:** Al seleccionar la región corporal, mostrar una lista predefinida de tests relevantes. Ejemplos:
- Hombro: Neer, Hawkins-Kennedy, Apprehension, Jobe, Speed, Yergason, O'Brien
- Rodilla: Lachman, McMurray, Apley, Varo/Valgo, Cajón anterior/posterior
- Lumbar: SLR, FABER, FADIR, Slump, Prueba de Waddell
- Cervical: Spurling, Distracción cervical, ULTT 1/2a/2b/3

**Criterio de cierre:** El test de Lachman puede registrarse como positivo con notas, y queda visible en el historial de evaluaciones.

### 2.4 — Hipótesis diagnóstica fisioterapéutica 🟢 ⭐⭐
**Schema:** Agregar a `ObjectiveAssessment`:
```prisma
workingDiagnosis      String?   // Hipótesis de trabajo del fisioterapeuta
clinicalClassification String?  // Clasificación clínica (ej: síndrome subacromial Neer grado II)
prognosis             String?   // Pronóstico estimado
```
**Criterio de cierre:** El fisio puede registrar "Síndrome de impingement subacromial, estadio II, pronóstico favorable a 6-8 semanas con tratamiento conservador."

### 2.5 — Signos físicos complementarios 🟢 ⭐
**Schema:** Agregar a `ObjectiveAssessment`:
```prisma
edema                 String?   // Descripción/medición de edema
skinColor             String?   // Color/temperatura local
circumference         String?   // Medición circunferencial (cm)
```

---

## FASE 3 — Sesión clínica completa
*Registrar todo lo que hace el fisioterapeuta, no solo los ejercicios.*

### 3.1 — Técnicas manuales en sesión 🔴 ⭐⭐⭐
**Schema:** Nueva tabla `ManualTechnique`:
```prisma
model ManualTechnique {
  id              String              @id @default(cuid())
  sessionId       String
  techniqueType   ManualTechniqueType
  region          BodyRegion?
  description     String?
  grade           String?             // Grado Maitland I-IV, etc.
  response        String?             // Respuesta del paciente
  session         Session             @relation(...)
}

enum ManualTechniqueType {
  JOINT_MOBILIZATION       // Movilización articular
  MANIPULATION             // Manipulación
  SOFT_TISSUE              // Terapia de tejidos blandos
  DRY_NEEDLING             // Punción seca
  NEURAL_MOBILIZATION      // Movilización neural
  MYOFASCIAL_RELEASE       // Liberación miofascial
  TAPING_KT                // Kinesiotaping
  TAPING_RIGID             // Vendaje rígido
  TRACTION                 // Tracción manual/mecánica
  OTHER
}
```
**Frontend:** Sección "Técnicas manuales" en el formulario de sesión. Lista de técnicas con checkbox + campos de región, descripción y respuesta.  
**Criterio de cierre:** Un fisioterapeuta puede registrar "Movilización articular grado III en C4-C5, respuesta: alivio de síntomas al finalizar".

### 3.2 — Agentes físicos en sesión 🟡 ⭐⭐
**Schema:** Nueva tabla `PhysicalAgent`:
```prisma
model PhysicalAgent {
  id            String            @id @default(cuid())
  sessionId     String
  agentType     PhysicalAgentType
  parameters    String?           // Parámetros (frecuencia, intensidad, tiempo)
  duration      Int?              // Minutos
  region        BodyRegion?
  session       Session           @relation(...)
}

enum PhysicalAgentType {
  TENS
  INTERFERENTIAL
  RUSSIAN_CURRENT
  ULTRASOUND
  LASER
  LED
  HEAT
  CRYOTHERAPY
  IONTOPHORESIS
  OTHER
}
```
**Criterio de cierre:** Se puede registrar "TENS modo burst, 80Hz, 100μs, 20 minutos en región lumbar".

### 3.3 — Duración y número de sesión 🟢 ⭐
**Schema:** Agregar a `Session`:
```prisma
durationMinutes   Int?    // Duración en minutos
sessionNumber     Int?    // Número de sesión en el episodio actual
```
**Criterio de cierre:** Cada sesión muestra "Sesión 4 — 45 minutos".

### 3.4 — Justificación de decisión clínica 🟢 ⭐⭐
**Schema:** Agregar a `Session`:
```prisma
clinicalDecisionNotes String?  // Justificación de la decisión clínica
```
**Frontend:** Campo de texto que aparece cuando se selecciona una `clinicalDecision`. Si la decisión es REFER, volverse obligatorio.  
**Criterio de cierre:** La decisión "Derivar" siempre tiene una justificación escrita.

---

## FASE 4 — Plan de rehabilitación enriquecido
*De un plan genérico a una hoja de ruta clínica real.*

### 4.1 — Criterios de progresión por fase 🟡 ⭐⭐⭐
**Schema:** Agregar a `RehabPlan`:
```prisma
totalSessions         Int?      // Número total de sesiones planificadas
estimatedWeeks        Int?      // Semanas estimadas de tratamiento
progressionCriteria   String?   // Criterios para pasar a la siguiente fase
estimatedPrognosis    String?   // Pronóstico narrativo del fisioterapeuta
```
**Frontend:** Campos adicionales en el formulario de plan de rehabilitación.  
**Criterio de cierre:** El plan dice "12 sesiones, 6 semanas. Criterio de progresión a Fortalecimiento: dolor < 3/10 y ROM > 120° de flexión."

### 4.2 — Metas funcionales por fase 🟡 ⭐⭐
**Schema:** Agregar campo `rehabPlanId` a `ClinicalGoal` para vincular objetivos a fases del plan:
```prisma
rehabPlanId   String?   // Objetivo vinculado a una fase del plan
```
**Frontend:** Al crear un objetivo, opción de vincularlo a un plan de rehabilitación activo.  
**Criterio de cierre:** El objetivo "Alcanzar 120° de flexión de hombro" está vinculado a la fase "Subaguda" del plan.

---

## FASE 5 — Nuevos módulos clínicos
*Funcionalidades que no existen y que son necesarias para la práctica profesional.*

### 5.1 — Alta clínica 🔴 ⭐⭐⭐
**Schema:** Nueva tabla `ClinicalDischarge`:
```prisma
model ClinicalDischarge {
  id                    String    @id @default(cuid())
  patientId             String    @unique
  dischargeDate         DateTime
  totalSessions         Int?
  treatmentDuration     String?   // "6 semanas"
  finalCondition        String?   // Estado final del paciente
  goalsAchieved         String?   // Objetivos cumplidos
  pendingGoals          String?   // Objetivos no alcanzados
  maintenanceRecommend  String?   // Recomendaciones de mantenimiento
  returnCriteria        String?   // Criterios para volver a consultar
  dischargeNotes        String?
  createdAt             DateTime  @default(now())
  patient               Patient   @relation(...)
}
```
**Frontend:** Botón "Dar de alta" en el detalle del paciente. Formulario de alta con todos los campos. El paciente dado de alta aparece con badge diferente en el listado.  
**Criterio de cierre:** Se puede generar un alta clínica que quede en el historial y se incluya en el informe PDF.

### 5.2 — Escalas funcionales integradas con calculadora 🔴 ⭐⭐⭐
*(Extensión de 1.4)*  
Para las escalas más comunes (DASH, NDI, Oswestry), implementar el cuestionario completo dentro de la app con cálculo automático del puntaje. El profesional responde las preguntas y el sistema calcula el score.  
**Criterio de cierre:** El paciente puede completar el DASH (30 preguntas) con guía y el sistema calcula el puntaje e interpreta el resultado (0-100, mayor = más discapacidad).

### 5.3 — Registro de episodios de tratamiento 🔴 ⭐⭐
**Schema:** Nueva tabla `TreatmentEpisode` que agrupa sesiones por episodio clínico:
```prisma
model TreatmentEpisode {
  id              String    @id @default(cuid())
  patientId       String
  startDate       DateTime
  endDate         DateTime?
  chiefComplaint  String
  isActive        Boolean   @default(true)
  sessions        Session[]
  patient         Patient   @relation(...)
}
```
**Criterio de cierre:** Un paciente que viene por lumbalgia en 2025 y vuelve por cervicalgia en 2026 tiene dos episodios separados pero en el mismo historial.

### 5.4 — Nota de evolución para derivante 🟡 ⭐⭐
**Frontend:** En el informe PDF, agregar una sección "Nota para médico derivante" con formato estructurado: motivo de consulta → diagnóstico fisioterapéutico → tratamiento realizado → evolución → estado actual → recomendaciones.  
No requiere cambios de schema, es una vista nueva del informe existente.  
**Criterio de cierre:** El fisioterapeuta puede generar un PDF de evolución para enviar al médico que derivó al paciente.

### 5.5 — Consentimiento informado 🟡 ⭐⭐
**Schema:** Nueva tabla `InformedConsent`:
```prisma
model InformedConsent {
  id            String    @id @default(cuid())
  patientId     String
  consentType   ConsentType
  signedDate    DateTime
  notes         String?
  patient       Patient   @relation(...)
}

enum ConsentType {
  GENERAL_TREATMENT
  MANIPULATION
  DRY_NEEDLING
  TAPING
  OTHER
}
```
**Frontend:** Registro de consentimientos firmados (no firma digital por ahora, solo registro de fecha).  
**Criterio de cierre:** Queda registrado que el paciente firmó consentimiento para punción seca el día X.

---

## FASE 6 — Visualización clínica avanzada
*Hacer que los datos registrados sean útiles para la toma de decisiones.*

### 6.1 — Comparación de evaluaciones objetivas en el tiempo 🔴 ⭐⭐⭐
**Frontend:** En el tab de Progreso, una vista que compare lado a lado la evaluación objetiva inicial vs la más reciente. Mostrar delta (mejora/empeoramiento) en ROM, fuerza y tests especiales.  
**Criterio de cierre:** El fisioterapeuta puede ver de un vistazo que la flexión cervical pasó de 35° a 55° entre la primera y la última evaluación.

### 6.2 — Dashboard clínico enriquecido 🟡 ⭐⭐
**Frontend:** Agregar al dashboard:
- Pacientes con sesión esta semana
- Pacientes que llevan más de 30 días sin sesión (en riesgo de abandono)
- Últimas decisiones clínicas (cuántos PROGRESS, cuántos REFER esta semana)

**Criterio de cierre:** El fisioterapeuta arranca el día con una vista útil de su carga clínica.

### 6.3 — Gráfico multi-métrica en progreso 🟡 ⭐⭐
**Frontend:** En el gráfico de progreso, poder seleccionar múltiples métricas en el mismo eje temporal. Ej: ver dolor + ROM de flexión + fuerza en el mismo gráfico para ver correlaciones.  
**Criterio de cierre:** Se puede ver que a medida que baja el dolor (línea azul) sube el ROM (línea verde).

---

## Secuencia recomendada de ejecución

| Orden | Fase | Justificación |
|---|---|---|
| 1 | Fase 1 (1.1, 1.2, 1.3, 1.5) | Campos que no requieren tablas nuevas, solo agregar a `InitialAssessment`. Migración simple. |
| 2 | Fase 3 (3.3, 3.4) | Campos simples en `Session`. Sin tablas nuevas. |
| 3 | Fase 4 (4.1) | Campos simples en `RehabPlan`. Sin tablas nuevas. |
| 4 | Fase 1 (1.4) | Nueva tabla `FunctionalScale` + UI básica (sin calculadora) |
| 5 | Fase 2 (2.4, 2.5) | Campos simples en `ObjectiveAssessment` |
| 6 | Fase 5 (5.1) | Alta clínica — nueva tabla, alto valor clínico |
| 7 | Fase 3 (3.1, 3.2) | Tablas de técnicas manuales y agentes físicos |
| 8 | Fase 2 (2.1, 2.2, 2.3) | ROM estructurado, fuerza y tests — las más complejas |
| 9 | Fase 5 (5.4, 5.5) | Nota para derivante y consentimientos |
| 10 | Fase 4 (4.2) | Vincular objetivos a fases del plan |
| 11 | Fase 6 (6.1, 6.2, 6.3) | Visualizaciones avanzadas |
| 12 | Fase 5 (5.2, 5.3) | Calculadoras de escalas y episodios — las más complejas |

---

## Checklist global

### Fase 1 — Anamnesis
- [ ] 1.1 Comportamiento del dolor en 24 horas
- [ ] 1.2 Irritabilidad del cuadro
- [ ] 1.3 Yellow flags / factores psicosociales
- [ ] 1.4 Escalas funcionales estandarizadas
- [ ] 1.5 Demanda funcional, deportiva y sueño

### Fase 2 — Evaluación objetiva
- [ ] 2.1 ROM estructurado por región
- [ ] 2.2 Fuerza muscular estructurada
- [ ] 2.3 Tests especiales predefinidos por región
- [ ] 2.4 Hipótesis diagnóstica fisioterapéutica
- [ ] 2.5 Signos físicos complementarios (edema, color, circunferencia)

### Fase 3 — Sesión completa
- [ ] 3.1 Técnicas manuales
- [ ] 3.2 Agentes físicos
- [ ] 3.3 Duración y número de sesión
- [ ] 3.4 Justificación de decisión clínica

### Fase 4 — Plan de rehabilitación
- [ ] 4.1 Criterios de progresión, sesiones totales, pronóstico
- [ ] 4.2 Objetivos vinculados a fases del plan

### Fase 5 — Nuevos módulos
- [ ] 5.1 Alta clínica
- [ ] 5.2 Calculadora de escalas funcionales integrada
- [ ] 5.3 Episodios de tratamiento
- [ ] 5.4 Nota de evolución para médico derivante
- [ ] 5.5 Registro de consentimiento informado

### Fase 6 — Visualización avanzada
- [ ] 6.1 Comparación de evaluaciones en el tiempo
- [ ] 6.2 Dashboard clínico enriquecido
- [ ] 6.3 Gráfico multi-métrica en progreso

---

## Nota sobre migraciones

Este plan implica múltiples migraciones de base de datos. Cada tarea que agrega campos o tablas necesita:
1. Modificar `schema.prisma`
2. Correr `npx prisma migrate dev --name <nombre-descriptivo>`
3. Verificar que los tests sigan verdes
4. Actualizar el seed si corresponde

Las migraciones de Fase 1 y 3 (solo campos nuevos opcionales) son las más seguras — no rompen datos existentes. Las de Fase 2 (nuevas tablas relacionadas) requieren más cuidado con las relaciones y los índices.

---

