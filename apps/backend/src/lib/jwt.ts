import { HttpError } from "./http-error";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new HttpError(500, "JWT secret is not configured");
  }

  return secret;
}
