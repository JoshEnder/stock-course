"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useAuth } from "../lib/auth-context";
import { FriendsLeaderboardPanel } from "../components/friends-leaderboard-panel";
import {
  getNickname,
  subscribeToCourseStorage,
} from "../lib/course-storage";
import {
  getServerCourseProgressSnapshot,
  getStoredCourseProgress,
  subscribeToCourseProgress,
} from "../lib/course-progress";
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
    <Link href="/" className="inline-flex items-end gap-0.5">
      <span
        className="text-2xl font-black tracking-tight text-[#1a2b4a]"
        style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
      >
        stoked
      </span>
      <span className="mb-[0.2em] h-3 w-3 flex-shrink-0 rounded-full bg-[#22c55e]" />
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
    <main
      className="min-h-screen bg-[#f7faf8]"
      style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <StokedLogo />
          <Link
            href="/course"
            className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-[#172b4d] shadow-[0_3px_0_#e5e7eb]"
          >
            Back to course
          </Link>
        </div>

        <div className="mx-auto mt-10 w-full max-w-5xl">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22c55e]">
              Leaderboard
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#172b4d]">
              XP standings
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">
              Signed-in learners are ranked by total course XP. Your place updates when you
              complete lessons and clear course milestones.
            </p>
          </div>

          {!user ? (
            <section className="rounded-[28px] border-2 border-[#dcfce7] bg-white p-8 shadow-[0_6px_0_#dcfce7]">
              <h2 className="text-2xl font-black text-[#172b4d]">Sign in to join the leaderboard</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                The leaderboard only includes logged-in learners so XP rankings stay tied to
                real synced progress.
              </p>
              <button
                type="button"
                onClick={() => void signInWithGoogle("/leaderboard")}
                disabled={authLoading}
                className="mt-6 rounded-2xl bg-[#22c55e] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? "Loading..." : "Continue with Google"}
              </button>
            </section>
          ) : (
            <>
              <div className="mb-6 inline-flex rounded-full border-2 border-gray-200 bg-white p-1 shadow-[0_4px_0_#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setView("global")}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                    view === "global"
                      ? "bg-[#172b4d] text-white"
                      : "text-[#64748b]"
                  }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setView("friends")}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                    view === "friends"
                      ? "bg-[#22c55e] text-white"
                      : "text-[#64748b]"
                  }`}
                >
                  Friends
                </button>
              </div>

              {view === "friends" ? (
                <FriendsLeaderboardPanel
                  onRequireSignIn={() => signInWithGoogle("/leaderboard")}
                />
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-[0_6px_0_#e5e7eb]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-[#172b4d]">Top learners</h2>
                        <p className="mt-2 text-sm text-gray-500">
                          Ranked by total XP across all signed-in users.
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f0fdf4] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#15803d]">
                        Live ranking
                      </span>
                    </div>

                    {loading ? (
                      <p className="text-sm text-gray-500">Loading leaderboard...</p>
                    ) : errorMessage ? (
                      <p className="text-sm text-[#b91c1c]">{errorMessage}</p>
                    ) : !entries.length ? (
                      <p className="text-sm text-gray-500">
                        No leaderboard entries yet. Finish a lesson while signed in to claim the first spot.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {entries.map((entry) => {
                          const isCurrentUser = entry.user_id === user.id;

                          return (
                            <div
                              key={entry.user_id}
                              className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-4 shadow-[0_4px_0_#e5e7eb] ${
                                isCurrentUser
                                  ? "border-[#86efac] bg-[#f0fdf4]"
                                  : "border-gray-100 bg-white"
                              }`}
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172b4d] text-lg font-black text-white">
                                #{entry.rank}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-base font-black text-[#172b4d]">
                                    {isCurrentUser ? localNickname : entry.nickname}
                                  </p>
                                  {isCurrentUser ? (
                                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#15803d]">
                                      You
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-400">
                                  {entry.completed_lessons} lessons completed • streak {entry.streak_count}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-[#f59e0b]">{entry.total_xp} XP</p>
                                <p className="mt-1 text-xs text-gray-400">{formatUpdatedAt(entry.updated_at)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <aside className="space-y-6">
                    <section className="rounded-[28px] border-2 border-[#dcfce7] bg-white p-6 shadow-[0_6px_0_#dcfce7]">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#22c55e]">
                        Your standing
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[#172b4d]">
                        {currentUserEntry ? `#${currentUserEntry.rank}` : "Unranked"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {currentUserEntry
                          ? `${currentUserEntry.total_xp} XP across ${currentUserEntry.completed_lessons} completed lessons as ${localNickname}.`
                          : storedProgress.totalXp > 0
                            ? `You have ${storedProgress.totalXp} XP locally. We are syncing your rank now.`
                            : "Complete your next signed-in lesson to appear in the standings."}
                      </p>
                      {currentUserEntry && !isCurrentUserVisible ? (
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gray-400">
                          Outside the top 25 right now
                        </p>
                      ) : null}
                    </section>

                    <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-[0_6px_0_#e5e7eb]">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                        How ranking works
                      </p>
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-500">
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
      </div>
    </main>
  );
}
