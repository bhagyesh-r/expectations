import type { DashboardResponse, DailyStatus, ReviewResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "expectations_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Something went wrong." }));
    throw new Error(body.message ?? "Something went wrong.");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  signUp: (body: { name: string; email: string; password: string }) =>
    request<{ user: unknown; token: string }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ user: unknown; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<{ user: unknown }>("/auth/me"),
  myCoupleSpace: () => request<{ coupleSpace: unknown }>("/couple-spaces/mine"),
  createCoupleSpace: (body: { name: string }) =>
    request<{ coupleSpace: unknown }>("/couple-spaces", { method: "POST", body: JSON.stringify(body) }),
  joinCoupleSpace: (body: { coupleCode: string }) =>
    request<{ coupleSpace: unknown }>("/couple-spaces/join", { method: "POST", body: JSON.stringify(body) }),
  expectationSets: () =>
    request<{ active: unknown[]; past: unknown[]; upcoming: unknown[]; sets: unknown[] }>("/expectation-sets"),
  createExpectationSet: (body: { name: string; startDate: string; endDate: string; duplicateFromSetId?: string }) =>
    request<{ expectationSet: unknown }>("/expectation-sets", { method: "POST", body: JSON.stringify(body) }),
  createExpectation: (body: { expectationSetId: string; expectedFromUserId: string; text: string }) =>
    request<{ expectation: unknown }>("/expectations", { method: "POST", body: JSON.stringify(body) }),
  updateExpectation: (id: string, body: { text?: string; isActive?: boolean }) =>
    request<{ expectation: unknown }>(`/expectations/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  dashboard: () => request<DashboardResponse>("/dashboard"),
  checkIn: (expectationSetId: string, date: string) =>
    request<{ expectations: unknown[]; appreciationNote: unknown }>(`/check-ins/${expectationSetId}/${date}`),
  saveCheckIn: (body: {
    expectationSetId: string;
    date: string;
    statuses: Array<{ expectationId: string; status: DailyStatus; note?: string | null }>;
    appreciationNote?: string | null;
  }) => request<unknown>("/check-ins", { method: "PUT", body: JSON.stringify(body) }),
  dayDetails: (expectationSetId: string, date: string) =>
    request<{ details: unknown[]; appreciationNotes: unknown[] }>(`/dashboard/day/${expectationSetId}/${date}`),
  review: (expectationSetId: string) => request<ReviewResponse>(`/reviews/${expectationSetId}`)
};
