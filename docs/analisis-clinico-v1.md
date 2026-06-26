# Análisis clínico — fisio-app
**Perspectiva:** Fisioterapeuta musculoesquelético con experiencia clínica  
**Fecha:** Junio 2026

---

## Resumen ejecutivo

La app tiene una base estructural correcta y demuestra comprensión del flujo de trabajo fisioterapéutico básico. Sin embargo, desde el punto de vista clínico real en fisioterapia musculoesquelética, hay vacíos importantes que limitarían su uso profesional. En el estado actual, podría servir como herramienta de registro básico, pero no reemplaza ni complementa adecuadamente la práctica clínica avanzada en MSK.

---

## Lo que está bien

### Anamnesis inicial — base sólida
La estructura de la anamnesis cubre los pilares básicos: motivo de consulta, fecha de inicio, mecanismo de lesión, comportamiento del dolor (mínimo, máximo, actual en NRS 0-10), factores agravantes y aliviadores, síntomas neurológicos, banderas rojas, antecedentes quirúrgicos, medicación e historia relevante. Esto es suficiente para una primera consulta básica.

La presencia de **red flags** como campo explícito es clínicamente correcta y demuestra conciencia de la seguridad del paciente. Bien.

### Evaluación objetiva — estructura coherente
Tener campos separados para postura, ROM, fuerza, tests especiales, tests funcionales, palpación, calidad del movimiento, balance y marcha refleja el razonamiento clínico estándar en MSK. La posibilidad de hacer múltiples evaluaciones objetivas a lo largo del tiempo es correcta — permite ver la evolución del cuadro.

### Decisión clínica en cada sesión
El campo `clinicalDecision` con los valores MAINTAIN / PROGRESS / REGRESS / REFER es una de las mejores decisiones de diseño del sistema. Obliga al fisioterapeuta a tomar una decisión explícita al final de cada sesión, lo que mejora el razonamiento clínico y la trazabilidad. En muchos sistemas clínicos esto no existe.

### RPE en ejercicios
El campo `rpe` (Rate of Perceived Exertion) en los ejercicios de sesión demuestra conocimiento de la práctica actual en rehabilitación basada en evidencia. El RPE es hoy preferido sobre el % de 1RM para prescripción de carga en rehabilitación.

---

## Vacíos clínicos críticos

### 1. Anamnesis — Faltan los elementos que definen la conducta terapéutica

**Comportamiento del dolor en 24 horas** — No existe.  
Este es probablemente el elemento más importante que falta. En MSK el comportamiento circadiano del dolor define el tipo de patología y la agresividad del tratamiento. ¿El dolor es peor al levantarse (inflamatorio)? ¿Mejora con movimiento (mecánico)? ¿Empeora al final del día (postural/sobrecarga)? ¿Despierta al paciente (patología seria)?  Sin esto, la anamnesis es incompleta.

**Irritabilidad del cuadro** — No existe.  
La irritabilidad (alta/media/baja) determina cuánto podemos explorar en la evaluación objetiva y qué intensidad de tratamiento es apropiada desde la primera sesión. Un cuadro altamente irritable con evaluación objetiva completa puede agravar al paciente. Este concepto, central en la práctica de Maitland y la fisioterapia MSK moderna, no está representado en ningún campo.

**Yellow flags** — No existe.  
Hay red flags pero no yellow flags (factores psicosociales: kinesiofobia, catastrofización, problemas laborales, estado emocional). La evidencia actual es clara: los factores psicosociales predicen cronicidad mejor que los hallazgos estructurales. Un fisioterapeuta que no los registra está trabajando incompleto.

**Impacto en el sueño** — No existe.  
El sueño interrumpido por dolor es un indicador de pronóstico y bandera de alerta clínica. Tampoco hay campo.

**Escalas de discapacidad funcional estandarizadas** — No existe.  
No hay lugar para registrar DASH (hombro/codo/mano), KOOS (rodilla), LEFS (miembro inferior), NDI (cuello), Oswestry (lumbar), ASES, FAAM, etc. Estas escalas son el estándar de medición de resultados en MSK y son las que se usan en investigación y en comunicación con otros profesionales. Sin ellas, el seguimiento del progreso funcional es subjetivo.

**Demanda funcional y deportiva** — Incompleta.  
Solo hay un campo "occupation" genérico. No hay registro de actividad deportiva, nivel de competición, demandas laborales específicas (trabajo sentado/de pie/manual), postura de trabajo. Esto afecta directamente el planteamiento terapéutico y los objetivos.

---

### 2. Evaluación objetiva — Texto libre donde debería haber datos estructurados

**ROM como texto libre** es el error clínico más importante del sistema.  
El campo `rangeOfMotion` es un `String`. En la práctica real, el fisioterapeuta mide y registra: "Flexión cervical: 45° (normal 50°), Rotación derecha: 60°, Rotación izquierda: 35° (limitada, dolor al final del rango)". Con texto libre esto no es comparable, no es graficable, no permite seguimiento objetivo entre sesiones.

Lo mismo aplica a **fuerza**: la escala de Daniels (0-5) o la dinamometría (kg) necesitan campos numéricos estructurados, no un String.

