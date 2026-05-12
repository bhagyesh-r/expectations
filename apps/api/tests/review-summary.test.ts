import { describe, expect, it } from "@jest/globals";
import {
  expectationsNeedingAttention,
  mostConsistentExpectations,
  qualitativeSummary
} from "../src/modules/reviews/review-summary";

const expectations = [
  { id: "wake", text: "Wake up early" },
  { id: "fruit", text: "Buy fruits" },
  { id: "greet", text: "Greet me warmly" }
];

describe("review summaries", () => {
  it("orders the most consistently met expectations by done ratio", () => {
    const result = mostConsistentExpectations(expectations, [
      { expectationId: "wake", status: "DONE" },
      { expectationId: "wake", status: "DONE" },
      { expectationId: "fruit", status: "DONE" },
      { expectationId: "fruit", status: "NOT_TODAY" },
      { expectationId: "greet", status: "NEEDS_DISCUSSION" }
    ]);

    expect(result.map((item) => item.expectation.id)).toEqual(["wake", "fruit", "greet"]);
  });

  it("surfaces expectations with not-today or needs-discussion statuses", () => {
    const result = expectationsNeedingAttention(expectations, [
      { expectationId: "wake", status: "DONE" },
      { expectationId: "fruit", status: "NOT_TODAY" },
      { expectationId: "fruit", status: "NEEDS_DISCUSSION" },
      { expectationId: "greet", status: "NEEDS_DISCUSSION" }
    ]);

    expect(result.map((item) => [item.expectation.id, item.attention])).toEqual([
      ["fruit", 2],
      ["greet", 1]
    ]);
  });

  it("keeps qualitative summary gentle instead of scorecard-like", () => {
    expect(qualitativeSummary(1)).toContain("worth talking about together");
    expect(qualitativeSummary(0)).toContain("positive moments");
  });
});
