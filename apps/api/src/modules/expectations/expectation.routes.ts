import { Router } from "express";
import { z } from "zod";
import { currentUser, requireAuth } from "../../lib/auth.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export const expectationRouter = Router();

const createSchema = z.object({
  expectationSetId: z.string(),
  expectedFromUserId: z.string(),
  text: z.string().trim().min(2).max(240)
});

const updateSchema = z.object({
  text: z.string().trim().min(2).max(240).optional(),
  isActive: z.boolean().optional()
});

expectationRouter.use(requireAuth);

async function requireExpectationSetForUser(expectationSetId: string, userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.coupleSpaceId) {
    throw new AppError(409, "Create or join a couple space first.");
  }

  const expectationSet = await prisma.expectationSet.findFirst({
    where: { id: expectationSetId, coupleSpaceId: user.coupleSpaceId }
  });

  if (!expectationSet) {
    throw new AppError(404, "Expectation set not found.");
  }

  return { expectationSet, coupleSpaceId: user.coupleSpaceId };
}

expectationRouter.post("/", async (request, response) => {
  const user = currentUser(request);
  const input = createSchema.parse(request.body);
  const { expectationSet, coupleSpaceId } = await requireExpectationSetForUser(input.expectationSetId, user.id);

  if (input.expectedFromUserId === user.id) {
    throw new AppError(400, "Expectations should be created for your partner.");
  }

  const partner = await prisma.user.findFirst({
    where: { id: input.expectedFromUserId, coupleSpaceId }
  });

  if (!partner) {
    throw new AppError(400, "Choose a partner from your couple space.");
  }

  const expectation = await prisma.expectation.create({
    data: {
      expectationSetId: expectationSet.id,
      coupleSpaceId,
      createdByUserId: user.id,
      expectedFromUserId: input.expectedFromUserId,
      text: input.text
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      expectedFrom: { select: { id: true, name: true } }
    }
  });

  response.status(201).json({ expectation });
});

expectationRouter.patch("/:id", async (request, response) => {
  const user = currentUser(request);
  const input = updateSchema.parse(request.body);
  const expectation = await prisma.expectation.findUnique({ where: { id: request.params.id } });

  if (!expectation || expectation.createdByUserId !== user.id) {
    throw new AppError(404, "Expectation not found.");
  }

  const updated = await prisma.expectation.update({
    where: { id: expectation.id },
    data: input,
    include: {
      createdBy: { select: { id: true, name: true } },
      expectedFrom: { select: { id: true, name: true } }
    }
  });

  response.json({ expectation: updated });
});

expectationRouter.delete("/:id", async (request, response) => {
  const user = currentUser(request);
  const expectation = await prisma.expectation.findUnique({ where: { id: request.params.id } });

  if (!expectation || expectation.createdByUserId !== user.id) {
    throw new AppError(404, "Expectation not found.");
  }

  await prisma.expectation.update({
    where: { id: expectation.id },
    data: { isActive: false }
  });

  response.status(204).send();
});
