export type User = {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  coupleSpaceId?: string | null;
};

export type CoupleSpace = {
  id: string;
  name: string;
  coupleCode: string;
  members: User[];
};

export type ExpectationSet = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  expectations: Expectation[];
};

export type Expectation = {
  id: string;
  expectationSetId: string;
  createdByUserId: string;
  expectedFromUserId: string;
  text: string;
  isActive: boolean;
  createdBy?: Pick<User, "id" | "name">;
  expectedFrom?: Pick<User, "id" | "name">;
  dailyStatuses?: DailyExpectationStatus[];
};

export type DailyStatus = "DONE" | "NOT_TODAY" | "NEEDS_DISCUSSION" | "SKIPPED";

export type DailyExpectationStatus = {
  id: string;
  expectationId: string;
  markedByUserId: string;
  expectedFromUserId: string;
  date: string;
  status: DailyStatus;
  note: string | null;
  expectation?: Expectation;
  markedBy?: Pick<User, "id" | "name">;
  expectedFrom?: Pick<User, "id" | "name">;
};

export type AppreciationNote = {
  id: string;
  date: string;
  note: string;
  createdBy: Pick<User, "id" | "name">;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  badgeType: string;
  earnedAt: string;
};

export type DashboardResponse = {
  needsCoupleSpace?: boolean;
  coupleSpace?: CoupleSpace;
  activeSet?: ExpectationSet | null;
  todaySummary?: DaySummary;
  calendarPreview?: DaySummary[];
  checkInStatus?: { completed: boolean; marked: number; total: number };
  recentAppreciation?: AppreciationNote | null;
  appreciationNotes?: AppreciationNote[];
  badges?: Badge[];
};

export type DaySummary = {
  date: string;
  summaries: Array<{
    user: User;
    done: number;
    total: number;
    completed: boolean;
  }>;
};

export type ReviewResponse = {
  expectationSet: ExpectationSet;
  totalDaysTracked: number;
  totalDaysInRange: number;
  mostConsistent: Array<{ expectation: Expectation; done: number; tracked: number }>;
  needsAttention: Array<{ expectation: Expectation; attention: number; tracked: number }>;
  appreciationNotes: AppreciationNote[];
  dayByDay: Array<{ date: string; statuses: DailyExpectationStatus[] }>;
  qualitativeSummary: string;
};
