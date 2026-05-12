import { addDays, format, formatISO, parseISO } from "date-fns";
import { CalendarDays, Clipboard, Heart, Home, ListChecks, LogOut, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api, setToken } from "./api/client";
import type {
  AppreciationNote,
  CoupleSpace,
  DailyExpectationStatus,
  DashboardResponse,
  DailyStatus,
  Expectation,
  ExpectationSet,
  ReviewResponse,
  User
} from "./api/types";
import { Button } from "./components/Button";
import { Field } from "./components/Field";
import { InitialAvatar } from "./components/InitialAvatar";

type View = "dashboard" | "sets" | "checkin" | "calendar" | "review";
type AuthMode = "welcome" | "login" | "signup";

const today = () => formatISO(new Date(), { representation: "date" });
const statuses: Array<{ value: DailyStatus; label: string; hint: string }> = [
  { value: "DONE", label: "Done", hint: "Nice, this happened today." },
  { value: "NOT_TODAY", label: "Not today", hint: "Maybe tomorrow." },
  { value: "NEEDS_DISCUSSION", label: "Needs discussion", hint: "Let’s talk about this." },
  { value: "SKIPPED", label: "Skipped", hint: "Not relevant today." }
];

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("welcome");
  const [view, setView] = useState<View>("dashboard");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    const [me, data] = await Promise.all([api.me(), api.dashboard()]);
    setUser(me.user as User);
    setDashboard(data);
  }

  useEffect(() => {
    refresh()
      .catch(() => {
        setUser(null);
        setDashboard(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    setToken(null);
    setUser(null);
    setDashboard(null);
    setAuthMode("welcome");
  }

  if (loading) {
    return (
      <Shell>
        <div className="panel">Loading your couple space...</div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <AuthScreen
          mode={authMode}
          setMode={setAuthMode}
          onAuthed={async (token) => {
            setToken(token);
            await refresh();
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell user={user} onLogout={logout}>
      {error ? <p className="error">{error}</p> : null}
      {dashboard?.needsCoupleSpace ? (
        <CoupleSetup onUpdated={refresh} />
      ) : (
        <>
          {view === "dashboard" ? <Dashboard data={dashboard} setView={setView} /> : null}
          {view === "sets" ? (
            <ExpectationSets user={user} coupleSpace={dashboard?.coupleSpace} onUpdated={refresh} />
          ) : null}
          {view === "checkin" ? <CheckIn activeSet={dashboard?.activeSet ?? null} onUpdated={refresh} /> : null}
          {view === "calendar" ? <CalendarView data={dashboard} /> : null}
          {view === "review" ? <Review activeSet={dashboard?.activeSet ?? null} /> : null}
          <BottomNav view={view} setView={setView} />
        </>
      )}
    </Shell>
  );
}

function Shell({ children, user, onLogout }: { children: React.ReactNode; user?: User | null; onLogout?: () => void }) {
  return (
    <main className="app-shell">
      <div className="mobile-frame">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">♥</span> Expectations
          </div>
          {user ? (
            <Button variant="ghost" onClick={onLogout} aria-label="Log out">
              <LogOut size={18} />
            </Button>
          ) : null}
        </header>
        {children}
      </div>
    </main>
  );
}

function AuthScreen({
  mode,
  setMode,
  onAuthed
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onAuthed: (token: string) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (mode === "welcome") {
    return (
      <section className="hero">
        <div>
          <h1>Clear expectations. More appreciation.</h1>
          <p className="muted">
            A playful private space for daily check-ins, kind notes, and gentle consistency patterns.
          </p>
        </div>
        <div className="stack">
          <Button onClick={() => setMode("signup")}>Create account</Button>
          <Button variant="secondary" onClick={() => setMode("login")}>
            Log in
          </Button>
        </div>
      </section>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result =
        mode === "signup" ? await api.signUp(form) : await api.login({ email: form.email, password: form.password });
      await onAuthed(result.token);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      <div>
        <h1>{mode === "signup" ? "Create account" : "Welcome back"}</h1>
        <p className="muted">No email verification needed for this MVP.</p>
      </div>
      {mode === "signup" ? (
        <Field
          label="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
      ) : null}
      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        required
      />
      <Field
        label="Password"
        type="password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        required
        minLength={8}
      />
      {error ? <p className="error">{error}</p> : null}
      <Button disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}</Button>
      <Button type="button" variant="ghost" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
        {mode === "signup" ? "I already have an account" : "Create a new account"}
      </Button>
    </form>
  );
}

function CoupleSetup({ onUpdated }: { onUpdated: () => Promise<void> }) {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [name, setName] = useState("Our Couple Space");
  const [code, setCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [error, setError] = useState("");

  async function create() {
    setError("");
    try {
      const result = await api.createCoupleSpace({ name });
      const coupleSpace = result.coupleSpace as CoupleSpace;
      setCreatedCode(coupleSpace.coupleCode);
      await onUpdated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    }
  }

  async function join() {
    setError("");
    try {
      await api.joinCoupleSpace({ coupleCode: code });
      await onUpdated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    }
  }

  return (
    <section className="panel stack">
      <h1>Couple space</h1>
      <p className="muted">Create a private space or join your partner with a shared code.</p>
      {error ? <p className="error">{error}</p> : null}
      {createdCode ? (
        <div className="success stack">
          <p>
            Couple code: <strong>{createdCode}</strong>
          </p>
          <div className="cluster">
            <Button type="button" variant="secondary" onClick={() => navigator.clipboard?.writeText(createdCode)}>
              <Clipboard size={18} />
              Copy code
            </Button>
            <Button type="button" onClick={onUpdated}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}
      {mode === "choice" ? (
        <div className="stack">
          <Button onClick={() => setMode("create")}>
            <Plus size={18} />
            Create Couple Space
          </Button>
          <Button variant="secondary" onClick={() => setMode("join")}>
            <Clipboard size={18} />
            Join Couple Space
          </Button>
        </div>
      ) : null}
      {mode === "create" ? (
        <div className="stack">
          <Field label="Couple space name" value={name} onChange={(event) => setName(event.target.value)} />
          <Button onClick={create}>Create</Button>
        </div>
      ) : null}
      {mode === "join" ? (
        <div className="stack">
          <Field label="Couple code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} />
          <Button onClick={join}>Join</Button>
        </div>
      ) : null}
    </section>
  );
}

function Dashboard({ data, setView }: { data: DashboardResponse | null; setView: (view: View) => void }) {
  if (!data?.activeSet) {
    return (
      <section className="stack">
        <div className="panel stack">
          <h1>Start with a set</h1>
          <p className="muted">Create a date-based expectation set, then add expectations for your partner.</p>
          <Button onClick={() => setView("sets")}>Create expectation set</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="panel stack">
        <div className="split">
          <div>
            <h1>{data.activeSet.name}</h1>
            <p className="muted">
              {format(parseISO(data.activeSet.startDate), "MMM d")} to{" "}
              {format(parseISO(data.activeSet.endDate), "MMM d")}
            </p>
          </div>
          <Heart color="#e84a5f" />
        </div>
        <div className="card split">
          <div>
            <strong>Today’s check-in</strong>
            <p className="muted">
              {data.checkInStatus?.marked ?? 0}/{data.checkInStatus?.total ?? 0} selected
            </p>
          </div>
          <Button onClick={() => setView("checkin")}>Mark</Button>
        </div>
      </div>
      <CalendarStrip days={data.calendarPreview ?? []} />
      <section className="card">
        <h2>Recent appreciation</h2>
        {data.recentAppreciation ? (
          <p>{data.recentAppreciation.note}</p>
        ) : (
          <p className="muted">Add one thing you noticed and liked today.</p>
        )}
      </section>
      <section className="card">
        <h2>Playful progress</h2>
        <div className="cluster">
          {(data.badges ?? []).length ? (
            data.badges?.map((badge) => (
              <span className="success" key={badge.id}>
                ✨ {badge.title}
              </span>
            ))
          ) : (
            <span className="muted">Badges appear after check-ins and appreciation notes.</span>
          )}
        </div>
      </section>
    </section>
  );
}

function ExpectationSets({
  user,
  coupleSpace,
  onUpdated
}: {
  user: User;
  coupleSpace?: CoupleSpace;
  onUpdated: () => Promise<void>;
}) {
  const [sets, setSets] = useState<ExpectationSet[]>([]);
  const [form, setForm] = useState({
    name: "This Month’s Expectations",
    startDate: today(),
    endDate: formatISO(addDays(new Date(), 30), { representation: "date" }),
    duplicateFromSetId: ""
  });
  const [newTexts, setNewTexts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function load() {
    const result = await api.expectationSets();
    setSets(result.sets as ExpectationSet[]);
  }

  useEffect(() => {
    load().catch((caught) => setError(caught instanceof Error ? caught.message : "Please try again."));
  }, []);

  const partner = coupleSpace?.members?.find((member) => member.id !== user.id);

  async function createSet(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.createExpectationSet({ ...form, duplicateFromSetId: form.duplicateFromSetId || undefined });
      setForm({ ...form, name: "" });
      await load();
      await onUpdated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    }
  }

  async function addExpectation(set: ExpectationSet) {
    if (!partner || !newTexts[set.id]) return;
    await api.createExpectation({ expectationSetId: set.id, expectedFromUserId: partner.id, text: newTexts[set.id] });
    setNewTexts({ ...newTexts, [set.id]: "" });
    await load();
    await onUpdated();
  }

  async function updateExpectation(expectation: Expectation, text: string) {
    await api.updateExpectation(expectation.id, { text });
    await load();
    await onUpdated();
  }

  async function deleteExpectation(expectation: Expectation) {
    await api.updateExpectation(expectation.id, { isActive: false });
    await load();
    await onUpdated();
  }

  return (
    <section className="stack">
      <form className="panel stack" onSubmit={createSet}>
        <h1>Expectation sets</h1>
        <Field
          label="Set name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <Field
          label="Start date"
          type="date"
          value={form.startDate}
          onChange={(event) => setForm({ ...form, startDate: event.target.value })}
          required
        />
        <Field
          label="End date"
          type="date"
          value={form.endDate}
          onChange={(event) => setForm({ ...form, endDate: event.target.value })}
          required
        />
        <label className="field">
          <span>Duplicate from previous set</span>
          <select
            value={form.duplicateFromSetId}
            onChange={(event) => setForm({ ...form, duplicateFromSetId: event.target.value })}
          >
            <option value="">Start fresh</option>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="error">{error}</p> : null}
        <Button>Create set</Button>
      </form>
      {sets.map((set) => (
        <article className="card stack" key={set.id}>
          <div>
            <h2>{set.name}</h2>
            <p className="muted">
              {format(parseISO(set.startDate), "MMM d")} to {format(parseISO(set.endDate), "MMM d")}
            </p>
          </div>
          {(set.expectations ?? []).map((expectation) => (
            <div className="expectation-row" key={expectation.id}>
              <p>
                <strong>{expectation.createdBy?.name}</strong> expects <strong>{expectation.expectedFrom?.name}</strong>{" "}
                to {expectation.text}
              </p>
              {expectation.createdByUserId === user.id ? (
                <div className="cluster">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const text = window.prompt("Update expectation", expectation.text);
                      if (text?.trim()) void updateExpectation(expectation, text.trim());
                    }}
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => deleteExpectation(expectation)}>
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          <div className="cluster">
            <input
              placeholder="Add expectation for partner"
              value={newTexts[set.id] ?? ""}
              onChange={(event) => setNewTexts({ ...newTexts, [set.id]: event.target.value })}
            />
            <Button type="button" onClick={() => addExpectation(set)}>
              Add
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}

function CheckIn({ activeSet, onUpdated }: { activeSet: ExpectationSet | null; onUpdated: () => Promise<void> }) {
  const [expectations, setExpectations] = useState<Expectation[]>([]);
  const [selected, setSelected] = useState<Record<string, { status: DailyStatus; note: string }>>({});
  const [appreciationNote, setAppreciationNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!activeSet) return;
    api.checkIn(activeSet.id, today()).then((result) => {
      const loaded = result.expectations as Expectation[];
      setExpectations(loaded);
      const next: Record<string, { status: DailyStatus; note: string }> = {};
      loaded.forEach((expectation) => {
        const saved = expectation.dailyStatuses?.[0];
        if (saved) next[expectation.id] = { status: saved.status, note: saved.note ?? "" };
      });
      setSelected(next);
      setAppreciationNote((result.appreciationNote as { note?: string } | null)?.note ?? "");
    });
  }, [activeSet]);

  if (!activeSet) return <Empty title="No active set" body="Create an expectation set before starting check-ins." />;

  async function save() {
    await api.saveCheckIn({
      expectationSetId: activeSet!.id,
      date: today(),
      statuses: expectations.map((expectation) => ({
        expectationId: expectation.id,
        status: selected[expectation.id]?.status,
        note: selected[expectation.id]?.note
      })),
      appreciationNote: appreciationNote || null
    });
    setMessage("Saved. Nice, this check-in happened today.");
    await onUpdated();
  }

  return (
    <section className="stack">
      <div className="panel">
        <h1>Today’s check-in</h1>
        <p className="muted">{format(new Date(), "EEEE, MMM d")}</p>
      </div>
      {expectations.map((expectation) => (
        <article className="card stack" key={expectation.id}>
          <h2>{expectation.text}</h2>
          <p className="muted">For {expectation.expectedFrom?.name}</p>
          <div className="status-grid">
            {statuses.map((status) => (
              <button
                className={`button button-ghost ${selected[expectation.id]?.status === status.value ? "selected" : ""}`}
                key={status.value}
                onClick={() =>
                  setSelected({
                    ...selected,
                    [expectation.id]: { status: status.value, note: selected[expectation.id]?.note ?? "" }
                  })
                }
              >
                {status.label}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Optional note"
            value={selected[expectation.id]?.note ?? ""}
            onChange={(event) =>
              setSelected({
                ...selected,
                [expectation.id]: { status: selected[expectation.id]?.status ?? "DONE", note: event.target.value }
              })
            }
          />
        </article>
      ))}
      <section className="card stack">
        <h2>Appreciation</h2>
        <textarea
          placeholder="What made you smile today?"
          value={appreciationNote}
          onChange={(event) => setAppreciationNote(event.target.value)}
        />
      </section>
      {message ? <p className="success">{message}</p> : null}
      <Button onClick={save} disabled={expectations.some((expectation) => !selected[expectation.id]?.status)}>
        Save check-in
      </Button>
    </section>
  );
}

function CalendarView({ data }: { data: DashboardResponse | null }) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [details, setDetails] = useState<DailyExpectationStatus[]>([]);
  const [notes, setNotes] = useState<AppreciationNote[]>([]);

  async function openDay(date: string) {
    if (!data?.activeSet) return;
    setSelectedDay(date);
    const result = await api.dayDetails(data.activeSet.id, date);
    setDetails(result.details as DailyExpectationStatus[]);
    setNotes(result.appreciationNotes as AppreciationNote[]);
  }

  if (!data?.calendarPreview?.length)
    return <Empty title="No calendar yet" body="Create an active set and save check-ins to see daily patterns." />;
  return (
    <section className="stack">
      <div className="panel">
        <h1>Calendar</h1>
        <p className="muted">Compact daily counts for both partners.</p>
      </div>
      <CalendarStrip days={data.calendarPreview} full onSelectDay={openDay} />
      {selectedDay ? (
        <section className="card stack">
          <h2>{format(parseISO(selectedDay), "MMM d")} details</h2>
          {details.length ? (
            details.map((detail) => (
              <p key={detail.id}>
                <strong>{detail.markedBy?.name}</strong> marked “{detail.expectation?.text}” as{" "}
                {statusLabel(detail.status)}
                {detail.note ? `: ${detail.note}` : ""}
              </p>
            ))
          ) : (
            <p className="muted">No check-in details for this day yet.</p>
          )}
          {notes.map((note) => (
            <p key={note.id}>
              ♥ <strong>{note.createdBy.name}</strong>: {note.note}
            </p>
          ))}
        </section>
      ) : null}
    </section>
  );
}

function Review({ activeSet }: { activeSet: ExpectationSet | null }) {
  const [review, setReview] = useState<ReviewResponse | null>(null);

  useEffect(() => {
    if (!activeSet) return;
    api.review(activeSet.id).then(setReview);
  }, [activeSet]);

  if (!activeSet) return <Empty title="No review yet" body="Create an active set to review consistency patterns." />;
  if (!review) return <div className="panel">Loading summary...</div>;

  return (
    <section className="stack">
      <div className="panel">
        <h1>Review</h1>
        <p className="muted">{review.qualitativeSummary}</p>
      </div>
      <div className="card">
        <h2>Total days tracked</h2>
        <p>
          {review.totalDaysTracked} of {review.totalDaysInRange}
        </p>
      </div>
      <SummaryList
        title="Most consistent"
        items={review.mostConsistent.map((item) => `${item.expectation.text}: ${item.done}/${item.tracked}`)}
      />
      <SummaryList
        title="Needs attention"
        items={review.needsAttention.map((item) => `${item.expectation.text}: ${item.attention} moments`)}
      />
      <SummaryList
        title="Appreciation notes"
        items={review.appreciationNotes.map((note) => `${note.createdBy.name}: ${note.note}`)}
      />
      <SummaryList
        title="Day by day"
        items={review.dayByDay.map((day) => `${format(parseISO(day.date), "MMM d")}: ${day.statuses.length} updates`)}
      />
    </section>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p className="muted">Nothing to show yet.</p>}
    </section>
  );
}

function CalendarStrip({
  days,
  full = false,
  onSelectDay
}: {
  days: NonNullable<DashboardResponse["calendarPreview"]>;
  full?: boolean;
  onSelectDay?: (date: string) => void;
}) {
  return (
    <section className={full ? "calendar-grid" : "card calendar-grid"}>
      {days.map((day) => (
        <button className="day-cell" key={day.date} onClick={() => onSelectDay?.(day.date)}>
          <span className="day-number">{format(parseISO(day.date), "d")}</span>
          {day.summaries.map((summary) => (
            <span className="mini-count" key={summary.user.id}>
              <InitialAvatar name={summary.user.name} /> {summary.done}/{summary.total}
            </span>
          ))}
        </button>
      ))}
    </section>
  );
}

function statusLabel(status: DailyStatus) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function BottomNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  const items: Array<{ view: View; icon: React.ReactNode; label: string }> = [
    { view: "dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { view: "sets", icon: <ListChecks size={18} />, label: "Sets" },
    { view: "checkin", icon: <Heart size={18} />, label: "Check-in" },
    { view: "calendar", icon: <CalendarDays size={18} />, label: "Calendar" },
    { view: "review", icon: <Sparkles size={18} />, label: "Review" }
  ];

  return (
    <nav className="nav" aria-label="Primary">
      {items.map((item) => (
        <button
          className={view === item.view ? "active" : ""}
          key={item.view}
          onClick={() => setView(item.view)}
          aria-label={item.label}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <section className="empty">
      <h1>{title}</h1>
      <p className="muted">{body}</p>
    </section>
  );
}
