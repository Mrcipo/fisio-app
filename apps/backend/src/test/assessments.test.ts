import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../app";
import { prismaMock } from "./prisma-mock";

jest.mock("../lib/prisma", () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require("./prisma-mock").prismaMock,
}));

const app = createApp();

function authHeader(userId = "user-1") {
  return {
    Authorization: `Bearer ${jwt.sign(
      { sub: userId, email: `${userId}@mail.com`, role: "CLINICIAN" },
      process.env.JWT_SECRET as string,
    )}`,
  };
}

function mockAuthenticatedUser(userId = "user-1") {
  prismaMock.user.findUnique.mockResolvedValue({
    id: userId,
    email: `${userId}@mail.com`,
    firstName: "Test",
    lastName: "User",
    role: "CLINICIAN",
    isActive: true,
  });
}

const basePatient = {
  id: "patient-1",
  userId: "user-1",
  firstName: "Ana",
  lastName: "Perez",
  documentNumber: null,
  dateOfBirth: null,
  sex: "NOT_SPECIFIED",
  phone: null,
  email: null,
  occupation: null,
  address: null,
  notes: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseInitialAssessment = {
  id: "ia-1",
  patientId: "patient-1",
  reasonForConsultation: "Dolor lumbar",
  onsetDate: null,
  injuryMechanism: null,
  medicalDiagnosis: null,
  currentPain: 7,
  maxPain: null,
  minPain: null,
  painLocation: null,
  painType: null,
  irradiation: null,
  aggravatingFactors: null,
  relievingFactors: null,
  neurologicalSymptoms: null,
  previousSurgeries: null,
  medications: null,
  relevantHistory: null,
  redFlags: null,
  patientGoals: null,
  limitedActivities: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseObjectiveAssessment = {
  id: "oa-1",
  patientId: "patient-1",
  bodyRegion: "LUMBAR",
  postureObservation: null,
  rangeOfMotion: null,
  strength: null,
  functionalTests: null,
  specialTests: null,
  palpationFindings: null,
  movementQuality: null,
  balance: null,
  gait: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Assessments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("InitialAssessment", () => {
    describe("POST /patients/:patientId/initial-assessment", () => {
      it("creates an initial assessment for a patient", async () => {
        mockAuthenticatedUser();
        prismaMock.patient.findFirst.mockResolvedValue(basePatient);
        prismaMock.initialAssessment.findUnique.mockResolvedValue(null);
        prismaMock.initialAssessment.create.mockResolvedValue(baseInitialAssessment);

        const response = await request(app)
          .post("/patients/patient-1/initial-assessment")
          .set(authHeader())
          .send({ reasonForConsultation: "Dolor lumbar", currentPain: 7 });

        expect(response.status).toBe(201);
        expect(response.body.initialAssessment.reasonForConsultation).toBe("Dolor lumbar");
        expect(response.body.initialAssessment.currentPain).toBe(7);
      });

      it("returns 401 without token", async () => {
        const response = await request(app)
          .post("/patients/patient-1/initial-assessment")
          .send({ reasonForConsultation: "Dolor lumbar" });

        expect(response.status).toBe(401);
      });

      it("returns 404 for another user's patient", async () => {
        mockAuthenticatedUser("user-1");
        prismaMock.patient.findFirst.mockResolvedValue(null);

        const response = await request(app)
          .post("/patients/other-patient/initial-assessment")
          .set(authHeader("user-1"))
          .send({ reasonForConsultation: "Dolor lumbar" });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toBe("Patient not found");
      });
    });

    describe("GET /patients/:patientId/initial-assessment", () => {
      it("returns the initial assessment for a patient", async () => {
        mockAuthenticatedUser();
        prismaMock.patient.findFirst.mockResolvedValue(basePatient);
        prismaMock.initialAssessment.findUnique.mockResolvedValue(baseInitialAssessment);

        const response = await request(app)
          .get("/patients/patient-1/initial-assessment")
          .set(authHeader());

        expect(response.status).toBe(200);
        expect(response.body.initialAssessment.id).toBe("ia-1");
        expect(response.body.initialAssessment.reasonForConsultation).toBe("Dolor lumbar");
      });

      it("returns 401 without token", async () => {
        const response = await request(app).get(
          "/patients/patient-1/initial-assessment",
        );

        expect(response.status).toBe(401);
      });

      it("returns 404 for another user's patient", async () => {
        mockAuthenticatedUser("user-1");
        prismaMock.patient.findFirst.mockResolvedValue(null);

        const response = await request(app)
          .get("/patients/other-patient/initial-assessment")
          .set(authHeader("user-1"));

        expect(response.status).toBe(404);
        expect(response.body.error.message).toBe("Patient not found");
      });
    });
  });

  describe("ObjectiveAssessment", () => {
    describe("POST /patients/:patientId/objective-assessments", () => {
      it("creates an objective assessment for a patient", async () => {
        mockAuthenticatedUser();
        prismaMock.patient.findFirst.mockResolvedValue(basePatient);
        prismaMock.objectiveAssessment.create.mockResolvedValue(baseObjectiveAssessment);

        const response = await request(app)
          .post("/patients/patient-1/objective-assessments")
          .set(authHeader())
          .send({ bodyRegion: "LUMBAR" });

        expect(response.status).toBe(201);
        expect(response.body.objectiveAssessment.bodyRegion).toBe("LUMBAR");
        expect(response.body.objectiveAssessment.patientId).toBe("patient-1");
      });

      it("returns 401 without token", async () => {
        const response = await request(app)
          .post("/patients/patient-1/objective-assessments")
          .send({ bodyRegion: "LUMBAR" });

        expect(response.status).toBe(401);
      });

      it("returns 404 for another user's patient", async () => {
        mockAuthenticatedUser("user-1");
        prismaMock.patient.findFirst.mockResolvedValue(null);

        const response = await request(app)
          .post("/patients/other-patient/objective-assessments")
          .set(authHeader("user-1"))
          .send({ bodyRegion: "LUMBAR" });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toBe("Patient not found");
      });
    });

    describe("GET /patients/:patientId/objective-assessments", () => {
      it("lists objective assessments for a patient", async () => {
        mockAuthenticatedUser();
        prismaMock.patient.findFirst.mockResolvedValue(basePatient);
        prismaMock.objectiveAssessment.findMany.mockResolvedValue([
          baseObjectiveAssessment,
        ]);

        const response = await request(app)
          .get("/patients/patient-1/objective-assessments")
          .set(authHeader());

        expect(response.status).toBe(200);
        expect(response.body.objectiveAssessments).toHaveLength(1);
        expect(response.body.objectiveAssessments[0].bodyRegion).toBe("LUMBAR");
      });

      it("returns 401 without token", async () => {
        const response = await request(app).get(
          "/patients/patient-1/objective-assessments",
        );

        expect(response.status).toBe(401);
      });

      it("returns 404 for another user's patient", async () => {
        mockAuthenticatedUser("user-1");
        prismaMock.patient.findFirst.mockResolvedValue(null);

        const response = await request(app)
          .get("/patients/other-patient/objective-assessments")
          .set(authHeader("user-1"));

        expect(response.status).toBe(404);
        expect(response.body.error.message).toBe("Patient not found");
      });
    });
  });
});
