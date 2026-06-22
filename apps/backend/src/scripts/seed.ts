import "dotenv/config";
import bcrypt from "bcrypt";
import {
  BodyRegion,
  ClinicalDecision,
  ClinicalGoalPriority,
  ClinicalGoalStatus,
  MetricType,
  MetricUnit,
  PatientSex,
  RehabPlanPhase,
  RehabPlanStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "demo@fisio.app";
  const password = "demo12345";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.progressMetric.deleteMany();
  await prisma.sessionExercise.deleteMany();
  await prisma.session.deleteMany();
  await prisma.clinicalGoal.deleteMany();
  await prisma.rehabPlan.deleteMany();
  await prisma.objectiveAssessment.deleteMany();
  await prisma.initialAssessment.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: "Demo",
      lastName: "Fisioterapeuta",
    },
  });

  const exercises = await prisma.$transaction([
    prisma.exercise.create({
      data: {
        userId: user.id,
        name: "Puente de gluteos",
        bodyRegion: BodyRegion.LUMBAR,
        objective: "Mejorar control lumbopelvico",
        defaultSets: 3,
        defaultReps: 12,
        precautions: "Suspender si aumenta dolor irradiado",
      },
    }),
    prisma.exercise.create({
      data: {
        userId: user.id,
        name: "Bird dog",
        bodyRegion: BodyRegion.LUMBAR,
        objective: "Estabilidad segmentaria",
        defaultSets: 3,
        defaultReps: 10,
      },
    }),
    prisma.exercise.create({
      data: {
        userId: user.id,
        name: "Sentadilla a caja",
        bodyRegion: BodyRegion.KNEE,
        objective: "Fortalecimiento funcional",
        defaultSets: 4,
        defaultReps: 8,
        defaultLoad: "Peso corporal",
      },
    }),
    prisma.exercise.create({
      data: {
        userId: user.id,
        name: "Remo elastico",
        bodyRegion: BodyRegion.SHOULDER,
        objective: "Control escapular y fortalecimiento de manguito",
        defaultSets: 3,
        defaultReps: 15,
      },
    }),
    prisma.exercise.create({
      data: {
        userId: user.id,
        name: "Elevacion de talones",
        bodyRegion: BodyRegion.ANKLE_FOOT,
        objective: "Fortalecer triceps sural y mejorar tolerancia a carga",
        defaultSets: 4,
        defaultReps: 12,
      },
    }),
    prisma.exercise.create({
      data: {
        userId: user.id,
        name: "Rotacion cervical isometrica",
        bodyRegion: BodyRegion.CERVICAL,
        objective: "Mejorar tolerancia cervical y control muscular",
        defaultSets: 3,
        defaultDuration: 30,
      },
    }),
  ]);

  const [
    gluteBridge,
    birdDog,
    boxSquat,
    bandRow,
    calfRaise,
    cervicalIsometric,
  ] = exercises;

  const lucia = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Lucia",
      lastName: "Fernandez",
      documentNumber: "30111222",
      dateOfBirth: new Date("1992-04-11"),
      sex: PatientSex.FEMALE,
      phone: "11-5555-1111",
      email: "lucia.fernandez@example.com",
      occupation: "Administrativa",
      address: "CABA",
      notes: "Paciente motivada y adherente.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: lucia.id,
      reasonForConsultation: "Dolor lumbar mecánico de 6 semanas de evolución.",
      onsetDate: new Date("2026-02-10"),
      injuryMechanism: "Inicio progresivo asociado a aumento de horas sentada.",
      medicalDiagnosis: "Lumbalgia inespecífica",
      currentPain: 6,
      maxPain: 8,
      minPain: 3,
      painLocation: "Región lumbar baja",
      painType: "Opresivo",
      irradiation: "Sin irradiación",
      aggravatingFactors: "Sedestación prolongada, flexión hacia adelante",
      relievingFactors: "Caminar, cambiar de posición",
      neurologicalSymptoms: "Niega parestesias",
      previousSurgeries: "No refiere",
      medications: "AINE según necesidad",
      relevantHistory: "Episodios previos leves",
      redFlags: "Sin banderas rojas",
      patientGoals: "Volver a entrenar 3 veces por semana sin dolor",
      limitedActivities: "Permanecer sentada y levantar objetos del piso",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: lucia.id,
      bodyRegion: BodyRegion.LUMBAR,
      postureObservation: "Aumento leve de anteversión pélvica",
      rangeOfMotion: "Flexión lumbar limitada con dolor al final del recorrido",
      strength: "Déficit leve en glúteo mayor y abdomen",
      functionalTests: "Sit to stand con estrategia rígida lumbar",
      specialTests: "SLR negativo",
      palpationFindings: "Hipertonía paravertebral lumbar",
      movementQuality: "Disociación lumbo-pélvica reducida",
      balance: "Sin alteraciones relevantes",
      gait: "Sin claudicación",
      notes: "Irritabilidad mecánica moderada",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: lucia.id,
      title: "Rehabilitación lumbopélvica",
      description: "Control de dolor, movilidad y retorno progresivo al gimnasio.",
      phase: RehabPlanPhase.SUBACUTE,
      frequencyPerWeek: 2,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  await prisma.clinicalGoal.createMany({
    data: [
      {
        patientId: lucia.id,
        description: "Reducir dolor lumbar a 2/10 o menos",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-05-20"),
      },
      {
        patientId: lucia.id,
        description: "Tolerar 60 minutos sentada sin incremento de síntomas",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-05-27"),
      },
      {
        patientId: lucia.id,
        description: "Retomar entrenamiento de fuerza 3 veces por semana",
        priority: ClinicalGoalPriority.MEDIUM,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-06-15"),
      },
    ],
  });

  const luciaSessionOne = await prisma.session.create({
    data: {
      patientId: lucia.id,
      date: new Date("2026-03-01"),
      painBefore: 6,
      painAfter: 5,
      subjectiveReport: "Dolor al permanecer sentada en oficina.",
      clinicalNotes: "Buena respuesta a movilidad lumbar y control motor básico.",
      responseToTreatment: "Disminuye rigidez post sesión.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: gluteBridge.id,
            sets: 3,
            reps: 12,
            rpe: 4,
          },
          {
            exerciseId: birdDog.id,
            sets: 3,
            reps: 8,
            rpe: 5,
          },
        ],
      },
    },
  });

  const luciaSessionTwo = await prisma.session.create({
    data: {
      patientId: lucia.id,
      date: new Date("2026-03-08"),
      painBefore: 5,
      painAfter: 3,
      subjectiveReport: "Menor dolor diario, tolera más tiempo sentada.",
      clinicalNotes: "Se agrega carga funcional progresiva.",
      responseToTreatment: "Buena tolerancia al trabajo de cadera.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: gluteBridge.id,
            sets: 3,
            reps: 15,
            rpe: 5,
          },
          {
            exerciseId: boxSquat.id,
            sets: 4,
            reps: 8,
            load: "Peso corporal",
            rpe: 6,
          },
        ],
      },
    },
  });

  const luciaSessionThree = await prisma.session.create({
    data: {
      patientId: lucia.id,
      date: new Date("2026-03-19"),
      painBefore: 3,
      painAfter: 2,
      subjectiveReport: "Tolera jornada laboral completa con pausas activas.",
      clinicalNotes: "Mejora control lumbopélvico y tolerancia a sentadilla.",
      responseToTreatment: "Sin reagudización posterior.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: birdDog.id,
            sets: 3,
            reps: 10,
            rpe: 5,
          },
          {
            exerciseId: boxSquat.id,
            sets: 4,
            reps: 10,
            load: "Mancuerna 8 kg",
            rpe: 7,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: lucia.id,
        sessionId: luciaSessionOne.id,
        metricType: MetricType.PAIN,
        name: "Dolor lumbar al inicio",
        value: 6,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-03-01"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionTwo.id,
        metricType: MetricType.PAIN,
        name: "Dolor lumbar al inicio",
        value: 5,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-03-08"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionThree.id,
        metricType: MetricType.PAIN,
        name: "Dolor lumbar al inicio",
        value: 3,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-03-19"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionOne.id,
        metricType: MetricType.ROM,
        name: "Flexión lumbar",
        value: 55,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-03-01"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionTwo.id,
        metricType: MetricType.ROM,
        name: "Flexión lumbar",
        value: 68,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-03-08"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionThree.id,
        metricType: MetricType.ROM,
        name: "Flexión lumbar",
        value: 78,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-03-19"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionOne.id,
        metricType: MetricType.STRENGTH,
        name: "Puente unilateral",
        value: 8,
        unit: MetricUnit.REPETITIONS,
        date: new Date("2026-03-01"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionTwo.id,
        metricType: MetricType.STRENGTH,
        name: "Puente unilateral",
        value: 12,
        unit: MetricUnit.REPETITIONS,
        date: new Date("2026-03-08"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionThree.id,
        metricType: MetricType.STRENGTH,
        name: "Sentadilla goblet",
        value: 10,
        unit: MetricUnit.REPETITIONS,
        date: new Date("2026-03-19"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionTwo.id,
        metricType: MetricType.ADHERENCE,
        name: "Cumplimiento ejercicio domiciliario",
        value: 80,
        unit: MetricUnit.PERCENT,
        date: new Date("2026-03-08"),
      },
      {
        patientId: lucia.id,
        sessionId: luciaSessionThree.id,
        metricType: MetricType.ADHERENCE,
        name: "Cumplimiento ejercicio domiciliario",
        value: 90,
        unit: MetricUnit.PERCENT,
        date: new Date("2026-03-19"),
      },
    ],
  });

  const martin = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Martin",
      lastName: "Suarez",
      documentNumber: "28999111",
      dateOfBirth: new Date("1987-09-24"),
      sex: PatientSex.MALE,
      phone: "11-5555-2222",
      occupation: "Profesor de educación física",
      address: "Avellaneda",
      notes: "Seguimiento de rodilla derecha pos sobrecarga.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: martin.id,
      reasonForConsultation: "Dolor anterior de rodilla derecha al correr y subir escaleras.",
      onsetDate: new Date("2026-03-03"),
      injuryMechanism: "Sobrecarga por aumento de volumen de carrera",
      medicalDiagnosis: "Dolor patelofemoral",
      currentPain: 4,
      maxPain: 7,
      minPain: 1,
      painLocation: "Cara anterior de rodilla derecha",
      painType: "Punzante",
      aggravatingFactors: "Escaleras, sentadilla profunda, running",
      relievingFactors: "Reposo relativo",
      patientGoals: "Retomar carrera 10k sin dolor",
      limitedActivities: "Correr, bajar escaleras y sentadilla unilateral",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: martin.id,
      bodyRegion: BodyRegion.KNEE,
      postureObservation: "Valgo dinámico leve en apoyo unipodal",
      rangeOfMotion: "ROM completa con molestia en flexión profunda",
      strength: "Déficit de glúteo medio y cuádriceps",
      functionalTests: "Step down positivo por dolor anterior",
      specialTests: "Sin signos meniscales",
      movementQuality: "Control deficiente en desaceleración",
      notes: "Compatible con sobrecarga patelofemoral",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: martin.id,
      title: "Manejo de carga y control de rodilla",
      description: "Reducir dolor y mejorar tolerancia a carrera.",
      phase: RehabPlanPhase.STRENGTHENING,
      frequencyPerWeek: 2,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  await prisma.clinicalGoal.createMany({
    data: [
      {
        patientId: martin.id,
        description: "Correr 5 km sin dolor mayor a 2/10",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-06-10"),
      },
      {
        patientId: martin.id,
        description: "Mejorar control en step down unilateral",
        priority: ClinicalGoalPriority.MEDIUM,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-05-30"),
      },
    ],
  });

  const martinSessionOne = await prisma.session.create({
    data: {
      patientId: martin.id,
      date: new Date("2026-03-12"),
      painBefore: 4,
      painAfter: 3,
      subjectiveReport: "Molestia al subir escaleras, mejor al caminar.",
      clinicalNotes: "Se inicia trabajo de control de rodilla y cadera.",
      responseToTreatment: "Buena tolerancia general.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: boxSquat.id,
            sets: 4,
            reps: 8,
            load: "Peso corporal",
            rpe: 6,
          },
        ],
      },
    },
  });

  const martinSessionTwo = await prisma.session.create({
    data: {
      patientId: martin.id,
      date: new Date("2026-03-26"),
      painBefore: 3,
      painAfter: 2,
      subjectiveReport: "Tolera trotes cortos en llano.",
      clinicalNotes: "Se suma trabajo excéntrico y control frontal.",
      responseToTreatment: "Sin aumento de dolor al día siguiente.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: boxSquat.id,
            sets: 4,
            reps: 10,
            load: "Mancuernas 2 x 10 kg",
            rpe: 7,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: martin.id,
        sessionId: martinSessionOne.id,
        metricType: MetricType.PAIN,
        name: "Dolor al subir escaleras",
        value: 4,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-03-12"),
      },
      {
        patientId: martin.id,
        sessionId: martinSessionTwo.id,
        metricType: MetricType.PAIN,
        name: "Dolor al subir escaleras",
        value: 3,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-03-26"),
      },
      {
        patientId: martin.id,
        sessionId: martinSessionOne.id,
        metricType: MetricType.FUNCTION,
        name: "Step down controlado",
        value: 5,
        unit: MetricUnit.SCORE,
        date: new Date("2026-03-12"),
      },
      {
        patientId: martin.id,
        sessionId: martinSessionTwo.id,
        metricType: MetricType.FUNCTION,
        name: "Step down controlado",
        value: 7,
        unit: MetricUnit.SCORE,
        date: new Date("2026-03-26"),
      },
      {
        patientId: martin.id,
        sessionId: martinSessionTwo.id,
        metricType: MetricType.ADHERENCE,
        name: "Cumplimiento plan domiciliario",
        value: 75,
        unit: MetricUnit.PERCENT,
        date: new Date("2026-03-26"),
      },
    ],
  });

  const sofia = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Sofia",
      lastName: "Mendez",
      documentNumber: "33444555",
      dateOfBirth: new Date("1995-12-08"),
      sex: PatientSex.FEMALE,
      phone: "11-5555-3333",
      email: "sofia.mendez@example.com",
      occupation: "Diseñadora gráfica",
      address: "La Plata",
      notes: "Dolor cervical y cefaleas vinculadas a trabajo remoto.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: sofia.id,
      reasonForConsultation: "Cervicalgia con cefaleas tensionales frecuentes.",
      onsetDate: new Date("2026-01-18"),
      injuryMechanism: "Inicio progresivo por teletrabajo prolongado",
      medicalDiagnosis: "Cervicalgia mecánica",
      currentPain: 7,
      maxPain: 9,
      minPain: 3,
      painLocation: "Región cervical posterior y trapecios",
      painType: "Pesadez y tensión",
      aggravatingFactors: "Pantalla prolongada, estrés, manejo",
      relievingFactors: "Pausas activas y calor local",
      neurologicalSymptoms: "Sin irradiación a miembro superior",
      medications: "Paracetamol ocasional",
      relevantHistory: "Migrañas esporádicas",
      patientGoals: "Trabajar sin cefalea y retomar yoga",
      limitedActivities: "Computadora, manejo y sueño",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: sofia.id,
      bodyRegion: BodyRegion.CERVICAL,
      postureObservation: "Cabeza adelantada y hombros protraídos",
      rangeOfMotion: "Rotación cervical limitada bilateralmente",
      strength: "Resistencia baja de flexores profundos cervicales",
      functionalTests: "Fatiga temprana en test de flexión cráneo-cervical",
      palpationFindings: "Puntos gatillo en trapecio superior y elevador",
      movementQuality: "Compensación torácica durante rotación",
      notes: "Alta irritabilidad inicial",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: sofia.id,
      title: "Descenso de irritabilidad cervical",
      description: "Pausas activas, control postural y fortalecimiento progresivo.",
      phase: RehabPlanPhase.ACUTE,
      frequencyPerWeek: 1,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  await prisma.clinicalGoal.createMany({
    data: [
      {
        patientId: sofia.id,
        description: "Reducir cefaleas a menos de 1 episodio semanal",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-06-05"),
      },
      {
        patientId: sofia.id,
        description: "Tolerar 2 horas de trabajo con micro-pausas sin reagudizar",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-05-22"),
      },
    ],
  });

  const sofiaSessionOne = await prisma.session.create({
    data: {
      patientId: sofia.id,
      date: new Date("2026-02-02"),
      painBefore: 7,
      painAfter: 5,
      subjectiveReport: "Llega con cefalea de intensidad moderada tras jornada laboral.",
      clinicalNotes: "Se trabaja movilidad torácica y control cervical de baja carga.",
      responseToTreatment: "Mejora inmediata de sensación de rigidez.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: cervicalIsometric.id,
            sets: 3,
            duration: 30,
            rpe: 3,
          },
          {
            exerciseId: bandRow.id,
            sets: 3,
            reps: 12,
            rpe: 4,
          },
        ],
      },
    },
  });

  const sofiaSessionTwo = await prisma.session.create({
    data: {
      patientId: sofia.id,
      date: new Date("2026-02-16"),
      painBefore: 5,
      painAfter: 4,
      subjectiveReport: "Menos cefaleas, pero persiste tensión al final del día.",
      clinicalNotes: "Mayor tolerancia al trabajo de resistencia cervical.",
      responseToTreatment: "Buena adhesión a pausas activas.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: cervicalIsometric.id,
            sets: 4,
            duration: 30,
            rpe: 4,
          },
          {
            exerciseId: bandRow.id,
            sets: 3,
            reps: 15,
            rpe: 5,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: sofia.id,
        sessionId: sofiaSessionOne.id,
        metricType: MetricType.PAIN,
        name: "Dolor cervical",
        value: 7,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-02-02"),
      },
      {
        patientId: sofia.id,
        sessionId: sofiaSessionTwo.id,
        metricType: MetricType.PAIN,
        name: "Dolor cervical",
        value: 5,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-02-16"),
      },
      {
        patientId: sofia.id,
        sessionId: sofiaSessionOne.id,
        metricType: MetricType.ROM,
        name: "Rotación cervical",
        value: 52,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-02-02"),
      },
      {
        patientId: sofia.id,
        sessionId: sofiaSessionTwo.id,
        metricType: MetricType.ROM,
        name: "Rotación cervical",
        value: 61,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-02-16"),
      },
      {
        patientId: sofia.id,
        sessionId: sofiaSessionTwo.id,
        metricType: MetricType.ADHERENCE,
        name: "Pausas activas laborales",
        value: 70,
        unit: MetricUnit.PERCENT,
        date: new Date("2026-02-16"),
      },
    ],
  });

  const carlos = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Carlos",
      lastName: "Quiroga",
      documentNumber: "24555111",
      dateOfBirth: new Date("1978-06-01"),
      sex: PatientSex.MALE,
      phone: "11-5555-4444",
      occupation: "Electricista",
      address: "Lanús",
      notes: "Post esguince lateral de tobillo con retorno laboral parcial.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: carlos.id,
      reasonForConsultation: "Dolor e inestabilidad residual luego de esguince lateral de tobillo.",
      onsetDate: new Date("2026-03-28"),
      injuryMechanism: "Torcedura jugando fútbol 5",
      medicalDiagnosis: "Esguince lateral de tobillo grado II",
      currentPain: 5,
      maxPain: 8,
      minPain: 2,
      painLocation: "Maleolo lateral y seno del tarso",
      painType: "Molestia punzante con carga",
      aggravatingFactors: "Caminar rápido, escaleras, apoyo unipodal",
      relievingFactors: "Reposo y vendaje funcional",
      patientGoals: "Volver a jugar fútbol recreativo y subir escaleras sin inseguridad",
      limitedActivities: "Trabajo en altura, caminar distancias largas",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: carlos.id,
      bodyRegion: BodyRegion.ANKLE_FOOT,
      postureObservation: "Edema residual lateral leve",
      rangeOfMotion: "Dorsiflexión limitada comparada con lado contralateral",
      strength: "Déficit en flexores plantares y eversores",
      functionalTests: "Apoyo unipodal inestable",
      specialTests: "Cajón anterior con tope firme doloroso",
      palpationFindings: "Dolor a la palpación sobre ATFL",
      balance: "Oscilación aumentada en apoyo unipodal",
      gait: "Marcha antálgica leve al inicio",
      notes: "Apto para progresión con carga dosificada",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: carlos.id,
      title: "Retorno progresivo tras esguince de tobillo",
      description: "Recuperar movilidad, fuerza y balance para trabajo y deporte recreativo.",
      phase: RehabPlanPhase.SUBACUTE,
      frequencyPerWeek: 2,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  await prisma.clinicalGoal.createMany({
    data: [
      {
        patientId: carlos.id,
        description: "Recuperar dorsiflexión funcional para sentadilla y escalera",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-05-25"),
      },
      {
        patientId: carlos.id,
        description: "Mantener 30 segundos de apoyo unipodal estable",
        priority: ClinicalGoalPriority.MEDIUM,
        status: ClinicalGoalStatus.ACTIVE,
        targetDate: new Date("2026-05-30"),
      },
    ],
  });

  const carlosSessionOne = await prisma.session.create({
    data: {
      patientId: carlos.id,
      date: new Date("2026-04-05"),
      painBefore: 5,
      painAfter: 4,
      subjectiveReport: "Inseguridad al apoyar y bajar de la camioneta.",
      clinicalNotes: "Se inicia movilidad de tobillo y fortalecimiento básico.",
      responseToTreatment: "Tolera bien carga parcial.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: calfRaise.id,
            sets: 4,
            reps: 10,
            rpe: 5,
          },
        ],
      },
    },
  });

  const carlosSessionTwo = await prisma.session.create({
    data: {
      patientId: carlos.id,
      date: new Date("2026-04-18"),
      painBefore: 4,
      painAfter: 3,
      subjectiveReport: "Camina mejor, aún evita giros rápidos.",
      clinicalNotes: "Mejora en control de apoyo y tolerancia a escalera.",
      responseToTreatment: "Sin edema reactivo post sesión.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: calfRaise.id,
            sets: 4,
            reps: 12,
            load: "Mochila 5 kg",
            rpe: 6,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: carlos.id,
        sessionId: carlosSessionOne.id,
        metricType: MetricType.PAIN,
        name: "Dolor al apoyo",
        value: 5,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-04-05"),
      },
      {
        patientId: carlos.id,
        sessionId: carlosSessionTwo.id,
        metricType: MetricType.PAIN,
        name: "Dolor al apoyo",
        value: 4,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-04-18"),
      },
      {
        patientId: carlos.id,
        sessionId: carlosSessionOne.id,
        metricType: MetricType.BALANCE,
        name: "Apoyo unipodal",
        value: 12,
        unit: MetricUnit.SECONDS,
        date: new Date("2026-04-05"),
      },
      {
        patientId: carlos.id,
        sessionId: carlosSessionTwo.id,
        metricType: MetricType.BALANCE,
        name: "Apoyo unipodal",
        value: 24,
        unit: MetricUnit.SECONDS,
        date: new Date("2026-04-18"),
      },
      {
        patientId: carlos.id,
        sessionId: carlosSessionTwo.id,
        metricType: MetricType.STRENGTH,
        name: "Elevación de talones unipodal",
        value: 14,
        unit: MetricUnit.REPETITIONS,
        date: new Date("2026-04-18"),
      },
    ],
  });

  const ana = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Ana",
      lastName: "Roldan",
      documentNumber: "27666777",
      dateOfBirth: new Date("1984-11-19"),
      sex: PatientSex.FEMALE,
      phone: "11-5555-5555",
      email: "ana.roldan@example.com",
      occupation: "Docente",
      address: "Quilmes",
      notes: "Alta clínica reciente; paciente útil para ver caso completado.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: ana.id,
      reasonForConsultation: "Dolor de hombro al elevar el brazo y al dormir de lado.",
      onsetDate: new Date("2025-12-10"),
      injuryMechanism: "Inicio gradual asociado a tareas repetitivas",
      medicalDiagnosis: "Síndrome subacromial",
      currentPain: 2,
      maxPain: 7,
      minPain: 0,
      painLocation: "Cara anterolateral de hombro izquierdo",
      painType: "Molestia mecánica",
      aggravatingFactors: "Elevar brazo, tender ropa, dormir sobre hombro",
      relievingFactors: "Evitar gestos repetitivos y ejercicios pautados",
      patientGoals: "Dar clases y nadar sin dolor",
      limitedActivities: "Alcance por encima de cabeza y natación",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: ana.id,
      bodyRegion: BodyRegion.SHOULDER,
      postureObservation: "Leve antepulsión de hombros",
      rangeOfMotion: "Elevación activa con molestia leve en arco medio",
      strength: "Mejora marcada de manguito rotador respecto a inicio",
      functionalTests: "Apley superior casi simétrico",
      specialTests: "Hawkins negativo al alta",
      movementQuality: "Buen ritmo escapulohumeral",
      notes: "Caso prácticamente resuelto",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: ana.id,
      title: "Retorno pleno de hombro izquierdo",
      description: "Última fase de fortalecimiento y mantenimiento.",
      phase: RehabPlanPhase.MAINTENANCE,
      frequencyPerWeek: 1,
      status: RehabPlanStatus.COMPLETED,
    },
  });

  await prisma.clinicalGoal.createMany({
    data: [
      {
        patientId: ana.id,
        description: "Elevar brazo completo sin dolor",
        priority: ClinicalGoalPriority.HIGH,
        status: ClinicalGoalStatus.ACHIEVED,
        targetDate: new Date("2026-03-15"),
      },
      {
        patientId: ana.id,
        description: "Retomar natación recreativa",
        priority: ClinicalGoalPriority.MEDIUM,
        status: ClinicalGoalStatus.ACHIEVED,
        targetDate: new Date("2026-04-01"),
      },
    ],
  });

  const anaSessionOne = await prisma.session.create({
    data: {
      patientId: ana.id,
      date: new Date("2026-01-20"),
      painBefore: 5,
      painAfter: 4,
      subjectiveReport: "Dolor al colgar ropa y al dormir.",
      clinicalNotes: "Inicio de control escapular y manguito.",
      responseToTreatment: "Mejora parcial inmediata.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: bandRow.id,
            sets: 3,
            reps: 12,
            rpe: 4,
          },
        ],
      },
    },
  });

  const anaSessionTwo = await prisma.session.create({
    data: {
      patientId: ana.id,
      date: new Date("2026-02-17"),
      painBefore: 3,
      painAfter: 2,
      subjectiveReport: "Mejoró el sueño y tolera mejor el alcance.",
      clinicalNotes: "Aumenta trabajo de fuerza y control overhead.",
      responseToTreatment: "Sin irritación posterior.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: bandRow.id,
            sets: 4,
            reps: 15,
            rpe: 5,
          },
        ],
      },
    },
  });

  const anaSessionThree = await prisma.session.create({
    data: {
      patientId: ana.id,
      date: new Date("2026-03-24"),
      painBefore: 1,
      painAfter: 0,
      subjectiveReport: "Sin dolor en actividades diarias. Retomó natación suave.",
      clinicalNotes: "Alta clínica con plan de mantenimiento.",
      responseToTreatment: "Objetivos cumplidos.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: bandRow.id,
            sets: 3,
            reps: 15,
            rpe: 4,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: ana.id,
        sessionId: anaSessionOne.id,
        metricType: MetricType.PAIN,
        name: "Dolor en elevación",
        value: 5,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-01-20"),
      },
      {
        patientId: ana.id,
        sessionId: anaSessionTwo.id,
        metricType: MetricType.PAIN,
        name: "Dolor en elevación",
        value: 3,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-02-17"),
      },
      {
        patientId: ana.id,
        sessionId: anaSessionThree.id,
        metricType: MetricType.PAIN,
        name: "Dolor en elevación",
        value: 1,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-03-24"),
      },
      {
        patientId: ana.id,
        sessionId: anaSessionOne.id,
        metricType: MetricType.ROM,
        name: "Elevación activa de hombro",
        value: 125,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-01-20"),
      },
      {
        patientId: ana.id,
        sessionId: anaSessionThree.id,
        metricType: MetricType.ROM,
        name: "Elevación activa de hombro",
        value: 170,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-03-24"),
      },
      {
        patientId: ana.id,
        sessionId: anaSessionThree.id,
        metricType: MetricType.FUNCTION,
        name: "QuickDASH simplificado",
        value: 8,
        unit: MetricUnit.SCORE,
        date: new Date("2026-03-24"),
      },
    ],
  });

  const diego = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Diego",
      lastName: "Navarro",
      documentNumber: "30555444",
      dateOfBirth: new Date("1989-07-07"),
      sex: PatientSex.MALE,
      phone: "11-5555-6666",
      email: "diego.navarro@example.com",
      occupation: "Chofer",
      address: "Morón",
      notes: "Dolor lumbar postural con mejora parcial tras sesiones.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: diego.id,
      reasonForConsultation: "Dolor lumbar con postura encorvada por trabajo de largo recorrido.",
      onsetDate: new Date("2026-04-12"),
      medicalDiagnosis: "Lumbalgia inespecífica",
      currentPain: 4,
      maxPain: 7,
      minPain: 1,
      painLocation: "Región lumbar baja",
      painType: "Molestia sorda",
      aggravatingFactors: "Conducción prolongada, flexión de tronco",
      relievingFactors: "Descanso y cambios de posición",
      relevantHistory: "Nivel de actividad variable",
      patientGoals: "Reducir dolor para viajar sin molestias.",
      limitedActivities: "Conducción larga y levantar cargas pesadas",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: diego.id,
      bodyRegion: BodyRegion.LUMBAR,
      postureObservation: "Leve hiperlordosis y rotación pélvica derecha.",
      rangeOfMotion: "Flexión limitada con molestia leve.",
      strength: "Aparente debilidad en extensores lumbares.",
      functionalTests: "Dolor al sit-to-stand rápido.",
      movementQuality: "Compensación de cadera derecha.",
      notes: "Paciente responde bien a trabajo de estabilidad.",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: diego.id,
      title: "Control lumbar para conducción",
      description: "Fortalecimiento de core y cambio postural progresivo.",
      phase: RehabPlanPhase.SUBACUTE,
      frequencyPerWeek: 2,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  await prisma.clinicalGoal.create({
    data: {
      patientId: diego.id,
      description: "Tolerar 3 horas de conducción sin dolor mayor a 3/10.",
      priority: ClinicalGoalPriority.HIGH,
      status: ClinicalGoalStatus.ACTIVE,
      targetDate: new Date("2026-06-08"),
    },
  });

  const diegoSession = await prisma.session.create({
    data: {
      patientId: diego.id,
      date: new Date("2026-05-02"),
      painBefore: 4,
      painAfter: 3,
      subjectiveReport: "Mejoría leve con ejercicios domiciliarios.",
      clinicalNotes: "Se mantiene trabajo de estabilización lumbo-pélvica.",
      responseToTreatment: "Tolerancia adecuada.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: gluteBridge.id,
            sets: 3,
            reps: 12,
            rpe: 4,
          },
          {
            exerciseId: birdDog.id,
            sets: 3,
            reps: 10,
            rpe: 4,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: diego.id,
        sessionId: diegoSession.id,
        metricType: MetricType.PAIN,
        name: "Dolor lumbar inicial",
        value: 4,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-05-02"),
      },
      {
        patientId: diego.id,
        sessionId: diegoSession.id,
        metricType: MetricType.ROM,
        name: "Flexión lumbar",
        value: 62,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-05-02"),
      },
    ],
  });

  const mariana = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Mariana",
      lastName: "Costa",
      documentNumber: "29222333",
      dateOfBirth: new Date("1990-03-14"),
      sex: PatientSex.FEMALE,
      phone: "11-5555-7777",
      email: "mariana.costa@example.com",
      occupation: "Auxiliar administrativo",
      address: "San Isidro",
      notes: "Dolor de hombro derecho postergado, con buena adherencia.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: mariana.id,
      reasonForConsultation: "Molestia al levantar objetos y al dormir del lado derecho.",
      onsetDate: new Date("2026-04-20"),
      medicalDiagnosis: "Tendinopatía del manguito rotador",
      currentPain: 5,
      maxPain: 8,
      minPain: 2,
      painLocation: "Hombro derecho",
      painType: "Molestia punzante",
      aggravatingFactors: "Elevación, rotación externa, dormir de lado.",
      relievingFactors: "Reposo, calor superficial.",
      patientGoals: "Alzar el brazo sin molestias para trabajo de oficina.",
      limitedActivities: "Cargar archivos y actividades de alcance.",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: mariana.id,
      bodyRegion: BodyRegion.SHOULDER,
      postureObservation: "Cefálico adelantado y hombros protraídos.",
      rangeOfMotion: "Abducción limitada a 120° con molestia.",
      strength: "Moderada debilidad en rotadores externos.",
      functionalTests: "Dolor en Apley superior.",
      notes: "Alta irritabilidad local.",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: mariana.id,
      title: "Rehabilitación de hombro derecho",
      description: "Movilidad controlada y fortalecimiento progresivo.",
      phase: RehabPlanPhase.ACUTE,
      frequencyPerWeek: 1,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  const marianaSession = await prisma.session.create({
    data: {
      patientId: mariana.id,
      date: new Date("2026-05-10"),
      painBefore: 5,
      painAfter: 4,
      subjectiveReport: "Menor molestia al iniciar el movimiento.",
      clinicalNotes: "Se incorpora isométricos de hombro.",
      responseToTreatment: "Tolerancia aceptable.",
      clinicalDecision: ClinicalDecision.MAINTAIN,
      sessionExercises: {
        create: [
          {
            exerciseId: cervicalIsometric.id,
            sets: 3,
            duration: 30,
            rpe: 3,
          },
          {
            exerciseId: bandRow.id,
            sets: 3,
            reps: 12,
            rpe: 4,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: mariana.id,
        sessionId: marianaSession.id,
        metricType: MetricType.PAIN,
        name: "Dolor en elevación de hombro",
        value: 5,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-05-10"),
      },
    ],
  });

  const lucas = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Lucas",
      lastName: "Mora",
      documentNumber: "30777444",
      dateOfBirth: new Date("1982-10-05"),
      sex: PatientSex.MALE,
      phone: "11-5555-8888",
      email: "lucas.mora@example.com",
      occupation: "Carpintero",
      address: "Tigre",
      notes: "Lesión de cadera con repercusión funcional en trabajo manual.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: lucas.id,
      reasonForConsultation: "Dolor en zona glútea al levantarse y cargar materiales.",
      onsetDate: new Date("2026-03-18"),
      medicalDiagnosis: "Síndrome de dolor miofascial glúteo",
      currentPain: 6,
      maxPain: 8,
      minPain: 3,
      painLocation: "Región glútea izquierda",
      painType: "Molestia profunda",
      aggravatingFactors: "Carga, sedestación prolongada.",
      relievingFactors: "Descanso y fricción leve.",
      patientGoals: "Levantar materiales sin dolor.",
      limitedActivities: "Carga de herramientas y posturas de rodillas.",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: lucas.id,
      bodyRegion: BodyRegion.LUMBAR,
      postureObservation: "Retroversión pélvica leve en apoyo.",
      rangeOfMotion: "Dolor con flexión de cadera izquierda.",
      strength: "Disminución de fuerza glútea.",
      functionalTests: "Dolor en puente unilateral.",
      notes: "Elevada irritabilidad con carga.",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: lucas.id,
      title: "Fortalecimiento glúteo y control lumbo-pélvico",
      description: "Aumentar tolerancia a carga manual.",
      phase: RehabPlanPhase.STRENGTHENING,
      frequencyPerWeek: 2,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  const lucasSession = await prisma.session.create({
    data: {
      patientId: lucas.id,
      date: new Date("2026-05-18"),
      painBefore: 6,
      painAfter: 4,
      subjectiveReport: "Menos dolor al sentarse, aún molesta al levantar.",
      clinicalNotes: "Progresión de puente y control de cadera.",
      responseToTreatment: "Mejora leve.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: gluteBridge.id,
            sets: 3,
            reps: 12,
            rpe: 5,
          },
          {
            exerciseId: boxSquat.id,
            sets: 3,
            reps: 8,
            load: "Peso corporal",
            rpe: 6,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: lucas.id,
        sessionId: lucasSession.id,
        metricType: MetricType.STRENGTH,
        name: "Puente de glúteos",
        value: 10,
        unit: MetricUnit.REPETITIONS,
        date: new Date("2026-05-18"),
      },
      {
        patientId: lucas.id,
        sessionId: lucasSession.id,
        metricType: MetricType.PAIN,
        name: "Dolor en glúteo",
        value: 4,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-05-18"),
      },
    ],
  });

  const valentina = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Valentina",
      lastName: "González",
      documentNumber: "30333444",
      dateOfBirth: new Date("1997-01-22"),
      sex: PatientSex.FEMALE,
      phone: "11-5555-9999",
      email: "valentina.gonzalez@example.com",
      occupation: "Estudiante",
      address: "Vicente López",
      notes: "Dolor en rodilla e inestabilidad en apoyo unipodal.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: valentina.id,
      reasonForConsultation: "Sensación de inestabilidad en rodilla derecha al bailar.",
      onsetDate: new Date("2026-04-05"),
      medicalDiagnosis: "Inestabilidad funcional de rodilla",
      currentPain: 3,
      maxPain: 6,
      minPain: 0,
      painLocation: "Cara anterior de rodilla derecha",
      painType: "Molestia punzante ocasional",
      aggravatingFactors: "Giros, saltos, apoyos rápidos.",
      relievingFactors: "Descanso y corrección de técnica.",
      patientGoals: "Bailar sin inseguridad y mejorar estabilidad.",
      limitedActivities: "Danza, trote y escaleras rápidas.",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: valentina.id,
      bodyRegion: BodyRegion.KNEE,
      postureObservation: "Ligera valgo dinámico en apoyo unipodal derecho.",
      rangeOfMotion: "ROM completa sin dolor en apoyo estático.",
      strength: "Leve déficit de cuádriceps medial.",
      balance: "Inestabilidad en apoyo unipodal derecho.",
      gait: "Marcha sin compensaciones visibles.",
      notes: "Necesita trabajo de propiocepción.",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: valentina.id,
      title: "Mejorar estabilidad y control de rodilla",
      description: "Ejercicios de equilibrio y fortalecimiento de cuádriceps.",
      phase: RehabPlanPhase.SUBACUTE,
      frequencyPerWeek: 2,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  const valentinaSession = await prisma.session.create({
    data: {
      patientId: valentina.id,
      date: new Date("2026-05-12"),
      painBefore: 3,
      painAfter: 2,
      subjectiveReport: "Menos inseguridad, pero sigue dudando en apoyo.",
      clinicalNotes: "Se introducen ejercicios unilaterales y de balance.",
      responseToTreatment: "Buena respuesta a control activo.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: calfRaise.id,
            sets: 4,
            reps: 12,
            rpe: 5,
          },
          {
            exerciseId: boxSquat.id,
            sets: 3,
            reps: 8,
            load: "Peso corporal",
            rpe: 5,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: valentina.id,
        sessionId: valentinaSession.id,
        metricType: MetricType.BALANCE,
        name: "Apoyo unipodal derecho",
        value: 18,
        unit: MetricUnit.SECONDS,
        date: new Date("2026-05-12"),
      },
      {
        patientId: valentina.id,
        sessionId: valentinaSession.id,
        metricType: MetricType.PAIN,
        name: "Molestia en rodilla",
        value: 2,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-05-12"),
      },
    ],
  });

  const alejandro = await prisma.patient.create({
    data: {
      userId: user.id,
      firstName: "Alejandro",
      lastName: "Torres",
      documentNumber: "31000111",
      dateOfBirth: new Date("1993-02-27"),
      sex: PatientSex.MALE,
      phone: "11-5555-0000",
      email: "alejandro.torres@example.com",
      occupation: "Programador",
      address: "Caballito",
      notes: "Cervicalgia con posturas prolongadas frente a la computadora.",
    },
  });

  await prisma.initialAssessment.create({
    data: {
      patientId: alejandro.id,
      reasonForConsultation: "Tensión cervical y hombros rígidos tras jornada de trabajo.",
      onsetDate: new Date("2026-05-01"),
      medicalDiagnosis: "Cervicalgia postural",
      currentPain: 5,
      maxPain: 8,
      minPain: 2,
      painLocation: "Región cervical y trapecios.",
      painType: "Tensión y pesadez",
      aggravatingFactors: "Computadora, reuniones largas.",
      relievingFactors: "Pausas activas, ejercicios cervicales.",
      patientGoals: "Trabajar sin rigidez y mejorar postura.",
      limitedActivities: "Estar sentado más de 1 hora sin moverse.",
    },
  });

  await prisma.objectiveAssessment.create({
    data: {
      patientId: alejandro.id,
      bodyRegion: BodyRegion.CERVICAL,
      postureObservation: "Cabeza adelantada y hombros elevados.",
      rangeOfMotion: "Rotación derecha con molestia leve.",
      strength: "Leve fatiga de flexores cervicales.",
      functionalTests: "Dolor en flexión cráneo-cervical.",
      notes: "Ideal para trabajo de reeducación postural.",
    },
  });

  await prisma.rehabPlan.create({
    data: {
      patientId: alejandro.id,
      title: "Control postural cervical",
      description: "Movilidad cervical y fuerza de flexores profundos.",
      phase: RehabPlanPhase.ACUTE,
      frequencyPerWeek: 1,
      status: RehabPlanStatus.ACTIVE,
    },
  });

  const alejandroSession = await prisma.session.create({
    data: {
      patientId: alejandro.id,
      date: new Date("2026-05-22"),
      painBefore: 5,
      painAfter: 3,
      subjectiveReport: "Mejora inmediata tras ejercicios de retracción cervical.",
      clinicalNotes: "Se incorpora pausa activa y trabajo isométrico.",
      responseToTreatment: "Buena tolerancia.",
      clinicalDecision: ClinicalDecision.PROGRESS,
      sessionExercises: {
        create: [
          {
            exerciseId: cervicalIsometric.id,
            sets: 3,
            duration: 30,
            rpe: 3,
          },
          {
            exerciseId: bandRow.id,
            sets: 3,
            reps: 12,
            rpe: 4,
          },
        ],
      },
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        patientId: alejandro.id,
        sessionId: alejandroSession.id,
        metricType: MetricType.PAIN,
        name: "Dolor cervical",
        value: 5,
        unit: MetricUnit.NRS_0_10,
        date: new Date("2026-05-22"),
      },
      {
        patientId: alejandro.id,
        sessionId: alejandroSession.id,
        metricType: MetricType.ROM,
        name: "Rotación cervical derecha",
        value: 58,
        unit: MetricUnit.DEGREES,
        date: new Date("2026-05-22"),
      },
    ],
  });

  console.log("Seed completado.");
  console.log(`Usuario demo: ${email}`);
  console.log(`Password demo: ${password}`);
  console.log("Pacientes sintéticos creados: 10");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
