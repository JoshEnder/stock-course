"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { DerivedLesson, DerivedModule } from "@/app/lib/course-engine";

const HEADER_OFFSET = 98;
const CONTENT_TOP = 56;
const MODULE_TOP_PADDING = 144;
const MODULE_BOTTOM_PADDING = 98;
const MODULE_GAP = 64;
const MOBILE_BREAKPOINT = 768;
const INTRO_SEEN_KEY = "stoked-course-journey-intro-seen";

// These lane deltas are derived from the Duolingo structural SVG reference and
// then widened slightly so the climb has stronger spatial momentum.
const REFERENCE_COLUMN_LEFT = 301;
const REFERENCE_COLUMN_RIGHT = 979;
const REFERENCE_LANE_COORDINATES = [570, 595.125, 640, 684.875, 710] as const;

const MODULE_LANE_PATTERNS = [
  [4, 3, 2, 1, 0, 1, 2, 3, 4, 5],
  [2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
  [5, 4, 3, 2, 1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
  [3, 2, 1, 0, 1, 2, 3, 4, 5, 4],
] as const;

const LESSON_GAP_PATTERNS = [
  [84, 74, 106, 80, 98, 74, 88, 110, 78],
  [80, 72, 112, 84, 94, 74, 90, 104, 80],
  [86, 70, 102, 78, 100, 76, 86, 108, 74],
  [82, 74, 110, 86, 92, 72, 94, 102, 78],
  [88, 76, 104, 82, 96, 74, 88, 106, 80],
] as const;

const STAGE_ALTITUDE_LABELS = [
  "Lower slope",
  "Base ridge",
  "First rise",
  "Tree line",
  "Middle face",
  "High traverse",
  "Upper ridge",
  "Thin air",
  "Summit approach",
  "Final push",
] as const;

type VisualLessonState = "completed" | "current" | "locked";

type JourneyLessonNode = {
  id: string;
  route: string;
  title: string;
  estimatedTime: string;
  moduleId: number;
  moduleTitle: string;
  moduleAccent: string;
  lessonNumber: number;
  visualIndex: number;
  globalIndex: number;
  state: VisualLessonState;
  isBoss: boolean;
  x: number;
  y: number;
};

type JourneyModuleSection = {
  id: number;
  title: string;
  subtitle: string;
  accentColor: string;
  progressPercent: number;
  completionCount: number;
  totalLessons: number;
  top: number;
  height: number;
  displayIndex: number;
  lessonIds: string[];
  anchorX: number;
  anchorY: number;
  exitX: number;
  exitY: number;
};

type JourneyGeometry = {
  d: string;
  viewBox: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const full =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : sanitized;

  const int = Number.parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getDisplayStageTitle(title: string) {
  return title.replace(/^Module\s+\d+\s*[·-]\s*/i, "").trim();
}

function normalizeLessonState(state: DerivedLesson["state"]): VisualLessonState {
  if (state === "completed") {
    return "completed";
  }

  if (state === "locked") {
    return "locked";
  }

  return "current";
}

function useWindowWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return width;
}

function getDesktopLanes() {
  const normalizedReference = REFERENCE_LANE_COORDINATES.map(
    (x) => ((x - REFERENCE_COLUMN_LEFT) / (REFERENCE_COLUMN_RIGHT - REFERENCE_COLUMN_LEFT)) * 100,
  );
  const center = normalizedReference[2];
  const smallDelta = Math.abs(normalizedReference[1] - center) * 2.15;
  const largeDelta = Math.abs(normalizedReference[0] - center) * 1.96;
  const outerDelta = largeDelta + (largeDelta - smallDelta) * 0.92;

  return [
    clamp(center - outerDelta, 12, 88),
    clamp(center - largeDelta, 16, 84),
    clamp(center - smallDelta, 20, 80),
    center,
    clamp(center + smallDelta, 20, 80),
    clamp(center + largeDelta, 16, 84),
    clamp(center + outerDelta, 12, 88),
  ];
}

function buildLessonOffsets(gaps: readonly number[]) {
  const offsets = [0];

  gaps.forEach((gap) => {
    offsets.push(offsets[offsets.length - 1] + gap);
  });

  return offsets;
}

function buildJourneyPath(nodes: JourneyLessonNode[], totalHeight: number): JourneyGeometry | null {
  if (nodes.length === 0) {
    return null;
  }

  if (nodes.length === 1) {
    const [node] = nodes;
    return {
      d: `M ${node.x} ${node.y} L ${node.x} ${node.y + 0.1}`,
      viewBox: `0 0 100 ${totalHeight}`,
    };
  }

  const [first, ...rest] = nodes;
  let d = `M ${first.x} ${first.y}`;

  rest.forEach((node, index) => {
    const previous = nodes[index];
    const deltaY = node.y - previous.y;
    const midpointX = previous.x + (node.x - previous.x) * 0.5;
    const controlY = clamp(deltaY * 0.38, 34, 68);

    d += ` C ${midpointX} ${previous.y + controlY * 0.46}, ${midpointX} ${node.y - controlY * 0.54}, ${node.x} ${node.y}`;
  });

  return { d, viewBox: `0 0 100 ${totalHeight}` };
}

function buildJourneyLayout(modules: DerivedModule[], isMobile: boolean) {
  const displayModules = [...modules].reverse();
  const sections: JourneyModuleSection[] = [];
  const nodes: JourneyLessonNode[] = [];
  const desktopLanes = getDesktopLanes();
  let cursor = HEADER_OFFSET + CONTENT_TOP;

  displayModules.forEach((module, displayIndex) => {
    const lanePattern = MODULE_LANE_PATTERNS[displayIndex % MODULE_LANE_PATTERNS.length];
    const gapPattern = LESSON_GAP_PATTERNS[displayIndex % LESSON_GAP_PATTERNS.length];
    const lessonOffsets = buildLessonOffsets(gapPattern);
    const lessonList = [...module.lessons].reverse();
    const top = cursor;
    const startY = top + MODULE_TOP_PADDING;
    const lessonIds: string[] = [];

    lessonList.forEach((lesson, visualIndex) => {
      const desktopX = desktopLanes[lanePattern[visualIndex] ?? 3];
      const mobileX = 50 + (desktopX - 50) * 0.74;
      const x = isMobile ? clamp(mobileX, 18, 82) : desktopX;
      const y = startY + lessonOffsets[visualIndex];
      const state = normalizeLessonState(lesson.state);

      const node: JourneyLessonNode = {
        id: lesson.id,
        route: lesson.route,
        title: lesson.title,
        estimatedTime: lesson.estimatedTime,
        moduleId: module.id,
        moduleTitle: module.title,
        moduleAccent: module.accentColor,
        lessonNumber: lesson.lessonNumber,
        visualIndex,
        globalIndex: nodes.length,
        state,
        isBoss: lesson.isBoss,
        x,
        y,
      };

      nodes.push(node);
      lessonIds.push(node.id);
    });

    const firstNode = nodes[nodes.length - lessonList.length];
    const lastNode = nodes[nodes.length - 1];
    const lastLessonOffset = lessonOffsets[Math.max(lessonOffsets.length - 1, 0)] ?? 0;
    const height = MODULE_TOP_PADDING + lastLessonOffset + MODULE_BOTTOM_PADDING;

    sections.push({
      id: module.id,
      title: module.title,
      subtitle: module.subtitle,
      accentColor: module.accentColor,
      progressPercent: module.progressPercent,
      completionCount: module.completionCount,
      totalLessons: module.lessons.length,
      top,
      height,
      displayIndex,
      lessonIds,
      anchorX: firstNode?.x ?? 50,
      anchorY: top + 102,
      exitX: lastNode?.x ?? 50,
      exitY: lastNode?.y ?? top + height - 84,
    });

    cursor += height;

    if (displayIndex < displayModules.length - 1) {
      cursor += MODULE_GAP;
    }
  });

  const finalSection = sections[sections.length - 1];
  const finalNode = nodes[nodes.length - 1];
  const endAnchor = Math.max(
    finalSection ? finalSection.top + finalSection.height : 0,
    finalNode ? finalNode.y + 88 : 0,
  );

  return {
    sections,
    nodes,
    totalHeight: endAnchor + 48,
  };
}

function JourneyPath({
  nodes,
  totalHeight,
  currentIndex,
  currentAccent,
}: {
  nodes: JourneyLessonNode[];
  totalHeight: number;
  currentIndex: number;
  currentAccent: string;
}) {
  const fullGeometry = useMemo(() => buildJourneyPath(nodes, totalHeight), [nodes, totalHeight]);
  const completedGeometry = useMemo(
    () => buildJourneyPath(nodes.slice(0, currentIndex + 1), totalHeight),
    [currentIndex, nodes, totalHeight],
  );
  const futureGeometry = useMemo(
    () => buildJourneyPath(nodes.slice(Math.max(currentIndex, 0)), totalHeight),
    [currentIndex, nodes, totalHeight],
  );
  const focusGeometry = useMemo(
    () =>
      buildJourneyPath(
        nodes.slice(Math.max(0, currentIndex - 1), Math.min(nodes.length, currentIndex + 3)),
        totalHeight,
      ),
    [currentIndex, nodes, totalHeight],
  );

  if (!fullGeometry) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={fullGeometry.viewBox}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] w-full"
      style={{ height: totalHeight }}
    >
      <defs>
        <filter id="journey-path-glow" x="-80%" y="-20%" width="260%" height="150%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="journey-path-focus-glow" x="-120%" y="-30%" width="320%" height="180%">
          <feGaussianBlur stdDeviation="4.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="journey-path-base" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(208,221,233,0.1)" />
          <stop offset="100%" stopColor="rgba(208,221,233,0.04)" />
        </linearGradient>
        <linearGradient id="journey-path-completed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(214,228,238,0.16)" />
          <stop offset="62%" stopColor="rgba(241,217,158,0.34)" />
          <stop offset="100%" stopColor="rgba(241,217,158,0.5)" />
        </linearGradient>
        <linearGradient id="journey-path-future" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(223,232,239,0.22)" />
          <stop offset="100%" stopColor="rgba(223,232,239,0.06)" />
        </linearGradient>
        <linearGradient id="journey-path-focus" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={hexToRgba(currentAccent, 0.1)} />
          <stop offset="55%" stopColor="rgba(242,209,133,0.72)" />
          <stop offset="100%" stopColor={hexToRgba(currentAccent, 0.5)} />
        </linearGradient>
      </defs>

      <path
        d={fullGeometry.d}
        fill="none"
        stroke="url(#journey-path-base)"
        strokeWidth="1.18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {futureGeometry && (
        <path
          d={futureGeometry.d}
          fill="none"
          stroke="url(#journey-path-future)"
          strokeWidth="1.08"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.8 3.6"
          opacity="0.74"
        />
      )}

      {completedGeometry && (
        <>
          <motion.path
            d={completedGeometry.d}
            fill="none"
            stroke="url(#journey-path-completed)"
            strokeWidth="1.72"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#journey-path-glow)"
            initial={{ pathLength: 0, opacity: 0.32 }}
            animate={{ pathLength: 1, opacity: 0.96 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
          />
          <path
            d={completedGeometry.d}
            fill="none"
            stroke="rgba(249,240,220,0.22)"
            strokeWidth="0.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {focusGeometry && (
        <motion.path
          d={focusGeometry.d}
          fill="none"
          stroke="url(#journey-path-focus)"
          strokeWidth="2.08"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#journey-path-focus-glow)"
          initial={{ opacity: 0.24 }}
          animate={{ opacity: [0.52, 0.94, 0.62] }}
          transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
        />
      )}
    </svg>
  );
}

