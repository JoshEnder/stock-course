"use client";

import type { RealtimePostgresChangesPayload, User } from "@supabase/supabase-js";
import type { CourseProgressRecord } from "./course-engine";
import {
  getCertificateId,
  getNickname,
  getStoredCertificateId,
  setCertificateId,
  setNickname,
} from "./course-storage";
import { getSupabaseBrowserClient } from "./supabase-browser";

export const leaderboardRefreshEventName = "stoked-leaderboard-refresh";

export type RemoteUserProgressRow = {
  certificate_id: string | null;
  completed_lesson_ids: string[] | null;
  hearts: number | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_heart_refill_at: string | null;
  last_opened_lesson_id: string | null;
  last_streak_active_on: string | null;
  nickname: string | null;
  seeded_demo: boolean | null;
  streak_count: number | null;
  total_xp: number | null;
  updated_at: string | null;
  user_id: string;
};

let userProgressTableMissing = false;
const maxHearts = 5;

export function serializeRemoteProgressError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const details = [
      "message",
      "code",
      "details",
      "hint",
      "name",
      "status",
      "statusText",
      "error_description",
      "error",
    ]
      .map((key) => {
        const value = (error as Record<string, unknown>)[key];

        return typeof value === "string" && value.trim() ? value.trim() : null;
      })
      .filter(Boolean);

    if (details.length > 0) {
      return details.join(" | ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "[object Object]";
    }
  }

  return String(error);
}

function isUnavailableUserProgressBackend(error: unknown) {
  const message = serializeRemoteProgressError(error);

  return (
    message.includes("public.user_progress") ||
    message.includes("PGRST205") ||
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}

export function isIgnorableRemoteProgressError(error: unknown) {
  const message = serializeRemoteProgressError(error);

  return (
    isUnavailableUserProgressBackend(error) ||
    message.includes("another request stole it") ||
    message.includes("NavigatorLockAcquireTimeoutError") ||
    message.includes("LockManager")
  );
}

function markUnavailableUserProgressBackend(error: unknown) {
  if (userProgressTableMissing) {
    return;
  }

  userProgressTableMissing = true;
  console.warn(
    "Remote progress sync is disabled because the Supabase user_progress backend is unavailable. Apply the latest migration and confirm authenticated read/write access.",
    error,
  );
}

function dispatchLeaderboardRefresh() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(leaderboardRefreshEventName));
}

export function normalizeCourseProgress(
  progress: CourseProgressRecord | null | undefined,
): CourseProgressRecord {
  const completedLessonIds = Array.from(
    new Set(progress?.completedLessonIds ?? []),
  ).sort();
  const derivedXp = completedLessonIds.length * 10;

  return {
    completedLessonIds,
    hearts:
      typeof progress?.hearts === "number"
        ? Math.max(0, Math.min(5, Math.floor(progress.hearts)))
        : 5,
    lastOpenedLessonId:
      typeof progress?.lastOpenedLessonId === "string"
        ? progress.lastOpenedLessonId
        : null,
    lastHeartRefillAt:
      typeof progress?.lastHeartRefillAt === "string"
        ? progress.lastHeartRefillAt
        : null,
    lastStreakActiveOn:
      typeof progress?.lastStreakActiveOn === "string"
        ? progress.lastStreakActiveOn
        : null,
    seededDemo: Boolean(progress?.seededDemo),
    streakCount:
      typeof progress?.streakCount === "number"
        ? Math.max(1, Math.floor(progress.streakCount))
        : 1,
    totalXp: derivedXp,
  };
}

export function mergeCourseProgress(
  localProgress: CourseProgressRecord | null | undefined,
  remoteProgress: CourseProgressRecord | null | undefined,
): CourseProgressRecord {
  const local = normalizeCourseProgress(localProgress);
  const remote = normalizeCourseProgress(remoteProgress);
  const mergedHearts = mergeHearts(local, remote);

  return {
    completedLessonIds: Array.from(
      new Set([...local.completedLessonIds, ...remote.completedLessonIds]),
    ).sort(),
    hearts: mergedHearts,
    lastOpenedLessonId: local.lastOpenedLessonId ?? remote.lastOpenedLessonId,
    lastHeartRefillAt: mergeHeartRefillAt(local, remote, mergedHearts),
    lastStreakActiveOn:
      local.lastStreakActiveOn && remote.lastStreakActiveOn
        ? local.lastStreakActiveOn > remote.lastStreakActiveOn
          ? local.lastStreakActiveOn
          : remote.lastStreakActiveOn
        : local.lastStreakActiveOn ?? remote.lastStreakActiveOn,
    seededDemo: local.seededDemo || remote.seededDemo,
    streakCount: Math.max(local.streakCount, remote.streakCount),
    totalXp: Math.max(local.totalXp, remote.totalXp),
  };
}

function mergeHearts(local: CourseProgressRecord, remote: CourseProgressRecord) {
  const localNeedsRefill = local.hearts < maxHearts;
  const remoteNeedsRefill = remote.hearts < maxHearts;

  if (localNeedsRefill && !remoteNeedsRefill) {
    return local.hearts;
  }

  if (!localNeedsRefill && remoteNeedsRefill) {
    return remote.hearts;
  }

  return Math.min(local.hearts, remote.hearts);
}

