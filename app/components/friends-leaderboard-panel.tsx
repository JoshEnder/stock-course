"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { fetchFriendComparison, type FriendComparisonEntry } from "../lib/friends";

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "No synced XP yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No synced XP yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

type FriendsLeaderboardPanelProps = {
  onRequireSignIn: () => Promise<void> | void;
};

export function FriendsLeaderboardPanel({ onRequireSignIn }: FriendsLeaderboardPanelProps) {
  const { loading: authLoading, profile, user } = useAuth();
  const [friends, setFriends] = useState<FriendComparisonEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<FriendComparisonEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socialReady = Boolean(user && profile?.username);

  useEffect(() => {
    let active = true;

    if (!socialReady) {
      setFriends([]);
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
        const comparison = await fetchFriendComparison();

        if (!active) {
          return;
        }

        setFriends(comparison.friends);
        setCurrentUserEntry(comparison.currentUser);
        setLoading(false);
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load your friends ranking.",
          );
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [socialReady]);

  if (!user) {
    return (
      <section className="rounded-[28px] border-2 border-[#dcfce7] bg-white p-8 shadow-[0_6px_0_#dcfce7]">
        <h2 className="text-2xl font-black text-[#172b4d]">Sign in to compare with friends</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Friend rankings stay private to accepted friends and your synced Stoked progress.
        </p>
        <button
          type="button"
          onClick={() => void onRequireSignIn()}
          disabled={authLoading}
          className="mt-6 rounded-2xl bg-[#22c55e] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Loading..." : "Continue with Google"}
        </button>
      </section>
    );
  }

  if (!profile?.username) {
    return (
      <section className="rounded-[28px] border-2 border-[#fef3c7] bg-white p-8 shadow-[0_6px_0_#fde68a]">
        <h2 className="text-2xl font-black text-[#172b4d]">Choose a username first</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Friends ranking uses usernames only, so choose yours before comparing progress.
        </p>
        <Link
          href="/username?next=/leaderboard"
          className="mt-6 inline-flex rounded-2xl border-2 border-[#f59e0b] bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-[#92400e] shadow-[0_4px_0_#fde68a]"
        >
          Choose username
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-[0_6px_0_#e5e7eb]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#172b4d]">Friends ranking</h2>
            <p className="mt-2 text-sm text-gray-500">
              Private to accepted friends. Ranked by synced total XP with streak as the tiebreaker.
            </p>
          </div>
          <span className="rounded-full bg-[#f0fdf4] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#15803d]">
            {friends.length} friends
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading friends ranking...</p>
        ) : errorMessage ? (
          <p className="text-sm text-[#b91c1c]">{errorMessage}</p>
        ) : friends.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-gray-200 bg-[#fcfdfc] p-6">
            <h3 className="text-lg font-black text-[#172b4d]">No friends to compare yet</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add friends from your profile, then come back here for a private progress ranking.
            </p>
            <Link
              href="/profile"
              className="mt-4 inline-flex rounded-2xl border-2 border-[#22c55e] bg-[#f0fdf4] px-4 py-3 text-sm font-black uppercase tracking-wide text-[#166534] shadow-[0_4px_0_#bbf7d0]"
            >
              Manage friends
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-4 shadow-[0_4px_0_#e5e7eb] ${
                  entry.hasSyncedProgress
                    ? "border-gray-100 bg-white"
                    : "border-dashed border-gray-200 bg-[#fcfdfc]"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172b4d] text-lg font-black text-white">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-black text-[#172b4d]">
                    @{entry.username}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-400">
                    {entry.hasSyncedProgress
                      ? `Streak ${entry.streak_count ?? 0} • ${entry.completed_lessons ?? 0} lessons`
                      : "No synced XP yet"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#f59e0b]">
                    {entry.hasSyncedProgress ? `${entry.total_xp} XP` : "—"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatUpdatedAt(entry.updated_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <section className="rounded-[28px] border-2 border-[#dcfce7] bg-white p-6 shadow-[0_6px_0_#dcfce7]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#22c55e]">
            Your standing
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#172b4d]">
            {currentUserEntry?.hasSyncedProgress ? `${currentUserEntry.total_xp} XP` : "No synced XP yet"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {currentUserEntry?.hasSyncedProgress
              ? `You are on a ${currentUserEntry.streak_count} day streak with ${currentUserEntry.completed_lessons} completed lessons.`
              : "Complete a signed-in lesson to appear in private comparisons."}
          </p>
          {currentUserEntry?.rank ? (
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gray-400">
              Global rank #{currentUserEntry.rank}
            </p>
          ) : null}
        </section>

        <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-[0_6px_0_#e5e7eb]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
            Friends ranking rules
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-500">
            <li>Only accepted friends appear here.</li>
            <li>Ranks use synced total XP, with streak breaking ties.</li>
            <li>Weekly XP and weekly lesson counts will arrive in a later phase.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
