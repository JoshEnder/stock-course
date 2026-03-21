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
  updated_at: string | null;
  user_id: string;
};

let userProgressTableMissing = false;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isMissingUserProgressTable(error: unknown) {
  const message = serializeError(error);

  return message.includes("public.user_progress") || message.includes("PGRST205");
}

function markMissingUserProgressTable(error: unknown) {
  if (userProgressTableMissing) {
    return;
  }

  userProgressTableMissing = true;
  console.warn(
    "Remote progress sync is disabled because public.user_progress is missing. Apply supabase/migrations/20260321_create_user_progress.sql to your Supabase project.",
    error,
  );
}

export function normalizeCourseProgress(
  progress: CourseProgressRecord | null | undefined,
): CourseProgressRecord {
  return {
    completedLessonIds: Array.from(
      new Set(progress?.completedLessonIds ?? []),
    ).sort(),
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
  };
}

export function mergeCourseProgress(
  localProgress: CourseProgressRecord | null | undefined,
  remoteProgress: CourseProgressRecord | null | undefined,
): CourseProgressRecord {
  const local = normalizeCourseProgress(localProgress);
  const remote = normalizeCourseProgress(remoteProgress);

  return {
    completedLessonIds: Array.from(
      new Set([...local.completedLessonIds, ...remote.completedLessonIds]),
    ).sort(),
    hearts: Math.max(local.hearts, remote.hearts),
    lastOpenedLessonId: local.lastOpenedLessonId ?? remote.lastOpenedLessonId,
    lastHeartRefillAt:
      local.lastHeartRefillAt && remote.lastHeartRefillAt
        ? new Date(local.lastHeartRefillAt).getTime() > new Date(remote.lastHeartRefillAt).getTime()
          ? local.lastHeartRefillAt
          : remote.lastHeartRefillAt
        : local.lastHeartRefillAt ?? remote.lastHeartRefillAt,
    lastStreakActiveOn:
      local.lastStreakActiveOn && remote.lastStreakActiveOn
        ? local.lastStreakActiveOn > remote.lastStreakActiveOn
          ? local.lastStreakActiveOn
          : remote.lastStreakActiveOn
        : local.lastStreakActiveOn ?? remote.lastStreakActiveOn,
    seededDemo: local.seededDemo || remote.seededDemo,
    streakCount: Math.max(local.streakCount, remote.streakCount),
  };
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
      "user_id, completed_lesson_ids, hearts, last_opened_lesson_id, last_heart_refill_at, last_streak_active_on, seeded_demo, nickname, certificate_id, last_login_ip, last_login_at, streak_count, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle<RemoteUserProgressRow>();

  if (error) {
    if (isMissingUserProgressTable(error)) {
      markMissingUserProgressTable(error);
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
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    if (isMissingUserProgressTable(error)) {
      markMissingUserProgressTable(error);
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
    if (isMissingUserProgressTable(error)) {
      markMissingUserProgressTable(error);
      return;
    }

    throw error;
  }
}

export function mapRealtimePayloadToRow(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) {
  return payload.new as unknown as RemoteUserProgressRow;
}
