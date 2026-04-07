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
      <section className="alpine-panel alpine-panel--accent p-8">
        <h2 className="alpine-panel__title">Sign in to compare with friends</h2>
        <p className="alpine-panel__copy">
          Friend rankings stay private to accepted friends and your synced Stoked progress.
        </p>
        <button
          type="button"
          onClick={() => void onRequireSignIn()}
          disabled={authLoading}
          className="alpine-cta-primary mt-6"
        >
          {authLoading ? "Loading..." : "Continue with Google"}
        </button>
      </section>
    );
  }

  if (!profile?.username) {
    return (
      <section className="alpine-panel alpine-panel--muted p-8">
        <h2 className="alpine-panel__title">Choose a username first</h2>
        <p className="alpine-panel__copy">
          Friends ranking uses usernames only, so choose yours before comparing progress.
        </p>
        <Link href="/username?next=/leaderboard" className="alpine-cta-secondary mt-6">
          Choose username
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="alpine-panel p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="alpine-panel__title">Friends ranking</h2>
            <p className="alpine-panel__copy">
              Private to accepted friends. Ranked by synced total XP with streak as the tiebreaker.
            </p>
          </div>
          <span className="alpine-chip alpine-chip--accent">{friends.length} friends</span>
        </div>

        {loading ? (
          <p style={{ color: "var(--alpine-text-secondary)" }}>Loading friends ranking...</p>
        ) : errorMessage ? (
          <div className="alpine-note-error">
            <p style={{ color: "var(--alpine-error)" }}>{errorMessage}</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="alpine-panel alpine-panel--muted p-6">
            <h3 className="alpine-panel__title text-[1.2rem]">No friends to compare yet</h3>
            <p className="alpine-panel__copy">
              Add friends from your profile, then come back here for a private progress ranking.
            </p>
            <Link href="/profile" className="alpine-cta-secondary mt-5">
              Manage friends
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`alpine-list-row ${entry.hasSyncedProgress ? "" : "opacity-80"}`}
                style={!entry.hasSyncedProgress ? { borderStyle: "dashed" } : undefined}
              >
                <div className="alpine-rank-badge">#{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold" style={{ color: "var(--alpine-text)" }}>
                    @{entry.username}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--alpine-text-tertiary)" }}>
                    {entry.hasSyncedProgress
                      ? `Streak ${entry.streak_count ?? 0} • ${entry.completed_lessons ?? 0} lessons`
                      : "No synced XP yet"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold" style={{ color: "var(--alpine-cream)" }}>
                    {entry.hasSyncedProgress ? `${entry.total_xp} XP` : "—"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--alpine-text-tertiary)" }}>
                    {formatUpdatedAt(entry.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <section className="alpine-panel alpine-panel--accent p-6">
          <p className="alpine-label" style={{ color: "var(--alpine-teal)" }}>
            Your standing
          </p>
          <h2 className="mt-2 text-2xl font-semibold" style={{ color: "var(--alpine-cream)" }}>
            {currentUserEntry?.hasSyncedProgress ? `${currentUserEntry.total_xp} XP` : "No synced XP yet"}
          </h2>
          <p className="mt-2 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
            {currentUserEntry?.hasSyncedProgress
              ? `You are on a ${currentUserEntry.streak_count} day streak with ${currentUserEntry.completed_lessons} completed lessons.`
              : "Complete a signed-in lesson to appear in private comparisons."}
          </p>
          {currentUserEntry?.rank ? (
            <p className="mt-4 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--alpine-text-tertiary)" }}>
              Global rank #{currentUserEntry.rank}
            </p>
          ) : null}
        </section>

        <section className="alpine-panel alpine-panel--muted p-6">
          <p className="alpine-label">Friends ranking rules</p>
          <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
            <li>Only accepted friends appear here.</li>
            <li>Ranks use synced total XP, with streak breaking ties.</li>
            <li>Weekly XP and weekly lesson counts will arrive in a later phase.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
