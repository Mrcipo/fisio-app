import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { loginSchema, registerSchema } from "./auth.schemas";
import { loginUser, registerUser } from "./auth.service";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authRouter = Router();

authRouter.get("/", (_req, res) => {
  res.status(200).json({
    module: "auth",
    status: "ready",
  });
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);

    res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);
    res.status(200).json(result);
  }),
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  res.status(204).send();
});
