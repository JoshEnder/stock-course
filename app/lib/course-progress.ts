"use client";

import {
  createDemoCourseProgress,
  defaultCourseProgress,
  type CourseProgressRecord,
} from "./course-engine";
import { syncCurrentUserProgressIfAuthenticated } from "./remote-progress";

const courseProgressStorageKey = "premiumStockCourseMapProgress";
const storageEventName = "premium-stock-course-map-storage";
const noopSubscribe = () => () => undefined;
const emptyProgressSnapshot = defaultCourseProgress;
const maxHearts = 5;
const signedInHeartRegenMs = 3 * 60 * 60 * 1000;
let hasLoadedProgressSnapshot = false;
let cachedProgressRaw: string | null = null;
let cachedProgressSnapshot: CourseProgressRecord = emptyProgressSnapshot;

function getLocalDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dayKey: string, delta: number) {
  const date = new Date(`${dayKey}T12:00:00`);
  date.setDate(date.getDate() + delta);
  return getLocalDayKey(date);
}

function safeParseProgress(raw: string | null) {
  if (!raw) {
    return emptyProgressSnapshot;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CourseProgressRecord>;

    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? [...new Set(parsed.completedLessonIds.filter(Boolean))]
        : [],
      hearts:
        typeof parsed.hearts === "number"
          ? Math.max(0, Math.min(maxHearts, Math.floor(parsed.hearts)))
          : maxHearts,
      lastOpenedLessonId:
        typeof parsed.lastOpenedLessonId === "string" ? parsed.lastOpenedLessonId : null,
      lastHeartRefillAt:
        typeof parsed.lastHeartRefillAt === "string" ? parsed.lastHeartRefillAt : null,
      lastStreakActiveOn:
        typeof parsed.lastStreakActiveOn === "string" ? parsed.lastStreakActiveOn : null,
      seededDemo: Boolean(parsed.seededDemo),
      streakCount:
        typeof parsed.streakCount === "number"
          ? Math.max(1, Math.floor(parsed.streakCount))
          : 1,
    };
  } catch {
    return emptyProgressSnapshot;
  }
}

function syncCourseProgressSnapshot(raw?: string | null) {
  const nextRaw =
    raw === undefined
      ? window.localStorage.getItem(courseProgressStorageKey)
      : raw;

  if (hasLoadedProgressSnapshot && nextRaw === cachedProgressRaw) {
    return cachedProgressSnapshot;
  }

  cachedProgressRaw = nextRaw ?? null;
  cachedProgressSnapshot = safeParseProgress(cachedProgressRaw);
  hasLoadedProgressSnapshot = true;
  return cachedProgressSnapshot;
}

function writeCourseProgressSnapshot(progress: CourseProgressRecord) {
  if (typeof window === "undefined") {
    return emptyProgressSnapshot;
  }

  const normalized = safeParseProgress(JSON.stringify(progress));
  const nextRaw = JSON.stringify(normalized);

  if (hasLoadedProgressSnapshot && nextRaw === cachedProgressRaw) {
    return cachedProgressSnapshot;
  }

  cachedProgressRaw = nextRaw;
  cachedProgressSnapshot = normalized;
  hasLoadedProgressSnapshot = true;
  window.localStorage.setItem(courseProgressStorageKey, nextRaw);
  window.dispatchEvent(new Event(storageEventName));
  return cachedProgressSnapshot;
}

export function getStoredCourseProgress() {
  if (typeof window === "undefined") {
    return emptyProgressSnapshot;
  }

  return syncCourseProgressSnapshot();
}

export function getEffectiveHearts(progress: CourseProgressRecord, isSignedIn: boolean) {
  if (!isSignedIn) {
    return Math.max(0, Math.min(maxHearts, progress.hearts));
  }

  if (progress.hearts >= maxHearts || !progress.lastHeartRefillAt) {
    return Math.max(0, Math.min(maxHearts, progress.hearts));
  }

  const elapsed = Date.now() - new Date(progress.lastHeartRefillAt).getTime();

  if (elapsed <= 0) {
    return progress.hearts;
  }

  const regenerated = Math.floor(elapsed / signedInHeartRegenMs);
  return Math.min(maxHearts, progress.hearts + regenerated);
}

