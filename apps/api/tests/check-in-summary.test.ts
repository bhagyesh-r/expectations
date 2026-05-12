import { describe, expect, it } from "@jest/globals";
import { dailyCountForUser } from "../src/modules/check-ins/check-in-summary";

describe("dailyCountForUser", () => {
  it("counts done expectations against the compact total", () => {
    const result = dailyCountForUser(
      "user-a",
      [
        { createdByUserId: "user-a", isActive: true },
        { createdByUserId: "user-a", isActive: true },
        { createdByUserId: "user-b", isActive: true }
      ],
      [
        { markedByUserId: "user-a", status: "DONE" },
        { markedByUserId: "user-a", status: "NOT_TODAY" },
        { markedByUserId: "user-b", status: "DONE" }
      ]
    );

    expect(result).toEqual({ done: 1, total: 2, activeToday: 2, completed: true });
  });

  it("excludes skipped expectations from active-today detail counts", () => {
    const result = dailyCountForUser(
      "user-a",
      [
        { createdByUserId: "user-a", isActive: true },
        { createdByUserId: "user-a", isActive: true }
      ],
      [
        { markedByUserId: "user-a", status: "DONE" },
        { markedByUserId: "user-a", status: "SKIPPED" }
      ]
    );

    expect(result).toEqual({ done: 1, total: 2, activeToday: 1, completed: true });
  });
});
