"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { DerivedLesson } from "../lib/course-engine";

// ─── Coordinate space ─────────────────────────────────────────────────────────
// SVG path uses tracedline.svg's native viewBox: 0 0 712 648
// Background image: mountain-clean.png, 1536×1024 (ratio 1.5)
//
// Stage: width = max(100vw, 100vh×1.5), aspect-ratio 1536/1024
//   → always covers the viewport, centered
// SVG overlay: viewBox="0 0 712 648", preserveAspectRatio="none"
//   → fills the stage exactly; SVG coords scale linearly to stage px
// HTML nodes: left = (x/712)*100%, top = (y/648)*100%

const SVG_W = 712;
const SVG_H = 648;
const IMG_RATIO = "1536 / 1024";

// ─── Exact path from tracedline.svg, REVERSED (base→summit) ──────────────────
// Original path: M586.501 3.5 ... C419 551.5, 7.5 636.5, 7.5 636.5
// Reversed so Framer Motion pathLength animates base → summit (ascending).
const ROUTE_PATH =
  "M 7.501 636.501 " +
  "C 7.501 636.501 419.001 551.501 419.001 533.001 " +
  "C 419.001 514.501 178.001 470.001 165.715 446.063 " +
  "C 153.428 422.126 571.501 333 571.476 313.61 " +
  "C 571.451 294.219 387.501 281.001 374.48 262.513 " +
  "C 361.458 244.026 715.001 188.501 704.001 168.754 " +
  "C 693.001 149.008 490.001 123.5 493.001 101.501 " +
  "C 496.001 79.501 704.001 55.657 704.001 38.501 " +
  "C 704.001 21.344 586.501 3.501 586.501 3.501";

// ─── Node config ──────────────────────────────────────────────────────────────

export type NodeVariant = "start" | "completed" | "current" | "locked";

export interface NodeConfig {
  id: number;
  // SVG coordinate space (0 0 712 648) — matches tracedline.svg
  x: number;
  y: number;
  sizePct: number; // % of stage width
  minPx: number;
  maxPx: number;
  variant: NodeVariant;
  label: string;
  route?: string;
}

// Positions sampled along the reversed path waypoints (base → summit).
// CSS: left=(x/712)*100%,  top=(y/648)*100%
const DEFAULT_NODES: NodeConfig[] = [
  { id: 1,  x: 174, y: 577, sizePct: 5.6, minPx: 52, maxPx: 88,  variant: "start",     label: "Start"     },
  { id: 2,  x: 380, y: 516, sizePct: 3.3, minPx: 36, maxPx: 54,  variant: "completed", label: "Lesson 2"  },
  { id: 3,  x: 190, y: 447, sizePct: 3.5, minPx: 36, maxPx: 56,  variant: "completed", label: "Lesson 3"  },
  { id: 4,  x: 468, y: 350, sizePct: 3.5, minPx: 36, maxPx: 56,  variant: "completed", label: "Lesson 4"  },
  { id: 5,  x: 372, y: 263, sizePct: 3.9, minPx: 40, maxPx: 62,  variant: "current",   label: "Lesson 5"  },
  { id: 6,  x: 616, y: 174, sizePct: 3.1, minPx: 32, maxPx: 50,  variant: "locked",    label: "Lesson 6"  },
  { id: 7,  x: 491, y: 104, sizePct: 2.8, minPx: 30, maxPx: 46,  variant: "locked",    label: "Lesson 7"  },
  { id: 8,  x: 564, y:  72, sizePct: 2.6, minPx: 28, maxPx: 42,  variant: "locked",    label: "Lesson 8"  },
];

// ─── Lesson → config mapping ──────────────────────────────────────────────────

function buildNodes(lessons: DerivedLesson[]): NodeConfig[] {
  return DEFAULT_NODES.map((def, i) => {
    const lesson = lessons[i];
    if (!lesson) return def;
    let variant: NodeVariant;
    if (i === 0) variant = "start";
    else if (lesson.state === "completed") variant = "completed";
    else if (lesson.state === "current" || lesson.state === "unlocked") variant = "current";
    else variant = "locked";
    return { ...def, variant, label: lesson.title, route: lesson.route };
  });
}

// ─── RoadmapPath ─────────────────────────────────────────────────────────────

