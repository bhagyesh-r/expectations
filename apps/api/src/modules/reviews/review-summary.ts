export type ReviewExpectation = {
  id: string;
  text: string;
};

export type ReviewStatus = {
  expectationId: string;
  status: "DONE" | "NOT_TODAY" | "NEEDS_DISCUSSION" | "SKIPPED";
};

export function buildExpectationSummaries(expectations: ReviewExpectation[], statuses: ReviewStatus[]) {
  return expectations.map((expectation) => {
    const matching = statuses.filter((status) => status.expectationId === expectation.id);
    return {
      expectation,
      done: matching.filter((status) => status.status === "DONE").length,
      attention: matching.filter((status) => status.status === "NOT_TODAY" || status.status === "NEEDS_DISCUSSION")
        .length,
      tracked: matching.length
    };
  });
}

export function mostConsistentExpectations(expectations: ReviewExpectation[], statuses: ReviewStatus[], limit = 3) {
  return buildExpectationSummaries(expectations, statuses)
    .filter((item) => item.tracked > 0)
    .sort((a, b) => b.done / b.tracked - a.done / a.tracked)
    .slice(0, limit);
}

export function expectationsNeedingAttention(expectations: ReviewExpectation[], statuses: ReviewStatus[], limit = 3) {
  return buildExpectationSummaries(expectations, statuses)
    .filter((item) => item.attention > 0)
    .sort((a, b) => b.attention - a.attention)
    .slice(0, limit);
}

export function qualitativeSummary(needsAttentionCount: number) {
  return needsAttentionCount > 0
    ? "Looks like this period had positive moments, and a few expectations may be worth talking about together."
    : "Looks like this period had many positive moments and a steady rhythm of care.";
}
