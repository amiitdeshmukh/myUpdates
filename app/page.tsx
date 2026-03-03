"use client";

import { useEffect, useMemo, useState } from "react";

import { COURSE_PHASES } from "@/lib/course";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { DigestPayload } from "@/lib/types";

type TabKey = "digest" | "quiz";
type ProgressByPhase = Record<number, number>;

const PHASE_PROGRESS_KEY = "dev-edge-phase-progress-v2";
const PHASE_SELECTION_KEY = "dev-edge-selected-phase-v2";

type ProgressRow = {
  phase_id: number;
  best_score: number;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("digest");

  const [digest, setDigest] = useState<DigestPayload | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(true);
  const [digestStatus, setDigestStatus] = useState("");

  const [selectedPhase, setSelectedPhase] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizStatus, setQuizStatus] = useState<string>("");
  const [progressByPhase, setProgressByPhase] = useState<ProgressByPhase>({});
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const readLocalProgress = (): ProgressByPhase => {
    const raw = localStorage.getItem(PHASE_PROGRESS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as ProgressByPhase;
    } catch {
      return {};
    }
  };

  const writeLocalProgress = (progress: ProgressByPhase) => {
    localStorage.setItem(PHASE_PROGRESS_KEY, JSON.stringify(progress));
    setProgressByPhase(progress);
  };

  const loadCloudProgress = async (uid: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("phase_progress")
      .select("phase_id,best_score")
      .eq("user_id", uid);

    if (error) {
      setSyncStatus(`Cloud load failed: ${error.message}`);
      return;
    }

    const mapped: ProgressByPhase = {};
    (data as ProgressRow[]).forEach((row) => {
      mapped[row.phase_id] = row.best_score;
    });
    writeLocalProgress(mapped);
    setSyncStatus("Cloud progress synced.");
  };

  const mergeLocalProgressToCloud = async (uid: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const local = readLocalProgress();
    if (Object.keys(local).length === 0) return;

    const { data: existing, error: existingErr } = await supabase
      .from("phase_progress")
      .select("phase_id,best_score")
      .eq("user_id", uid);
    if (existingErr) {
      setSyncStatus(`Cloud merge failed: ${existingErr.message}`);
      return;
    }

    const existingByPhase = new Map<number, number>();
    (existing as ProgressRow[]).forEach((row) => existingByPhase.set(row.phase_id, row.best_score));

    const rows = Object.entries(local).map(([phaseId, localBest]) => {
      const pid = Number(phaseId);
      const cloudBest = existingByPhase.get(pid) ?? 0;
      const best = Math.max(cloudBest, localBest);
      return {
        user_id: uid,
        phase_id: pid,
        best_score: best,
        last_score: localBest,
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase.from("phase_progress").upsert(rows, {
      onConflict: "user_id,phase_id"
    });
    if (error) {
      setSyncStatus(`Cloud merge failed: ${error.message}`);
    }
  };

  const loadDigest = async () => {
    setLoadingDigest(true);
    setDigestStatus("");
    try {
      const res = await fetch("/api/digest", { cache: "no-store" });
      const data = (await res.json()) as DigestPayload;
      if (!res.ok) {
        setDigestStatus("Failed to fetch digest.");
        return;
      }
      setDigest(data);
    } catch {
      setDigestStatus("Failed to fetch digest.");
    } finally {
      setLoadingDigest(false);
    }
  };

  useEffect(() => {
    void loadDigest();
  }, []);

  useEffect(() => {
    const savedProgress = readLocalProgress();
    const savedPhase = localStorage.getItem(PHASE_SELECTION_KEY);

    setProgressByPhase(savedProgress);

    if (savedPhase) {
      const parsed = Number(savedPhase);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= COURSE_PHASES.length) {
        setSelectedPhase(parsed);
      }
    }
    if (!supabaseConfigured) {
      setSyncStatus("Cloud sync not configured. Progress stays on this browser only.");
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);
      await mergeLocalProgressToCloud(session.user.id);
      await loadCloudProgress(session.user.id);
    };

    void syncSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserId(null);
        setUserEmail(null);
        setSyncStatus("Signed out. Using local browser progress.");
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);
      void mergeLocalProgressToCloud(session.user.id).then(() =>
        loadCloudProgress(session.user.id)
      );
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const sendReminder = async () => {
    setDigestStatus("Sending reminder email...");
    try {
      const res = await fetch("/api/reminder", { method: "POST" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setDigestStatus(`Email failed: ${payload.error ?? "unknown error"}`);
        return;
      }
      setDigestStatus("Reminder email sent.");
    } catch {
      setDigestStatus("Email failed.");
    }
  };

  const phase = useMemo(
    () => COURSE_PHASES.find((p) => p.id === selectedPhase) ?? COURSE_PHASES[0],
    [selectedPhase]
  );

  const completedPhases = useMemo(
    () => Object.values(progressByPhase).filter((score) => score > 0).length,
    [progressByPhase]
  );

  useEffect(() => {
    setAnswers({});
    setQuizStatus("");
    localStorage.setItem(PHASE_SELECTION_KEY, String(selectedPhase));
  }, [selectedPhase]);

  const score = phase.quiz.reduce(
    (sum, q, idx) => (answers[idx] === q.answerIndex ? sum + 1 : sum),
    0
  );

  const checkQuiz = () => {
    if (Object.keys(answers).length < phase.quiz.length) {
      setQuizStatus("Answer all quiz questions first.");
      return;
    }

    const currentBest = progressByPhase[phase.id] ?? 0;
    const next = { ...progressByPhase, [phase.id]: Math.max(currentBest, score) };
    writeLocalProgress(next);

    if (userId) {
      const supabase = getSupabaseBrowser();
      if (supabase) {
        void supabase.from("phase_progress").upsert(
          {
            user_id: userId,
            phase_id: phase.id,
            best_score: next[phase.id],
            last_score: score,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id,phase_id" }
        );
      }
    }
    setQuizStatus(`Score ${score}/${phase.quiz.length}`);
  };

  const signInWithPassword = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setAuthStatus("Supabase env is missing.");
      return;
    }
    if (!authEmail.trim() || !authPassword) {
      setAuthStatus("Enter both email and password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword
    });
    if (error) {
      setAuthStatus(`Sign in failed: ${error.message}`);
      return;
    }
    setAuthStatus("Signed in successfully.");
  };

  const signUpWithPassword = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setAuthStatus("Supabase env is missing.");
      return;
    }
    if (!authEmail.trim() || !authPassword) {
      setAuthStatus("Enter both email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPassword
    });
    if (error) {
      setAuthStatus(`Sign up failed: ${error.message}`);
      return;
    }

    if (data.session) {
      setAuthStatus("Account created and signed in.");
      return;
    }
    setAuthStatus("Account created. Check your email if confirmation is enabled.");
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthStatus("Signed out.");
  };

  return (
    <main className="container">
      <h1 className="title">Dev Edge Coach</h1>
      <p className="subtitle">
        Tab 1 for daily digest + new skills. Tab 2 for AI quiz by phase.
      </p>

      <section className="panel">
        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "digest" ? "tab-btn-active" : ""}`}
            onClick={() => setActiveTab("digest")}
          >
            1. Digest + New Skills to Learn
          </button>
          <button
            className={`tab-btn ${activeTab === "quiz" ? "tab-btn-active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            2. AI Quiz
          </button>
        </div>
      </section>

      {activeTab === "digest" && (
        <>
          <section className="panel">
            <h2>Important Updates {digest && <span className="badge">Top {digest.topUpdates.length}</span>}</h2>
            {loadingDigest && <p>Loading latest updates...</p>}
            {!loadingDigest && digest?.topUpdates.length === 0 && <p>No updates found right now.</p>}
            {!loadingDigest &&
              digest?.topUpdates.map((item) => (
                <article key={item.link} className="item">
                  <p>
                    <strong>{item.title}</strong>
                  </p>
                  <p>{item.shortSummary}</p>
                  <p>
                    Source: {item.source} | <a href={item.link}>Reference Link</a>
                  </p>
                </article>
              ))}
          </section>

          <section className="panel">
            <h2>New Skills To Learn</h2>
            <h3>Topics</h3>
            <ol>{digest?.learning.topics.map((topic) => <li key={topic}>{topic}</li>)}</ol>
            <h3>Today&apos;s Tasks</h3>
            <ol>{digest?.learning.tasks.map((task) => <li key={task}>{task}</li>)}</ol>
            <h3>Practice Questions</h3>
            <ol>{digest?.learning.questions.map((q) => <li key={q}>{q}</li>)}</ol>
          </section>

          <div className="cta">
            <button onClick={() => void loadDigest()} disabled={loadingDigest}>
              Refresh Digest
            </button>
            <button className="secondary" onClick={() => void sendReminder()}>
              Send Today&apos;s Reminder Email
            </button>
          </div>
          <p className="status">{digestStatus}</p>
        </>
      )}

      {activeTab === "quiz" && (
        <>
          <section className="panel">
            <h2>Phase Navigator</h2>
            <p className="status">
              {syncStatus} Completed phases: {completedPhases}/{COURSE_PHASES.length}
            </p>
            <div className="auth-row">
              {!supabaseConfigured && <p>Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</p>}
              {supabaseConfigured && !userId && (
                <>
                  <input
                    className="email-input"
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <input
                    className="email-input"
                    type="password"
                    placeholder="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                  <button onClick={() => void signInWithPassword()}>Sign In</button>
                  <button className="secondary" onClick={() => void signUpWithPassword()}>
                    Sign Up
                  </button>
                </>
              )}
              {supabaseConfigured && userId && (
                <>
                  <p>Signed in: {userEmail ?? "unknown"}</p>
                  <button className="secondary" onClick={() => void signOut()}>
                    Sign Out
                  </button>
                </>
              )}
            </div>
            <p className="status">{authStatus}</p>
            <div className="phase-grid">
              {COURSE_PHASES.map((p) => {
                const best = progressByPhase[p.id];
                return (
                  <button
                    key={p.id}
                    className={`phase-btn ${selectedPhase === p.id ? "phase-btn-active" : ""}`}
                    onClick={() => setSelectedPhase(p.id)}
                  >
                    Phase {p.id}
                    {typeof best === "number" ? ` (Best: ${best}/15)` : ""}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <h2>
              Phase {phase.id}: {phase.title}
            </h2>
            <>
              <p>
                <strong>Duration:</strong> {phase.duration}
              </p>
              <p>
                <strong>Why this phase:</strong> {phase.whyItMatters}
              </p>

              <h3>Expected Outcomes</h3>
              <ol>{phase.outcomes.map((o) => <li key={o}>{o}</li>)}</ol>

              <h3>Tasks (Do these this week)</h3>
              <ol>{phase.tasks.map((t) => <li key={t}>{t}</li>)}</ol>

              <h3>Exact Prompts for Online AI Tutors</h3>
              <p>Copy these exactly and use in ChatGPT/Gemini/Claude with your own follow-up questions.</p>
              {phase.prompts.map((prompt, idx) => (
                <article key={prompt} className="prompt-card">
                  <p>
                    <strong>Prompt {idx + 1}</strong>
                  </p>
                  <pre>{prompt}</pre>
                </article>
              ))}

              <h3>Phase Quiz ({phase.quiz.length} questions)</h3>
              {phase.quiz.map((q, idx) => (
                <article key={q.question} className="quiz-card">
                  <p>
                    <strong>
                      Q{idx + 1}. {q.question}
                    </strong>
                  </p>
                  <div className="options">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={`${q.question}-${optIdx}`}
                        className={`option-btn ${answers[idx] === optIdx ? "selected" : ""}`}
                        onClick={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    ))}
                  </div>
                  {quizStatus.startsWith("Score") ? (
                    <p className="result">
                      Correct answer: {String.fromCharCode(65 + q.answerIndex)}. {q.explanation}
                    </p>
                  ) : null}
                </article>
              ))}

              <div className="cta">
                <button onClick={checkQuiz}>Check Answers</button>
              </div>
              <p className="status">{quizStatus}</p>
            </>
          </section>
        </>
      )}
    </main>
  );
}
