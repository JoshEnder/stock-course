"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { DerivedLesson } from "../lib/course-engine";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — edit coordinates here only
// ─────────────────────────────────────────────────────────────────────────────

type NodeState = "current" | "completed" | "locked" | "unlocked";

interface RoadmapAnchor {
  x: number;
  y: number;
  hitboxSize: number;
}

interface RoadmapNode extends RoadmapAnchor {
  id: number;
  label: string;
  description: string;
  state: NodeState;
  route: string;
}

type PathSegment = {
  id: string;
  d: string;
  grooveWidth: number;
  bodyWidth: number;
  coreWidth: number;
  glowWidth: number;
  grooveOpacity: number;
  bodyOpacity: number;
  coreOpacity: number;
  glowOpacity: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bodyStartColor: string;
  bodyMidColor: string;
  bodyEndColor: string;
  startColor: string;
  endColor: string;
};

const SCENE_VIEWBOX = {
  width: 100,
  height: 100,
} as const;

const ROADMAP_ANCHORS: RoadmapAnchor[] = [
  { x: 15, y: 82, hitboxSize: 8.5 },
  { x: 27, y: 75, hitboxSize: 7.4 },
  { x: 38, y: 65, hitboxSize: 6.4 },
  { x: 48, y: 54, hitboxSize: 6.1 },
  { x: 56, y: 43, hitboxSize: 5.8 },
  { x: 63, y: 32, hitboxSize: 5.6 },
  { x: 70, y: 21, hitboxSize: 5.1 },
  { x: 76, y: 11, hitboxSize: 5.0 },
  { x: 82, y: 3, hitboxSize: 4.9 },
  { x: 87, y: 4, hitboxSize: 4.7 },
];

const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const GREEN = "#22ff77";
const PATH_COLORS = [
  ["rgba(122, 214, 153, 0.55)", "rgba(86, 184, 123, 0.42)"],
  ["rgba(126, 220, 158, 0.5)", "rgba(80, 168, 112, 0.36)"],
  ["rgba(150, 228, 170, 0.46)", "rgba(72, 151, 101, 0.32)"],
] as const;

function describeLesson(lesson: DerivedLesson) {
  if (lesson.isBoss) {
    return `${lesson.estimatedTime} boss checkpoint`;
  }

  return `${lesson.estimatedTime} lesson · Learn, practice, and check`;
}

function toRoadmapNode(lesson: DerivedLesson, anchor: RoadmapAnchor): RoadmapNode {
  return {
    id: lesson.lessonNumber,
    label: lesson.title,
    description: describeLesson(lesson),
    state: lesson.state,
    route: lesson.route,
    ...anchor,
  };
}

function getNodeStatusLabel(state: NodeState) {
  switch (state) {
    case "completed":
      return "Completed";
    case "current":
      return "Current lesson";
    case "unlocked":
      return "Unlocked";
    case "locked":
    default:
      return "Locked";
  }
}

