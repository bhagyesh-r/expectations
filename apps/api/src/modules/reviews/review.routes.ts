import { Router } from "express";
import { currentUser, requireAuth } from "../../lib/auth.js";
import { dateKey, dateRange } from "../../lib/dates.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export const reviewRouter = Router();
reviewRouter.use(requireAuth);

reviewRouter.get("/:expectationSetId", async (request, response) => {
  const user = currentUser(request);
  const current = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!current.coupleSpaceId) throw new AppError(409, "Create or join a couple space first.");

  const expectationSet = await prisma.expectationSet.findFirst({
    where: { id: request.params.expectationSetId, coupleSpaceId: current.coupleSpaceId },
    include: {
      expectations: {
        where: { isActive: true },
        include: {
          createdBy: { select: { id: true, name: true } },
          expectedFrom: { select: { id: true, name: true } }
        }
      }
    }
  });

  if (!expectationSet) throw new AppError(404, "Expectation set not found.");

  const statuses = await prisma.dailyExpectationStatus.findMany({
    where: { expectationSetId: expectationSet.id },
    include: {
      expectation: true,
      markedBy: { select: { id: true, name: true } },
      expectedFrom: { select: { id: true, name: true } }
    }
  });
  const appreciationNotes = await prisma.appreciationNote.findMany({
    where: { expectationSetId: expectationSet.id },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { date: "desc" }
  });

  const dayKeys = dateRange(expectationSet.startDate, expectationSet.endDate).map(dateKey);
  const trackedDays = new Set(statuses.map((status) => dateKey(status.date)));
  const expectationSummaries = expectationSet.expectations.map((expectation) => {
    const matching = statuses.filter((status) => status.expectationId === expectation.id);
    const done = matching.filter((status) => status.status === "DONE").length;
    const attention = matching.filter(
      (status) => status.status === "NOT_TODAY" || status.status === "NEEDS_DISCUSSION"
    ).length;
    return {
      expectation,
      done,
      attention,
      tracked: matching.length
    };
  });

  const mostConsistent = [...expectationSummaries]
    .filter((item) => item.tracked > 0)
    .sort((a, b) => b.done / b.tracked - a.done / a.tracked)
    .slice(0, 3);

  const needsAttention = [...expectationSummaries]
    .filter((item) => item.attention > 0)
    .sort((a, b) => b.attention - a.attention)
    .slice(0, 3);

  const qualitativeSummary =
    needsAttention.length > 0
      ? "Looks like this period had positive moments, and a few expectations may be worth talking about together."
      : "Looks like this period had many positive moments and a steady rhythm of care.";

  response.json({
    expectationSet,
    totalDaysTracked: trackedDays.size,
    totalDaysInRange: dayKeys.length,
    mostConsistent,
    needsAttention,
    appreciationNotes,
    dayByDay: dayKeys.map((day) => ({
      date: day,
      statuses: statuses.filter((status) => dateKey(status.date) === day)
    })),
    qualitativeSummary
  });
});
