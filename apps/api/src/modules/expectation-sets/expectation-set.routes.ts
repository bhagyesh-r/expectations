import { Router } from "express";
import { z } from "zod";
import { currentUser, requireAuth } from "../../lib/auth.js";
import { toDateOnly } from "../../lib/dates.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export const expectationSetRouter = Router();

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  startDate: z.string().date(),
  endDate: z.string().date(),
  duplicateFromSetId: z.string().optional()
});

expectationSetRouter.use(requireAuth);

async function requireCoupleSpace(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.coupleSpaceId) {
    throw new AppError(409, "Create or join a couple space first.");
  }
  return user.coupleSpaceId;
}

expectationSetRouter.get("/", async (request, response) => {
  const user = currentUser(request);
  const coupleSpaceId = await requireCoupleSpace(user.id);
  const today = toDateOnly(new Date());
  const sets = await prisma.expectationSet.findMany({
    where: { coupleSpaceId },
    include: {
      expectations: {
        where: { isActive: true },
        include: {
          createdBy: { select: { id: true, name: true } },
          expectedFrom: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { startDate: "desc" }
  });

  response.json({
    active: sets.filter((set) => set.startDate <= today && set.endDate >= today),
    past: sets.filter((set) => set.endDate < today),
    upcoming: sets.filter((set) => set.startDate > today),
    sets
  });
});

expectationSetRouter.post("/", async (request, response) => {
  const user = currentUser(request);
  const coupleSpaceId = await requireCoupleSpace(user.id);
  const input = createSchema.parse(request.body);
  const startDate = toDateOnly(input.startDate);
  const endDate = toDateOnly(input.endDate);

  if (endDate < startDate) {
    throw new AppError(400, "End date should be after the start date.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const expectationSet = await tx.expectationSet.create({
      data: {
        coupleSpaceId,
        name: input.name,
        startDate,
        endDate,
        createdByUserId: user.id
      }
    });

    if (input.duplicateFromSetId) {
      const source = await tx.expectation.findMany({
        where: {
          expectationSetId: input.duplicateFromSetId,
          coupleSpaceId,
          isActive: true
        }
      });

      await tx.expectation.createMany({
        data: source.map((expectation) => ({
          expectationSetId: expectationSet.id,
          coupleSpaceId,
          createdByUserId: expectation.createdByUserId,
          expectedFromUserId: expectation.expectedFromUserId,
          text: expectation.text,
          isActive: true
        }))
      });
    }

    return tx.expectationSet.findUniqueOrThrow({
      where: { id: expectationSet.id },
      include: { expectations: true }
    });
  });

  response.status(201).json({ expectationSet: created });
});
