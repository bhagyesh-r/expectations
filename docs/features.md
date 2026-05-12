# Feature Details

This document maps the MVP PRD to the implemented application surfaces.

## Authentication

- Email/password sign-up and login.
- JWT-based sessions stored by the frontend in local storage.
- Session restore through `GET /api/auth/me`.
- Logout clears the local session.
- No email verification is triggered.

## Couple Space

- Authenticated users can create a couple space.
- The API generates a unique shared couple code.
- A second partner can join with the code.
- The API prevents a user from joining more than one couple space.
- The API checks that a couple space has no more than two members before join.

## Expectation Sets

- Users can create expectation sets with a name, start date, and end date.
- Date range is set at the list level.
- Users can view active, past, upcoming, and all sets.
- Users can duplicate active expectations from a previous set into a new date range.

## Expectations

- Users can add expectations for their partner.
- Both partners can see expectations in the shared space.
- API supports edit and soft-delete for expectations created by the current user.
- Frontend shows who expects what from whom.

## Daily Check-In

- Users can mark each expectation with:
  - Done
  - Not today
  - Needs discussion
  - Skipped
- Each status can include an optional note.
- Users can update the same day’s check-in with upsert behavior.
- Daily data is stored by expectation, user, and date.

## Appreciation Notes

- Users can add one optional appreciation note per date and expectation set.
- Notes are visible in dashboard and review surfaces.
- Appreciation notes trigger lightweight positive badges.

## Dashboard

- Mobile-first dashboard after login.
- Shows active expectation set, today’s check-in state, recent appreciation, compact calendar preview, and badge preview.
- If no active set exists, the dashboard prompts the user to create one.

## Calendar

- Compact calendar preview renders daily partner counts as profile initial plus done/total.
- API provides day-detail data for expectations, selected statuses, optional notes, and appreciation notes.

## Review Summary

- API returns total days tracked, total days in range, most consistent expectations, expectations needing attention, appreciation notes, day-by-day statuses, and a gentle qualitative summary.
- Frontend renders the qualitative summary and key review lists.

## Gamification

- Badge records exist for:
  - 3-Day Check-In Streak
  - Appreciation Star
  - Teamwork Moment
  - Consistency Couple
  - Kind Note Sent
- API awards appreciation and basic check-in/teamwork badges.
- UI keeps language positive and avoids punitive scoring.

## CI/CD And Operations

- GitHub Actions verifies lint, formatting, build, backend Jest tests, and frontend Playwright E2E tests.
- Docker images are built and pushed to GitHub Container Registry on `main`.
- EC2 deployment uses Docker Compose with PostgreSQL, API, and web services.
- Production web serves the React app through Nginx and proxies `/api` to the API container.
