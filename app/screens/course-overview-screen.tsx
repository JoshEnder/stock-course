"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  CheckCircleIcon,
  CircleIcon,
  LockIcon,
  TrendingUpIcon,
} from "../components/icons";
import { ProgressBar } from "../components/progress-bar";
import { ScrollReveal } from "../components/scroll-reveal";
import { SiteHeader } from "../components/site-header";
import { lessonCatalog } from "../lib/course-data";
import {
  defaultProgress,
  getCourseProgress,
  getNickname,
  subscribeToHydration,
  subscribeToCourseStorage,
} from "../lib/course-storage";

export function CourseOverviewScreen() {
  const storedNickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const storedProgressState = useSyncExternalStore(
    subscribeToCourseStorage,
    getCourseProgress,
    () => defaultProgress,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const nickname = isHydrated ? storedNickname : "Learner";
  const progressState = isHydrated ? storedProgressState : defaultProgress;

  const completedCount = progressState.completedLessonIds.length;
  const progress = (completedCount / lessonCatalog.length) * 100;

  return (
    <main className="alpine-page">
      <SiteHeader nickname={nickname} showProfile={true} />

      <div className="alpine-page__inner pt-10">
        <section className="alpine-panel alpine-panel--accent p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className="alpine-kicker">Course overview</p>
              <h1 className="alpine-heading mt-3">
                Welcome back, <span style={{ color: "var(--alpine-cream)" }}>{nickname}</span>
              </h1>
              <p className="alpine-copy mt-4">
                Continue Beginner Stock Foundations with a clearer view of what is
                complete, what is unlocked next, and what still needs review.
              </p>
            </div>

            <div className="alpine-chip alpine-chip--accent">
              <TrendingUpIcon className="h-4 w-4" />
              <span>
                {completedCount}/{lessonCatalog.length} lessons complete
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: "var(--alpine-text-secondary)" }}>
                Course progress
              </span>
              <span
                style={{
                  color: "var(--alpine-text)",
                  fontWeight: 600,
                }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar
              value={progress}
              className="h-3 bg-[rgba(127,231,242,0.14)]"
            />
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="alpine-label">Learning path</p>
                <h2
                  className="mt-2 text-2xl font-semibold"
                  style={{ color: "var(--alpine-text)" }}
                >
                  Beginner Stock Foundations
                </h2>
              </div>
              <div className="alpine-chip">10 lessons</div>
            </div>

            <ScrollReveal delayMs={40}>
              <div className="space-y-4">
                {lessonCatalog.map((lesson) => {
                  const completed = progressState.completedLessonIds.includes(lesson.id);
                  const playable =
                    lesson.id === 1 ||
                    progressState.completedLessonIds.includes((lesson.id - 1) as number);

                  return playable ? (
                    <Link
                      key={lesson.id}
                      className="group block alpine-panel p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(127,231,242,0.18)] hover:bg-[linear-gradient(180deg,rgba(22,49,74,0.96),rgba(17,38,58,0.94))]"
                      href={`/lesson/${lesson.id}`}
                    >
                      <LessonRow
                        completed={completed}
                        description={lesson.description}
                        duration={lesson.duration}
                        locked={false}
                        title={lesson.title}
                      />
                    </Link>
                  ) : (
                    <div
                      key={lesson.id}
                      className="alpine-panel alpine-panel--muted p-6 opacity-70"
                    >
                      <LessonRow
                        completed={false}
                        description={lesson.description}
                        duration={lesson.duration}
                        locked={true}
                        title={lesson.title}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </section>

          <aside className="space-y-6">
            <ScrollReveal delayMs={100}>
              <section className="alpine-panel alpine-panel--muted p-6">
                <p className="alpine-label" style={{ color: "var(--alpine-teal)" }}>
                  Your goal
                </p>
                <h2
                  className="mt-3 text-xl font-semibold"
                  style={{ color: "var(--alpine-cream)" }}
                >
                  Finish all 10 lessons
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
                  Unlock your certificate and build confidence with ownership,
                  exchanges, risk, market cap, and beginner stock decisions.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delayMs={140}>
              <section className="alpine-panel p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="alpine-label">Review queue</p>
                    <h2
                      className="mt-2 text-xl font-semibold"
                      style={{ color: "var(--alpine-text)" }}
                    >
                      Lightweight follow-up
                    </h2>
                  </div>
                  <span className="alpine-chip">
                    {progressState.reviewQueue.length} item
                    {progressState.reviewQueue.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
                  Wrong answers are saved here for quick reinforcement before they
                  pile up.
                </p>

                {progressState.reviewQueue.length ? (
                  <ul className="mt-5 space-y-3">
                    {progressState.reviewQueue.map((item) => (
                      <li key={item} className="alpine-list-row">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              "linear-gradient(180deg,var(--alpine-teal),var(--alpine-cyan))",
                            boxShadow: "0 0 0 3px rgba(39,211,195,0.15)",
                          }}
                        />
                        <span
                          className="min-w-0 flex-1 text-sm leading-6"
                          style={{ color: "var(--alpine-text)" }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="alpine-note-success mt-5">
                    No review items yet. Keep climbing.
                  </div>
                )}
              </section>
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </main>
  );
}

function LessonRow({
  completed,
  description,
  duration,
  locked,
  title,
}: {
  completed: boolean;
  description: string;
  duration: string;
  locked: boolean;
  title: string;
}) {
  const iconColor = locked
    ? "var(--alpine-text-dim)"
    : completed
      ? "var(--alpine-teal)"
      : "var(--alpine-cyan)";

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
        {completed ? (
          <CheckCircleIcon className="h-8 w-8" style={{ color: iconColor }} />
        ) : locked ? (
          <LockIcon className="h-8 w-8" style={{ color: iconColor }} />
        ) : (
          <CircleIcon className="h-8 w-8" style={{ color: iconColor }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h3
            className="text-base font-semibold transition-colors duration-200 group-hover:text-[var(--alpine-cream)]"
            style={{ color: "var(--alpine-text)" }}
          >
            {title}
          </h3>
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--alpine-text-tertiary)" }}
          >
            {duration}
          </span>
        </div>
        <p className="text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
