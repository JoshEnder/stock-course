"use client";

import Link from "next/link";
import { AnimatedNumber } from "./animated-number";
import { GraduationCapIcon, StarIcon, TrendingUpIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

type CourseProgressHeaderProps = {
  completionPercent: number;
  completedLessons: number;
  currentModuleId: number;
  nickname: string;
  rank: string;
  resumeHref: string;
  streak: number;
  totalLessons: number;
};

export function CourseProgressHeader({
  completionPercent,
  completedLessons,
  currentModuleId,
  nickname,
  rank,
  resumeHref,
  streak,
  totalLessons,
}: CourseProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/80 bg-[rgba(250,251,253,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-8 px-8 py-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link className="interactive-cta flex items-center gap-3" href="/" prefetch={false}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] text-white shadow-[0_14px_30px_rgba(22,163,74,0.22)]">
              <GraduationCapIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Premium Course Map
              </p>
              <h1 className="truncate text-lg font-semibold text-slate-950">
                Market Academy
              </h1>
            </div>
          </Link>

          <div className="surface-lift hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.07)] xl:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <StarIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Streak</p>
              <p className="text-sm font-semibold text-slate-900">
                <AnimatedNumber className="progress-value live" value={streak} /> day climb
              </p>
            </div>
          </div>

          <div className="surface-lift hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.07)] xl:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <TrendingUpIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Current</p>
              <p className="text-sm font-semibold text-slate-900">
                Module <AnimatedNumber className="progress-value live" value={currentModuleId} />
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-5">
          <div className="surface-lift hidden min-w-[280px] max-w-[360px] flex-1 rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.07)] lg:block">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-600">
                <AnimatedNumber className="progress-value live" value={completedLessons} />/{totalLessons} lessons complete
              </span>
              <AnimatedNumber
                className="progress-value live font-semibold text-slate-900"
                suffix="%"
                value={completionPercent}
              />
            </div>
            <ProgressBar value={completionPercent} />
          </div>

          <div className="hidden text-right lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {rank}
            </p>
            <p className="text-sm text-slate-600">{nickname}</p>
          </div>

          <Link
            className="interactive-cta inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(22,163,74,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
            data-success="true"
            href={resumeHref}
            prefetch={false}
          >
            Resume lesson
          </Link>
        </div>
      </div>
    </header>
  );
}
