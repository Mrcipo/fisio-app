import jwt from "jsonwebtoken";
import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { getJwtSecret } from "../lib/jwt";
import { prisma } from "../lib/prisma";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const cookieToken = req.cookies?.token as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    throw new HttpError(401, "Authentication required");
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    throw new HttpError(401, "Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    throw new HttpError(401, "Authentication required");
  }

  req.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  next();
});
