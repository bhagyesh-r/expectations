import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { AppError } from "./errors.js";

export type AuthUser = {
  id: string;
  email: string;
};

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "30d" });
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    throw new AppError(401, "Please log in to continue.");
  }

  try {
    request.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    next();
  } catch {
    throw new AppError(401, "Your session expired. Please log in again.");
  }
}

export function currentUser(request: Request) {
  if (!request.user) {
    throw new AppError(401, "Please log in to continue.");
  }
  return request.user;
}
