# PRD: Expectations

## 1. Product Overview

**Product name:** Expectations  
**Platform:** Mobile-first Progressive Web App (PWA)  
**Target users:** Married couples  
**MVP audience:** One couple using the app privately  
**Future audience:** Multiple couples with optional leaderboard and gamified social features

Expectations is a mobile-first relationship tracking app that helps married couples clearly communicate expectations, track consistency, appreciate each other, and avoid misunderstandings caused by unspoken needs.

The app is not intended to be a strict performance scorecard. It should feel playful, light, and gamified while helping both partners understand how regularly they are meeting each other’s expectations.

---

## 2. Problem Statement

In relationships, many expectations remain unspoken. This can lead to confusion, disappointment, and unnecessary conflict. Partners may assume the other person already knows what they want, but the expectations are often unclear.

Expectations solves this by giving couples a shared space to define expectations together, track them daily, add appreciation, and review patterns over time.

---

## 3. Goals

### Primary Goals

1. Help couples communicate expectations clearly.
2. Help partners appreciate each other more often.
3. Reduce misunderstandings caused by unclear or unspoken expectations.
4. Provide a simple daily tracking habit.
5. Show consistency patterns over a selected date range.
6. Keep the experience playful, light, and mobile-friendly.

### Secondary Goals

1. Encourage couples to sit together and define expectations.
2. Create visibility into both partners’ expectations.
3. Provide qualitative summaries instead of heavy scoring.
4. Support gentle gamification through hearts, streaks, badges, and celebration animations.

---

## 4. Non-Goals for MVP

The MVP will not include:

1. Email verification.
2. Push notifications.
3. Expectation approval or acceptance workflow.
4. Per-expectation frequency.
5. Complex scoring algorithms.
6. AI-generated relationship advice.
7. Public couple leaderboard.
8. Multi-couple social features.
9. Payment or subscription.
10. Private notes hidden from the partner.

---

## 5. Product Principles

1. **Clarity over assumption**  
   The app should help partners clearly express what they expect.

2. **Playful, not punitive**  
   The app should avoid blame-heavy language and harsh scoring.

3. **Shared visibility**  
   Both partners can see everything in the couple space.

4. **Lightweight daily habit**  
   Daily tracking should be fast and easy on mobile.

5. **Appreciation-first experience**  
   The app should encourage positive reinforcement, not just tracking missed expectations.

6. **Patterns over judgment**  
   Summaries should help couples notice consistency and areas needing conversation.

---

## 6. Product Tone and Language

### Desired Tone

- Gamified
- Playful
- Light
- Warm
- Encouraging
- Couple-friendly

### Words to Use

- Expectations
- Check-in
- Appreciation
- Needs discussion
- Not today
- Skipped
- Consistency
- Streak
- Heart
- Badge
- Celebration

### Words to Avoid

- Failed
- Blame
- Penalty
- Bad performance
- Complaint
- Punishment
- Report card

---

## 7. Core User Flow

### First-Time User Flow

1. User opens the app.
2. User sees two options:
   - Create Couple Space
   - Join Couple Space
3. User signs up or logs in using email and password.
4. If creating a couple space:
   - User creates a couple space.
   - App generates a shared couple code.
   - User shares the code with partner.
5. If joining a couple space:
   - User enters couple code.
   - User joins the shared couple space.
6. Both partners can now create expectation sets.

### Expectation Setup Flow

1. Couple sits together and decides expectations.
2. User creates an expectation set.
3. User selects date range at the list level:
   - Start date
   - End date
4. User adds expectations for the partner.
5. Partner can also add expectations for the user.
6. Both users can see all expectations.
7. User can duplicate all expectations from a previous expectation set.

### Daily Tracking Flow

1. User opens today’s check-in.
2. User sees expectations they have from their partner.
3. User marks whether the partner met each expectation.
4. For every selected status, user can optionally add a note.
5. User can add one simple optional appreciation note for the day.
6. App updates the daily calendar summary.

### Review Flow

