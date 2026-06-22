# Contexto del proyecto

## 1. Objetivo del producto
Crear una app web para fisioterapia/kinesiología musculoesquelética que permita registrar, organizar y seguir la evolución clínica de pacientes durante su proceso de rehabilitación, de forma simple, clara y profesional.

## 2. Módulos principales
- Autenticación de profesionales
- Gestión de pacientes
- Anamnesis inicial
- Evaluación objetiva
- Objetivos de rehabilitación
- Evolución por sesión
- Visualización de progreso clínico
- Generación de informes PDF

## 3. Entidades principales
- Usuario profesional: kinesiólogo/fisioterapeuta con acceso autenticado
- Paciente: datos personales y de contacto
- Historia clínica: ficha general del paciente
- Anamnesis: motivo de consulta, antecedentes, dolor, limitaciones funcionales, tiempo de evolución
- Evaluación objetiva: postura, movilidad, fuerza, tests clínicos, hallazgos relevantes
- Objetivo terapéutico: objetivos clínicos y funcionales con estado y fecha
- Sesión/evolución: registro cronológico de cada atención, intervenciones y respuesta del paciente
- Informe: resumen clínico exportable en PDF

## 4. Reglas clínicas básicas
- Toda evolución debe estar asociada a un paciente existente.
- La anamnesis inicial y la evaluación objetiva deben poder registrarse antes de comenzar las sesiones.
- Los objetivos de rehabilitación deben estar vinculados al problema principal del paciente.
- El progreso clínico debe mostrarse en orden cronológico.
- Los registros clínicos no deben borrarse físicamente; idealmente se conservan por trazabilidad.
- Los informes PDF deben reflejar información clínica clara, resumida y profesional.

## 5. Reglas técnicas
- Usar TypeScript en frontend y backend.
- Validar inputs con Zod tanto en cliente como en servidor cuando aplique.
- Usar Prisma como única capa de acceso a datos.
- La autenticación se resuelve con JWT.
- PostgreSQL es la fuente única de verdad.
- Mantener separación clara entre frontend, API, lógica de negocio y acceso a datos.
- Priorizar componentes reutilizables y formularios tipados.
- Diseñar el modelo de datos pensando en escalabilidad y trazabilidad clínica.

## 6. Prioridades del MVP
- Login de profesional
- Alta, edición y visualización de pacientes
- Carga de anamnesis inicial
- Carga de evaluación objetiva
- Definición de objetivos de rehabilitación
- Registro de evolución por sesión
- Vista simple del progreso clínico del paciente
- Generación básica de informe PDF

## 7. Qué NO debe hacer todavía la app
- No manejar videollamadas ni telemedicina
- No incluir facturación, pagos ni integración con obras sociales
- No incluir agenda compleja ni recordatorios automáticos
- No usar IA para diagnóstico o decisiones clínicas
- No permitir acceso multiinstitución, roles avanzados ni administración compleja
- No integrar wearables, sensores o dispositivos externos
- No reemplazar el criterio clínico profesional
