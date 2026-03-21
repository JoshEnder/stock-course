"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DerivedLesson, DerivedModule } from "../lib/course-engine";
import {
  BarChartIcon,
  BuildingIcon,
  CircleIcon,
  CompassIcon,
  LayersIcon,
  LineChartIcon,
  PercentIcon,
  PieChartIcon,
  PuzzleIcon,
  TrophyIcon,
  TrendingUpIcon,
} from "./icons";
import { AnimatedNumber } from "./animated-number";
import { LessonNode } from "./lesson-node";
import { ProgressBar } from "./progress-bar";

type ModuleSectionProps = {
  module: DerivedModule;
};

const lessonPath = [
  { x: 6, y: 81 },
  { x: 15, y: 71 },
  { x: 26, y: 60 },
  { x: 37, y: 66 },
  { x: 48, y: 53 },
  { x: 59, y: 43 },
  { x: 70, y: 56 },
  { x: 80, y: 38 },
  { x: 89, y: 28 },
  { x: 95, y: 20 },
];

const moduleIcons = {
  compass: CompassIcon,
  "line-chart": LineChartIcon,
  "trending-up": TrendingUpIcon,
  layers: LayersIcon,
  "bar-chart": BarChartIcon,
  building: BuildingIcon,
  "pie-chart": PieChartIcon,
  percent: PercentIcon,
  puzzle: PuzzleIcon,
  trophy: TrophyIcon,
};

function buildCurvePath() {
  return lessonPath.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = lessonPath[index - 1];
    const midpointY = (previous.y + point.y) / 2;
    return `${path} C ${previous.x} ${midpointY}, ${point.x} ${midpointY}, ${point.x} ${point.y}`;
  }, "");
}

const pathD = buildCurvePath();