1. User opens review summary for the active expectation set.
2. App shows:
   - Total days tracked
   - Most consistently met expectations
   - Expectations needing attention
   - Appreciation notes from the period
   - Day-by-day calendar view
3. App uses qualitative language instead of heavy scoring.

---

## 8. User Roles

### Partner A

A partner in the couple space. Partner A can:

- Add expectations from Partner B.
- View expectations created by Partner B.
- Mark whether Partner B met Partner A’s expectations.
- Add optional notes.
- Add appreciation notes.
- View dashboard, calendar, and summaries.

### Partner B

Same permissions as Partner A.

There are no admin roles in MVP.

---

## 9. Key Concept: Expectation Ownership

If Partner A creates an expectation from Partner B, then Partner A is responsible for marking whether Partner B fulfilled that expectation.

Example:

- Bhagyesh expects his wife to “Wake up early.”
- Bhagyesh marks whether his wife met that expectation each day.
- His wife can see the expectation and the tracking result.

This means the person who has the expectation is responsible for saying whether the partner was up to the mark on that expectation.

---

## 10. Feature Requirements

## 10.1 Authentication

### Description

Users can create an account and log in using email and password.

### Requirements

- User can sign up with:
  - Name
  - Email
  - Password
- User can log in with:
  - Email
  - Password
- Email verification is not required in MVP.
- User remains logged in after refreshing the PWA.
- User can log out.

### Acceptance Criteria

- A new user can create an account successfully.
- A returning user can log in successfully.
- Invalid login shows a friendly error message.
- No email verification is triggered.

---

## 10.2 Couple Space

### Description

A couple space is a shared private workspace for two partners.

### Requirements

First screen after authentication should show two options:

1. Create Couple Space
2. Join Couple Space

### Create Couple Space

- User enters couple space name or uses a default name.
- App generates a unique shared couple code.
- User can copy the couple code.
- Partner uses the code to join.

### Join Couple Space

- User enters couple code.
- App validates the code.
- If valid, user joins the couple space.
- If invalid, app shows a friendly error.

### Constraints

- MVP supports only two users per couple space.
- A user can belong to one couple space in MVP.

### Acceptance Criteria

- User can create a couple space.
- User receives a unique couple code.
- Partner can join using the code.
- Third user cannot join a couple space that already has two members.

---

## 10.3 Expectation Sets

### Description

Expectation sets are list-level groups of expectations created for a selected date range.

Example:

- “May Expectations”
- Start date: May 1
- End date: May 31

### Requirements

- User can create an expectation set at any time of the month.
- User must select:
  - Start date
  - End date
- Date range applies to the entire expectation set.
- User can add expectations under the set.
- User can view active and past expectation sets.
- User can duplicate all expectations from a previous expectation set.

### No Per-Expectation Frequency

Every expectation is available for marking every day during the selected date range.

### Acceptance Criteria

- User can create an expectation set with start and end date.
- User can add multiple expectations to the set.
- User can duplicate all expectations from a previous set.
- Duplicated expectations can be saved into a new date range.
- Active expectation set appears on the dashboard.

---

## 10.4 Expectations

### Description

An expectation is something one partner wants from the other partner.

Examples:

- Wake up early.
- Buy fruits.
- Greet me in the morning and evening.
- Bring flowers.
- Avoid fighting.

### Requirements

Each expectation should include:

- Expectation text
- Created by user
- Expected from partner
- Expectation set ID
- Active status
- Created date

### Visibility

Both partners can see all expectations.

### Acceptance Criteria

- User can add an expectation for the partner.
- Partner can see the expectation.
- User can edit or delete expectations they added.
- App clearly shows who expects what from whom.

---

## 10.5 Daily Check-In

### Description

Daily check-in allows each partner to mark whether the other person met their expectations for that day.

### Requirements

For each expectation, user can select one status:

1. Done
2. Not today
3. Needs discussion
4. Skipped

Each status can include an optional note.

The note should be optional for all statuses, including Done.

### Example

Expectation: “Buy fruits”

Status: Done  
Optional note: “Thank you for bringing mangoes today.”