export function RoadmapPath() {
  const ease = [0.25, 0.46, 0.45, 0.94];
  const dur = 2.6;
  const delay = 0.3;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 1,
        overflow: "visible",
      }}
    >
      <defs>
        <filter id="rp-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="rp-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Soft outer bloom */}
      <motion.path d={ROUTE_PATH} fill="none"
        stroke="rgba(205, 145, 18, 0.20)" strokeWidth={32} strokeLinecap="round"
        filter="url(#rp-bloom)"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        // @ts-expect-error number[] is valid cubic-bezier ease
        transition={{ duration: dur, delay, ease }}
      />

      {/* Warm body */}
      <motion.path d={ROUTE_PATH} fill="none"
        stroke="rgba(225, 158, 28, 0.58)" strokeWidth={5} strokeLinecap="round"
        filter="url(#rp-glow)"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        // @ts-expect-error number[] is valid cubic-bezier ease
        transition={{ duration: dur, delay, ease }}
      />

      {/* Crisp bright core */}
      <motion.path d={ROUTE_PATH} fill="none"
        stroke="rgba(255, 220, 118, 0.92)" strokeWidth={1.6} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        // @ts-expect-error number[] is valid cubic-bezier ease
        transition={{ duration: dur, delay, ease }}
      />
    </svg>
  );
}

// ─── Node surface styles ──────────────────────────────────────────────────────

function nodeSurface(variant: NodeVariant, hovered: boolean) {
  switch (variant) {
    case "start":
      return {
        background: "linear-gradient(148deg, rgba(230,235,240,0.90) 0%, rgba(195,202,210,0.84) 100%)",
        border: "1px solid rgba(255,255,255,0.54)",
        boxShadow: [
          "inset 0 1.5px 0 rgba(255,255,255,0.70)",
          "inset 0 -1px 0 rgba(0,0,0,0.10)",
          "0 6px 28px rgba(0,0,0,0.38)",
          hovered ? "0 10px 42px rgba(0,0,0,0.46)" : "",
        ].filter(Boolean).join(", "),
      };
    case "completed":
      return {
        background: "linear-gradient(148deg, rgba(22,34,50,0.95) 0%, rgba(16,26,40,0.91) 100%)",
        border: "1px solid rgba(50,70,96,0.36)",
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.05)",
          "0 3px 16px rgba(0,0,0,0.32)",
          hovered ? "0 7px 30px rgba(0,0,0,0.44), 0 0 16px rgba(228,162,34,0.12)" : "",
        ].filter(Boolean).join(", "),
      };
    case "current":
      return {
        background: "linear-gradient(148deg, rgba(28,42,58,0.97) 0%, rgba(20,33,50,0.93) 100%)",
        border: "1px solid rgba(218,175,48,0.30)",
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.07)",
          "0 4px 20px rgba(0,0,0,0.36)",
          "0 0 0 2px rgba(218,175,48,0.18)",
          "0 0 22px rgba(210,162,36,0.22)",
          hovered ? "0 8px 34px rgba(0,0,0,0.46), 0 0 32px rgba(218,175,48,0.32)" : "",
        ].filter(Boolean).join(", "),
      };
    default: // locked
      return {
        background: "rgba(14, 20, 30, 0.80)",
        border: "1px solid rgba(40,55,72,0.28)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.26)",
      };
  }
}

// ─── RoadmapNode ─────────────────────────────────────────────────────────────

