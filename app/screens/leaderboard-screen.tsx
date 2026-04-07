"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FriendsLeaderboardPanel } from "../components/friends-leaderboard-panel";
import { useAuth } from "../lib/auth-context";
import {
  getServerCourseProgressSnapshot,
  getStoredCourseProgress,
  subscribeToCourseProgress,
} from "../lib/course-progress";
import {
  getNickname,
  subscribeToCourseStorage,
} from "../lib/course-storage";
import {
  fetchLeaderboard,
  fetchLeaderboardEntryForUser,
  type LeaderboardEntry,
} from "../lib/leaderboard";
import {
  leaderboardRefreshEventName,
  serializeRemoteProgressError,
  syncCurrentUserProgressIfAuthenticated,
} from "../lib/remote-progress";

function StokedLogo() {
  return (
    <Link href="/" className="alpine-brand-link">
      <span className="alpine-brand-link__word">stoked</span>
      <span className="alpine-brand-link__dot" />
    </Link>
  );
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function LeaderboardScreen() {
  const { loading: authLoading, signInWithGoogle, user } = useAuth();
  const localNickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const storedProgress = useSyncExternalStore(
    subscribeToCourseProgress,
    getStoredCourseProgress,
    getServerCourseProgressSnapshot,
  );
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<"global" | "friends">("global");

  useEffect(() => {
    let active = true;

    if (!user) {
      setEntries([]);
      setCurrentUserEntry(null);
      setLoading(false);
      setErrorMessage(null);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setErrorMessage(null);

    const load = async () => {
      try {
        let [nextEntries, nextCurrentUserEntry] = await Promise.all([
          fetchLeaderboard(),
          fetchLeaderboardEntryForUser(user.id),
        ]);

        if (!nextCurrentUserEntry && storedProgress.totalXp > 0) {
          await syncCurrentUserProgressIfAuthenticated(storedProgress);

          [nextEntries, nextCurrentUserEntry] = await Promise.all([
            fetchLeaderboard(),
            fetchLeaderboardEntryForUser(user.id),
          ]);
        }

        if (active) {
          setEntries(nextEntries);
          setCurrentUserEntry(nextCurrentUserEntry);
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            serializeRemoteProgressError(error) || "Unable to load the leaderboard right now.",
          );
          setLoading(false);
        }
      }
    };

    void load();

    const handleRefresh = () => {
      void load();
    };

    const intervalId = window.setInterval(() => {
      void load();
    }, 60_000);

    window.addEventListener("focus", handleRefresh);
    window.addEventListener(leaderboardRefreshEventName, handleRefresh);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(leaderboardRefreshEventName, handleRefresh);
    };
  }, [storedProgress, user]);

  const isCurrentUserVisible = useMemo(
    () => entries.some((entry) => entry.user_id === user?.id),
    [entries, user?.id],
  );

  return (
    <main className="alpine-page">
      <div className="alpine-page__inner">
        <div className="alpine-topbar">
          <StokedLogo />
          <Link href="/course" className="alpine-back-link">
            Back to course
          </Link>
        </div>

        <div className="alpine-page-head">
          <p className="alpine-kicker">Leaderboard</p>
          <h1 className="alpine-heading">XP standings</h1>
          <p className="alpine-copy">
            Signed-in learners are ranked by total course XP. Your place updates when you
            complete lessons and clear course milestones.
          </p>
        </div>

        {!user ? (
          <section className="alpine-panel alpine-panel--accent p-8 md:p-10">
            <div className="max-w-3xl">
              <p className="alpine-kicker">Join the climb</p>
              <h2 className="alpine-panel__title mt-3">Sign in to join the leaderboard</h2>
              <p className="alpine-panel__copy">
                The leaderboard only includes logged-in learners so XP standings stay tied to
                real synced progress across devices.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void signInWithGoogle("/leaderboard")}
                disabled={authLoading}
                className="alpine-cta-primary"
              >
                {authLoading ? "Loading..." : "Continue with Google"}
              </button>
              <div className="alpine-chip">
                Private rankings only
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-6">
              <div className="alpine-segmented">
                <button
                  type="button"
                  onClick={() => setView("global")}
                  className={`alpine-segmented__button ${view === "global" ? "is-active" : ""}`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setView("friends")}
                  className={`alpine-segmented__button ${view === "friends" ? "is-active" : ""}`}
                >
                  Friends
                </button>
              </div>
            </div>

            {view === "friends" ? (
              <FriendsLeaderboardPanel onRequireSignIn={() => signInWithGoogle("/leaderboard")} />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <section className="alpine-panel p-6">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="alpine-panel__title">Top learners</h2>
                      <p className="alpine-panel__copy">
                        Ranked by total XP across all signed-in users.
                      </p>
                    </div>
                    <span className="alpine-chip alpine-chip--accent">Live ranking</span>
                  </div>

                  {loading ? (
                    <p style={{ color: "var(--alpine-text-secondary)" }}>Loading leaderboard...</p>
                  ) : errorMessage ? (
                    <div className="alpine-note-error">
                      <p style={{ color: "var(--alpine-error)" }}>{errorMessage}</p>
                    </div>
                  ) : !entries.length ? (
                    <p style={{ color: "var(--alpine-text-secondary)" }}>
                      No leaderboard entries yet. Finish a lesson while signed in to claim the first spot.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry) => {
                        const isCurrentUser = entry.user_id === user.id;

                        return (
                          <div
                            key={entry.user_id}
                            className={`alpine-list-row ${isCurrentUser ? "alpine-list-row--active" : ""}`}
                          >
                            <div
                              className="alpine-rank-badge"
                              style={isCurrentUser ? { color: "var(--alpine-cyan)" } : undefined}
                            >
                              #{entry.rank}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-base font-semibold" style={{ color: "var(--alpine-text)" }}>
                                  {isCurrentUser ? localNickname : entry.nickname}
                                </p>
                                {isCurrentUser ? (
                                  <span className="alpine-chip alpine-chip--accent">You</span>
                                ) : null}
                              </div>
                              <p
                                className="mt-1 text-xs uppercase tracking-[0.16em]"
                                style={{ color: "var(--alpine-text-tertiary)" }}
                              >
                                {entry.completed_lessons} lessons completed • streak {entry.streak_count}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-semibold" style={{ color: "var(--alpine-cream)" }}>
                                {entry.total_xp} XP
                              </p>
                              <p className="mt-1 text-xs" style={{ color: "var(--alpine-text-tertiary)" }}>
                                {formatUpdatedAt(entry.updated_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <aside className="space-y-6">
                  <section className="alpine-panel alpine-panel--accent p-6">
                    <p className="alpine-label" style={{ color: "var(--alpine-teal)" }}>
                      Your standing
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold" style={{ color: "var(--alpine-cream)" }}>
                      {currentUserEntry ? `#${currentUserEntry.rank}` : "Unranked"}
                    </h2>
                    <p className="mt-3 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
                      {currentUserEntry
                        ? `${currentUserEntry.total_xp} XP across ${currentUserEntry.completed_lessons} completed lessons as ${localNickname}.`
                        : storedProgress.totalXp > 0
                          ? `You have ${storedProgress.totalXp} XP locally. We are syncing your rank now.`
                          : "Complete your next signed-in lesson to appear in the standings."}
                    </p>
                    {currentUserEntry && !isCurrentUserVisible ? (
                      <p className="mt-4 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--alpine-text-tertiary)" }}>
                        Outside the top 25 right now
                      </p>
                    ) : null}
                  </section>

                  <section className="alpine-panel alpine-panel--muted p-6">
                    <p className="alpine-label">How ranking works</p>
                    <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
                      <li>Regular lessons add 10 XP, and boss lessons add 20 XP.</li>
                      <li>Only signed-in users appear on the leaderboard.</li>
                      <li>Leaderboard placement updates from synced course milestones.</li>
                    </ul>
                  </section>
                </aside>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