Status: Not today  
Optional note: “No issue, we can buy tomorrow.”

Status: Needs discussion  
Optional note: “Let’s decide who buys groceries this week.”

### Acceptance Criteria

- User can complete today’s check-in.
- User can select status for each expectation.
- User can add optional note for any status.
- User can update the same day’s check-in before the day ends.
- App stores daily tracking data by date.

---

## 10.6 Appreciation Note

### Description

Each user can add one simple optional appreciation note during the daily check-in.

### Requirements

- Appreciation note is optional.
- Appreciation note is attached to a date and user.
- Both partners can see appreciation notes.
- Appreciation notes appear in review summary.

### Example Prompts

- “Want to appreciate something today?”
- “What made you smile today?”
- “One thing I noticed and liked today…”

### Acceptance Criteria

- User can add appreciation note during daily check-in.
- User can skip appreciation note.
- Appreciation note is visible to both partners.
- Appreciation notes appear in summary.

---

## 10.7 Mobile Dashboard

### Description

The dashboard is the main screen after login.

### Requirements

Dashboard should show:

1. Current active expectation set.
2. Today’s check-in status.
3. Quick access to mark expectations.
4. Compact calendar preview.
5. Individual daily summary for each partner.
6. Recent appreciation note.
7. Streaks or playful progress indicators.

### Calendar Summary Display

The calendar should not occupy too much space. Each day should show compact individual views using small profile pictures and numbers.

Example day cell:

- Bhagyesh profile image + 4/5
- Wife profile image + 5/5

Meaning:

- Bhagyesh marked 4 out of 5 expectations from wife as met.
- Wife marked 5 out of 5 expectations from Bhagyesh as met.

### Acceptance Criteria

- Dashboard is usable on mobile screens.
- User can see today’s tracking status quickly.
- User can access daily check-in within one tap.
- Calendar preview shows both partners’ daily numbers compactly.

---

## 10.8 Calendar View

### Description

Calendar view shows daily consistency across the expectation set date range.

### Requirements

- Calendar displays each day in the selected expectation set range.
- Each day shows both partners’ individual tracking summaries.
- Use compact profile image + count format.
- User can tap a day to see details.

### Day Detail View

When user taps a day, show:

- Expectations tracked by Partner A
- Status selected by Partner A
- Optional notes added by Partner A
- Expectations tracked by Partner B
- Status selected by Partner B
- Optional notes added by Partner B
- Appreciation notes for that day

### Acceptance Criteria

- Calendar shows all days in date range.
- Each day shows both partners’ progress.
- User can open a day and see details.
- Calendar remains mobile-friendly.

---

## 10.9 Review Summary

### Description

Review summary gives a qualitative overview for the selected expectation set duration.

### Requirements

Review summary should include:

1. Total days tracked.
2. Most consistently met expectations.
3. Expectations needing attention.
4. Appreciation notes from the period.
5. Day-by-day calendar view.
6. Gentle qualitative summary.

### Example Qualitative Summary

“Looks like this period had many positive moments. A few expectations came up repeatedly as ‘Not today’ or ‘Needs discussion,’ so they may be worth talking about together.”

### No Heavy Scoring in MVP

The app can show counts such as 4/5 per day, but it should avoid turning the relationship into a harsh scorecard.

### Acceptance Criteria

- User can view summary for an expectation set.
- Summary includes total days tracked.
- Summary identifies consistently met expectations.
- Summary identifies expectations needing attention.
- Summary displays appreciation notes.
- Summary includes day-by-day calendar view.

---

## 10.10 Gamification

### Description

Gamification should make the app feel playful and light without creating pressure.

### MVP Gamification Elements

1. Hearts
2. Streaks
3. Badges
4. Gentle celebration animations

### Example Badges

- “3-Day Check-In Streak”
- “Appreciation Star”
- “Teamwork Moment”
- “Consistency Couple”
- “Kind Note Sent”

### Requirements

- Show celebration animation when both partners complete check-in for the day.
- Show hearts for appreciation moments.
- Show streak when a user completes check-ins for consecutive days.
- Keep badges light and encouraging.

