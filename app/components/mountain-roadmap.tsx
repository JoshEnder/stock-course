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
  hitboxRadius: number;
}

interface RoadmapNode extends RoadmapAnchor {
  id: number;
  label: string;
  description: string;
  state: NodeState;
  route: string;
}

const ROADMAP_ANCHORS: RoadmapAnchor[] = [
  { x: 15, y: 82, hitboxRadius: 85 },
  { x: 27, y: 75, hitboxRadius: 74 },
  { x: 38, y: 65, hitboxRadius: 64 },
  { x: 48, y: 54, hitboxRadius: 61 },
  { x: 56, y: 43, hitboxRadius: 58 },
  { x: 63, y: 32, hitboxRadius: 56 },
  { x: 70, y: 21, hitboxRadius: 51 },
  { x: 76, y: 11, hitboxRadius: 50 },
  { x: 82, y: 3, hitboxRadius: 49 },
  { x: 87, y: 4, hitboxRadius: 47 },
];

const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const GREEN = "#22ff77";

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

      {/* ── Interactive node controls ─────────────────────────────────────── */}
      {roadmapNodes.map((node) => (
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
            width: node.hitboxRadius,
            height: node.hitboxRadius,
            borderRadius: "50%",
            zIndex: 10,
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: node.state === "locked" ? "not-allowed" : "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span
            aria-hidden="true"
            className={`mountain-node-halo${controlStates.get(node.id)?.isHovered ? " mountain-node-halo--hovered" : ""}${controlStates.get(node.id)?.isFocused ? " mountain-node-halo--focused" : ""}${controlStates.get(node.id)?.isSelected ? " mountain-node-halo--selected" : ""}${controlStates.get(node.id)?.isLocked ? " mountain-node-halo--locked" : ""}`}
          />
        </button>
      ))}

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

        .mountain-node-halo {
          position: absolute;
          inset: 50%;
          width: 22px;
          height: 22px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
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
          pointer-events: none;
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
