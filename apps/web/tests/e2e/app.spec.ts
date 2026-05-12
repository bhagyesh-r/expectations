import { expect, test } from "@playwright/test";

const user = {
  id: "user-a",
  name: "Bhagyesh",
  email: "bhagyesh@example.com",
  profileImageUrl: null,
  coupleSpaceId: "couple-1"
};

const partner = {
  id: "user-b",
  name: "Partner",
  email: "partner@example.com",
  profileImageUrl: null,
  coupleSpaceId: "couple-1"
};

const activeSet = {
  id: "set-1",
  name: "May Expectations",
  startDate: "2026-05-01T00:00:00.000Z",
  endDate: "2026-05-31T00:00:00.000Z",
  expectations: [
    {
      id: "exp-1",
      expectationSetId: "set-1",
      createdByUserId: "user-a",
      expectedFromUserId: "user-b",
      text: "Buy fruits",
      isActive: true,
      createdBy: { id: "user-a", name: "Bhagyesh" },
      expectedFrom: { id: "user-b", name: "Partner" }
    }
  ]
};

async function mockAuthenticatedApi(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: { user } });
  });

  await page.route("**/api/dashboard", async (route) => {
    await route.fulfill({
      json: {
        coupleSpace: {
          id: "couple-1",
          name: "Our Couple Space",
          coupleCode: "ABCD1234",
          members: [user, partner]
        },
        activeSet,
        todaySummary: {
          date: "2026-05-12",
          summaries: [
            { user, done: 1, total: 1, completed: true },
            { user: partner, done: 0, total: 1, completed: false }
          ]
        },
        calendarPreview: [
          {
            date: "2026-05-12",
            summaries: [
              { user, done: 1, total: 1, completed: true },
              { user: partner, done: 0, total: 1, completed: false }
            ]
          }
        ],
        checkInStatus: { completed: false, marked: 0, total: 1 },
        recentAppreciation: { id: "note-1", date: "2026-05-12", note: "Thank you for being kind.", createdBy: user },
        appreciationNotes: [],
        badges: [
          {
            id: "badge-1",
            title: "Kind Note Sent",
            description: "A warm note was shared.",
            badgeType: "KIND_NOTE_SENT",
            earnedAt: "2026-05-12T00:00:00.000Z"
          }
        ]
      }
    });
  });
}

test("signs up and shows the dashboard", async ({ page }) => {
  let signedUp = false;
  await page.route("**/api/auth/me", async (route) => {
    if (signedUp) {
      await route.fulfill({ json: { user } });
      return;
    }
    await route.fulfill({ status: 401, json: { message: "Please log in to continue." } });
  });
  await page.route("**/api/auth/signup", async (route) => {
    signedUp = true;
    await route.fulfill({ status: 201, json: { user, token: "test-token" } });
  });
  await page.route("**/api/dashboard", async (route) => {
    await route.fulfill({
      json: {
        coupleSpace: {
          id: "couple-1",
          name: "Our Couple Space",
          coupleCode: "ABCD1234",
          members: [user, partner]
        },
        activeSet,
        todaySummary: {
          date: "2026-05-12",
          summaries: [
            { user, done: 1, total: 1, completed: true },
            { user: partner, done: 0, total: 1, completed: false }
          ]
        },
        calendarPreview: [],
        checkInStatus: { completed: false, marked: 0, total: 1 },
        recentAppreciation: { id: "note-1", date: "2026-05-12", note: "Thank you for being kind.", createdBy: user },
        appreciationNotes: [],
        badges: []
      }
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /clear expectations/i })).toBeVisible();
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByLabel("Name").fill("Bhagyesh");
  await page.getByLabel("Email").fill("bhagyesh@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "May Expectations" })).toBeVisible();
  await expect(page.getByText("Thank you for being kind.")).toBeVisible();
});

test("shows couple setup when a user has no couple space", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: { user: { ...user, coupleSpaceId: null } } });
  });
  await page.route("**/api/dashboard", async (route) => {
    await route.fulfill({ json: { needsCoupleSpace: true } });
  });
  await page.route("**/api/couple-spaces", async (route) => {
    await route.fulfill({
      status: 201,
      json: {
        coupleSpace: {
          id: "couple-1",
          name: "Our Couple Space",
          coupleCode: "ABCD1234",
          members: [user]
        }
      }
    });
  });

  await page.addInitScript(() => localStorage.setItem("expectations_token", "test-token"));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Couple space" })).toBeVisible();
  await page.getByRole("button", { name: /create couple space/i }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText(/couple code/i)).toBeVisible();
});

test("navigates to check-in and saves statuses", async ({ page }) => {
  await mockAuthenticatedApi(page);
  await page.route("**/api/check-ins/set-1/**", async (route) => {
    await route.fulfill({ json: { expectations: activeSet.expectations, appreciationNote: null } });
  });
  await page.route("**/api/check-ins", async (route) => {
    await route.fulfill({ json: { statuses: [], appreciationNote: null } });
  });

  await page.addInitScript(() => localStorage.setItem("expectations_token", "test-token"));
  await page.goto("/");
  await page.getByLabel("Check-in").click();
  await expect(page.getByRole("heading", { name: "Today’s check-in" })).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByPlaceholder("What made you smile today?").fill("A small kind moment.");
  await page.getByRole("button", { name: "Save check-in" }).click();
  await expect(page.getByText(/saved/i)).toBeVisible();
});