### Acceptance Criteria

- App celebrates completed daily check-ins.
- App shows streaks for repeated check-ins.
- App awards simple badges for positive actions.
- Gamification does not shame users for missed days.

---

## 11. Screens

## 11.1 Welcome Screen

### Purpose

Introduce the app and allow users to start.

### Elements

- App name: Expectations
- Short tagline
- Sign up button
- Login button

### Suggested Tagline

“Clear expectations. More appreciation. Fewer misunderstandings.”

---

## 11.2 Login Screen

### Elements

- Email field
- Password field
- Login button
- Link to sign up
- Friendly error state

---

## 11.3 Sign-Up Screen

### Elements

- Name field
- Email field
- Password field
- Create account button
- Link to login

---

## 11.4 Couple Setup Screen

### Elements

- Create Couple Space button
- Join Couple Space button

---

## 11.5 Create Couple Space Screen

### Elements

- Couple space name
- Create button
- Generated couple code
- Copy code button

---

## 11.6 Join Couple Space Screen

### Elements

- Couple code input
- Join button
- Error state for invalid code

---

## 11.7 Dashboard Screen

### Elements

- Active expectation set
- Today’s check-in CTA
- Compact calendar preview
- Partner profile pictures
- Daily counts
- Recent appreciation
- Streak or badge preview

---

## 11.8 Expectation Set List Screen

### Elements

- Active expectation sets
- Past expectation sets
- Create new expectation set button
- Duplicate previous set option

---

## 11.9 Create Expectation Set Screen

### Elements

- Set name
- Start date
- End date
- Add expectations
- Duplicate all from previous set option
- Save button

---

## 11.10 Daily Check-In Screen

### Elements

- Date
- List of expectations user has from partner
- Status buttons:
  - Done
  - Not today
  - Needs discussion
  - Skipped
- Optional note field for each expectation
- Optional daily appreciation note
- Save check-in button

---

## 11.11 Calendar Screen

### Elements

- Date range selector or expectation set selector
- Calendar grid
- Daily cells with compact profile + count
- Tap day for details

---

## 11.12 Day Detail Screen

### Elements

- Date
- Partner A tracking details
- Partner B tracking details
- Notes
- Appreciation notes

---

## 11.13 Review Summary Screen

### Elements

- Date range
- Total days tracked
- Most consistently met expectations
- Expectations needing attention
- Appreciation notes
- Calendar summary
- Qualitative message

---

## 12. Data Model

## 12.1 User

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "profileImageUrl": "string | null",
  "coupleSpaceId": "string | null",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 12.2 CoupleSpace

