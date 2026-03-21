"use client";

export const nicknameStorageKey = "userNickname";
const progressStorageKey = "stockAcademyProgress";
const certificateIdKey = "stockAcademyCertificateId";
const storageEventName = "stock-academy-storage";
const noopSubscribe = () => () => undefined;

export type CourseProgress = {
  completedLessonIds: number[];
  reviewQueue: string[];
};

export const defaultProgress: CourseProgress = {
  completedLessonIds: [],
  reviewQueue: [],
};
const emptyProgressSnapshot = defaultProgress;
let cachedProgressRaw: string | null = null;
let cachedProgressSnapshot: CourseProgress = emptyProgressSnapshot;

export function getNickname() {
  if (typeof window === "undefined") {
    return "Learner";
  }

  return window.localStorage.getItem(nicknameStorageKey) || "Learner";
}

export function setNickname(nickname: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(nicknameStorageKey, nickname);
  window.dispatchEvent(new Event(storageEventName));
}

export function clearNickname() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(nicknameStorageKey);
  window.dispatchEvent(new Event(storageEventName));
}

export function getCourseProgress(): CourseProgress {
  if (typeof window === "undefined") {
    return emptyProgressSnapshot;
  }

  const raw = window.localStorage.getItem(progressStorageKey);

  if (!raw) {
    cachedProgressRaw = null;
    cachedProgressSnapshot = emptyProgressSnapshot;
    return cachedProgressSnapshot;
  }

  if (raw === cachedProgressRaw) {
    return cachedProgressSnapshot;
  }

  try {
    const parsed = JSON.parse(raw) as CourseProgress;
    cachedProgressRaw = raw;
    cachedProgressSnapshot = {
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? parsed.completedLessonIds
        : [],
      reviewQueue: Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue : [],
    };
    return cachedProgressSnapshot;
  } catch {
    cachedProgressRaw = null;
    cachedProgressSnapshot = emptyProgressSnapshot;
    return cachedProgressSnapshot;
  }
}

export function saveCourseProgress(progress: CourseProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  window.dispatchEvent(new Event(storageEventName));
}

export function addReviewPrompt(prompt: string) {
  const progress = getCourseProgress();

  if (!prompt || progress.reviewQueue.includes(prompt)) {
    return progress;
  }

  const next = {
    ...progress,
    reviewQueue: [...progress.reviewQueue, prompt],
  };

  saveCourseProgress(next);
  return next;
}

export function markLessonComplete(lessonId: number) {
  const progress = getCourseProgress();

  if (progress.completedLessonIds.includes(lessonId)) {
    return progress;
  }

  const next = {
    ...progress,
    completedLessonIds: [...progress.completedLessonIds, lessonId].sort(),
  };

  saveCourseProgress(next);
  return next;
}

export function getCertificateId() {
  if (typeof window === "undefined") {
    return "SF-DEMO";
  }

  const existing = window.localStorage.getItem(certificateIdKey);

  if (existing) {
    return existing;
  }

  const next = `SF-${Date.now().toString(36).toUpperCase()}`;
  window.localStorage.setItem(certificateIdKey, next);
  window.dispatchEvent(new Event(storageEventName));
  return next;
}

export function getStoredCertificateId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(certificateIdKey);
}

export function setCertificateId(certificateId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(certificateIdKey, certificateId);
  window.dispatchEvent(new Event(storageEventName));
}

export function clearCertificateId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(certificateIdKey);
  window.dispatchEvent(new Event(storageEventName));
}

export function subscribeToCourseStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = () => onStoreChange();
  window.addEventListener("storage", handleStorage);
  window.addEventListener(storageEventName, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(storageEventName, handleStorage);
  };
}

export function subscribeToHydration() {
  return noopSubscribe();
}
