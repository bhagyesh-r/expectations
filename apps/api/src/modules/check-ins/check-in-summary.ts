export type StatusForSummary = {
  markedByUserId: string;
  status: "DONE" | "NOT_TODAY" | "NEEDS_DISCUSSION" | "SKIPPED";
};

export type ExpectationForSummary = {
  createdByUserId: string;
  isActive: boolean;
};

export function dailyCountForUser(userId: string, expectations: ExpectationForSummary[], statuses: StatusForSummary[]) {
  const total = expectations.filter(
    (expectation) => expectation.createdByUserId === userId && expectation.isActive
  ).length;
  const userStatuses = statuses.filter((status) => status.markedByUserId === userId);
  const done = userStatuses.filter((status) => status.status === "DONE").length;
  const skipped = userStatuses.filter((status) => status.status === "SKIPPED").length;

  return {
    done,
    total,
    activeToday: Math.max(total - skipped, 0),
    completed: total > 0 && userStatuses.length >= total
  };
}