function getNodeAriaLabel(node: RoadmapNode) {
  const base = `Lesson ${node.id}, ${node.label}. ${getNodeStatusLabel(node.state)}.`;

  if (node.state === "locked") {
    return `${base} ${node.description}.`;
  }

  return `${base} ${node.description}. Activate to open lesson details.`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getNodeTilt(nodes: RoadmapNode[], index: number) {
  const prev = nodes[index - 1] ?? nodes[index];
  const next = nodes[index + 1] ?? nodes[index];
  const angle = (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI;

  return clamp(angle * 0.28, -16, -6);
}

function getNodeVisuals(node: RoadmapNode, index: number, nodes: RoadmapNode[]) {
  const depth = node.y / 100;
  const altitudeFade = 0.68 + depth * 0.28;
  const scale = 0.78 + depth * 0.3;
  const tilt = getNodeTilt(nodes, index);

  let shellColor = "rgba(22, 39, 30, 0.84)";
  let shellBorder = "rgba(159, 242, 186, 0.14)";
  let coreStart = "rgba(145, 226, 167, 0.82)";
  let coreEnd = "rgba(42, 116, 69, 0.72)";
  let glow = "rgba(93, 214, 128, 0.22)";

  if (node.state === "current") {
    shellColor = "rgba(20, 43, 31, 0.92)";
    shellBorder = "rgba(190, 255, 209, 0.24)";
    coreStart = "rgba(176, 245, 193, 0.96)";
    coreEnd = "rgba(56, 141, 84, 0.82)";
    glow = "rgba(104, 229, 143, 0.3)";
  } else if (node.state === "completed") {
    shellColor = "rgba(21, 38, 29, 0.88)";
    shellBorder = "rgba(168, 244, 192, 0.18)";
    coreStart = "rgba(157, 233, 179, 0.9)";
    coreEnd = "rgba(46, 124, 75, 0.76)";
    glow = "rgba(88, 205, 120, 0.24)";
  } else if (node.state === "locked") {
    shellColor = "rgba(28, 34, 39, 0.82)";
    shellBorder = "rgba(168, 181, 194, 0.14)";
    coreStart = "rgba(119, 134, 146, 0.5)";
    coreEnd = "rgba(52, 62, 72, 0.48)";
    glow = "rgba(108, 120, 132, 0.14)";
  }

  return {
    depth,
    altitudeFade,
    scale,
    tilt,
    shellColor,
    shellBorder,
    coreStart,
    coreEnd,
    glow,
  };
}

function buildPathSegments(nodes: RoadmapNode[]): PathSegment[] {
  return nodes.slice(0, -1).map((node, index) => {
    const next = nodes[index + 1];
    const dx = next.x - node.x;
    const dy = next.y - node.y;
    const distance = Math.hypot(dx, dy) || 1;
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const curveStrength = 0.38 + (node.y / 100) * 0.42;
    const controlX = (node.x + next.x) / 2 + normalX * curveStrength;
    const controlY = (node.y + next.y) / 2 + normalY * curveStrength * 0.72;
    const avgY = (node.y + next.y) / 2;
    const depth = avgY / 100;
    const grooveWidth = 0.72 + depth * 1.24;
    const bodyWidth = grooveWidth * 0.62;
    const coreWidth = grooveWidth * 0.24;
    const glowWidth = grooveWidth * 0.96;
    const colorPair = PATH_COLORS[index % PATH_COLORS.length];

    return {
      id: `segment-${node.id}-${next.id}`,
      d: `M ${node.x} ${node.y} Q ${controlX} ${controlY} ${next.x} ${next.y}`,
      grooveWidth,
      bodyWidth,
      coreWidth,
      glowWidth,
      grooveOpacity: 0.34 + depth * 0.16,
      bodyOpacity: 0.24 + depth * 0.14,
      coreOpacity: 0.38 + depth * 0.16,
      glowOpacity: 0.07 + depth * 0.07,
      x1: node.x,
      y1: node.y,
      x2: next.x,
      y2: next.y,
      bodyStartColor: "rgba(16, 28, 20, 0.68)",
      bodyMidColor: "rgba(48, 78, 58, 0.34)",
      bodyEndColor: "rgba(16, 32, 21, 0.56)",
      startColor: colorPair[0],
      endColor: colorPair[1],
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

function Tooltip({ node }: { node: RoadmapNode }) {
  const showBelow = node.y < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: showBelow ? -5 : 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: showBelow ? -4 : 4 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: `${node.x}%`,
        top: showBelow
          ? `calc(${node.y}% + 5.5%)`
          : `calc(${node.y}% - 2.5%)`,
        transform: showBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 30,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {!showBelow && (
        <div style={{
          width: 0, height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `6px solid ${GREEN}`,
          margin: "0 auto",
          marginBottom: -1,
        }} />
      )}

      <div style={{
        background: "rgba(5,8,14,0.97)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${GREEN}`,
        borderRadius: 9,
        padding: "8px 13px",
        boxShadow: `0 0 20px rgba(34,255,119,0.15), 0 6px 24px rgba(0,0,0,0.6)`,
        fontFamily: sans,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: "-0.01em" }}>
          {node.label}
        </div>
        <div style={{ fontSize: 11, color: "rgba(170,190,205,0.75)", marginTop: 3 }}>
          {node.description}
        </div>
      </div>

      {showBelow && (
        <div style={{
          width: 0, height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `6px solid ${GREEN}`,
          margin: "0 auto",
          marginTop: -1,
        }} />
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO PANEL
// ─────────────────────────────────────────────────────────────────────────────

function InfoPanel({
  node,
  onClose,
  onStart,
}: {
  node: RoadmapNode;
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
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.42)",
          zIndex: 20,
          cursor: "default",
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          bottom: "6%",
          right: "3%",
          zIndex: 40,
          width: "clamp(210px, 26%, 300px)",
          background: "rgba(5,8,14,0.98)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${isLocked ? "rgba(107,114,128,0.4)" : "rgba(34,255,119,0.4)"}`,
          borderRadius: 13,
          padding: "16px 16px 14px",
          boxShadow: isLocked
            ? "0 12px 40px rgba(0,0,0,0.6)"
            : `0 0 28px rgba(34,255,119,0.10), 0 12px 40px rgba(0,0,0,0.6)`,
          fontFamily: sans,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: isLocked ? "rgba(107,114,128,0.8)" : GREEN,
              marginBottom: 5,
            }}>
              Lesson {node.id}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isLocked ? "rgba(180,190,200,0.6)" : "#eef4f0", lineHeight: 1.3 }}>
              {node.label}
            </div>
          </div>

          {/* × close */}
          <button
            type="button"
            onClick={onClose}
            className="mountain-panel-close"
            style={{
              flexShrink: 0, width: 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 6, cursor: "pointer",
              color: "rgba(180,190,205,0.7)", fontSize: 15, lineHeight: 1, padding: 0,
              outline: "none",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 12, color: "rgba(160,180,195,0.68)",
          margin: "10px 0 13px", lineHeight: 1.55,
        }}>
          {node.description}
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={() => !isLocked && onStart(node.route)}
          disabled={isLocked}
          className="mountain-panel-cta"
          style={{
            width: "100%", height: 38, borderRadius: 8, border: "none",
            background: isLocked ? "rgba(55,65,80,0.6)" : GREEN,
            color: isLocked ? "rgba(150,160,175,0.7)" : "#060a0a",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.01em",
            cursor: isLocked ? "not-allowed" : "pointer",
            fontFamily: sans,
            boxShadow: isLocked ? "none" : `0 0 14px rgba(34,255,119,0.22), 0 3px 10px rgba(0,0,0,0.3)`,
            transition: "opacity 0.12s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            outline: "none",
          }}
          onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {isLocked ? (
            <>
              {/* Inline lock icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

type MountainRoadmapProps = {
  lessons: DerivedLesson[];
};

export function MountainRoadmap({ lessons }: MountainRoadmapProps) {
  const router = useRouter();
  const [hoveredId,  setHoveredId]  = useState<number | null>(null);
  const [focusedId,  setFocusedId]  = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const roadmapNodes = lessons
    .slice(0, ROADMAP_ANCHORS.length)
    .map((lesson, index) => toRoadmapNode(lesson, ROADMAP_ANCHORS[index]));
  const pathSegments = useMemo(() => buildPathSegments(roadmapNodes), [roadmapNodes]);

  const activeTooltipNodeId = selectedId === null ? focusedId ?? hoveredId : null;
  const hoveredNode  = roadmapNodes.find((node) => node.id === activeTooltipNodeId)  ?? null;
  const selectedNode = roadmapNodes.find((node) => node.id === selectedId) ?? null;
  const controlStates = useMemo(() => {
    return new Map(
      roadmapNodes.map((node) => [
        node.id,
        {
          isHovered: hoveredId === node.id,
          isFocused: focusedId === node.id,
          isSelected: selectedId === node.id,
          isLocked: node.state === "locked",
        },
      ]),
    );
  }, [focusedId, hoveredId, roadmapNodes, selectedId]);

  function handleClick(node: RoadmapNode) {
    if (node.state === "locked") return;
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        // Image native ratio 2048×1364 ≈ 1.502:1
        aspectRatio: "2048 / 1364",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.24)",
        userSelect: "none",
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && selectedId !== null) {
          e.stopPropagation();
          setSelectedId(null);
        }
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <Image
        src="/ref/upscale.png"
        alt="Course roadmap: your path up the mountain"
        fill
        priority
        style={{ objectFit: "contain", objectPosition: "center", pointerEvents: "none", zIndex: 0 }}
        sizes="100vw"
      />

      {/* ── Terrain-embedded route ───────────────────────────────────────── */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${SCENE_VIEWBOX.width} ${SCENE_VIEWBOX.height}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3, pointerEvents: "none" }}
      >
        <defs>
          <filter id="mountainRouteBloom" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.75" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {pathSegments.map((segment) => (
          <linearGradient
            key={`${segment.id}-gradient`}
            id={`${segment.id}-gradient`}
            gradientUnits="userSpaceOnUse"
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
          >
            <stop offset="0%" stopColor={segment.bodyStartColor} />
            <stop offset="52%" stopColor={segment.bodyMidColor} />
            <stop offset="100%" stopColor={segment.bodyEndColor} />
          </linearGradient>
        ))}

        {pathSegments.map((segment) => (
          <linearGradient
            key={`${segment.id}-core-gradient`}
            id={`${segment.id}-core-gradient`}
            gradientUnits="userSpaceOnUse"
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
          >
            <stop offset="0%" stopColor={segment.startColor} />
            <stop offset="54%" stopColor="rgba(171, 235, 190, 0.26)" />
            <stop offset="100%" stopColor={segment.endColor} />
          </linearGradient>
        ))}

        {pathSegments.map((segment) => (
          <g key={segment.id}>
            <path
              d={segment.d}
              fill="none"
              stroke={`rgba(5, 10, 11, ${segment.grooveOpacity})`}
              strokeWidth={segment.grooveWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ mixBlendMode: "multiply" }}
            />
            <path
              d={segment.d}
              fill="none"
              stroke={`url(#${segment.id}-gradient)`}
              strokeOpacity={segment.bodyOpacity}
              strokeWidth={segment.bodyWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={segment.d}
              fill="none"
              stroke={`url(#${segment.id}-core-gradient)`}
              strokeOpacity={segment.coreOpacity}
              strokeWidth={segment.coreWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={segment.d}
              fill="none"
              stroke={`url(#${segment.id}-core-gradient)`}
              strokeOpacity={segment.glowOpacity}
              strokeWidth={segment.glowWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mountainRouteBloom)"
            />
          </g>
        ))}
      </svg>

      {/* ── Interactive node controls ─────────────────────────────────────── */}
      {roadmapNodes.map((node, index) => {
        const visuals = getNodeVisuals(node, index, roadmapNodes);

        return (
        <button
          key={node.id}
          type="button"
          className={`mountain-node-button${controlStates.get(node.id)?.isSelected ? " mountain-node-button--selected" : ""}${controlStates.get(node.id)?.isLocked ? " mountain-node-button--locked" : ""}`}
          aria-label={getNodeAriaLabel(node)}
          aria-disabled={node.state === "locked"}
          aria-expanded={node.state === "locked" ? undefined : selectedId === node.id}
          aria-haspopup={node.state === "locked" ? undefined : "dialog"}
          onMouseEnter={() => setHoveredId(node.id)}
          onMouseLeave={() => setHoveredId(null)}
          onFocus={() => setFocusedId(node.id)}
          onBlur={() => setFocusedId((current) => (current === node.id ? null : current))}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(node);
          }}
          style={{
            position: "absolute",
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            width: `${node.hitboxSize}%`,
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            zIndex: 10,
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: node.state === "locked" ? "not-allowed" : "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            ["--node-tilt" as string]: `${visuals.tilt}deg`,
            ["--node-scale" as string]: `${visuals.scale}`,
            ["--node-fade" as string]: `${visuals.altitudeFade}`,
            ["--node-shell" as string]: visuals.shellColor,
            ["--node-shell-border" as string]: visuals.shellBorder,
            ["--node-core-start" as string]: visuals.coreStart,
            ["--node-core-end" as string]: visuals.coreEnd,
            ["--node-glow" as string]: visuals.glow,
          }}
        >
          <span aria-hidden="true" className="mountain-node-shadow" />
          <span aria-hidden="true" className="mountain-node-seat" />
          <span aria-hidden="true" className="mountain-node-body">
            <span className="mountain-node-core" />
            <span className="mountain-node-highlight" />
          </span>
          <span
            aria-hidden="true"
            className={`mountain-node-halo${controlStates.get(node.id)?.isHovered ? " mountain-node-halo--hovered" : ""}${controlStates.get(node.id)?.isFocused ? " mountain-node-halo--focused" : ""}${controlStates.get(node.id)?.isSelected ? " mountain-node-halo--selected" : ""}${controlStates.get(node.id)?.isLocked ? " mountain-node-halo--locked" : ""}`}
          />
        </button>
        );
      })}

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <Tooltip key={`tip-${hoveredNode.id}`} node={hoveredNode} />
        )}
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
        .mountain-node-button {
          appearance: none;
        }

        .mountain-node-shadow,
        .mountain-node-seat,
        .mountain-node-body,
        .mountain-node-halo {
          position: absolute;
          inset: 50%;
          border-radius: 999px;
          pointer-events: none;
        }

        .mountain-node-shadow {
          width: 16px;
          height: 8px;
          transform: translate(-50%, -50%) translateY(calc(4px * var(--node-scale))) rotate(var(--node-tilt)) scaleX(calc(0.88 + var(--node-scale) * 0.16));
          background: rgba(3, 6, 8, 0.48);
          filter: blur(5px);
          opacity: calc(var(--node-fade) * 0.72);
        }

        .mountain-node-seat {
          width: calc(18px * var(--node-scale));
          height: calc(10px * var(--node-scale));
          transform: translate(-50%, -50%) translateY(calc(1.25px * var(--node-scale))) rotate(var(--node-tilt));
          background:
            radial-gradient(circle at 50% 35%, rgba(5, 9, 11, 0.52) 0%, rgba(10, 16, 17, 0.24) 58%, rgba(10, 16, 17, 0) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px rgba(6, 11, 12, 0.24);
          opacity: calc(var(--node-fade) * 0.9);
        }

        .mountain-node-body {
          width: calc(14px * var(--node-scale));
          height: calc(14px * var(--node-scale));
          transform: translate(-50%, -50%) translateY(calc(0.6px * var(--node-scale))) rotate(var(--node-tilt));
          background:
            linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0)),
            var(--node-shell);
          border: 1px solid var(--node-shell-border);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(0,0,0,0.18),
            0 2px 6px rgba(0,0,0,0.24),
            0 0 16px var(--node-glow);
          opacity: calc(0.76 * var(--node-fade));
        }

        .mountain-node-core,
        .mountain-node-highlight {
          position: absolute;
          inset: 50%;
          border-radius: 999px;
          pointer-events: none;
        }

        .mountain-node-core {
          width: 54%;
          height: 54%;
          transform: translate(-50%, -50%);
          background: linear-gradient(180deg, var(--node-core-start), var(--node-core-end));
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 8px rgba(120, 216, 149, 0.16);
        }

        .mountain-node-highlight {
          width: 34%;
          height: 22%;
          transform: translate(-50%, -50%) translate(-12%, -28%) rotate(-18deg);
          background: rgba(248, 255, 251, 0.16);
          filter: blur(0.4px);
          opacity: calc(var(--node-fade) * 0.72);
        }

        .mountain-node-halo {
          width: 22px;
          height: 22px;
          transform: translate(-50%, -50%);
          border: 1px solid transparent;
          background:
            radial-gradient(circle, rgba(34, 255, 119, 0.16) 0%, rgba(34, 255, 119, 0.05) 46%, rgba(34, 255, 119, 0) 78%);
          box-shadow: none;
          opacity: 0;
          transition:
            opacity 140ms ease,
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .mountain-node-halo--hovered {
          opacity: 0.82;
          transform: translate(-50%, -50%) scale(1.22);
          border-color: rgba(186, 255, 213, 0.26);
          box-shadow:
            0 0 0 1px rgba(18, 26, 22, 0.32),
            0 0 24px rgba(34, 255, 119, 0.16);
        }

        .mountain-node-halo--focused {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.34);
          border-color: rgba(214, 255, 228, 0.6);
          box-shadow:
            0 0 0 1px rgba(7, 14, 11, 0.64),
            0 0 0 4px rgba(34, 255, 119, 0.16),
            0 0 28px rgba(34, 255, 119, 0.22);
        }

        .mountain-node-halo--selected {
          opacity: 0.96;
          transform: translate(-50%, -50%) scale(1.28);
          border-color: rgba(160, 255, 196, 0.4);
          box-shadow:
            0 0 0 1px rgba(7, 14, 11, 0.58),
            0 0 26px rgba(34, 255, 119, 0.18);
        }

        .mountain-node-halo--locked {
          background:
            radial-gradient(circle, rgba(148, 163, 184, 0.12) 0%, rgba(148, 163, 184, 0.04) 44%, rgba(148, 163, 184, 0) 76%);
        }

        .mountain-node-button--locked .mountain-node-halo--hovered,
        .mountain-node-button--locked .mountain-node-halo--focused {
          border-color: rgba(148, 163, 184, 0.34);
          box-shadow:
            0 0 0 1px rgba(7, 14, 11, 0.48),
            0 0 22px rgba(148, 163, 184, 0.14);
        }

        .mountain-panel-close:focus-visible {
          box-shadow:
            0 0 0 1px rgba(7, 14, 11, 0.52),
            0 0 0 3px rgba(34, 255, 119, 0.18),
            0 0 20px rgba(34, 255, 119, 0.18);
          border-color: rgba(180, 255, 205, 0.38);
        }

        .mountain-panel-cta:focus-visible {
          box-shadow:
            0 0 0 1px rgba(7, 14, 11, 0.58),
            0 0 0 4px rgba(34, 255, 119, 0.16),
            0 0 26px rgba(34, 255, 119, 0.24);
        }
      `}</style>
    </div>
  );
}
