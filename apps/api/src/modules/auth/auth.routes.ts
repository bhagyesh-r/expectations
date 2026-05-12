import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { currentUser, requireAuth, signToken } from "../../lib/auth.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export const authRouter = Router();

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1)
});

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  coupleSpaceId: string | null;
}) {
  return user;
}

authRouter.post("/signup", async (request, response) => {
  const input = signUpSchema.parse(request.body);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    },
    select: { id: true, name: true, email: true, profileImageUrl: true, coupleSpaceId: true }
  });

  response.status(201).json({
    user: publicUser(user),
    token: signToken({ id: user.id, email: user.email })
  });
});

authRouter.post("/login", async (request, response) => {
  const input = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const isValid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

  if (!user || !isValid) {
    throw new AppError(401, "That email and password did not match. Please try again.");
  }

  response.json({
    user: publicUser(user),
    token: signToken({ id: user.id, email: user.email })
  });
});

authRouter.get("/me", requireAuth, async (request, response) => {
  const authUser = currentUser(request);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: authUser.id },
    select: { id: true, name: true, email: true, profileImageUrl: true, coupleSpaceId: true }
  });

  response.json({ user: publicUser(user) });
});