export function ModuleSection({ module }: ModuleSectionProps) {
  const Icon = moduleIcons[module.icon] ?? CircleIcon;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isReturnFocused, setIsReturnFocused] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [sequenceKey, setSequenceKey] = useState(0);
  const lessonItems = module.lessons as DerivedLesson[];
  const currentLessonId = useMemo(
    () => lessonItems.find((lesson) => lesson.state === "current")?.id ?? null,
    [lessonItems],
  );
  const previousStateRef = useRef({
    currentLessonId,
    lessonCount: module.completionCount,
    moduleId: module.id,
  });
  const sectionStyle = {
    "--module-color": module.accentColor,
    "--module-soft": module.accentSoft,
    "--module-soft-alt": module.accentSoftAlt,
  } as CSSProperties;
  const gradientId = `module-path-gradient-${module.id}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAnimatedProgress(module.progressPercent);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [module.progressPercent, module.id]);

  useEffect(() => {
    setIsReturnFocused(true);

    const timeout = window.setTimeout(() => {
      setIsReturnFocused(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [module.id]);

  useEffect(() => {
    const previous = previousStateRef.current;
    const hasAdvanced =
      module.completionCount > previous.lessonCount ||
      (currentLessonId !== null && previous.currentLessonId !== currentLessonId);

    if (!hasAdvanced) {
      previousStateRef.current = {
        currentLessonId,
        lessonCount: module.completionCount,
        moduleId: module.id,
      };
      return;
    }

    setIsAdvancing(true);
    setIsReturnFocused(true);
    setSequenceKey((value) => value + 1);

    const timeout = window.setTimeout(() => {
      setIsAdvancing(false);
    }, 1680);

    const focusTimeout = window.setTimeout(() => {
      setIsReturnFocused(false);
    }, 2100);

    previousStateRef.current = {
      currentLessonId,
      lessonCount: module.completionCount,
      moduleId: module.id,
    };

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(focusTimeout);
    };
  }, [currentLessonId, module.completionCount, module.id]);

  useEffect(() => {
    const storageKey = "stock-course:last-current-module";
    const previousId = window.sessionStorage.getItem(storageKey);

    if (previousId && Number(previousId) !== module.id) {
      setIsUnlocking(true);
      setIsReturnFocused(true);

      const timeout = window.setTimeout(() => {
        setIsUnlocking(false);
      }, 2600);

      const focusTimeout = window.setTimeout(() => {
        setIsReturnFocused(false);
      }, 2800);

      window.sessionStorage.setItem(storageKey, String(module.id));
      return () => {
        window.clearTimeout(timeout);
        window.clearTimeout(focusTimeout);
      };
    }

    window.sessionStorage.setItem(storageKey, String(module.id));
  }, [module.id]);

  return (
    <section className={`relative ${module.locked ? "opacity-70" : ""}`} style={sectionStyle}>
      <div className="grid gap-4 lg:grid-cols-[60px_minmax(0,1fr)]">
        <div className="rounded-[1.45rem] border border-white/70 bg-white/78 px-2 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
          <div className="flex h-full flex-col items-center justify-between gap-5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-[0_10px_22px_rgba(15,23,42,0.06)]"
              style={{ color: module.accentColor }}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="[writing-mode:vertical-rl] rotate-180 text-center">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: module.accentColor }}
              >
                Module {String(module.id).padStart(2, "0")}
              </p>
              <p className="mt-2.5 text-xs font-semibold text-slate-700">{module.title}</p>
            </div>
          </div>
        </div>

        <div
          className={`surface-lift roadmap-shell relative h-[500px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_100%)] shadow-[0_28px_56px_rgba(15,23,42,0.07)] ${
            isReturnFocused ? "roadmap-shell--focus" : ""
          } ${isAdvancing ? "roadmap-shell--advancing" : ""} ${isUnlocking ? "roadmap-shell--unlock" : ""}`}
          data-advancing={isAdvancing}
          data-return-focus={isReturnFocused}
          data-unlocking={isUnlocking}
        >
          <div className="course-grid absolute inset-0 opacity-55" />
          <div
            className="absolute inset-x-10 top-8 h-36 rounded-[2rem] blur-3xl"
            style={{
              background: `linear-gradient(135deg, ${module.accentSoftAlt} 0%, ${module.accentSoft} 100%)`,
            }}
          />
          <div className="absolute inset-x-8 top-7 z-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Active path
              </p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
                {module.title}
              </h2>
            </div>
          </div>
          <div
            className={`roadmap-progress-band absolute left-1/2 top-8 z-10 w-[280px] -translate-x-1/2 ${
              isAdvancing ? "is-advancing" : ""
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>
                <AnimatedNumber className="progress-value live" value={module.completionCount} />/10 complete
              </span>
              <AnimatedNumber
                className="progress-value live text-slate-900"
                suffix="%"
                value={module.progressPercent}
              />
            </div>
            <ProgressBar value={module.progressPercent} />
          </div>
          <div
            className="absolute inset-x-8 top-[28%] h-px opacity-18"
            style={{ backgroundColor: module.accentColor }}
          />
          <div
            className="absolute inset-x-8 top-[58%] h-px opacity-16"
            style={{ backgroundColor: module.accentColor }}
          />
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor={module.accentColor} stopOpacity="0.12" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
                <stop offset="100%" stopColor={module.accentColor} stopOpacity="0.16" />
              </linearGradient>
            </defs>
            <path
              d={pathD}
              fill="none"
              opacity="0.16"
              stroke={module.accentColor}
              strokeLinecap="round"
              strokeWidth="2.4"
              pathLength="100"
            />
            <path
              d={pathD}
              fill="none"
              opacity="0.3"
              stroke={module.accentColor}
              strokeLinecap="round"
              strokeWidth="0.9"
              pathLength="100"
            />
            <path
              className="path-progress-line"
              d={pathD}
              fill="none"
              opacity="0.95"
              pathLength="100"
              stroke={module.accentColor}
              strokeDasharray="100"
              strokeDashoffset={100 - animatedProgress}
              strokeLinecap="round"
              strokeWidth="2.1"
              style={{
                filter: `drop-shadow(0 0 10px ${module.accentColor}44)`,
              }}
            />
            <path
              className={`path-energy-line ${isAdvancing || isReturnFocused || isUnlocking ? "is-active" : ""}`}
              d={pathD}
              fill="none"
              pathLength="100"
              stroke={`url(#${gradientId})`}
              strokeDasharray="12 18"
              strokeDashoffset="0"
              strokeLinecap="round"
              strokeWidth="1.4"
            />
          </svg>

          {lessonItems.map((lesson, index) => (
            <LessonNode
              key={lesson.id}
              accentColor={module.accentColor}
              estimatedTime={lesson.estimatedTime}
              href={lesson.route}
              isBoss={lesson.isBoss}
              lessonNumber={lesson.lessonNumber}
              position={lessonPath[index]}
              sequenceKey={sequenceKey}
              state={lesson.state}
              title={lesson.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
