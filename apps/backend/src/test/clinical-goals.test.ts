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

const baseGoal = {
  id: "goal-1",
  patientId: "patient-1",
  description: "Reducir dolor lumbar a 3/10",
  targetDate: null,
  status: "IN_PROGRESS",
  priority: "HIGH",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const goalWithPatient = {
  ...baseGoal,
  patient: { userId: "user-1" },
};

describe("Clinical Goals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /patients/:patientId/goals", () => {
    it("creates a clinical goal for a patient", async () => {
      mockAuthenticatedUser();
      prismaMock.patient.findFirst.mockResolvedValue(basePatient);
      prismaMock.clinicalGoal.create.mockResolvedValue(baseGoal);

      const response = await request(app)
        .post("/patients/patient-1/goals")
        .set(authHeader())
        .send({ description: "Reducir dolor lumbar a 3/10", priority: "HIGH" });

      expect(response.status).toBe(201);
      expect(response.body.goal.description).toBe("Reducir dolor lumbar a 3/10");
      expect(response.body.goal.priority).toBe("HIGH");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .post("/patients/patient-1/goals")
        .send({ description: "Reducir dolor" });

      expect(response.status).toBe(401);
    });

    it("returns 404 for another user's patient", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.patient.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/patients/other-patient/goals")
        .set(authHeader("user-1"))
        .send({ description: "Reducir dolor" });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Patient not found");
    });
  });

  describe("GET /patients/:patientId/goals", () => {
    it("lists clinical goals for a patient", async () => {
      mockAuthenticatedUser();
      prismaMock.patient.findFirst.mockResolvedValue(basePatient);
      prismaMock.clinicalGoal.findMany.mockResolvedValue([baseGoal]);

      const response = await request(app)
        .get("/patients/patient-1/goals")
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.goals).toHaveLength(1);
      expect(response.body.goals[0].description).toBe("Reducir dolor lumbar a 3/10");
    });

    it("returns 401 without token", async () => {
      const response = await request(app).get("/patients/patient-1/goals");

      expect(response.status).toBe(401);
    });

    it("returns 404 for another user's patient", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.patient.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/patients/other-patient/goals")
        .set(authHeader("user-1"));

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Patient not found");
    });
  });

  describe("PATCH /goals/:id", () => {
    it("updates a clinical goal", async () => {
      mockAuthenticatedUser();
      prismaMock.clinicalGoal.findUnique.mockResolvedValue(goalWithPatient);
      prismaMock.clinicalGoal.update.mockResolvedValue({
        ...baseGoal,
        status: "ACHIEVED",
      });

      const response = await request(app)
        .patch("/goals/goal-1")
        .set(authHeader())
        .send({ status: "ACHIEVED" });

      expect(response.status).toBe(200);
      expect(response.body.goal.status).toBe("ACHIEVED");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .patch("/goals/goal-1")
        .send({ status: "ACHIEVED" });

      expect(response.status).toBe(401);
    });

    it("returns 403 for another user's goal", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.clinicalGoal.findUnique.mockResolvedValue({
        ...baseGoal,
        patient: { userId: "user-2" },
      });

      const response = await request(app)
        .patch("/goals/goal-1")
        .set(authHeader("user-1"))
        .send({ status: "ACHIEVED" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /goals/:id", () => {
    it("deletes a clinical goal", async () => {
      mockAuthenticatedUser();
      prismaMock.clinicalGoal.findUnique.mockResolvedValue(goalWithPatient);
      prismaMock.clinicalGoal.delete.mockResolvedValue(baseGoal);

      const response = await request(app)
        .delete("/goals/goal-1")
        .set(authHeader());

      expect(response.status).toBe(204);
    });

    it("returns 401 without token", async () => {
      const response = await request(app).delete("/goals/goal-1");

      expect(response.status).toBe(401);
    });

    it("returns 403 for another user's goal", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.clinicalGoal.findUnique.mockResolvedValue({
        ...baseGoal,
        patient: { userId: "user-2" },
      });

      const response = await request(app)
        .delete("/goals/goal-1")
        .set(authHeader("user-1"));

      expect(response.status).toBe(403);
    });
  });
});
