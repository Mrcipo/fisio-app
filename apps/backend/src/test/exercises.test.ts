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

const baseExercise = {
  id: "exercise-1",
  userId: "user-1",
  name: "Puente de glúteos",
  description: null,
  bodyRegion: "LUMBAR",
  objective: null,
  defaultSets: 3,
  defaultReps: 15,
  defaultDuration: null,
  defaultLoad: null,
  precautions: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Exercises", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /exercises", () => {
    it("creates an exercise for the authenticated user", async () => {
      mockAuthenticatedUser();
      prismaMock.exercise.create.mockResolvedValue(baseExercise);

      const response = await request(app)
        .post("/exercises")
        .set(authHeader())
        .send({ name: "Puente de glúteos", bodyRegion: "LUMBAR", defaultSets: 3, defaultReps: 15 });

      expect(response.status).toBe(201);
      expect(response.body.exercise.name).toBe("Puente de glúteos");
      expect(response.body.exercise.bodyRegion).toBe("LUMBAR");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .post("/exercises")
        .send({ name: "Puente de glúteos" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /exercises", () => {
    it("lists exercises for the authenticated user", async () => {
      mockAuthenticatedUser();
      prismaMock.exercise.findMany.mockResolvedValue([baseExercise]);

      const response = await request(app)
        .get("/exercises")
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.exercises).toHaveLength(1);
      expect(response.body.exercises[0].name).toBe("Puente de glúteos");
    });

    it("returns 401 without token", async () => {
      const response = await request(app).get("/exercises");

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /exercises/:id", () => {
    it("updates an exercise", async () => {
      mockAuthenticatedUser();
      prismaMock.exercise.findUnique.mockResolvedValue(baseExercise);
      prismaMock.exercise.update.mockResolvedValue({
        ...baseExercise,
        name: "Puente de glúteos avanzado",
      });

      const response = await request(app)
        .patch("/exercises/exercise-1")
        .set(authHeader())
        .send({ name: "Puente de glúteos avanzado" });

      expect(response.status).toBe(200);
      expect(response.body.exercise.name).toBe("Puente de glúteos avanzado");
    });

    it("returns 401 without token", async () => {
      const response = await request(app)
        .patch("/exercises/exercise-1")
        .send({ name: "Nuevo nombre" });

      expect(response.status).toBe(401);
    });

    it("returns 403 for another user's exercise", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.exercise.findUnique.mockResolvedValue({
        ...baseExercise,
        userId: "user-2",
      });

      const response = await request(app)
        .patch("/exercises/exercise-1")
        .set(authHeader("user-1"))
        .send({ name: "Nuevo nombre" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /exercises/:id", () => {
    it("deletes an exercise", async () => {
      mockAuthenticatedUser();
      prismaMock.exercise.findUnique.mockResolvedValue(baseExercise);
      prismaMock.exercise.delete.mockResolvedValue(baseExercise);

      const response = await request(app)
        .delete("/exercises/exercise-1")
        .set(authHeader());

      expect(response.status).toBe(204);
    });

    it("returns 401 without token", async () => {
      const response = await request(app).delete("/exercises/exercise-1");

      expect(response.status).toBe(401);
    });

    it("returns 403 for another user's exercise", async () => {
      mockAuthenticatedUser("user-1");
      prismaMock.exercise.findUnique.mockResolvedValue({
        ...baseExercise,
        userId: "user-2",
      });

      const response = await request(app)
        .delete("/exercises/exercise-1")
        .set(authHeader("user-1"));

      expect(response.status).toBe(403);
    });
  });
});