**Tests especiales sin estructura** — Los tests especiales son el corazón del diagnóstico diferencial en MSK. "Test de Neer positivo", "Hawkins negativo", "Apprehension test dudoso". Hoy todo va en un campo de texto libre sin estandarización. Idealmente deberían existir tests predefinidos por región corporal con resultado positivo/negativo/dudoso.

**Faltan signos físicos básicos:**
- No hay campo para **edema** (medición circunferencial)
- No hay campo para **temperatura local** (aumentada/normal)
- No hay campo para **color de la piel** en la zona afectada
- No hay **clasificación diagnóstica fisioterapéutica** — ¿Cuál es la hipótesis de trabajo del fisio tras la evaluación? No hay campo para esto.

---

### 3. Sesiones — Solo registra ejercicios, no el tratamiento completo

El módulo de sesión registra ejercicios (bien implementado) pero ignora el 50% o más de lo que hace un fisioterapeuta MSK en una sesión:

**Técnicas manuales** — No existe ningún campo.  
Movilización articular (Grados de Maitland), manipulación, terapia miofascial, punción seca, masoterapia, movilización neural, taping (KT, rígido), tracción... Nada de esto puede registrarse. Un fisioterapeuta que usa terapia manual como parte central de su práctica no puede documentar su trabajo.

**Agentes físicos** — No existe.  
Electroterapia (TENS, interferenciales, corrientes rusas), ultrasonido terapéutico, termoterapia (calor/frío), fotobioterapia (laser, LED)... Tampoco.

**Duración de la sesión** — No existe. Relevante para facturación y para valorar adherencia.

**Número de sesión en el plan** — No hay forma de saber que esto es la "sesión 4 de 12 planificadas". La relación entre el plan de rehabilitación y las sesiones es débil.

---

### 4. Plan de rehabilitación — Demasiado genérico

El plan actual tiene título, descripción, fase y frecuencia semanal. En la práctica MSK esto es insuficiente:

- No hay **número total de sesiones** previstas
- No hay **criterios de progresión de fase** — ¿Qué tiene que lograr el paciente para pasar de ACUTE a SUBACUTE? ¿ROM de 90°? ¿EVA < 3? ¿Test funcional específico?
- No hay **pronóstico** — tiempo estimado de recuperación
- No hay **metas funcionales por fase** — no es lo mismo "fortalecimiento" que "lograr sentadilla profunda sin dolor"
- Los objetivos clínicos (ClinicalGoal) están desvinculados del plan de rehabilitación — no hay relación entre qué fase del plan corresponde a qué objetivo

---

### 5. Ausencias sistémicas importantes

**Body chart** — No hay mapa corporal para marcar localización del dolor, áreas de referencia, parestesias, alodinia. En MSK esto es estándar en la primera consulta.

**Alta clínica** — No hay módulo de alta. No hay forma de cerrar un episodio de tratamiento con criterios cumplidos, recomendaciones de mantenimiento y prevención de recaídas.

**Episodios anteriores** — Si el mismo paciente vuelve con el mismo problema un año después, no hay forma de vincular el nuevo episodio con el anterior. Se pierde la historia longitudinal.

**Consentimiento informado** — Para técnicas como punción seca o manipulación vertebral es legalmente obligatorio en muchas jurisdicciones. No hay rastro de esto.

**Informe para derivante** — El PDF de informe existe pero está pensado como resumen general. No hay una "nota de evolución para médico" estructurada que el fisio pueda enviar al médico que derivó al paciente.

---

## Prioridades de mejora clínica

### Prioridad 1 — Impacto inmediato en la calidad del registro
1. Agregar comportamiento del dolor en 24hs a la anamnesis (3 campos: mañana / tarde-noche / nocturno)
2. Agregar irritabilidad del cuadro (alta/media/baja + texto justificativo)
3. Agregar una escala funcional estandarizada por región (al menos DASH y Oswestry para empezar)
4. Convertir ROM de texto libre a campos numéricos estructurados por movimiento

### Prioridad 2 — Completar el registro de sesión
5. Agregar módulo de técnicas manuales (lista predefinida + campos de descripción)
6. Agregar módulo de agentes físicos
7. Agregar duración de sesión

### Prioridad 3 — Enriquecer el modelo clínico
8. Agregar yellow flags a la anamnesis
9. Agregar hipótesis diagnóstica fisioterapéutica a la evaluación objetiva
10. Agregar módulo de alta clínica
11. Vincular criterios de progresión al plan de rehabilitación

---

## Conclusión

La app está bien construida técnicamente y tiene la arquitectura correcta para crecer. El flujo básico (paciente → anamnesis → evaluación → plan → sesiones → progreso) es clínicamente coherente. Pero en su estado actual, un fisioterapeuta MSK con formación rigurosa encontraría que le faltan las herramientas para documentar su práctica completa.

El mayor valor que podría agregar el próximo ciclo de desarrollo no es más UI ni más funciones de gestión — es profundidad clínica: comportamiento del dolor, irritabilidad, escalas validadas, técnicas manuales y ROM estructurado. Con esos cambios, la app pasaría de "útil para llevar un registro básico" a "herramienta clínica real para un fisioterapeuta MSK".

---


