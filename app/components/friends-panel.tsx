"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth-context";
import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriendComparison,
  fetchFriends,
  fetchIncomingFriendRequests,
  fetchOutgoingFriendRequests,
  searchUsersByUsername,
  sendFriendRequest,
  type FriendComparisonEntry,
  type FriendListItem,
  type FriendRequestListItem,
  type FriendSearchResult,
} from "../lib/friends";

function formatFriendshipDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
      {label} {value}
    </span>
  );
}

export function FriendsPanel() {
  const { loading: authLoading, profile, signInWithGoogle, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestListItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestListItem[]>([]);
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [friendStats, setFriendStats] = useState<Map<string, FriendComparisonEntry>>(new Map());
  const [panelLoading, setPanelLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const socialReady = Boolean(user && profile?.username);
  const trimmedQuery = searchQuery.trim();

  async function loadFriendsState() {
    if (!socialReady) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setFriends([]);
      setFriendStats(new Map());
      return;
    }

    setPanelLoading(true);

    try {
      const [incoming, outgoing, friendList, comparison] = await Promise.all([
        fetchIncomingFriendRequests(),
        fetchOutgoingFriendRequests(),
        fetchFriends(),
        fetchFriendComparison(),
      ]);

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setFriends(friendList);
      setFriendStats(
        new Map(comparison.friends.map((entry) => [entry.user_id, entry])),
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load friends right now.",
      );
    } finally {
      setPanelLoading(false);
    }
  }

  useEffect(() => {
    void loadFriendsState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socialReady]);

  useEffect(() => {
    if (!socialReady) {
      setSearchResults([]);
      return;
    }

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchUsersByUsername(trimmedQuery);

        if (active) {
          setSearchResults(results);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to search usernames right now.",
          );
        }
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [socialReady, trimmedQuery]);

  const outgoingIds = useMemo(
    () =>
      new Set(
        outgoingRequests
          .map((request) => request.user?.user_id)
          .filter((value): value is string => Boolean(value)),
      ),
    [outgoingRequests],
  );

  const incomingIds = useMemo(
    () =>
      new Set(
        incomingRequests
          .map((request) => request.user?.user_id)
          .filter((value): value is string => Boolean(value)),
      ),
    [incomingRequests],
  );

  async function handleSendRequest(result: FriendSearchResult) {
    if (!result.user_id || busyKey) {
      return;
    }

    try {
      setBusyKey(`send-${result.user_id}`);
      setErrorMessage(null);
      await sendFriendRequest(result.user_id);
      setSuccessMessage(`Friend request sent to @${result.username}.`);
      await loadFriendsState();
      if (trimmedQuery.length >= 2) {
        const refreshed = await searchUsersByUsername(trimmedQuery);
        setSearchResults(refreshed);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send friend request.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function handleIncomingAction(requestId: number, action: "accept" | "decline") {
    if (busyKey) {
      return;
    }

    try {
      setBusyKey(`${action}-${requestId}`);
      setErrorMessage(null);

      if (action === "accept") {
        await acceptFriendRequest(requestId);
        setSuccessMessage("Friend request accepted.");
      } else {
        await declineFriendRequest(requestId);
        setSuccessMessage("Friend request declined.");
      }

      await loadFriendsState();
      if (trimmedQuery.length >= 2) {
        const refreshed = await searchUsersByUsername(trimmedQuery);
        setSearchResults(refreshed);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update friend request.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="rounded-[28px] border-2 border-gray-200 bg-white p-6 shadow-[0_6px_0_#e5e7eb]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
            Friends
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#172b4d]">
            Build your private crew
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Find friends by username, manage requests, and compare streak and XP without turning Stoked into a noisy social app.
          </p>
        </div>
        {socialReady ? (
          <Link
            href="/leaderboard"
            className="rounded-2xl border-2 border-[#22c55e] bg-[#f0fdf4] px-4 py-3 text-sm font-black uppercase tracking-wide text-[#166534] shadow-[0_4px_0_#bbf7d0]"
          >
            View friends ranking
          </Link>
        ) : null}
      </div>

      {!user ? (
        <div className="mt-6 rounded-[24px] border-2 border-[#dcfce7] bg-[#f8fffb] p-5">
          <h3 className="text-lg font-black text-[#172b4d]">Sign in to add friends</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Friends are private to logged-in learners with usernames.
          </p>
          <button
            type="button"
            onClick={() => void signInWithGoogle("/profile")}
            disabled={authLoading}
            className="mt-4 rounded-2xl bg-[#22c55e] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {authLoading ? "Loading..." : "Continue with Google"}
          </button>
        </div>
      ) : !profile?.username ? (
        <div className="mt-6 rounded-[24px] border-2 border-[#fef3c7] bg-[#fffbeb] p-5">
          <h3 className="text-lg font-black text-[#172b4d]">Choose a username first</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Friends search and private rankings use your username, not your email.
          </p>
          <Link
            href="/username?next=/profile"
            className="mt-4 inline-flex rounded-2xl border-2 border-[#f59e0b] bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-[#92400e] shadow-[0_4px_0_#fde68a]"
          >
            Set username
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="rounded-[24px] border-2 border-gray-100 bg-[#fcfdfc] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                  Search by username
                </p>
                <h3 className="mt-2 text-xl font-black text-[#172b4d]">Add a friend</h3>
              </div>
              <p className="text-xs font-semibold text-gray-400">
                Search uses unique usernames only
              </p>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              placeholder="Search username"
              className="mt-4 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 text-base font-semibold text-[#172b4d] outline-none placeholder:text-gray-400"
            />

            <div className="mt-4 space-y-3">
              {searchLoading ? (
                <p className="text-sm text-gray-500">Searching usernames...</p>
              ) : trimmedQuery.length >= 2 && searchResults.length === 0 ? (
                <p className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                  No username matches yet.
                </p>
              ) : null}

              {searchResults.map((result) => (
                <div
                  key={result.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-4"
                >
                  <div>
                    <p className="text-base font-black text-[#172b4d]">
                      @{result.username}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                      {result.state === "friend"
                        ? "Already in your friends list"
                        : result.state === "outgoing"
                          ? "Request already sent"
                          : result.state === "incoming"
                            ? "Sent you a request"
                            : "Available to add"}
                    </p>
                  </div>

                  {result.state === "available" ? (
                    <button
                      type="button"
                      onClick={() => void handleSendRequest(result)}
                      disabled={busyKey === `send-${result.user_id}`}
                      className="rounded-2xl bg-[#172b4d] px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {busyKey === `send-${result.user_id}` ? "Sending..." : "Send request"}
                    </button>
                  ) : (
                    <span className="rounded-full bg-[#f8fafc] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
                      {result.state === "friend"
                        ? "Friends"
                        : result.state === "outgoing"
                          ? "Pending"
                          : "Needs reply"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[24px] border-2 border-gray-100 bg-[#fcfdfc] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Requests
                  </p>
                  <h3 className="mt-2 text-xl font-black text-[#172b4d]">
                    Incoming
                  </h3>
                </div>
                <span className="rounded-full bg-[#f0fdf4] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#15803d]">
                  {incomingRequests.length} pending
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {panelLoading ? (
                  <p className="text-sm text-gray-500">Loading requests...</p>
                ) : incomingRequests.length === 0 ? (
                  <p className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                    No incoming requests right now.
                  </p>
                ) : (
                  incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border-2 border-gray-100 bg-white px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-[#172b4d]">
                            @{request.user?.username ?? "learner"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                            Sent {formatFriendshipDate(request.created_at) ?? "recently"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleIncomingAction(request.id, "accept")}
                            disabled={busyKey === `accept-${request.id}` || Boolean(busyKey && busyKey !== `accept-${request.id}` && busyKey !== `decline-${request.id}`)}
                            className="rounded-xl bg-[#22c55e] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_3px_0_#16a34a] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {busyKey === `accept-${request.id}` ? "Accepting..." : "Accept"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleIncomingAction(request.id, "decline")}
                            disabled={busyKey === `decline-${request.id}` || Boolean(busyKey && busyKey !== `accept-${request.id}` && busyKey !== `decline-${request.id}`)}
                            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#475569] shadow-[0_3px_0_#e5e7eb] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {busyKey === `decline-${request.id}` ? "Declining..." : "Decline"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 border-t-2 border-gray-100 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                      Requests
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#172b4d]">
                      Sent
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#f8fafc] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
                    {outgoingRequests.length} pending
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {panelLoading ? null : outgoingRequests.length === 0 ? (
                    <p className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                      No outgoing requests waiting right now.
                    </p>
                  ) : (
                    outgoingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-4"
                      >
                        <div>
                          <p className="text-base font-black text-[#172b4d]">
                            @{request.user?.username ?? "learner"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                            Waiting since {formatFriendshipDate(request.created_at) ?? "recently"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#f8fafc] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
                          Pending
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border-2 border-gray-100 bg-[#fcfdfc] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Friends list
                  </p>
                  <h3 className="mt-2 text-xl font-black text-[#172b4d]">
                    Accepted friends
                  </h3>
                </div>
                <span className="rounded-full bg-[#eef2ff] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#4338ca]">
                  {friends.length} friends
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {panelLoading ? (
                  <p className="text-sm text-gray-500">Loading friends...</p>
                ) : friends.length === 0 ? (
                  <p className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                    Add your first friend to start a private comparison list.
                  </p>
                ) : (
                  friends.map((friend) => {
                    const userSummary = friend.user;
                    const stats = userSummary ? friendStats.get(userSummary.user_id) ?? null : null;

                    return (
                      <div
                        key={userSummary?.user_id ?? friend.created_at}
                        className="rounded-2xl border-2 border-gray-100 bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-[#172b4d]">
                              @{userSummary?.username ?? "learner"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                              Friends since {formatFriendshipDate(friend.created_at) ?? "recently"}
                            </p>
                          </div>
                          {stats?.hasSyncedProgress ? (
                            <p className="text-lg font-black text-[#f59e0b]">
                              {stats.total_xp} XP
                            </p>
                          ) : (
                            <span className="rounded-full bg-[#f8fafc] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
                              No synced XP yet
                            </span>
                          )}
                        </div>

                        {stats?.hasSyncedProgress ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <StatChip label="Streak" value={String(stats.streak_count ?? 0)} />
                            <StatChip label="Lessons" value={String(stats.completed_lessons ?? 0)} />
                            {stats.rank ? <StatChip label="Global rank" value={`#${stats.rank}`} /> : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {successMessage ? (
            <p className="rounded-2xl border-2 border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#15803d]">
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
              {errorMessage}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