export function getServerCourseProgressSnapshot() {
  return emptyProgressSnapshot;
}

type SaveStoredCourseProgressOptions = {
  skipRemoteSync?: boolean;
};

export function saveStoredCourseProgress(
  progress: CourseProgressRecord,
  options?: SaveStoredCourseProgressOptions,
) {
  if (typeof window === "undefined") {
    return emptyProgressSnapshot;
  }

  const next = writeCourseProgressSnapshot(progress);

  if (!options?.skipRemoteSync) {
    void syncCurrentUserProgressIfAuthenticated(next).catch((error) => {
      console.error("Failed to sync progress to Supabase", error);
    });
  }

  return next;
}

export function refreshStoredHearts(isSignedIn: boolean) {
  const progress = getStoredCourseProgress();

  if (!isSignedIn || progress.hearts >= maxHearts || !progress.lastHeartRefillAt) {
    return progress;
  }

  const refillStart = new Date(progress.lastHeartRefillAt).getTime();
  const elapsed = Date.now() - refillStart;

  if (elapsed < signedInHeartRegenMs) {
    return progress;
  }

  const regenerated = Math.floor(elapsed / signedInHeartRegenMs);
  const hearts = Math.min(maxHearts, progress.hearts + regenerated);
  const updated: CourseProgressRecord = {
    ...progress,
    hearts,
    lastHeartRefillAt:
      hearts >= maxHearts
        ? null
        : new Date(refillStart + regenerated * signedInHeartRegenMs).toISOString(),
  };

  return saveStoredCourseProgress(updated);
}

export function spendHeart(isSignedIn: boolean) {
  const progress = isSignedIn ? refreshStoredHearts(true) : getStoredCourseProgress();
  const hearts = Math.max(0, progress.hearts - 1);

  if (hearts === progress.hearts) {
    return progress;
  }

  return saveStoredCourseProgress({
    ...progress,
    hearts,
    lastHeartRefillAt:
      isSignedIn && hearts < maxHearts
        ? progress.lastHeartRefillAt ?? new Date().toISOString()
        : progress.lastHeartRefillAt,
  });
}

export function openLesson(lessonId: string) {
  const progress = getStoredCourseProgress();

  if (progress.lastOpenedLessonId === lessonId) {
    return progress;
  }

  return saveStoredCourseProgress({
    ...progress,
    lastOpenedLessonId: lessonId,
  });
}

export function completeLesson(lessonId: string) {
  const progress = getStoredCourseProgress();
  const today = getLocalDayKey();
  let streakCount = progress.streakCount;

  if (progress.lastStreakActiveOn !== today) {
    if (progress.lastStreakActiveOn === addDays(today, -1)) {
      streakCount += 1;
    } else {
      streakCount = 1;
    }
  }

  if (progress.completedLessonIds.includes(lessonId)) {
    if (progress.lastOpenedLessonId === lessonId) {
      return progress;
    }

    return saveStoredCourseProgress({
      ...progress,
      lastOpenedLessonId: lessonId,
      lastStreakActiveOn: today,
      streakCount,
    });
  }

  const next: CourseProgressRecord = {
    ...progress,
    completedLessonIds: [...progress.completedLessonIds, lessonId],
    hearts: progress.hearts,
    lastOpenedLessonId: lessonId,
    lastHeartRefillAt: progress.lastHeartRefillAt,
    lastStreakActiveOn: today,
    streakCount,
  };

  return saveStoredCourseProgress(next);
}

export function resetCourseProgress() {
  saveStoredCourseProgress(defaultCourseProgress);
}

export function seedDemoCourseProgress() {
  saveStoredCourseProgress(createDemoCourseProgress());
}

export function subscribeToCourseProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return noopSubscribe();
  }

  const handleStorage = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key &&
      event.key !== courseProgressStorageKey
    ) {
      return;
    }

    syncCourseProgressSnapshot();
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(storageEventName, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(storageEventName, handleStorage);
  };
}

export function subscribeToProgressHydration() {
  return noopSubscribe();
}