```json
{
  "id": "string",
  "name": "string",
  "coupleCode": "string",
  "memberIds": ["string"],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 12.3 ExpectationSet

```json
{
  "id": "string",
  "coupleSpaceId": "string",
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "createdByUserId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 12.4 Expectation

```json
{
  "id": "string",
  "expectationSetId": "string",
  "coupleSpaceId": "string",
  "createdByUserId": "string",
  "expectedFromUserId": "string",
  "text": "string",
  "isActive": true,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 12.5 DailyExpectationStatus

```json
{
  "id": "string",
  "expectationId": "string",
  "expectationSetId": "string",
  "coupleSpaceId": "string",
  "markedByUserId": "string",
  "expectedFromUserId": "string",
  "date": "date",
  "status": "DONE | NOT_TODAY | NEEDS_DISCUSSION | SKIPPED",
  "note": "string | null",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 12.6 AppreciationNote

```json
{
  "id": "string",
  "coupleSpaceId": "string",
  "expectationSetId": "string",
  "createdByUserId": "string",
  "date": "date",
  "note": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 12.7 Badge

```json
{
  "id": "string",
  "coupleSpaceId": "string",
  "userId": "string | null",
  "badgeType": "string",
  "title": "string",
  "description": "string",
  "earnedAt": "datetime"
}
```

---

## 13. Status Definitions

## Done

The partner met the expectation for the day.

User-facing language:

“Done”  
“Nice, this happened today.”

## Not Today

The expectation was not met today, but it does not necessarily mean something is wrong.

User-facing language:

“Not today”  
“Maybe tomorrow.”

## Needs Discussion

The expectation may need a conversation.

User-facing language:

“Needs discussion”  
“Let’s talk about this.”

## Skipped

The expectation is not applicable for the day.

User-facing language:

“Skipped”  
“Not relevant today.”

---

## 14. Business Logic

## 14.1 Daily Count Logic

For each user on each day:

- Numerator = expectations marked as Done.
- Denominator = total active expectations the user has from their partner for that day, excluding Skipped if needed.

Example:

Bhagyesh has 5 expectations from wife.  
He marks 4 as Done and 1 as Not Today.  
Calendar shows Bhagyesh profile + 4/5.

Wife has 5 expectations from Bhagyesh.  
She marks 5 as Done.  
Calendar shows wife profile + 5/5.

## 14.2 Skipped Handling

Recommended MVP rule:

Skipped expectations should not count against the user.

Example:

Total expectations: 5  
Done: 4  
Skipped: 1  
Display: 4/4 or 4/5 depending on product preference.

Recommended display: **4/4 active today** in detail view, but compact calendar can show **4/5** for simplicity. This should be finalized during design.

## 14.3 Completion of Daily Check-In

A daily check-in is considered complete when the user has selected a status for every expectation they are tracking that day.

## 14.4 Celebration Trigger

Show gentle celebration animation when both partners complete their daily check-in.

---

## 15. MVP Success Metrics

Since this is an early personal product, success should focus on habit formation and clarity.

### Suggested Metrics

1. Number of expectation sets created.
2. Number of expectations added.
3. Daily check-in completion rate.
4. Number of appreciation notes added.
5. Number of days both partners completed check-in.
6. Number of duplicated expectation sets.
7. Number of expectations marked as Needs Discussion.

---

## 16. Future Roadmap

## Version 1.1

- Push notifications
- Reminder settings
- Edit past check-ins
- Profile pictures
- Better badge system
- Streak recovery

## Version 1.2

- Expectation approval workflow
- Partner comments on expectations
- Per-expectation frequency
- Custom recurring expectations
- More advanced calendar filters

## Version 2.0

- Couple leaderboard
- Multiple couples
- Social challenges
- Couple comparison badges
- Invite friends

## Version 2.1

- AI-generated qualitative summaries
- AI suggestions for rewriting expectations kindly
- Monthly relationship reflection prompts
- Conflict-sensitive language suggestions

## Version 3.0

- Native mobile apps
- Premium features
- Export monthly relationship report
- Shared memories and milestones

---

## 17. Open Questions

1. Should Skipped expectations be included in the denominator on the compact calendar?
2. Should users be able to edit past daily check-ins in MVP?
3. Should the expectation set allow overlapping date ranges?
4. Should there be only one active expectation set at a time?
5. Should duplicate expectations copy only text or also previous notes/settings?
6. Should appreciation notes be editable or deletable?
7. Should profile pictures be part of MVP or use initials first?

---

## 18. Recommended MVP Build Order

1. Authentication
2. Couple space creation and joining
3. Expectation set creation
4. Add expectations
5. Daily check-in
6. Appreciation note
7. Dashboard
8. Calendar view
9. Review summary
10. Basic gamification

---

## 19. Recommended Tech Direction

### Frontend

- Mobile-first PWA
- React or Next.js
- Responsive UI
- Installable app experience

### Backend

- Node.js / NestJS / Express, or Next.js API routes
- PostgreSQL or Firebase/Supabase
- JWT or session-based auth

### Suggested Fast MVP Stack

- Next.js
- Supabase Auth with email/password
- Supabase Postgres
- Tailwind CSS
- PWA support

This stack is fast for prototyping, supports authentication, database, and hosting-friendly deployment.

---

## 20. One-Line Product Summary

Expectations is a playful mobile-first PWA for married couples to make expectations clear, track them daily, appreciate each other, and review consistency without turning the relationship into a harsh scorecard.