export function RoadmapNode({
  node, index, isHovered, onHover, onClick,
}: {
  node: NodeConfig;
  index: number;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onClick: (node: NodeConfig) => void;
}) {
  const isLocked = node.variant === "locked";
  const isStart = node.variant === "start";
  const isCurrent = node.variant === "current";
  const isCompleted = node.variant === "completed";

  return (
    <motion.button
      type="button"
      aria-label={`${node.label}${isLocked ? " — locked" : ""}`}
      aria-disabled={isLocked}
      initial={{ opacity: 0, scale: 0.62 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.40,
        delay: 1.4 + index * 0.10,
        ease: [0.34, 1.40, 0.64, 1],
      }}
      whileHover={isLocked ? undefined : { y: -3, transition: { duration: 0.15, ease: "easeOut" } }}
      whileTap={isLocked ? undefined : { scale: 0.95, transition: { duration: 0.10 } }}
      onHoverStart={() => onHover(node.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => !isLocked && onClick(node)}
      className={isCurrent ? "rn-current" : undefined}
      style={{
        position: "absolute",
        left: `${(node.x / SVG_W) * 100}%`,
        top: `${(node.y / SVG_H) * 100}%`,
        transform: "translate(-50%, -50%)",
        width: `clamp(${node.minPx}px, ${node.sizePct}%, ${node.maxPx}px)`,
        height: `clamp(${node.minPx}px, ${node.sizePct}%, ${node.maxPx}px)`,
        borderRadius: "22%",
        cursor: isLocked ? "default" : "pointer",
        outline: "none",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        WebkitTapHighlightColor: "transparent",
        transition: "box-shadow 0.18s ease, border-color 0.18s ease",
        ...nodeSurface(node.variant, isHovered),
      }}
    >
      {/* Top-edge highlight on start node */}
      {isStart && (
        <span aria-hidden="true" style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.76), transparent)",
          borderRadius: "1px",
        }} />
      )}

      {/* Contact shadow — grounds node on terrain */}
      <span aria-hidden="true" style={{
        position: "absolute",
        bottom: "-22%", left: "8%", right: "8%", height: "14%",
        background: "rgba(0,0,0,0.40)",
        borderRadius: "50%",
        filter: "blur(5px)",
        pointerEvents: "none",
        zIndex: -1,
        opacity: isLocked ? 0.34 : 0.65,
      }} />

      {/* Completed checkmark */}
      {isCompleted && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"
          style={{ width: "38%", height: "38%", display: "block" }}>
          <path d="M3 8.5L6.5 12L13 5"
            stroke="rgba(255,255,255,0.84)" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Current warm checkmark */}
      {isCurrent && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"
          style={{ width: "38%", height: "38%", display: "block" }}>
          <path d="M3 8.5L6.5 12L13 5"
            stroke="rgba(232,192,96,0.92)" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Lock icon */}
      {isLocked && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"
          style={{ width: "36%", height: "36%", display: "block" }}>
          <rect x="4" y="7.5" width="8" height="5.5" rx="1.4"
            stroke="rgba(138,155,173,0.44)" strokeWidth="1.1" />
          <path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2"
            stroke="rgba(138,155,173,0.44)" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      )}

      <style jsx>{`
        button:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px rgba(8, 14, 24, 0.90),
            0 0 0 4px rgba(218, 175, 48, 0.52),
            0 0 22px rgba(218, 175, 48, 0.26);
        }
        .rn-current {
          animation: rnPulse 3.8s ease-in-out infinite;
        }
        @keyframes rnPulse {
          0%, 100% {
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.07),
              0 4px 20px rgba(0,0,0,0.36),
              0 0 0 2px rgba(218,175,48,0.18),
              0 0 22px rgba(210,162,36,0.22);
          }
          50% {
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.07),
              0 4px 20px rgba(0,0,0,0.36),
              0 0 0 3px rgba(218,175,48,0.32),
              0 0 36px rgba(210,162,36,0.36);
          }
        }
      `}</style>
    </motion.button>
  );
}

// ─── MountainRoadmap ──────────────────────────────────────────────────────────

interface MountainRoadmapProps {
  lessons?: DerivedLesson[];
  onNodeClick?: (id: number, route?: string) => void;
}

export function MountainRoadmap({ lessons, onNodeClick }: MountainRoadmapProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const nodes = lessons && lessons.length > 0 ? buildNodes(lessons) : DEFAULT_NODES;

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0b0f18" }}>
      {/*
        Stage replicates object-cover for mountain-clean.png (1536×1024).
        width  = max(100vw, 100vh × 1.5)   → always ≥ viewport width
        height = auto via aspect-ratio     → always ≥ viewport height
        Centered → symmetric crop on all sides.
      */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "max(100vw, calc(100vh * 1.5))",
        aspectRatio: IMG_RATIO,
      }}>
        {/* Background */}
        <Image
          src="/ref/mountain-clean.png"
          alt=""
          fill
          priority
          style={{ objectFit: "fill" }}
          sizes="150vw"
        />

        {/* Slight vignette — bottom only, preserves mountain sky */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(6,9,16,0.24) 0%, transparent 30%)",
        }} />

        {/* Traced path */}
        <RoadmapPath />

        {/* Nodes */}
        {nodes.map((node, i) => (
          <RoadmapNode
            key={node.id}
            node={node}
            index={i}
            isHovered={hoveredId === node.id}
            onHover={setHoveredId}
            onClick={(n) => onNodeClick?.(n.id, n.route)}
          />
        ))}
      </div>
    </div>
  );
}