function ModuleSection({
  section,
  currentModuleId,
  isMobile,
}: {
  section: JourneyModuleSection;
  currentModuleId: number;
  isMobile: boolean;
}) {
  const active = section.id === currentModuleId;
  const alignRight = !isMobile && section.anchorX > 50;
  const displayTitle = getDisplayStageTitle(section.title);
  const altitudeLabel = STAGE_ALTITUDE_LABELS[(section.id - 1) % STAGE_ALTITUDE_LABELS.length];
  const bandTop = clamp(10 + section.displayIndex * 6, 10, 66);
  const bandBottom = clamp(78 - section.displayIndex * 3, 34, 82);
  const stageMood = active
    ? altitudeLabel
    : section.completionCount > 0
      ? "Terrain covered"
      : "Ascent ahead";
  const labelSideClass = isMobile
    ? "left-1/2 -translate-x-1/2 text-center"
    : alignRight
      ? "left-8 text-left md:left-10"
      : "right-8 text-right md:right-10";

  return (
    <section
      className="absolute inset-x-0"
      style={{ top: section.top, height: section.height }}
      aria-labelledby={`course-module-${section.id}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-full"
        style={{
          background: `
            radial-gradient(circle at ${section.anchorX}% 7%, ${hexToRgba(section.accentColor, active ? 0.2 : 0.1)} 0%, transparent 22%),
            radial-gradient(circle at ${alignRight ? "74%" : "26%"} 38%, rgba(255,255,255,0.06) 0%, transparent 30%),
            radial-gradient(circle at ${section.anchorX}% ${bandTop}%, ${hexToRgba(section.accentColor, active ? 0.08 : 0.05)} 0%, transparent 22%),
            linear-gradient(180deg, rgba(214,226,235,0.035) 0%, rgba(255,255,255,0.012) 18%, rgba(255,255,255,0) 52%, rgba(214,226,235,0.02) 100%)
          `,
        }}
      />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full opacity-[0.72]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={`M0 9 C16 8, 28 7, ${section.anchorX - 8} 9 C${section.anchorX - 2} 10, ${section.anchorX + 2} 10, 100 8`}
          fill="none"
          stroke={hexToRgba(section.accentColor, active ? 0.18 : 0.1)}
          strokeWidth="0.18"
        />
        <path
          d={`M0 18 C18 17, 34 15, ${section.anchorX - 5} 17 C${section.anchorX + 8} 18, 74 18, 100 16`}
          fill="none"
          stroke="rgba(212,224,235,0.08)"
          strokeWidth="0.16"
        />
        <path
          d={`M0 ${bandTop} C16 ${bandTop - 2}, 34 ${bandTop - 3}, ${section.anchorX - 7} ${bandTop - 1} C${section.anchorX + 7} ${bandTop + 1}, 82 ${bandTop - 2}, 100 ${bandTop - 4}`}
          fill="none"
          stroke={hexToRgba(section.accentColor, active ? 0.12 : 0.07)}
          strokeWidth="0.15"
        />
        <path
          d={`M0 ${bandBottom} C18 ${bandBottom - 3}, 36 ${bandBottom - 4}, ${section.exitX - 7} ${bandBottom - 1} C${section.exitX + 6} ${bandBottom + 1}, 82 ${bandBottom - 1}, 100 ${bandBottom - 3}`}
          fill="none"
          stroke="rgba(212,224,235,0.055)"
          strokeWidth="0.15"
        />
        <path
          d={`M0 85 C18 81, 34 80, ${section.exitX - 8} 78 C${section.exitX + 6} 76, 82 74, 100 72`}
          fill="none"
          stroke="rgba(212,224,235,0.06)"
          strokeWidth="0.16"
        />
      </svg>

      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-10 h-px md:inset-x-10"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(section.accentColor, active ? 0.22 : 0.12)} 22%, rgba(214,226,235,0.08) 50%, ${hexToRgba(section.accentColor, active ? 0.22 : 0.12)} 78%, transparent 100%)`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute z-[2] flex -translate-x-1/2 items-center gap-3"
        style={{ left: `${section.anchorX}%`, top: section.anchorY }}
      >
        <span
          className="h-[1px] w-10 md:w-14"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(section.accentColor, 0.3)} 100%)`,
          }}
        />
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: active ? "rgba(244,237,222,0.92)" : "rgba(194,210,223,0.72)",
            borderColor: hexToRgba(section.accentColor, active ? 0.24 : 0.14),
            background: `linear-gradient(180deg, ${hexToRgba(section.accentColor, active ? 0.1 : 0.06)} 0%, rgba(17,28,40,0.18) 100%)`,
            boxShadow: active ? `0 14px 28px ${hexToRgba(section.accentColor, 0.12)}` : "none",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <span>{`Stage ${String(section.id).padStart(2, "0")}`}</span>
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: hexToRgba(section.accentColor, 0.92) }}
          />
          <span>{altitudeLabel}</span>
        </span>
        <span
          className="h-[1px] w-10 md:w-14"
          style={{
            background: `linear-gradient(90deg, ${hexToRgba(section.accentColor, 0.3)} 0%, transparent 100%)`,
          }}
        />
      </div>

      <div className={`absolute top-24 z-[2] w-[min(350px,calc(100%-2rem))] ${labelSideClass}`}>
        <div
          className="rounded-[24px] border px-4 py-4 md:px-5"
          style={{
            borderColor: hexToRgba(section.accentColor, active ? 0.2 : 0.12),
            background: `linear-gradient(180deg, ${hexToRgba(section.accentColor, active ? 0.08 : 0.05)} 0%, rgba(12,22,34,0.24) 100%)`,
            boxShadow: active
              ? `0 24px 48px ${hexToRgba(section.accentColor, 0.1)}, inset 0 1px 0 rgba(255,255,255,0.07)`
              : "0 16px 34px rgba(3,10,18,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div
            className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${isMobile ? "justify-center" : alignRight ? "justify-start" : "justify-end"}`}
            style={{ color: active ? "rgba(244,237,222,0.84)" : "rgba(194,210,223,0.68)" }}
          >
            <span>{`Stage ${String(section.id).padStart(2, "0")}`}</span>
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: hexToRgba(section.accentColor, 0.92) }}
            />
            <span>{stageMood}</span>
          </div>
          <h2
            id={`course-module-${section.id}`}
            className="mt-3 text-[30px] leading-[1.02] tracking-[-0.04em] text-[#f6efe5] md:text-[36px]"
            style={{ fontFamily: "var(--font-eb-garamond,'EB Garamond',Georgia,serif)" }}
          >
            {displayTitle}
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[rgba(214,225,234,0.76)] md:text-[14px]">
            {section.subtitle}
          </p>
          <div className={`mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[rgba(188,204,217,0.66)] ${isMobile ? "justify-center" : alignRight ? "justify-start" : "justify-end"}`}>
            <span>{section.completionCount}/{section.totalLessons} complete</span>
            <span
              aria-hidden="true"
              className="h-px w-10"
              style={{ background: hexToRgba(section.accentColor, 0.24) }}
            />
            <span>{Math.round(section.progressPercent)}%</span>
          </div>
          <div
            className={`mt-3 h-[3px] w-[178px] overflow-hidden rounded-full ${isMobile ? "mx-auto" : alignRight ? "mr-auto" : "ml-auto"}`}
            style={{ background: "rgba(171,192,208,0.14)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(section.progressPercent, 6)}%`,
                background: `linear-gradient(90deg, ${hexToRgba(section.accentColor, 0.96)} 0%, rgba(236,244,248,0.88) 100%)`,
                boxShadow: `0 0 18px ${hexToRgba(section.accentColor, 0.18)}`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute z-[2] flex -translate-x-1/2 items-center gap-2"
        style={{ left: `${section.exitX}%`, top: section.exitY + 26 }}
      >
        <span
          className="h-px w-8"
          style={{ background: hexToRgba(section.accentColor, 0.18) }}
        />
        <span
          className="rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: "rgba(191,206,219,0.64)",
            borderColor: hexToRgba(section.accentColor, 0.12),
            background: "rgba(12,20,31,0.24)",
          }}
        >
          {active ? "Current ridge" : section.completionCount > 0 ? "Trail below" : "Route above"}
        </span>
      </div>
    </section>
  );
}

