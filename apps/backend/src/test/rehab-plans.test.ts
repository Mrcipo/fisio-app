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

const baseRehabPlan = {
  id: "plan-1",
  patientId: "patient-1",
  title: "Plan de rehabilitación lumbar",
  description: null,
  phase: "ACUTE",
  status: "ACTIVE",
  frequencyPerWeek: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const rehabPlanWithPatient = {
  ...baseRehabPlan,
  patient: { userId: "user-1" },
};

describe("Rehab Plans", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /patients/:patientId/rehab-plans", () => {
    it("creates a rehab plan for a patient", async () => {
      mockAuthenticatedUser();
      prismaMock.patient.findFirst.mockResolvedValue(basePatient);
      prismaMock.rehabPlan.create.mockResolvedValue(baseRehabPlan);

      const response = await request(app)
        .post("/patients/patient-1/rehab-plans")
        .set(authHeader())
        .send({ title: "Plan de rehabilitación lumbar", phase: "ACUTE" });

      expect(response.status).toBe(201);
      expect(response.body.rehabPlan.title).toBe("Plan de rehabilitación lumbar");
      expect(response.body.rehabPlan.phase).toBe("ACUTE");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .post("/patients/patient-1/rehab-plans")
        .send({ title: "Plan", phase: "ACUTE" });

      expect(response.status).toBe(401);
    });

    it("returns 404 for another user's patient", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.patient.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/patients/other-patient/rehab-plans")
        .set(authHeader("user-1"))
        .send({ title: "Plan", phase: "ACUTE" });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Patient not found");
    });
  });

  describe("GET /patients/:patientId/rehab-plans", () => {
    it("lists rehab plans for a patient", async () => {
      mockAuthenticatedUser();
      prismaMock.patient.findFirst.mockResolvedValue(basePatient);
      prismaMock.rehabPlan.findMany.mockResolvedValue([baseRehabPlan]);

      const response = await request(app)
        .get("/patients/patient-1/rehab-plans")
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.rehabPlans).toHaveLength(1);
      expect(response.body.rehabPlans[0].title).toBe("Plan de rehabilitación lumbar");
    });

    it("returns 401 without token", async () => {
      const response = await request(app).get("/patients/patient-1/rehab-plans");

      expect(response.status).toBe(401);
    });

    it("returns 404 for another user's patient", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.patient.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/patients/other-patient/rehab-plans")
        .set(authHeader("user-1"));

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Patient not found");
    });
  });

  describe("PATCH /rehab-plans/:id", () => {
    it("updates a rehab plan", async () => {
      mockAuthenticatedUser();
      prismaMock.rehabPlan.findUnique.mockResolvedValue(rehabPlanWithPatient);
      prismaMock.rehabPlan.update.mockResolvedValue({
        ...baseRehabPlan,
        status: "COMPLETED",
      });

      const response = await request(app)
        .patch("/rehab-plans/plan-1")
        .set(authHeader())
        .send({ status: "COMPLETED" });

      expect(response.status).toBe(200);
      expect(response.body.rehabPlan.status).toBe("COMPLETED");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .patch("/rehab-plans/plan-1")
        .send({ status: "COMPLETED" });

      expect(response.status).toBe(401);
    });

    it("returns 403 for another user's rehab plan", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.rehabPlan.findUnique.mockResolvedValue({
        ...baseRehabPlan,
        patient: { userId: "user-2" },
      });

      const response = await request(app)
        .patch("/rehab-plans/plan-1")
        .set(authHeader("user-1"))
        .send({ status: "COMPLETED" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /rehab-plans/:id", () => {
    it("deletes a rehab plan", async () => {
      mockAuthenticatedUser();
      prismaMock.rehabPlan.findUnique.mockResolvedValue(rehabPlanWithPatient);
      prismaMock.rehabPlan.delete.mockResolvedValue(baseRehabPlan);

      const response = await request(app)
        .delete("/rehab-plans/plan-1")
        .set(authHeader());

      expect(response.status).toBe(204);
    });

    it("returns 401 without token", async () => {
      const response = await request(app).delete("/rehab-plans/plan-1");

      expect(response.status).toBe(401);
    });

    it("returns 403 for another user's rehab plan", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.rehabPlan.findUnique.mockResolvedValue({
        ...baseRehabPlan,
        patient: { userId: "user-2" },
      });

      const response = await request(app)
        .delete("/rehab-plans/plan-1")
        .set(authHeader("user-1"));

      expect(response.status).toBe(403);
    });
  });
});