function mergeHeartRefillAt(
  local: CourseProgressRecord,
  remote: CourseProgressRecord,
  hearts: number,
) {
  if (hearts >= maxHearts) {
    return null;
  }

  if (local.hearts === hearts && remote.hearts !== hearts) {
    return local.lastHeartRefillAt ?? remote.lastHeartRefillAt;
  }

  if (remote.hearts === hearts && local.hearts !== hearts) {
    return remote.lastHeartRefillAt ?? local.lastHeartRefillAt;
  }

  if (local.lastHeartRefillAt && remote.lastHeartRefillAt) {
    return new Date(local.lastHeartRefillAt).getTime() > new Date(remote.lastHeartRefillAt).getTime()
      ? local.lastHeartRefillAt
      : remote.lastHeartRefillAt;
  }

  return local.lastHeartRefillAt ?? remote.lastHeartRefillAt;
}

export function courseProgressEquals(
  left: CourseProgressRecord | null | undefined,
  right: CourseProgressRecord | null | undefined,
) {
  const a = normalizeCourseProgress(left);
  const b = normalizeCourseProgress(right);

  return (
    a.hearts === b.hearts &&
    a.seededDemo === b.seededDemo &&
    a.lastHeartRefillAt === b.lastHeartRefillAt &&
    a.lastOpenedLessonId === b.lastOpenedLessonId &&
    a.lastStreakActiveOn === b.lastStreakActiveOn &&
    a.streakCount === b.streakCount &&
    a.totalXp === b.totalXp &&
    a.completedLessonIds.length === b.completedLessonIds.length &&
    a.completedLessonIds.every((value, index) => value === b.completedLessonIds[index])
  );
}

function pickGoogleDisplayName(user: User | null) {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata;

  if (typeof metadata?.nickname === "string" && metadata.nickname.trim()) {
    return metadata.nickname.trim();
  }

  if (typeof metadata?.full_name === "string" && metadata.full_name.trim()) {
    return metadata.full_name.trim().split(" ")[0] ?? metadata.full_name.trim();
  }

  if (typeof metadata?.name === "string" && metadata.name.trim()) {
    return metadata.name.trim().split(" ")[0] ?? metadata.name.trim();
  }

  return null;
}

export function applyRemoteIdentityDefaults(user: User | null, row?: RemoteUserProgressRow | null) {
  const remoteNickname = row?.nickname?.trim();

  if (remoteNickname && remoteNickname !== "Learner") {
    setNickname(remoteNickname);
  } else {
    const googleName = pickGoogleDisplayName(user);

    if (googleName) {
      setNickname(googleName);
    }
  }

  if (row?.certificate_id) {
    setCertificateId(row.certificate_id);
  }
}

export async function loadRemoteProgress(userId: string) {
  if (userProgressTableMissing) {
    return null;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select(
      "user_id, completed_lesson_ids, hearts, last_opened_lesson_id, last_heart_refill_at, last_streak_active_on, seeded_demo, nickname, certificate_id, last_login_ip, last_login_at, streak_count, total_xp, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle<RemoteUserProgressRow>();

  if (error) {
    if (isUnavailableUserProgressBackend(error)) {
      markUnavailableUserProgressBackend(error);
      return null;
    }

    throw error;
  }

  return data ?? null;
}

export function remoteRowToCourseProgress(row: RemoteUserProgressRow | null) {
  if (!row) {
    return null;
  }

  return normalizeCourseProgress({
    completedLessonIds: row.completed_lesson_ids ?? [],
    hearts: row.hearts ?? 5,
    lastOpenedLessonId: row.last_opened_lesson_id,
    lastHeartRefillAt: row.last_heart_refill_at,
    lastStreakActiveOn: row.last_streak_active_on,
    seededDemo: Boolean(row.seeded_demo),
    streakCount: row.streak_count ?? 1,
    totalXp: row.total_xp ?? 0,
  });
}

export async function syncProgressToSupabase(
  userId: string,
  progress: CourseProgressRecord,
  nickname = getNickname(),
  certificateId = getStoredCertificateId() ?? getCertificateId(),
) {
  if (userProgressTableMissing) {
    return;
  }

  const normalized = normalizeCourseProgress(progress);
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      completed_lesson_ids: normalized.completedLessonIds,
      hearts: normalized.hearts,
      last_opened_lesson_id: normalized.lastOpenedLessonId,
      last_heart_refill_at: normalized.lastHeartRefillAt,
      last_streak_active_on: normalized.lastStreakActiveOn,
      seeded_demo: normalized.seededDemo,
      nickname,
      certificate_id: certificateId,
      streak_count: normalized.streakCount,
      total_xp: normalized.totalXp,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    if (isUnavailableUserProgressBackend(error)) {
      markUnavailableUserProgressBackend(error);
      return;
    }

    throw error;
  }
}

export async function syncCurrentUserProgressIfAuthenticated(progress: CourseProgressRecord) {
  if (userProgressTableMissing) {
    return;
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return;
  }

  await syncProgressToSupabase(session.user.id, progress);
}

export async function syncNicknameForCurrentUser(nickname: string) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return;
  }

  const certificateId = getStoredCertificateId() ?? getCertificateId();
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: session.user.id,
      nickname,
      certificate_id: certificateId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    if (isUnavailableUserProgressBackend(error)) {
      markUnavailableUserProgressBackend(error);
      return;
    }

    throw error;
  }

  dispatchLeaderboardRefresh();
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitFor<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms.`));
      }, timeoutMs);
    }),
  ]);
}

export async function saveNicknameForCurrentUser(
  nickname: string,
  options?: {
    attempts?: number;
    retryDelayMs?: number;
    timeoutMs?: number;
  },
) {
  const attempts = options?.attempts ?? 3;
  const retryDelayMs = options?.retryDelayMs ?? 1200;
  const timeoutMs = options?.timeoutMs ?? 2500;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await waitFor(syncNicknameForCurrentUser(nickname), timeoutMs);
      return true;
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to save nickname remotely.");
}

export function mapRealtimePayloadToRow(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) {
  return payload.new as unknown as RemoteUserProgressRow;
}
