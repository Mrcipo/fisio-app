import bcrypt from "bcrypt";
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
      {
        sub: userId,
        email: `${userId}@mail.com`,
        role: "CLINICIAN",
      },
      process.env.JWT_SECRET as string,
    )}`,
  };
}

function authCookie(userId = "user-1") {
  const token = jwt.sign(
    { sub: userId, email: `${userId}@mail.com`, role: "CLINICIAN" },
    process.env.JWT_SECRET as string,
  );
  return `token=${token}`;
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

describe("Backend basic flows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      email: "kine@test.com",
      firstName: "Kine",
      lastName: "Test",
      role: "CLINICIAN",
    });

    const response = await request(app).post("/auth/register").send({
      email: "kine@test.com",
      password: "password123",
      firstName: "Kine",
      lastName: "Test",
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("kine@test.com");
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("logs in an existing user", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);

    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "kine@test.com",
      firstName: "Kine",
      lastName: "Test",
      role: "CLINICIAN",
      isActive: true,
      passwordHash,
    });

    const response = await request(app).post("/auth/login").send({
      email: "kine@test.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("kine@test.com");
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("protects patient routes with JWT", async () => {
    const response = await request(app).get("/patients");

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Authentication required");
  });

  it("creates a patient for the authenticated user", async () => {
    mockAuthenticatedUser();
    prismaMock.patient.create.mockResolvedValue({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post("/patients")
      .set(authHeader())
      .send({
        firstName: "Ana",
        lastName: "Perez",
      });

    expect(response.status).toBe(201);
    expect(response.body.patient.firstName).toBe("Ana");
    expect(prismaMock.patient.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          firstName: "Ana",
          lastName: "Perez",
        }),
      }),
    );
  });

  it("validates pain scale between 0 and 10", async () => {
    mockAuthenticatedUser();

    const response = await request(app)
      .post("/patients/patient-1/initial-assessment")
      .set(authHeader())
      .send({
        reasonForConsultation: "Dolor lumbar",
        currentPain: 11,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Validation error");
  });

  it("returns 404 when accessing another user's patient", async () => {
    mockAuthenticatedUser("user-1");
    // findPatientForUser uses findFirst with userId in the where clause;
    // querying with user-1's id returns null for a patient owned by user-2
    prismaMock.patient.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .get("/patients/patient-2")
      .set(authHeader("user-1"));

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("Patient not found");
  });

  describe("require-auth cookie support", () => {
    it("grants access to a protected route when token is in cookie", async () => {
      mockAuthenticatedUser();
      prismaMock.$transaction.mockResolvedValue([[], 0]);

      const response = await request(app).get("/patients").set("Cookie", authCookie());

      expect(response.status).toBe(200);
    });

    it("returns 401 when cookie contains an invalid token", async () => {
      const response = await request(app)
        .get("/patients")
        .set("Cookie", "token=not-a-valid-jwt");

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe("Authentication required");
    });
  });

  it("creates a session with performed exercises", async () => {
    mockAuthenticatedUser();
    prismaMock.patient.findFirst.mockResolvedValue({
      id: "patient-1",
      userId: "user-1",
      deletedAt: null,
    });
    prismaMock.exercise.findMany.mockResolvedValue([{ id: "exercise-1" }]);
    prismaMock.session.create.mockResolvedValue({
      id: "session-1",
      patientId: "patient-1",
      date: new Date("2026-01-10"),
      painBefore: 6,
      painAfter: 4,
      subjectiveReport: "Molestia al agacharse",
      clinicalNotes: "Buena tolerancia",
      responseToTreatment: "Disminuye dolor",
      clinicalDecision: "PROGRESS",
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionExercises: [
        {
          id: "session-ex-1",
          sessionId: "session-1",
          exerciseId: "exercise-1",
          sets: 3,
          reps: 10,
          duration: null,
          load: "Banda media",
          rpe: 5,
          symptoms: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    const response = await request(app)
      .post("/patients/patient-1/sessions")
      .set(authHeader())
      .send({
        date: "2026-01-10",
        painBefore: 6,
        painAfter: 4,
        subjectiveReport: "Molestia al agacharse",
        clinicalNotes: "Buena tolerancia",
        responseToTreatment: "Disminuye dolor",
        clinicalDecision: "PROGRESS",
        exercises: [
          {
            exerciseId: "exercise-1",
            sets: 3,
            reps: 10,
            load: "Banda media",
            rpe: 5,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.session.patientId).toBe("patient-1");
    expect(response.body.session.sessionExercises).toHaveLength(1);
  });
});