function LessonNode({
  lesson,
  hovered,
  onHover,
  onSelect,
}: {
  lesson: JourneyLessonNode;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (lesson: JourneyLessonNode) => void;
}) {
  const isLocked = lesson.state === "locked";
  const isCurrent = lesson.state === "current";
  const isCompleted = lesson.state === "completed";
  const accent = lesson.moduleAccent;
  const titleSide = lesson.x >= 50 ? "right" : "left";
  const nodeSize = isCurrent ? 132 : lesson.isBoss ? (isLocked ? 72 : 84) : isLocked ? 60 : 68;

  const shellStyle = isCurrent
    ? {
        background: "linear-gradient(180deg, rgba(246,239,228,1) 0%, rgba(229,216,193,0.98) 100%)",
        border: `1px solid ${hexToRgba(accent, 0.38)}`,
        boxShadow: `0 34px 74px rgba(4,10,18,0.28), 0 0 0 1px ${hexToRgba(accent, 0.1)}, 0 0 46px ${hexToRgba(accent, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.8)`,
      }
    : isCompleted
      ? {
          background: "linear-gradient(180deg, rgba(44,60,78,0.99) 0%, rgba(29,41,57,0.99) 100%)",
          border: `1px solid ${hexToRgba(accent, 0.2)}`,
          boxShadow: hovered
            ? "0 20px 42px rgba(3,10,18,0.22), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 14px 30px rgba(3,10,18,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
        }
      : {
          background: "linear-gradient(180deg, rgba(20,29,41,0.82) 0%, rgba(12,18,26,0.9) 100%)",
          border: `1px solid ${hexToRgba(accent, 0.12)}`,
          boxShadow: "0 10px 20px rgba(3,10,18,0.12)",
        };

  return (
    <div
      className="absolute z-[3]"
      style={{ left: `${lesson.x}%`, top: lesson.y, transform: "translate(-50%, -50%)" }}
    >
      {isCurrent && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
          className={`absolute top-1/2 hidden w-[286px] -translate-y-1/2 rounded-[24px] border px-4 py-4 text-left md:block ${
            titleSide === "right" ? "right-[calc(100%+22px)]" : "left-[calc(100%+22px)]"
          }`}
          style={{
            borderColor: hexToRgba(accent, 0.22),
            background:
              "linear-gradient(180deg, rgba(24,36,51,0.88) 0%, rgba(11,19,29,0.92) 100%)",
            boxShadow: `0 26px 54px rgba(3,10,18,0.22), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${hexToRgba(accent, 0.05)}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(204,217,228,0.72)]">
            Continue ascent
          </p>
          <p
            className="mt-2 text-[21px] leading-[1.02] tracking-[-0.025em] text-[#f6efe4]"
            style={{ fontFamily: "var(--font-eb-garamond,'EB Garamond',Georgia,serif)" }}
          >
            {lesson.title}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[rgba(180,197,210,0.66)]">
            <span>{lesson.moduleTitle}</span>
            <span
              aria-hidden="true"
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: hexToRgba(accent, 0.78) }}
            />
            <span>{lesson.estimatedTime}</span>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-[rgba(192,206,218,0.68)]">
            This is the next foothold on your climb. Finish it to pull the route further uphill.
          </p>
        </motion.div>
      )}

      <motion.button
        type="button"
        aria-label={lesson.title}
        disabled={isLocked}
        initial={{ opacity: 0, scale: 0.82, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.42,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.14 + lesson.globalIndex * 0.01,
        }}
        whileHover={isLocked ? undefined : { y: -3, scale: isCurrent ? 1.015 : 1.03 }}
        whileTap={isLocked ? undefined : { scale: 0.985 }}
        onHoverStart={() => onHover(lesson.id)}
        onHoverEnd={() => onHover(null)}
        onFocus={() => onHover(lesson.id)}
        onBlur={() => onHover(null)}
        onClick={() => {
          if (!isLocked) {
            onSelect(lesson);
          }
        }}
        className="relative flex items-center justify-center rounded-[26px] outline-none transition-transform"
        style={{
          width: nodeSize,
          height: nodeSize,
          cursor: isLocked ? "default" : "pointer",
          color: isCurrent ? "#07111d" : isLocked ? "rgba(138,154,168,0.52)" : "#f6f1e6",
          ...shellStyle,
        }}
      >
        {isCurrent && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-[-28px] rounded-[42px]"
              style={{
                background: `radial-gradient(circle, ${hexToRgba(accent, 0.28)} 0%, rgba(249,236,206,0.14) 20%, transparent 68%)`,
                filter: "blur(16px)",
              }}
            />
            <motion.span
              aria-hidden="true"
              className="absolute inset-[-12px] rounded-[34px] border"
              animate={{ opacity: [0.34, 0.16, 0.34], scale: [1, 1.05, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderColor: hexToRgba(accent, 0.22) }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-[-18px] left-1/2 h-10 w-[74%] -translate-x-1/2 rounded-full"
              style={{
                background: `radial-gradient(circle, ${hexToRgba(accent, 0.18)} 0%, rgba(255,255,255,0.06) 30%, transparent 78%)`,
                filter: "blur(12px)",
              }}
            />
          </>
        )}

        {isCompleted && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-[8px] rounded-[20px]"
              style={{
                background: `linear-gradient(180deg, ${hexToRgba(accent, 0.14)} 0%, rgba(255,255,255,0) 70%)`,
              }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-[3px] rounded-[23px] border"
              style={{ borderColor: hexToRgba(accent, 0.08) }}
            />
          </>
        )}

        {isLocked && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-[10px] rounded-[18px]"
              style={{
                background: `linear-gradient(180deg, ${hexToRgba(accent, 0.07)} 0%, rgba(255,255,255,0) 70%)`,
              }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-[4px] rounded-[22px] border"
              style={{ borderColor: hexToRgba(accent, 0.06) }}
            />
          </>
        )}

        <div className="relative z-[1] flex flex-col items-center justify-center">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{
              color: isCurrent
                ? "rgba(7,17,29,0.58)"
                : isLocked
                  ? "rgba(138,154,168,0.48)"
                  : "rgba(204,217,228,0.72)",
            }}
          >
            L{String(lesson.lessonNumber).padStart(2, "0")}
          </span>

          {isCompleted ? (
            <span
              className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                background: hexToRgba(accent, 0.16),
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 0 18px rgba(0,0,0,0.06)",
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8.5L6.5 12L13 5"
                  stroke="rgba(247,241,230,0.94)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : isLocked ? (
            <>
              <svg className="mt-2 h-4.5 w-4.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="4" y="7.1" width="8" height="5.8" rx="1.4" stroke="currentColor" strokeWidth="1.1" />
                <path d="M5.5 7.1V5.45a2.5 2.5 0 1 1 5 0V7.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: hexToRgba(accent, 0.34) }}
              />
            </>
          ) : isCurrent ? (
            <span
              className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: hexToRgba(accent, 0.16),
                boxShadow: `0 0 22px ${hexToRgba(accent, 0.16)}`,
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M5 3.5L11 8L5 12.5"
                  stroke="rgba(7,17,29,0.88)"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : null}
        </div>

        {isCurrent && (
          <div
            className="pointer-events-none absolute left-1/2 top-[calc(100%+12px)] w-[220px] -translate-x-1/2 rounded-[20px] border px-3 py-3 text-center md:hidden"
            style={{
              borderColor: hexToRgba(accent, 0.2),
              background:
                "linear-gradient(180deg, rgba(24,36,51,0.88) 0%, rgba(11,19,29,0.92) 100%)",
              boxShadow: "0 20px 40px rgba(3,10,18,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(204,217,228,0.72)]">
              Continue ascent
            </p>
            <p className="mt-1 text-[15px] leading-5 text-[#f6efe4]">{lesson.title}</p>
          </div>
        )}

        {(hovered || isCurrent) && !isCurrent && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`pointer-events-none absolute top-1/2 hidden w-[208px] -translate-y-1/2 rounded-[18px] border px-3 py-3 text-left md:block ${
              titleSide === "right" ? "right-[calc(100%+18px)]" : "left-[calc(100%+18px)]"
            }`}
            style={{
              borderColor: "rgba(134,154,170,0.14)",
              background: "rgba(11,19,29,0.82)",
              boxShadow: "0 18px 36px rgba(3,10,18,0.16)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <p className="text-[13px] font-medium leading-5 text-[#f0f4f7]">{lesson.title}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[rgba(194,209,223,0.62)]">
              {lesson.moduleTitle}
            </p>
          </motion.div>
        )}

        {hovered && isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`pointer-events-none absolute top-1/2 hidden w-[200px] -translate-y-1/2 rounded-[16px] border px-3 py-2 text-left md:block ${
              titleSide === "right" ? "right-[calc(100%+18px)]" : "left-[calc(100%+18px)]"
            }`}
            style={{
              borderColor: hexToRgba(accent, 0.1),
              background: "rgba(10,17,26,0.78)",
              boxShadow: "0 16px 32px rgba(3,10,18,0.14)",
            }}
          >
            <p className="text-[12px] font-medium text-[rgba(222,230,236,0.82)]">{lesson.title}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[rgba(174,191,205,0.52)]">
              Ascent ahead
            </p>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

export function CourseJourney({
  modules,
  currentLessonId,
  onLessonSelect,
  supportRail,
  mobileSupportRail,
}: {
  modules: DerivedModule[];
  currentLessonId: string | null;
  onLessonSelect: (lesson: DerivedLesson) => void;
  supportRail?: ReactNode;
  mobileSupportRail?: ReactNode;
}) {
  const width = useWindowWidth();
  const isMobile = width !== null && width < MOBILE_BREAKPOINT;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);

  const layout = useMemo(() => buildJourneyLayout(modules, isMobile), [modules, isMobile]);

  const currentNode = useMemo(() => {
    const explicit = layout.nodes.find((node) => node.id === currentLessonId);
    if (explicit) {
      return explicit;
    }

    return (
      [...layout.nodes].reverse().find((node) => node.state !== "locked") ??
      layout.nodes[layout.nodes.length - 1]
    );
  }, [currentLessonId, layout.nodes]);

  const currentIndex = useMemo(
    () => layout.nodes.findIndex((node) => node.id === currentNode?.id),
    [currentNode?.id, layout.nodes],
  );
  const currentSection = useMemo(
    () => layout.sections.find((section) => section.id === currentNode?.moduleId) ?? null,
    [currentNode?.moduleId, layout.sections],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !currentNode) {
      return;
    }

    const maxScroll = Math.max(0, layout.totalHeight - container.clientHeight);
    const target = clamp(currentNode.y - container.clientHeight * 0.48, 0, maxScroll);

    if (typeof window === "undefined") {
      container.scrollTop = target;
      return;
    }

    const alreadySeen = window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (alreadySeen || prefersReducedMotion) {
      container.scrollTop = target;
      return;
    }

    const scenicStart = currentSection
      ? clamp(currentSection.top - container.clientHeight * 1.14, 0, maxScroll)
      : clamp(target - container.clientHeight * 1.36, 0, maxScroll);
    const start = Math.min(scenicStart, clamp(target - container.clientHeight * 0.94, 0, maxScroll));
    container.scrollTop = start;
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");

    let rafId = 0;
    let timeoutId = 0;
    const distance = Math.abs(target - start);
    const duration = clamp(1700 + distance * 0.38, 1800, 3000);

    const animate = (animationStart: number) => (now: number) => {
      const progress = clamp((now - animationStart) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3.5);
      container.scrollTop = start + (target - start) * eased;

      if (progress < 1) {
        rafId = window.requestAnimationFrame(animate(animationStart));
      }
    };

    timeoutId = window.setTimeout(() => {
      rafId = window.requestAnimationFrame((now) => animate(now)(now));
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafId);
    };
  }, [currentNode, currentSection, layout.totalHeight]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden"
      style={{
        scrollBehavior: "auto",
        background:
          "linear-gradient(180deg, #243a4d 0%, #21384c 9%, #192d40 30%, #132437 60%, #0f1b2c 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 13% 8%, rgba(186,211,228,0.22) 0%, transparent 34%),
            radial-gradient(circle at 86% 9%, rgba(168,198,223,0.16) 0%, transparent 28%),
            radial-gradient(circle at 24% 74%, rgba(132,162,190,0.08) 0%, transparent 32%),
            radial-gradient(circle at 78% 66%, rgba(245,214,147,0.05) 0%, transparent 28%),
            radial-gradient(circle at 54% 28%, rgba(255,255,255,0.07) 0%, transparent 42%),
            radial-gradient(circle at 50% 54%, rgba(174,198,218,0.06) 0%, transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 24%)
          `,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: Math.min(layout.totalHeight, 860),
          backgroundImage: `
            linear-gradient(180deg, rgba(228,235,244,0.1) 0%, rgba(228,235,244,0.02) 18%, rgba(13,24,37,0.12) 64%, rgba(11,19,31,0.42) 100%),
            linear-gradient(180deg, rgba(9,18,29,0) 0%, rgba(9,18,29,0.14) 55%, rgba(9,18,29,0.68) 100%),
            url('/course/peak.png')
          `,
          backgroundSize: "cover, 100% 100%, cover",
          backgroundPosition: "center top, center, center 28%",
          backgroundRepeat: "no-repeat",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 44%, rgba(0,0,0,0.24) 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 44%, rgba(0,0,0,0.24) 78%, transparent 100%)",
          opacity: 0.8,
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 w-full opacity-[0.72]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height: layout.totalHeight }}
      >
        <defs>
          <linearGradient id="mountain-far-ridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(126,151,174,0.26)" />
            <stop offset="100%" stopColor="rgba(56,77,99,0.16)" />
          </linearGradient>
          <linearGradient id="mountain-main-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(94,116,136,0.5)" />
            <stop offset="40%" stopColor="rgba(58,78,99,0.42)" />
            <stop offset="100%" stopColor="rgba(18,29,43,0.18)" />
          </linearGradient>
          <linearGradient id="mountain-near-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(42,58,76,0.56)" />
            <stop offset="100%" stopColor="rgba(14,23,35,0.14)" />
          </linearGradient>
          <linearGradient id="mountain-foreground" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(22,33,47,0.62)" />
            <stop offset="100%" stopColor="rgba(12,21,32,0.16)" />
          </linearGradient>
          <linearGradient id="mountain-route-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(150,177,200,0.18)" />
            <stop offset="100%" stopColor="rgba(57,79,102,0.08)" />
          </linearGradient>
        </defs>
        <path
          d="M0 40 C15 35, 27 31, 39 27 C52 22, 66 17, 82 12 C90 9, 96 6, 100 4 L100 100 L0 100 Z"
          fill="url(#mountain-far-ridge)"
        />
        <path
          d="M0 78 C10 74, 19 68, 28 61 C39 52, 49 44, 61 35 C74 25, 86 16, 100 8 L100 100 L0 100 Z"
          fill="url(#mountain-main-face)"
        />
        <path
          d="M0 88 C13 84, 23 76, 32 67 C41 58, 51 49, 63 40 C75 31, 87 20, 100 12 L100 100 L0 100 Z"
          fill="url(#mountain-route-face)"
        />
        <path
          d="M0 92 C10 88, 20 82, 29 74 C38 65, 48 57, 58 49 C72 38, 86 27, 100 17 L100 100 L0 100 Z"
          fill="url(#mountain-near-face)"
        />
        <path
          d="M0 100 L0 92 C14 88, 25 81, 35 72 C45 63, 56 54, 67 45 C79 35, 90 27, 100 20 L100 100 Z"
          fill="url(#mountain-foreground)"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 w-full opacity-[0.54]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height: layout.totalHeight }}
      >
        <path d="M0 40 C15 35, 27 31, 39 27 C52 22, 66 17, 82 12 C90 9, 96 6, 100 4" fill="none" stroke="rgba(223,232,239,0.18)" strokeWidth="0.24" />
        <path d="M0 78 C10 74, 19 68, 28 61 C39 52, 49 44, 61 35 C74 25, 86 16, 100 8" fill="none" stroke="rgba(223,232,239,0.16)" strokeWidth="0.24" />
        <path d="M0 88 C13 84, 23 76, 32 67 C41 58, 51 49, 63 40 C75 31, 87 20, 100 12" fill="none" stroke="rgba(223,232,239,0.12)" strokeWidth="0.22" />
        <path d="M0 92 C10 88, 20 82, 29 74 C38 65, 48 57, 58 49 C72 38, 86 27, 100 17" fill="none" stroke="rgba(255,242,214,0.1)" strokeWidth="0.2" />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.028) 1px, transparent 1px), radial-gradient(circle at 50% 0%, rgba(255,255,255,0.045) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
          backgroundSize: "100% 136px, 100% 100%, 100% 260px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.26) 100%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.26) 100%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0 22 C16 20, 34 21, 50 18 C67 15, 84 10, 100 8" fill="none" stroke="rgba(225,234,241,0.18)" strokeWidth="0.22" />
        <path d="M0 36 C16 33, 34 33, 50 30 C67 27, 84 22, 100 18" fill="none" stroke="rgba(225,234,241,0.12)" strokeWidth="0.2" />
        <path d="M0 52 C16 49, 34 48, 52 45 C69 42, 85 36, 100 30" fill="none" stroke="rgba(225,234,241,0.1)" strokeWidth="0.2" />
        <path d="M0 70 C16 66, 36 64, 54 59 C70 54, 86 47, 100 38" fill="none" stroke="rgba(225,234,241,0.08)" strokeWidth="0.2" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0 14 C14 12, 28 13, 40 12 C55 11, 72 7, 100 3" fill="none" stroke="rgba(255,241,217,0.12)" strokeWidth="0.16" />
        <path d="M0 46 C14 44, 30 44, 45 41 C60 38, 78 31, 100 24" fill="none" stroke="rgba(255,241,217,0.08)" strokeWidth="0.16" />
        <path d="M0 84 C18 80, 34 78, 51 72 C66 67, 84 59, 100 49" fill="none" stroke="rgba(255,241,217,0.06)" strokeWidth="0.16" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0 16 C18 14, 32 15, 50 12 C64 10, 82 6, 100 4.5" fill="none" stroke="rgba(216,226,236,0.14)" strokeWidth="0.18" />
        <path d="M0 28 C18 25, 34 25, 52 21 C68 18, 84 12, 100 10" fill="none" stroke="rgba(216,226,236,0.11)" strokeWidth="0.18" />
        <path d="M0 44 C20 40, 37 39, 55 34 C72 29, 86 22, 100 18" fill="none" stroke="rgba(216,226,236,0.09)" strokeWidth="0.18" />
        <path d="M0 61 C18 57, 35 55, 54 50 C72 45, 86 38, 100 33" fill="none" stroke="rgba(216,226,236,0.07)" strokeWidth="0.18" />
        <path d="M0 79 C20 75, 38 72, 57 67 C74 62, 88 55, 100 48" fill="none" stroke="rgba(216,226,236,0.06)" strokeWidth="0.18" />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] xl:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,35,51,0.18) 0%, rgba(18,32,47,0.28) 22%, rgba(12,21,32,0.12) 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 18%, rgba(0,0,0,0.95) 48%, rgba(0,0,0,0.84) 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 18%, rgba(0,0,0,0.95) 48%, rgba(0,0,0,0.84) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: layout.totalHeight,
          background: `
            linear-gradient(180deg, rgba(255,255,255,0.018) 0%, rgba(255,255,255,0) 9%),
            linear-gradient(180deg, transparent 0%, rgba(145,176,201,0.03) 18%, transparent 30%, rgba(245,214,147,0.025) 48%, transparent 60%, rgba(145,176,201,0.03) 78%, transparent 100%)
          `,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: layout.totalHeight,
          backgroundImage:
            "radial-gradient(circle at 22% 12%, rgba(168,198,223,0.08) 0%, transparent 18%), radial-gradient(circle at 74% 34%, rgba(243,212,145,0.06) 0%, transparent 16%), radial-gradient(circle at 30% 68%, rgba(168,198,223,0.06) 0%, transparent 18%), radial-gradient(circle at 76% 86%, rgba(243,212,145,0.05) 0%, transparent 16%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1420px] px-4 pb-12 sm:px-6 lg:px-8">
        {mobileSupportRail ? (
          <div className="mb-5 xl:hidden" style={{ paddingTop: 88 }}>
            {mobileSupportRail}
          </div>
        ) : null}

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_286px] xl:gap-6 2xl:grid-cols-[minmax(0,1fr)_304px] 2xl:gap-8">
          <div className="min-w-0">
            <div className="relative" style={{ height: layout.totalHeight }}>
              {currentNode && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-[0] rounded-full"
                    style={{
                      left: `${currentNode.x}%`,
                      top: currentNode.y,
                      width: isMobile ? 310 : 500,
                      height: isMobile ? 310 : 500,
                      transform: "translate(-50%, -50%)",
                      background: `radial-gradient(circle, ${hexToRgba(currentNode.moduleAccent, 0.18)} 0%, rgba(255,255,255,0.06) 18%, transparent 66%)`,
                      filter: "blur(24px)",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-[0] rounded-full"
                    style={{
                      left: `${currentNode.x}%`,
                      top: currentNode.y,
                      width: isMobile ? 140 : 180,
                      height: isMobile ? 140 : 180,
                      transform: "translate(-50%, -50%)",
                      background: "radial-gradient(circle, rgba(249,239,215,0.16) 0%, transparent 70%)",
                      filter: "blur(18px)",
                    }}
                  />
                </>
              )}

              {layout.sections.map((section) => (
                <ModuleSection
                  key={section.id}
                  section={section}
                  currentModuleId={currentNode?.moduleId ?? modules[0]?.id ?? 1}
                  isMobile={isMobile}
                />
              ))}

              <JourneyPath
                nodes={layout.nodes}
                totalHeight={layout.totalHeight}
                currentIndex={Math.max(currentIndex, 0)}
                currentAccent={currentNode?.moduleAccent ?? "#d3b573"}
              />

              {layout.nodes.map((lesson) => (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  hovered={hoveredLessonId === lesson.id}
                  onHover={setHoveredLessonId}
                  onSelect={(selectedLesson) => {
                    const sourceModule = modules.find((module) => module.id === selectedLesson.moduleId);
                    const actualLesson = sourceModule?.lessons.find((item) => item.id === selectedLesson.id);
                    if (actualLesson) {
                      onLessonSelect(actualLesson);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {supportRail ? (
            <aside className="relative hidden xl:block">
              <div className="relative sticky top-[98px] max-h-[calc(100vh-112px)] overflow-y-auto pb-3 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-full rounded-[30px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 18%, rgba(255,255,255,0) 100%)",
                    boxShadow:
                      "inset 1px 0 0 rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                />
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-full w-full opacity-60"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path d="M0 8 C24 6, 44 7, 62 5 C76 4, 88 3, 100 2" fill="none" stroke="rgba(216,226,236,0.08)" strokeWidth="0.18" />
                  <path d="M0 20 C24 18, 42 18, 60 16 C76 14, 88 12, 100 9" fill="none" stroke="rgba(216,226,236,0.07)" strokeWidth="0.18" />
                  <path d="M0 42 C22 40, 40 38, 58 34 C76 30, 88 25, 100 20" fill="none" stroke="rgba(216,226,236,0.06)" strokeWidth="0.18" />
                  <path d="M0 66 C24 62, 44 58, 62 52 C78 47, 90 39, 100 32" fill="none" stroke="rgba(216,226,236,0.05)" strokeWidth="0.18" />
                  <path d="M0 90 C22 84, 42 80, 62 72 C78 66, 90 56, 100 46" fill="none" stroke="rgba(216,226,236,0.04)" strokeWidth="0.18" />
                </svg>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[30px]"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 16%, rgba(172,201,223,0.08) 0%, transparent 18%), radial-gradient(circle at 82% 10%, rgba(241,203,120,0.06) 0%, transparent 20%)",
                  }}
                />
                <div className="relative px-1 pt-[88px]">
                  {supportRail}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
