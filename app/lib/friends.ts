"use client";

import { getSupabaseBrowserClient } from "./supabase-browser";
import { normalizeUsername } from "./user-profiles";

export type FriendRequestStatus = "pending" | "accepted" | "declined";
export type FriendSearchState = "available" | "outgoing" | "incoming" | "friend";

type FriendProfileSummary = {
  user_id: string;
  username: string | null;
  username_normalized: string | null;
};

type FriendRequestRow = {
  id: number;
  sender_user_id: string;
  receiver_user_id: string;
  status: FriendRequestStatus;
  created_at: string;
  responded_at: string | null;
};

type FriendshipRow = {
  user_id: string;
  friend_user_id: string;
  created_at: string;
};

export type FriendSearchResult = FriendProfileSummary & {
  state: FriendSearchState;
};

export type FriendRequestListItem = {
  id: number;
  direction: "incoming" | "outgoing";
  status: FriendRequestStatus;
  created_at: string;
  responded_at: string | null;
  user: FriendProfileSummary | null;
};

export type FriendListItem = {
  created_at: string;
  user: FriendProfileSummary | null;
};

type LeaderboardStatRow = {
  completed_lessons: number;
  rank: number;
  streak_count: number;
  total_xp: number;
  updated_at: string | null;
  user_id: string;
};

export type FriendComparisonEntry = FriendProfileSummary & {
  completed_lessons: number | null;
  created_at: string | null;
  hasSyncedProgress: boolean;
  isCurrentUser: boolean;
  rank: number | null;
  streak_count: number | null;
  total_xp: number | null;
  updated_at: string | null;
};

function serializeFriendError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }

  return String(error);
}

async function requireAuthenticatedUserId() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error("You need to be signed in to use friends.");
  }

  return session.user.id;
}

async function loadProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, FriendProfileSummary>();
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, username_normalized")
    .in("user_id", Array.from(new Set(userIds)));

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as FriendProfileSummary[]).map((profile) => [profile.user_id, profile]),
  );
}

async function loadLeaderboardStatsByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, LeaderboardStatRow>();
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("user_id, total_xp, streak_count, completed_lessons, updated_at, rank")
    .in("user_id", Array.from(new Set(userIds)));

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as LeaderboardStatRow[]).map((row) => [row.user_id, row]),
  );
}

export async function searchUsersByUsername(query: string, limit = 8) {
  const currentUserId = await requireAuthenticatedUserId();
  const normalizedQuery = normalizeUsername(query);

  if (normalizedQuery.length < 2) {
    return [] as FriendSearchResult[];
  }

  const supabase = getSupabaseBrowserClient();
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, username, username_normalized")
    .not("username", "is", null)
    .neq("user_id", currentUserId)
    .ilike("username_normalized", `${normalizedQuery}%`)
    .order("username_normalized", { ascending: true })
    .limit(limit);

  if (profilesError) {
    throw profilesError;
  }

  const candidates = (profiles ?? []) as FriendProfileSummary[];

  if (candidates.length === 0) {
    return [];
  }

  const candidateIds = candidates.map((profile) => profile.user_id);
  const [{ data: friendships, error: friendshipsError }, { data: requests, error: requestsError }] =
    await Promise.all([
      supabase
        .from("friendships")
        .select("friend_user_id")
        .eq("user_id", currentUserId)
        .in("friend_user_id", candidateIds),
      supabase
        .from("friend_requests")
        .select("sender_user_id, receiver_user_id, status")
        .eq("status", "pending")
        .or(
          [
            `and(sender_user_id.eq.${currentUserId},receiver_user_id.in.(${candidateIds.join(",")}))`,
            `and(receiver_user_id.eq.${currentUserId},sender_user_id.in.(${candidateIds.join(",")}))`,
          ].join(","),
        ),
    ]);

  if (friendshipsError) {
    throw friendshipsError;
  }

  if (requestsError) {
    throw requestsError;
  }

  const friendIds = new Set(((friendships ?? []) as Array<{ friend_user_id: string }>).map((row) => row.friend_user_id));
  const outgoingIds = new Set<string>();
  const incomingIds = new Set<string>();

  for (const request of (requests ?? []) as Array<Pick<FriendRequestRow, "sender_user_id" | "receiver_user_id" | "status">>) {
    if (request.sender_user_id === currentUserId) {
      outgoingIds.add(request.receiver_user_id);
    } else {
      incomingIds.add(request.sender_user_id);
    }
  }

  return candidates.map((profile) => {
    const state: FriendSearchState = friendIds.has(profile.user_id)
      ? "friend"
      : outgoingIds.has(profile.user_id)
        ? "outgoing"
        : incomingIds.has(profile.user_id)
          ? "incoming"
          : "available";

    return {
      ...profile,
      state,
    };
  });
}

