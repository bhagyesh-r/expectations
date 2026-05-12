import { Router } from "express";
import { z } from "zod";
import { currentUser, requireAuth } from "../../lib/auth.js";
import { toDateOnly } from "../../lib/dates.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { awardAppreciationBadges, awardCheckInBadges } from "../gamification/gamification.service.js";

export const checkInRouter = Router();

const statusSchema = z.object({
  expectationId: z.string(),
  status: z.enum(["DONE", "NOT_TODAY", "NEEDS_DISCUSSION", "SKIPPED"]),
  note: z.string().trim().max(500).optional().nullable()
});

const saveSchema = z.object({
  expectationSetId: z.string(),
  date: z.string().date(),
  statuses: z.array(statusSchema),
  appreciationNote: z.string().trim().max(500).optional().nullable()
});

checkInRouter.use(requireAuth);

async function getCoupleSpaceId(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.coupleSpaceId) {
    throw new AppError(409, "Create or join a couple space first.");
  }
  return user.coupleSpaceId;
}

checkInRouter.get("/:expectationSetId/:date", async (request, response) => {
  const user = currentUser(request);
  const coupleSpaceId = await getCoupleSpaceId(user.id);
  const date = toDateOnly(request.params.date);
  const expectationSet = await prisma.expectationSet.findFirst({
    where: { id: request.params.expectationSetId, coupleSpaceId }
  });

  if (!expectationSet) {
    throw new AppError(404, "Expectation set not found.");
  }

  if (date < expectationSet.startDate || date > expectationSet.endDate) {
    throw new AppError(400, "Choose a date within this expectation set.");
  }

  const expectations = await prisma.expectation.findMany({
    where: {
      expectationSetId: expectationSet.id,
      createdByUserId: user.id,
      isActive: true
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      expectedFrom: { select: { id: true, name: true } },
      dailyStatuses: {
        where: { date, markedByUserId: user.id }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const appreciationNote = await prisma.appreciationNote.findUnique({
    where: {
      expectationSetId_createdByUserId_date: {
        expectationSetId: expectationSet.id,
        createdByUserId: user.id,
        date
      }
    }
  });

  response.json({ expectationSet, expectations, appreciationNote });
});

checkInRouter.put("/", async (request, response) => {
  const user = currentUser(request);
  const coupleSpaceId = await getCoupleSpaceId(user.id);
  const input = saveSchema.parse(request.body);
  const date = toDateOnly(input.date);
  const expectationSet = await prisma.expectationSet.findFirst({
    where: { id: input.expectationSetId, coupleSpaceId }
  });

  if (!expectationSet) {
    throw new AppError(404, "Expectation set not found.");
  }

  const expectations = await prisma.expectation.findMany({
    where: {
      expectationSetId: input.expectationSetId,
      coupleSpaceId,
      createdByUserId: user.id,
      isActive: true
    }
  });

  const expectationById = new Map(expectations.map((expectation) => [expectation.id, expectation]));
  const missing = expectations.filter(
    (expectation) => !input.statuses.some((status) => status.expectationId === expectation.id)
  );

  if (missing.length > 0) {
    throw new AppError(400, "Choose a status for every expectation before saving.");
  }

  for (const status of input.statuses) {
    if (!expectationById.has(status.expectationId)) {
      throw new AppError(400, "One of the selected expectations is not available for your check-in.");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const savedStatuses = await Promise.all(
      input.statuses.map((item) => {
        const expectation = expectationById.get(item.expectationId)!;
        return tx.dailyExpectationStatus.upsert({
          where: {
            expectationId_markedByUserId_date: {
              expectationId: item.expectationId,
              markedByUserId: user.id,
              date
            }
          },
          update: {
            status: item.status,
            note: item.note || null
          },
          create: {
            expectationId: item.expectationId,
            expectationSetId: input.expectationSetId,
            coupleSpaceId,
            markedByUserId: user.id,
            expectedFromUserId: expectation.expectedFromUserId,
            date,
            status: item.status,
            note: item.note || null
          }
        });
      })
    );

    const appreciationNote = input.appreciationNote
      ? await tx.appreciationNote.upsert({
          where: {
            expectationSetId_createdByUserId_date: {
              expectationSetId: input.expectationSetId,
              createdByUserId: user.id,
              date
            }
          },
          update: { note: input.appreciationNote },
          create: {
            expectationSetId: input.expectationSetId,
            coupleSpaceId,
            createdByUserId: user.id,
            date,
            note: input.appreciationNote
          }
        })
      : null;

    return { statuses: savedStatuses, appreciationNote };
  });

  if (result.appreciationNote) {
    await awardAppreciationBadges(prisma, coupleSpaceId, user.id);
  }
  await awardCheckInBadges(prisma, coupleSpaceId, input.expectationSetId, date);

  response.json(result);
});
