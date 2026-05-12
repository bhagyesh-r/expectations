import { customAlphabet } from "nanoid";
import { Router } from "express";
import { z } from "zod";
import { currentUser, requireAuth } from "../../lib/auth.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export const coupleSpaceRouter = Router();
const codeGenerator = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

const createSchema = z.object({
  name: z.string().trim().min(1).max(80).default("Our Couple Space")
});

const joinSchema = z.object({
  coupleCode: z
    .string()
    .trim()
    .min(4)
    .max(16)
    .transform((value) => value.toUpperCase())
});

coupleSpaceRouter.use(requireAuth);

coupleSpaceRouter.get("/mine", async (request, response) => {
  const user = currentUser(request);
  const current = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: {
      coupleSpace: {
        include: {
          members: {
            select: { id: true, name: true, email: true, profileImageUrl: true }
          }
        }
      }
    }
  });

  response.json({ coupleSpace: current.coupleSpace });
});

coupleSpaceRouter.post("/", async (request, response) => {
  const authUser = currentUser(request);
  const input = createSchema.parse(request.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });

  if (user.coupleSpaceId) {
    throw new AppError(409, "You already belong to a couple space.");
  }

  let coupleCode = codeGenerator();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await prisma.coupleSpace.findUnique({ where: { coupleCode } });
    if (!existing) break;
    coupleCode = codeGenerator();
  }

  const coupleSpace = await prisma.coupleSpace.create({
    data: {
      name: input.name,
      coupleCode,
      members: { connect: { id: authUser.id } }
    },
    include: {
      members: {
        select: { id: true, name: true, email: true, profileImageUrl: true }
      }
    }
  });

  response.status(201).json({ coupleSpace });
});

coupleSpaceRouter.post("/join", async (request, response) => {
  const authUser = currentUser(request);
  const input = joinSchema.parse(request.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });

  if (user.coupleSpaceId) {
    throw new AppError(409, "You already belong to a couple space.");
  }

  const coupleSpace = await prisma.coupleSpace.findUnique({
    where: { coupleCode: input.coupleCode },
    select: { id: true }
  });

  if (!coupleSpace) {
    throw new AppError(404, "We could not find a couple space with that code.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${coupleSpace.id}))`;
    const lockedSpace = await tx.coupleSpace.findUniqueOrThrow({
      where: { id: coupleSpace.id },
      include: { members: true }
    });

    if (lockedSpace.members.length >= 2) {
      throw new AppError(409, "This couple space already has two partners.");
    }

    return tx.coupleSpace.update({
      where: { id: coupleSpace.id },
      data: { members: { connect: { id: authUser.id } } },
      include: {
        members: {
          select: { id: true, name: true, email: true, profileImageUrl: true }
        }
      }
    });
  });

  response.json({ coupleSpace: updated });
});
