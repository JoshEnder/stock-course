"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { DerivedLesson } from "../lib/course-engine";

// ─── Scene geometry ───────────────────────────────────────────────────────────

// ViewBox: 100 × 60 — cinematic 5:3 ratio, built entirely in code
const VB_W = 100;
const VB_H = 60;

// Node positions in viewBox space — switchback ascent from basecamp to summit
const NODE_POSITIONS = [
  { vx: 50, vy: 53 }, // 1  — Basecamp
  { vx: 61, vy: 46 }, // 2  — First ascent right
  { vx: 70, vy: 39 }, // 3  — Right slope
  { vx: 74, vy: 31 }, // 4  — Rightmost switchback
  { vx: 65, vy: 26 }, // 5  — Heading left
  { vx: 51, vy: 22 }, // 6  — Mid-mountain centre
  { vx: 37, vy: 18 }, // 7  — Leftmost switchback
  { vx: 43, vy: 13 }, // 8  — Heading back right
  { vx: 51, vy:  9 }, // 9  — Upper approach
  { vx: 50, vy:  4 }, // 10 — Summit
];

// Mountain silhouette layers — all close at VB_H to form filled shapes
const FAR_MOUNTAINS =
  `M 0,${VB_H} L 0,26 L 7,19 L 13,24 L 19,14 L 27,21 L 34,11 L 42,18 ` +
  `L 48,9 L 54,14 L 60,8 L 66,15 L 72,11 L 78,19 L 84,14 L 90,21 ` +
  `L 96,17 L ${VB_W},20 L ${VB_W},${VB_H} Z`;

const MID_MOUNTAINS =
  `M 0,${VB_H} L 0,41 L 10,35 L 18,41 L 24,31 L 32,38 L 38,26 L 46,33 ` +
  `L 52,23 L 58,30 L 64,21 L 70,29 L 76,24 L 82,34 L 88,27 ` +
  `L 94,35 L ${VB_W},30 L ${VB_W},${VB_H} Z`;

const NEAR_MOUNTAINS =
  `M 0,${VB_H} L 0,52 L 10,46 L 18,51 L 26,43 L 34,49 L 42,41 ` +
  `L 50,47 L 58,39 L 65,46 L 72,40 L 80,49 L 88,43 ` +
  `L 96,49 L ${VB_W},45 L ${VB_W},${VB_H} Z`;

const FOREGROUND =
  `M 0,${VB_H} L 0,57 L 14,54 L 30,57 L 50,54 L 68,57 ` +
  `L 86,54 L ${VB_W},56 L ${VB_W},${VB_H} Z`;

// ─── Catmull-Rom smooth path ──────────────────────────────────────────────────

