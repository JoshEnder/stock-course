"use client";

import Link from "next/link";
import type { DerivedModule } from "../lib/course-engine";
import { AnimatedNumber } from "./animated-number";
import {
  BarChartIcon,
  BuildingIcon,
  CheckCircleIcon,
  CompassIcon,
  LayersIcon,
  LineChartIcon,
  LockIcon,
  PercentIcon,
  PieChartIcon,
  PuzzleIcon,
  TrophyIcon,
  TrendingUpIcon,
} from "./icons";
import { ProgressBar } from "./progress-bar";

type ModulePreviewCardProps = {
  module: DerivedModule;
  variant: "completed" | "current" | "locked";
};

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

export function ModulePreviewCard({
  module,
  variant,
}: ModulePreviewCardProps) {
  const Icon = moduleIcons[module.icon];
  const isLocked = variant === "locked";

  // Locked: "territory ahead" — muted, foggy, feels like future zone
  if (isLocked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-100/70 bg-[#f5f5f4] p-4">
        {/* Upward arrow badge — momentum indicator */}
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/80">
          <span className="text-[11px] font-black text-gray-400">↑</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200/60 text-gray-400">
            <LockIcon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
              Module {module.id} · Locked
            </p>
            <h3 className="text-sm font-black text-gray-400">{module.title}</h3>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200/80" />
          <p className="mt-2 text-[11px] font-bold text-gray-400">Unlock by completing the previous module</p>
        </div>
      </div>
    );
  }

  // Completed: cleared territory — green tint, check stamp
  if (variant === "completed") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#bbf7d0]/50 bg-[#f0fdf4]/70 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: module.accentSoft, color: module.accentColor }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#16a34a]/70">
                Module {module.id} · Complete
              </p>
              <h3 className="text-sm font-black text-[#172b4d]/80">{module.title}</h3>
            </div>
          </div>
          <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#22c55e]" />
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#bbf7d0]/60">
            <div className="h-full w-full rounded-full bg-[#22c55e]/50" />
          </div>
        </div>
      </div>
    );
  }

  // Current (fallback, rarely shown here — current module is rendered by ModuleSection)
  return (
    <div className="rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,#ffffff_0%,#f2fff5_100%)] p-4 shadow-[0_8px_20px_rgba(22,163,74,0.08)]">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: module.accentSoft, color: module.accentColor }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
            Module {module.id}
          </p>
          <h3 className="text-base font-black text-[#172b4d]">{module.title}</h3>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            <AnimatedNumber className="progress-value live" value={module.completionCount} />/10
          </span>
          <AnimatedNumber
            className="progress-value live font-bold text-[#172b4d]"
            suffix="%"
            value={module.progressPercent}
          />
        </div>
        <ProgressBar value={module.progressPercent} />
      </div>
      <Link
        className="interactive-cta mt-4 inline-flex rounded-2xl bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] px-4 py-3 text-sm font-black text-white shadow-[0_4px_0_#16a34a] transition-all"
        data-success="true"
        href={`#module-${module.slug}`}
        prefetch={false}
      >
        Open active module
      </Link>
    </div>
  );
}
