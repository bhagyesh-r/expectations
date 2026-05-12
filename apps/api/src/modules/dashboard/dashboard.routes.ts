import { Router } from "express";
import { currentUser, requireAuth } from "../../lib/auth.js";
import { dateKey, dateRange, toDateOnly } from "../../lib/dates.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (request, response) => {
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

  if (!current.coupleSpace) {
    return response.json({ needsCoupleSpace: true });
  }

  const today = toDateOnly(new Date());
  const activeSet = await prisma.expectationSet.findFirst({
    where: {
      coupleSpaceId: current.coupleSpace.id,
      startDate: { lte: today },
      endDate: { gte: today }
    },
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

  if (!activeSet) {
    return response.json({ coupleSpace: current.coupleSpace, activeSet: null });
  }

  const days = dateRange(activeSet.startDate, activeSet.endDate);
  const statuses = await prisma.dailyExpectationStatus.findMany({
    where: { expectationSetId: activeSet.id },
    include: { expectation: true }
  });
  const appreciationNotes = await prisma.appreciationNote.findMany({
    where: { expectationSetId: activeSet.id },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5
  });
  const badges = await prisma.badge.findMany({
    where: { coupleSpaceId: current.coupleSpace.id },
    orderBy: { earnedAt: "desc" },
    take: 6
  });

  const calendar = days.map((day) => {
    const key = dateKey(day);
    const summaries = current.coupleSpace!.members.map((member) => {
      const expected = activeSet.expectations.filter((expectation) => expectation.createdByUserId === member.id);
      const dayStatuses = statuses.filter(
        (status) => status.markedByUserId === member.id && dateKey(status.date) === key
      );
      const done = dayStatuses.filter((status) => status.status === "DONE").length;
      return {
        user: member,
        done,
        total: expected.length,
        completed: expected.length > 0 && dayStatuses.length === expected.length
      };
    });
    return { date: key, summaries };
  });

  const todaySummary = calendar.find((day) => day.date === dateKey(today));
  const myExpected = activeSet.expectations.filter((expectation) => expectation.createdByUserId === user.id).length;
  const myMarkedToday = statuses.filter(
    (status) => status.markedByUserId === user.id && dateKey(status.date) === dateKey(today)
  ).length;

  response.json({
    coupleSpace: current.coupleSpace,
    activeSet,
    todaySummary,
    calendarPreview: calendar.slice(0, 35),
    checkInStatus: {
      completed: myExpected > 0 && myExpected === myMarkedToday,
      marked: myMarkedToday,
      total: myExpected
    },
    recentAppreciation: appreciationNotes[0] ?? null,
    appreciationNotes,
    badges
  });
});

dashboardRouter.get("/day/:expectationSetId/:date", async (request, response) => {
  const user = currentUser(request);
  const current = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!current.coupleSpaceId) throw new AppError(409, "Create or join a couple space first.");
  const date = toDateOnly(request.params.date);

  const details = await prisma.dailyExpectationStatus.findMany({
    where: {
      expectationSetId: request.params.expectationSetId,
      coupleSpaceId: current.coupleSpaceId,
      date
    },
    include: {
      expectation: true,
      markedBy: { select: { id: true, name: true } },
      expectedFrom: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  const appreciationNotes = await prisma.appreciationNote.findMany({
    where: {
      expectationSetId: request.params.expectationSetId,
      coupleSpaceId: current.coupleSpaceId,
      date
    },
    include: { createdBy: { select: { id: true, name: true } } }
  });

  response.json({ details, appreciationNotes });
});
