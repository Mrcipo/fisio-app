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
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseMetric = {
  id: "metric-1",
  patientId: "patient-1",
  sessionId: null,
  metricType: "PAIN",
  name: "Dolor en reposo",
  value: 5,
  unit: "NRS_0_10",
  date: new Date("2026-01-10"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Progress Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /patients/:patientId/progress-metrics", () => {
    it("creates a progress metric for a patient", async () => {
      mockAuthenticatedUser();
      prismaMock.patient.findFirst.mockResolvedValue(basePatient);
      prismaMock.progressMetric.create.mockResolvedValue(baseMetric);

      const response = await request(app)
        .post("/patients/patient-1/progress-metrics")
        .set(authHeader())
        .send({
          metricType: "PAIN",
          name: "Dolor en reposo",
          value: 5,
          unit: "NRS_0_10",
          date: "2026-01-10",
        });

      expect(response.status).toBe(201);
      expect(response.body.progressMetric.metricType).toBe("PAIN");
      expect(response.body.progressMetric.name).toBe("Dolor en reposo");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .post("/patients/patient-1/progress-metrics")
        .send({ metricType: "PAIN", name: "Dolor", value: 5, unit: "NRS_0_10", date: "2026-01-10" });

      expect(response.status).toBe(401);
    });

    it("returns 404 for another user's patient", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.patient.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/patients/other-patient/progress-metrics")
        .set(authHeader("user-1"))
        .send({ metricType: "PAIN", name: "Dolor", value: 5, unit: "NRS_0_10", date: "2026-01-10" });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Patient not found");
    });
  });

  describe("GET /patients/:patientId/progress-metrics", () => {
    it("lists progress metrics for a patient", async () => {
      mockAuthenticatedUser();
      prismaMock.patient.findFirst.mockResolvedValue(basePatient);
      prismaMock.progressMetric.findMany.mockResolvedValue([baseMetric]);

      const response = await request(app)
        .get("/patients/patient-1/progress-metrics")
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.progressMetrics).toHaveLength(1);
      expect(response.body.progressMetrics[0].metricType).toBe("PAIN");
    });

    it("returns 401 without token", async () => {
      const response = await request(app).get("/patients/patient-1/progress-metrics");

      expect(response.status).toBe(401);
    });

    it("returns 404 for another user's patient", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.patient.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/patients/other-patient/progress-metrics")
        .set(authHeader("user-1"));

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Patient not found");
    });
  });
});