function catmullRomPath(pts: { vx: number; vy: number }[], tension = 0.3): string {
  const n = pts.length;
  if (n < 2) return "";
  const p = [
    { vx: pts[0].vx * 2 - pts[1].vx, vy: pts[0].vy * 2 - pts[1].vy },
    ...pts,
    { vx: pts[n - 1].vx * 2 - pts[n - 2].vx, vy: pts[n - 1].vy * 2 - pts[n - 2].vy },
  ];
  let d = `M ${pts[0].vx} ${pts[0].vy}`;
  for (let i = 1; i < p.length - 2; i++) {
    const cp1x = p[i].vx + (p[i + 1].vx - p[i - 1].vx) * tension;
    const cp1y = p[i].vy + (p[i + 1].vy - p[i - 1].vy) * tension;
    const cp2x = p[i + 1].vx - (p[i + 2].vx - p[i].vx) * tension;
    const cp2y = p[i + 1].vy - (p[i + 2].vy - p[i].vy) * tension;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p[i + 1].vx} ${p[i + 1].vy}`;
  }
  return d;
}

const ROUTE_PATH = catmullRomPath(NODE_POSITIONS, 0.3);
const ROUTE_TRANSITION = { duration: 2.2, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] };

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeState = "current" | "completed" | "locked" | "unlocked";

interface SceneNode {
  id: number;
  vx: number;
  vy: number;
  label: string;
  description: string;
  state: NodeState;
  route: string;
  isBoss: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

function toLeft(vx: number) {
  return `${vx}%`;
}
function toTop(vy: number) {
  return `${(vy / VB_H) * 100}%`;
}

function describeLesson(lesson: DerivedLesson) {
  if (lesson.isBoss) return `${lesson.estimatedTime} · Boss checkpoint`;
  return `${lesson.estimatedTime} · ${lesson.type === "practice" ? "Practice" : "Lesson"}`;
}

function getAriaLabel(node: SceneNode) {
  const stateLabel =
    node.state === "completed" ? "Completed"
    : node.state === "current" ? "Current lesson"
    : node.state === "unlocked" ? "Available"
    : "Locked";
  const base = `Lesson ${node.id}: ${node.label}. ${stateLabel}.`;
  return node.state === "locked" ? base : `${base} Press to open lesson details.`;
}

// ─── Node state styles ────────────────────────────────────────────────────────

const STYLES: Record<NodeState, {
  shell: string;
  shellBorder: string;
  innerFill: string;
  iconColor: string;
  outerRing: string;
  glow: string;
}> = {
  completed: {
    shell: "rgba(7, 20, 26, 0.94)",
    shellBorder: "rgba(39, 211, 195, 0.38)",
    innerFill: "rgba(39, 211, 195, 0.20)",
    iconColor: "#27d3c3",
    outerRing: "rgba(39, 211, 195, 0.28)",
    glow: "rgba(39, 211, 195, 0.18)",
  },
  current: {
    shell: "rgba(4, 16, 22, 0.97)",
    shellBorder: "rgba(89, 240, 223, 0.52)",
    innerFill: "rgba(89, 240, 223, 0.26)",
    iconColor: "#59f0df",
    outerRing: "rgba(89, 240, 223, 0.45)",
    glow: "rgba(89, 240, 223, 0.32)",
  },
  unlocked: {
    shell: "rgba(9, 19, 26, 0.90)",
    shellBorder: "rgba(39, 211, 195, 0.22)",
    innerFill: "rgba(39, 211, 195, 0.10)",
    iconColor: "#27d3c3",
    outerRing: "rgba(39, 211, 195, 0.16)",
    glow: "rgba(39, 211, 195, 0.10)",
  },
  locked: {
    shell: "rgba(12, 18, 26, 0.86)",
    shellBorder: "rgba(90, 110, 130, 0.20)",
    innerFill: "rgba(75, 95, 115, 0.10)",
    iconColor: "rgba(115, 135, 155, 0.58)",
    outerRing: "rgba(80, 100, 120, 0.12)",
    glow: "transparent",
  },
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({ node }: { node: SceneNode }) {
  const above = node.vy >= 12;
  const tipLeft = `${Math.min(82, Math.max(18, node.vx))}%`;
  const cssTop = above
    ? `calc(${toTop(node.vy)} - 1%)`
    : `calc(${toTop(node.vy)} + 4.5%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: above ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      style={{
        position: "absolute",
        left: tipLeft,
        top: cssTop,
        transform: above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        zIndex: 40,
        pointerEvents: "none",
        fontFamily: sans,
      }}
    >
      <div
        style={{
          background: "rgba(3, 7, 13, 0.97)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(39, 211, 195, 0.22)",
          borderRadius: 8,
          padding: "6px 11px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.55), 0 0 12px rgba(39,211,195,0.07)",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "#d4f0ec",
            letterSpacing: "-0.01em",
          }}
        >
          {node.label}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────

function InfoPanel({
  node,
  onClose,
  onStart,
}: {
  node: SceneNode;
  onClose: () => void;
  onStart: (route: string) => void;
}) {
  const isLocked = node.state === "locked";
  const isCompleted = node.state === "completed";
  const isCurrent = node.state === "current";

  return (
    <>
      {/* Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          background: "rgba(0,0,0,0.22)",
          cursor: "default",
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: "5%",
          right: "3%",
          zIndex: 50,
          width: "clamp(200px, 25%, 285px)",
          background: "rgba(3, 7, 14, 0.98)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: `1px solid ${isLocked ? "rgba(85,105,125,0.28)" : "rgba(39,211,195,0.32)"}`,
          borderRadius: 12,
          padding: "15px 15px 13px",
          fontFamily: sans,
          boxShadow: isLocked
            ? "0 10px 36px rgba(0,0,0,0.6)"
            : "0 0 22px rgba(39,211,195,0.07), 0 10px 36px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: isLocked ? "rgba(90,110,130,0.65)" : "rgba(39,211,195,0.75)",
                marginBottom: 4,
              }}
            >
              {node.isBoss ? "Boss · " : ""}Lesson {node.id}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.3,
                color: isLocked ? "rgba(140,160,175,0.55)" : "#e4f2f0",
              }}
            >
              {node.label}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="alp-close"
            aria-label="Close panel"
            style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              cursor: "pointer",
              outline: "none",
              color: "rgba(155,175,190,0.6)",
              fontSize: 14,
              padding: 0,
              fontFamily: sans,
            }}
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 11.5,
            color: "rgba(130,155,168,0.65)",
            margin: "9px 0 12px",
            lineHeight: 1.5,
          }}
        >
          {node.description}
        </p>

        {/* CTA */}
        <button
          type="button"
          disabled={isLocked}
          onClick={() => !isLocked && onStart(node.route)}
          className="alp-cta"
          style={{
            width: "100%",
            height: 36,
            borderRadius: 7,
            background: isLocked ? "rgba(45,58,72,0.45)" : "rgba(39,211,195,0.13)",
            color: isLocked ? "rgba(120,140,155,0.55)" : "#27d3c3",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.01em",
            cursor: isLocked ? "not-allowed" : "pointer",
            border: `1px solid ${isLocked ? "rgba(80,100,120,0.18)" : "rgba(39,211,195,0.28)"}`,
            boxShadow: isLocked ? "none" : "0 0 12px rgba(39,211,195,0.09)",
            transition: "background 0.13s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            outline: "none",
            fontFamily: sans,
          }}
          onMouseEnter={(e) => {
            if (!isLocked)
              (e.currentTarget as HTMLElement).style.background = "rgba(39,211,195,0.20)";
          }}
          onMouseLeave={(e) => {
            if (!isLocked)
              (e.currentTarget as HTMLElement).style.background = "rgba(39,211,195,0.13)";
          }}
        >
          {isLocked ? (
            <>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Locked
            </>
          ) : isCompleted ? (
            "Review lesson"
          ) : isCurrent ? (
            "Continue lesson"
          ) : (
            "Start lesson"
          )}
        </button>
      </motion.div>

      <style jsx>{`
        .alp-close:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px rgba(39, 211, 195, 0.32);
        }
        .alp-cta:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px rgba(39, 211, 195, 0.32), 0 0 16px rgba(39, 211, 195, 0.14);
        }
      `}</style>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type MountainRoadmapProps = { lessons: DerivedLesson[] };

export function MountainRoadmap({ lessons }: MountainRoadmapProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const nodes: SceneNode[] = lessons.slice(0, NODE_POSITIONS.length).map((lesson, i) => ({
    id: lesson.lessonNumber,
    vx: NODE_POSITIONS[i].vx,
    vy: NODE_POSITIONS[i].vy,
    label: lesson.title,
    description: describeLesson(lesson),
    state: lesson.state as NodeState,
    route: lesson.route,
    isBoss: lesson.isBoss,
  }));

  const activeTooltipId = selectedId === null ? (focusedId ?? hoveredId) : null;
  const tooltipNode = nodes.find((n) => n.id === activeTooltipId) ?? null;
  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  function handleClick(node: SceneNode) {
    if (node.state === "locked") return;
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }

  return (
    <div
      role="region"
      aria-label="Course roadmap"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${VB_W} / ${VB_H}`,
        borderRadius: 16,
        overflow: "hidden",
        userSelect: "none",
        background: "#060b18",
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && selectedId !== null) {
          e.stopPropagation();
          setSelectedId(null);
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedId(null);
      }}
    >
      {/* ── Alpine world (built entirely in SVG) ──────────────────────────── */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <defs>
          {/* Sky */}
          <linearGradient
            id="alp-sky"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#040a18" />
            <stop offset="50%" stopColor="#0a1c32" />
            <stop offset="100%" stopColor="#0d2340" />
          </linearGradient>

          {/* Atmospheric shimmer */}
          <radialGradient id="alp-atm" cx="48%" cy="30%" r="52%">
            <stop offset="0%" stopColor="rgba(80,140,200,0.07)" />
            <stop offset="100%" stopColor="rgba(80,140,200,0)" />
          </radialGradient>

          {/* Summit glow */}
          <radialGradient id="alp-summit" cx="50%" cy="8%" r="35%">
            <stop offset="0%" stopColor="rgba(89,240,223,0.055)" />
            <stop offset="100%" stopColor="rgba(89,240,223,0)" />
          </radialGradient>

          {/* Horizontal fog band */}
          <linearGradient id="alp-fog" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(130,185,220,0)" />
            <stop offset="25%" stopColor="rgba(130,185,220,0.028)" />
            <stop offset="50%" stopColor="rgba(130,185,220,0.042)" />
            <stop offset="75%" stopColor="rgba(130,185,220,0.028)" />
            <stop offset="100%" stopColor="rgba(130,185,220,0)" />
          </linearGradient>

          {/* Route body gradient — teal to glacier */}
          <linearGradient
            id="alp-route-body"
            x1="0"
            y1="1"
            x2="0"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="rgba(39,211,195,0.22)" />
            <stop offset="100%" stopColor="rgba(89,240,223,0.32)" />
          </linearGradient>

          {/* Route core — brighter line */}
          <linearGradient
            id="alp-route-core"
            x1="0"
            y1="1"
            x2="0"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="rgba(39,211,195,0.52)" />
            <stop offset="100%" stopColor="rgba(127,231,242,0.68)" />
          </linearGradient>

          {/* Route ambient glow filter */}
          <filter id="alp-glow-f" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.55" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky base */}
        <rect width={VB_W} height={VB_H} fill="url(#alp-sky)" />
        <rect width={VB_W} height={VB_H} fill="url(#alp-atm)" />
        <rect width={VB_W} height={VB_H} fill="url(#alp-summit)" />

        {/* Far mountains — lightest, most atmospheric */}
        <motion.path
          d={FAR_MOUNTAINS}
          fill="rgba(16,32,54,0.52)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
        />

        {/* High fog band */}
        <motion.rect
          x={0} y={14} width={VB_W} height={9}
          fill="url(#alp-fog)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.38 }}
        />

        {/* Mid mountains */}
        <motion.path
          d={MID_MOUNTAINS}
          fill="rgba(9,18,32,0.78)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28, ease: "easeOut" }}
        />

        {/* Mid fog band */}
        <motion.rect
          x={0} y={28} width={VB_W} height={8}
          fill="url(#alp-fog)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
        />

        {/* Near mountains — darkest, most present */}
        <motion.path
          d={NEAR_MOUNTAINS}
          fill="rgba(6,12,22,0.90)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.44, ease: "easeOut" }}
        />

        {/* Route — groove (shadow carved into terrain) */}
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth={1.6}
          strokeLinecap="round"
          style={{ mixBlendMode: "multiply" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          // @ts-expect-error framer-motion accepts number[] for cubic bezier ease
          transition={ROUTE_TRANSITION}
        />

        {/* Route — body */}
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="url(#alp-route-body)"
          strokeWidth={0.9}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          // @ts-expect-error framer-motion accepts number[] for cubic bezier ease
          transition={ROUTE_TRANSITION}
        />

        {/* Route — bright core */}
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="url(#alp-route-core)"
          strokeWidth={0.36}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          // @ts-expect-error framer-motion accepts number[] for cubic bezier ease
          transition={ROUTE_TRANSITION}
        />

        {/* Route — ambient glow */}
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(89,240,223,0.12)"
          strokeWidth={2.0}
          strokeLinecap="round"
          filter="url(#alp-glow-f)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          // @ts-expect-error framer-motion accepts number[] for cubic bezier ease
          transition={ROUTE_TRANSITION}
        />

        {/* Foreground ridge — ground frame */}
        <motion.path
          d={FOREGROUND}
          fill="rgba(4,8,16,0.97)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </svg>

      {/* ── Interactive nodes (HTML overlay, above SVG) ───────────────────── */}
      {nodes.map((node, index) => {
        const s = STYLES[node.state];
        const isCurrent = node.state === "current";
        const isCompleted = node.state === "completed";
        const isLocked = node.state === "locked";
        const isActive = hoveredId === node.id || focusedId === node.id;
        const isSelected = selectedId === node.id;

        // Larger nodes lower in the scene — depth perspective
        const depthScale = 0.84 + (node.vy / VB_H) * 0.25;
        const sz = `clamp(40px, ${(4.5 * depthScale).toFixed(1)}%, 56px)`;

        return (
          <motion.button
            key={node.id}
            type="button"
            aria-label={getAriaLabel(node)}
            aria-disabled={isLocked}
            aria-expanded={isLocked ? undefined : isSelected}
            aria-haspopup={isLocked ? undefined : "dialog"}
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.38,
              delay: 1.0 + index * 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setFocusedId(node.id)}
            onBlur={() => setFocusedId((cur) => (cur === node.id ? null : cur))}
            onClick={(e) => {
              e.stopPropagation();
              handleClick(node);
            }}
            className={`alp-node${isLocked ? " alp-node--locked" : ""}`}
            style={{
              position: "absolute",
              left: toLeft(node.vx),
              top: toTop(node.vy),
              transform: "translate(-50%, -50%)",
              width: sz,
              height: sz,
              borderRadius: "50%",
              zIndex: 10,
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: isLocked ? "not-allowed" : "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Ambient pulse — current node only */}
            {isCurrent && <span className="alp-pulse" aria-hidden="true" />}

            {/* Outer indicator ring */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-16%",
                borderRadius: "50%",
                border: `1px solid ${isActive && !isLocked ? s.shellBorder : s.outerRing}`,
                transition: "border-color 0.14s ease, box-shadow 0.14s ease",
                boxShadow:
                  isSelected && !isLocked
                    ? `0 0 0 1px ${s.shellBorder}, 0 0 18px ${s.glow}`
                    : "none",
              }}
            />

            {/* Node shell */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: s.shell,
                border: `1px solid ${s.shellBorder}`,
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.08)",
                  "inset 0 -1px 0 rgba(0,0,0,0.22)",
                  "0 2px 8px rgba(0,0,0,0.38)",
                  isLocked ? null : `0 0 16px ${s.glow}`,
                ]
                  .filter(Boolean)
                  .join(", "),
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
            />

            {/* Inner fill disc */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "18%",
                borderRadius: "50%",
                background: s.innerFill,
              }}
            />

            {/* State icon */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isCompleted ? (
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ width: "36%", height: "36%", display: "block" }}
                >
                  <path
                    d="M3 8.5L6.5 12L13 5"
                    stroke={s.iconColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : isLocked ? (
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ width: "36%", height: "36%", display: "block" }}
                >
                  <rect x="4" y="7.5" width="8" height="6" rx="1" fill={s.iconColor} />
                  <path
                    d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2"
                    stroke={s.iconColor}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <span
                  style={{
                    fontSize: "clamp(7px, 36%, 15px)",
                    fontWeight: 700,
                    color: s.iconColor,
                    fontFamily: sans,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {node.id}
                </span>
              )}
            </span>

            {/* Glass glint highlight */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "11%",
                left: "17%",
                width: "32%",
                height: "22%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                filter: "blur(0.4px)",
                transform: "rotate(-20deg)",
                pointerEvents: "none",
              }}
            />
          </motion.button>
        );
      })}

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {tooltipNode && <Tooltip key={`tip-${tooltipNode.id}`} node={tooltipNode} />}
      </AnimatePresence>

      {/* ── Info panel + scrim ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedNode && (
          <InfoPanel
            key={`panel-${selectedNode.id}`}
            node={selectedNode}
            onClose={() => setSelectedId(null)}
            onStart={(route) => router.push(route)}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        .alp-node {
          appearance: none;
        }

        .alp-node:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px rgba(5, 10, 20, 0.85),
            0 0 0 4px rgba(39, 211, 195, 0.32),
            0 0 22px rgba(39, 211, 195, 0.20);
        }

        .alp-node--locked:focus-visible {
          box-shadow:
            0 0 0 2px rgba(5, 10, 20, 0.85),
            0 0 0 4px rgba(90, 110, 130, 0.28);
        }

        .alp-pulse {
          position: absolute;
          inset: -22%;
          border-radius: 50%;
          border: 1.5px solid rgba(89, 240, 223, 0.38);
          pointer-events: none;
          animation: alp-pulse 3.2s ease-in-out infinite;
        }

        @keyframes alp-pulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          55% { transform: scale(1.22); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
