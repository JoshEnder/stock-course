"use client";

import { resetCourseProgress } from "../lib/course-progress";
import { AnimatedNumber } from "./animated-number";
import { JourneyLink } from "./journey-link";
import { QaLessonJump } from "./qa-lesson-jump";

type CourseHeroProps = {
  completionPercent: number;
  currentModuleTitle: string;
  nickname: string;
  resumeHref: string;
};

export function CourseHero({
  completionPercent,
  currentModuleTitle,
  nickname,
  resumeHref,
}: CourseHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] px-7 py-6"
      style={{
        border: "1px solid var(--alpine-border-soft)",
        background:
          "linear-gradient(135deg, rgba(22,49,74,0.96) 0%, rgba(16,36,58,0.94) 52%, rgba(10,22,38,0.98) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), var(--alpine-shadow-lg)",
      }}
    >
      <div className="course-grid absolute inset-0 opacity-60" />
      <div className="absolute right-[-5rem] top-[-5rem] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(127,231,242,0.14)_0%,rgba(127,231,242,0)_72%)]" />
      <div className="absolute bottom-[-6rem] left-[-3rem] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(39,211,195,0.12)_0%,rgba(39,211,195,0)_70%)]" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--alpine-text-tertiary)" }}>
            Current climb
          </p>
          <h2 className="max-w-2xl text-[2.3rem] font-semibold leading-[1.02] tracking-[-0.05em] md:text-[2.55rem]" style={{ color: "var(--alpine-text)" }}>
            {nickname}, keep climbing.
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{
                border: "1px solid rgba(95,143,179,0.18)",
                background: "rgba(22,49,74,0.76)",
                color: "var(--alpine-cyan)",
                boxShadow: "0 10px 24px rgba(3,10,20,0.16)",
              }}
            >
              {currentModuleTitle}
            </span>
            <span className="text-sm" style={{ color: "var(--alpine-text-secondary)" }}>
              <AnimatedNumber className="progress-value live" suffix="%" value={completionPercent} /> of the course complete
            </span>
          </div>
        </div>

        <div className="flex w-fit flex-col items-start gap-2">
          <QaLessonJump />
          <button
            className="interactive-cta inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              border: "1px solid var(--alpine-border-soft)",
              background:
                "linear-gradient(180deg, rgba(19,58,90,0.76) 0%, rgba(11,28,46,0.9) 100%)",
              color: "var(--alpine-text-secondary)",
              boxShadow: "var(--alpine-shadow-md)",
            }}
            onClick={resetCourseProgress}
            type="button"
          >
            Restart from lesson 1
          </button>
          <JourneyLink
            className="interactive-cta inline-flex w-fit items-center rounded-2xl bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(22,163,74,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
            data-success="true"
            href={resumeHref}
            intent="lesson"
            prefetch={false}
          >
            Enter next lesson
          </JourneyLink>
        </div>
      </div>
    </section>
  );
}