export async function sendFriendRequest(targetUserId: string) {
  await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("send_friend_request", {
    target_user_id: targetUserId,
  });

  if (error) {
    throw new Error(serializeFriendError(error));
  }

  return data as FriendRequestRow;
}

export async function acceptFriendRequest(requestId: number) {
  await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("accept_friend_request", {
    friend_request_id: requestId,
  });

  if (error) {
    throw new Error(serializeFriendError(error));
  }

  return data as FriendRequestRow;
}

export async function declineFriendRequest(requestId: number) {
  await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("decline_friend_request", {
    friend_request_id: requestId,
  });

  if (error) {
    throw new Error(serializeFriendError(error));
  }

  return data as FriendRequestRow;
}

export async function fetchIncomingFriendRequests() {
  const currentUserId = await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_user_id, receiver_user_id, status, created_at, responded_at")
    .eq("receiver_user_id", currentUserId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FriendRequestRow[];
  const profiles = await loadProfilesByIds(rows.map((row) => row.sender_user_id));

  return rows.map((row) => ({
    id: row.id,
    direction: "incoming" as const,
    status: row.status,
    created_at: row.created_at,
    responded_at: row.responded_at,
    user: profiles.get(row.sender_user_id) ?? null,
  }));
}

export async function fetchOutgoingFriendRequests() {
  const currentUserId = await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_user_id, receiver_user_id, status, created_at, responded_at")
    .eq("sender_user_id", currentUserId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FriendRequestRow[];
  const profiles = await loadProfilesByIds(rows.map((row) => row.receiver_user_id));

  return rows.map((row) => ({
    id: row.id,
    direction: "outgoing" as const,
    status: row.status,
    created_at: row.created_at,
    responded_at: row.responded_at,
    user: profiles.get(row.receiver_user_id) ?? null,
  }));
}

export async function fetchFriends() {
  const currentUserId = await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("user_id, friend_user_id, created_at")
    .eq("user_id", currentUserId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FriendshipRow[];
  const profiles = await loadProfilesByIds(rows.map((row) => row.friend_user_id));

  return rows.map((row) => ({
    created_at: row.created_at,
    user: profiles.get(row.friend_user_id) ?? null,
  })) as FriendListItem[];
}

export async function fetchFriendComparison() {
  const currentUserId = await requireAuthenticatedUserId();
  const friends = await fetchFriends();
  const friendIds = friends
    .map((item) => item.user?.user_id)
    .filter((value): value is string => Boolean(value));
  const comparisonIds = [currentUserId, ...friendIds];
  const [profiles, leaderboardStats] = await Promise.all([
    loadProfilesByIds(comparisonIds),
    loadLeaderboardStatsByIds(comparisonIds),
  ]);
  const friendSinceMap = new Map(
    friends
      .filter((item): item is FriendListItem & { user: FriendProfileSummary } => Boolean(item.user?.user_id))
      .map((item) => [item.user.user_id, item.created_at]),
  );

  const entries = comparisonIds.map((userId) => {
    const profile = profiles.get(userId) ?? null;
    const stats = leaderboardStats.get(userId) ?? null;

    return {
      user_id: userId,
      username: profile?.username ?? null,
      username_normalized: profile?.username_normalized ?? null,
      completed_lessons: stats?.completed_lessons ?? null,
      created_at: friendSinceMap.get(userId) ?? null,
      hasSyncedProgress: Boolean(stats),
      isCurrentUser: userId === currentUserId,
      rank: stats?.rank ?? null,
      streak_count: stats?.streak_count ?? null,
      total_xp: stats?.total_xp ?? null,
      updated_at: stats?.updated_at ?? null,
    };
  });

  const sortScore = (entry: FriendComparisonEntry) => entry.total_xp ?? -1;
  const sortStreak = (entry: FriendComparisonEntry) => entry.streak_count ?? -1;

  const currentUser = entries.find((entry) => entry.isCurrentUser) ?? null;
  const friendsOnly = entries
    .filter((entry) => !entry.isCurrentUser)
    .sort((left, right) => {
      if (sortScore(right) !== sortScore(left)) {
        return sortScore(right) - sortScore(left);
      }

      if (sortStreak(right) !== sortStreak(left)) {
        return sortStreak(right) - sortStreak(left);
      }

      return (left.username_normalized ?? "").localeCompare(right.username_normalized ?? "");
    });

  return {
    currentUser,
    friends: friendsOnly,
  };
}
