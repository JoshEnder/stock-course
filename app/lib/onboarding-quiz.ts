"use client";

import { getNickname } from "./course-storage";

export const QUIZ_KEY = "stoked_quiz";

export type QuizData = {
  nickname: string;
  experienceLevel: string;
  goal: string;
  timeCommitment: string;
  completedAt: string;
};

export function getQuizData(): QuizData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    return raw ? (JSON.parse(raw) as QuizData) : null;
  } catch {
    return null;
  }
}

export function saveQuizData(data: QuizData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUIZ_KEY, JSON.stringify(data));
}

export function buildQuizData(input: Partial<QuizData>): QuizData {
  const nickname = (input.nickname || getNickname() || "Learner").trim() || "Learner";

  return {
    nickname,
    experienceLevel: input.experienceLevel ?? "new",
    goal: input.goal ?? "wealth",
    timeCommitment: input.timeCommitment ?? "flexible",
    completedAt: input.completedAt ?? new Date().toISOString(),
  };
}
