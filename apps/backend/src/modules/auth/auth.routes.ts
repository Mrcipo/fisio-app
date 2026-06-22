import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { loginSchema, registerSchema } from "./auth.schemas";
import { loginUser, registerUser } from "./auth.service";

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

    res.status(201).json(result);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    res.status(200).json(result);
  }),
);
