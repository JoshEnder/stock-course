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

const EMERALD = "#10b981";
const SURFACE = "#1a2942";
const CREAM = "#e8e2d4";
const TEXT = "#cbd5e1";
const MUTED = "#94a3b8";
const DIM = "#5f687a";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

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
    <span style={{ fontSize: 11, fontWeight: 500, color: DIM }}>
      {label} {value}
    </span>
  );
}

function PremiumBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 22px", borderRadius: 10, border: "none",
        background: CREAM, color: "#111",
        fontFamily: sans, fontWeight: 500, fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
        transition: "opacity 200ms",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, disabled, href }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; href?: string }) {
  const style = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 22px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent", color: TEXT,
    fontFamily: sans, fontWeight: 500, fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    transition: "opacity 200ms",
  } as const;
  if (href) return <Link href={href} style={style}>{children}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}

function SubSection({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)", padding: 20 }}>
      {children}
    </div>
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
    <section style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: SURFACE, padding: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>Friends</p>
          <h2 style={{ fontSize: 20, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 6 }}>
            Build your private crew
          </h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 6, maxWidth: 480 }}>
            Find friends by username, manage requests, and compare streak and XP.
          </p>
        </div>
        {socialReady ? (
          <GhostBtn href="/leaderboard">View friends ranking</GhostBtn>
        ) : null}
      </div>

      {!user ? (
        <div style={{ marginTop: 20, borderLeft: `2px solid ${EMERALD}`, paddingLeft: 16 }}>
          <p style={{ fontSize: 15, fontFamily: serif, fontWeight: 600, color: CREAM }}>Sign in to add friends</p>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 4 }}>
            Friends are private to logged-in learners with usernames.
          </p>
          <div style={{ marginTop: 12 }}>
            <PremiumBtn onClick={() => void signInWithGoogle("/profile")} disabled={authLoading}>
              {authLoading ? "Loading..." : "Continue with Google"}
            </PremiumBtn>
          </div>
        </div>
      ) : !profile?.username ? (
        <div style={{ marginTop: 20, borderLeft: "2px solid #f59e0b", paddingLeft: 16 }}>
          <p style={{ fontSize: 15, fontFamily: serif, fontWeight: 600, color: CREAM }}>Choose a username first</p>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 4 }}>
            Friends search and private rankings use your username, not your email.
          </p>
          <div style={{ marginTop: 12 }}>
            <GhostBtn href="/username?next=/profile">Set username</GhostBtn>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Search */}
          <SubSection>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Search by username</p>
                <p style={{ fontSize: 17, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 4 }}>Add a friend</p>
              </div>
              <span style={{ fontSize: 11, color: DIM }}>Search uses unique usernames only</span>
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
              style={{
                width: "100%", marginTop: 14, padding: "12px 16px",
                borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)", color: CREAM,
                fontFamily: sans, fontSize: 15, fontWeight: 500,
                outline: "none",
              }}
            />

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {searchLoading ? (
                <p style={{ fontSize: 13, color: DIM }}>Searching usernames...</p>
              ) : trimmedQuery.length >= 2 && searchResults.length === 0 ? (
                <p style={{ fontSize: 13, color: DIM }}>No username matches yet.</p>
              ) : null}

              {searchResults.map((result) => (
                <div
                  key={result.user_id}
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: CREAM }}>@{result.username}</p>
                    <p style={{ fontSize: 11, color: DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
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
                    <PremiumBtn onClick={() => void handleSendRequest(result)} disabled={busyKey === `send-${result.user_id}`}>
                      {busyKey === `send-${result.user_id}` ? "Sending..." : "Send request"}
                    </PremiumBtn>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 500, color: DIM, textTransform: "uppercase", letterSpacing: "0.1em" }}>
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
          </SubSection>

          <div className="grid gap-4 xl:grid-cols-2">
            {/* Requests */}
            <SubSection>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Requests</p>
                  <p style={{ fontSize: 17, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 4 }}>Incoming</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: EMERALD }}>{incomingRequests.length} pending</span>
              </div>

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {panelLoading ? (
                  <p style={{ fontSize: 13, color: DIM }}>Loading requests...</p>
                ) : incomingRequests.length === 0 ? (
                  <p style={{ fontSize: 13, color: DIM }}>No incoming requests right now.</p>
                ) : (
                  incomingRequests.map((request) => (
                    <div key={request.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: CREAM }}>@{request.user?.username ?? "learner"}</p>
                          <p style={{ fontSize: 11, color: DIM, marginTop: 2 }}>Sent {formatFriendshipDate(request.created_at) ?? "recently"}</p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <PremiumBtn
                            onClick={() => void handleIncomingAction(request.id, "accept")}
                            disabled={busyKey === `accept-${request.id}` || Boolean(busyKey && busyKey !== `accept-${request.id}` && busyKey !== `decline-${request.id}`)}
                          >
                            {busyKey === `accept-${request.id}` ? "..." : "Accept"}
                          </PremiumBtn>
                          <GhostBtn
                            onClick={() => void handleIncomingAction(request.id, "decline")}
                            disabled={busyKey === `decline-${request.id}` || Boolean(busyKey && busyKey !== `accept-${request.id}` && busyKey !== `decline-${request.id}`)}
                          >
                            {busyKey === `decline-${request.id}` ? "..." : "Decline"}
                          </GhostBtn>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Requests</p>
                    <p style={{ fontSize: 17, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 4 }}>Sent</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: DIM }}>{outgoingRequests.length} pending</span>
                </div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {panelLoading ? null : outgoingRequests.length === 0 ? (
                    <p style={{ fontSize: 13, color: DIM }}>No outgoing requests waiting right now.</p>
                  ) : (
                    outgoingRequests.map((request) => (
                      <div
                        key={request.id}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}
                      >
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: CREAM }}>@{request.user?.username ?? "learner"}</p>
                          <p style={{ fontSize: 11, color: DIM, marginTop: 2 }}>Waiting since {formatFriendshipDate(request.created_at) ?? "recently"}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: DIM, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pending</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SubSection>

            {/* Friends list */}
            <SubSection>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Friends list</p>
                  <p style={{ fontSize: 17, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 4 }}>Accepted friends</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: EMERALD }}>{friends.length} friends</span>
              </div>

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {panelLoading ? (
                  <p style={{ fontSize: 13, color: DIM }}>Loading friends...</p>
                ) : friends.length === 0 ? (
                  <p style={{ fontSize: 13, color: DIM }}>Add your first friend to start a private comparison list.</p>
                ) : (
                  friends.map((friend) => {
                    const userSummary = friend.user;
                    const stats = userSummary ? friendStats.get(userSummary.user_id) ?? null : null;

                    return (
                      <div
                        key={userSummary?.user_id ?? friend.created_at}
                        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <p style={{ fontSize: 15, fontWeight: 600, color: CREAM }}>@{userSummary?.username ?? "learner"}</p>
                            <p style={{ fontSize: 11, color: DIM, marginTop: 2 }}>
                              Friends since {formatFriendshipDate(friend.created_at) ?? "recently"}
                            </p>
                          </div>
                          {stats?.hasSyncedProgress ? (
                            <p style={{ fontSize: 16, fontWeight: 600, color: EMERALD, fontVariantNumeric: "tabular-nums" }}>
                              {stats.total_xp} XP
                            </p>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 500, color: DIM }}>No synced XP yet</span>
                          )}
                        </div>

                        {stats?.hasSyncedProgress ? (
                          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12 }}>
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
            </SubSection>
          </div>

          {successMessage ? (
            <div style={{ borderLeft: `3px solid ${EMERALD}`, paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
              <p style={{ fontSize: 14, color: EMERALD }}>{successMessage}</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div style={{ borderLeft: "3px solid #ef4444", paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
              <p style={{ fontSize: 14, color: "#f87171" }}>{errorMessage}</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
