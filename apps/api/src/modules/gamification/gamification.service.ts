import { subDays } from "date-fns";
import type { PrismaClient } from "@prisma/client";
import { dateKey, toDateOnly } from "../../lib/dates.js";

const BADGES = {
  THREE_DAY_CHECK_IN_STREAK: {
    title: "3-Day Check-In Streak",
    description: "Three days of showing up and checking in."
  },
  APPRECIATION_STAR: {
    title: "Appreciation Star",
    description: "A kind note made it into the couple space."
  },
  TEAMWORK_MOMENT: {
    title: "Teamwork Moment",
    description: "Both partners completed a daily check-in."
  },
  KIND_NOTE_SENT: {
    title: "Kind Note Sent",
    description: "A warm appreciation note was shared."
  }
} as const;

export async function awardAppreciationBadges(prisma: PrismaClient, coupleSpaceId: string, userId: string) {
  await prisma.badge.upsert({
    where: {
      coupleSpaceId_userId_badgeType: {
        coupleSpaceId,
        userId,
        badgeType: "APPRECIATION_STAR"
      }
    },
    update: {},
    create: {
      coupleSpaceId,
      userId,
      badgeType: "APPRECIATION_STAR",
      ...BADGES.APPRECIATION_STAR
    }
  });

  await prisma.badge.upsert({
    where: {
      coupleSpaceId_userId_badgeType: {
        coupleSpaceId,
        userId,
        badgeType: "KIND_NOTE_SENT"
      }
    },
    update: {},
    create: {
      coupleSpaceId,
      userId,
      badgeType: "KIND_NOTE_SENT",
      ...BADGES.KIND_NOTE_SENT
    }
  });
}

export async function awardCheckInBadges(
  prisma: PrismaClient,
  coupleSpaceId: string,
  expectationSetId: string,
  date: Date
) {
  const members = await prisma.user.findMany({ where: { coupleSpaceId }, select: { id: true } });
  const activeExpectations = await prisma.expectation.findMany({
    where: { coupleSpaceId, expectationSetId, isActive: true },
    select: { id: true, createdByUserId: true }
  });

  const statuses = await prisma.dailyExpectationStatus.findMany({
    where: { coupleSpaceId, expectationSetId, date },
    select: { markedByUserId: true, expectationId: true }
  });

  const completedUsers = members.filter((member) => {
    const expectedIds = activeExpectations
      .filter((expectation) => expectation.createdByUserId === member.id)
      .map((expectation) => expectation.id);
    if (expectedIds.length === 0) return false;
    const markedIds = new Set(
      statuses.filter((status) => status.markedByUserId === member.id).map((status) => status.expectationId)
    );
    return expectedIds.every((id) => markedIds.has(id));
  });

  if (members.length === 2 && completedUsers.length === 2) {
    const existingTeamworkBadge = await prisma.badge.findFirst({
      where: { coupleSpaceId, userId: null, badgeType: "TEAMWORK_MOMENT" }
    });

    if (!existingTeamworkBadge) {
      await prisma.badge.create({
        data: {
          coupleSpaceId,
          userId: null,
          badgeType: "TEAMWORK_MOMENT",
          ...BADGES.TEAMWORK_MOMENT
        }
      });
    }
  }

  await Promise.all(
    completedUsers.map(async (member) => {
      const lastThree = [0, 1, 2].map((offset) => toDateOnly(subDays(date, offset))).map(dateKey);
      const completedDayKeys = new Set<string>();

      for (const day of lastThree) {
        const dayDate = toDateOnly(day);
        const dayStatuses = await prisma.dailyExpectationStatus.findMany({
          where: { coupleSpaceId, expectationSetId, markedByUserId: member.id, date: dayDate },
          select: { expectationId: true }
        });
        const expectedIds = activeExpectations
          .filter((expectation) => expectation.createdByUserId === member.id)
          .map((expectation) => expectation.id);
        const markedIds = new Set(dayStatuses.map((status) => status.expectationId));
        if (expectedIds.length > 0 && expectedIds.every((id) => markedIds.has(id))) {
          completedDayKeys.add(day);
        }
      }

      if (lastThree.every((day) => completedDayKeys.has(day))) {
        await prisma.badge.upsert({
          where: {
            coupleSpaceId_userId_badgeType: {
              coupleSpaceId,
              userId: member.id,
              badgeType: "THREE_DAY_CHECK_IN_STREAK"
            }
          },
          update: {},
          create: {
            coupleSpaceId,
            userId: member.id,
            badgeType: "THREE_DAY_CHECK_IN_STREAK",
            ...BADGES.THREE_DAY_CHECK_IN_STREAK
          }
        });
      }
    })
  );
}
