"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — edit coordinates here only
// ─────────────────────────────────────────────────────────────────────────────

type NodeState = "current" | "completed" | "locked";

interface RoadmapNode {
  id:           number;
  label:        string;
  description:  string;
  x:            number;  // % from left (can be negative — clips at container edge)
  y:            number;  // % from top  (can be negative — clips at container edge)
  hitboxRadius: number;  // px diameter of invisible hit zone
  state:        NodeState;
  route:        string;
}

const ROADMAP_NODES: RoadmapNode[] = [
  { id:  1, label: "Build Your Foundation",      description: "Learn stock basics & market mechanics", x: 15, y: 82, hitboxRadius: 85, state: "current",   route: "/course/foundations/what-owning-a-stock-means"     },
  { id:  2, label: "Understanding Fundamentals", description: "Financial statements & valuation",      x: 27, y: 75, hitboxRadius: 74, state: "completed", route: "/course/foundations/why-companies-sell-stock"       },
  { id:  3, label: "Technical Analysis Basics",  description: "Charts, patterns & indicators",         x: 38, y: 65, hitboxRadius: 64, state: "locked",    route: "/course/foundations/how-buyers-and-sellers-meet"    },
  { id:  4, label: "Risk Management",            description: "Position sizing & stop losses",         x: 48, y: 54, hitboxRadius: 61, state: "locked",    route: "/course/foundations/how-price-can-move-up-or-down"  },
  { id:  5, label: "Trading Strategy",           description: "Build your edge & execute",             x: 56, y: 43, hitboxRadius: 58, state: "locked",    route: "/course/foundations/gain-loss-and-break-even"       },
  { id:  6, label: "Advanced Techniques",        description: "Options & derivatives intro",           x: 63, y: 32, hitboxRadius: 56, state: "locked",    route: "/course/foundations/dividends-vs-price-gain"        },
  { id:  7, label: "Market Psychology",          description: "Master your emotions",                  x: 70, y: 21, hitboxRadius: 51, state: "locked",    route: "/course/foundations/stock-vs-bond-vs-savings"       },
  { id:  8, label: "Portfolio Construction",     description: "Diversification & rebalancing",         x: 76, y: 11, hitboxRadius: 50, state: "locked",    route: "/course/foundations/why-stock-prices-react-to-news" },
  { id:  9, label: "Advanced Strategies",        description: "Multi-leg trades & hedging",            x: 82, y:  3, hitboxRadius: 49, state: "locked",    route: "/course/foundations/what-a-careful-beginner-does"   },
  { id: 10, label: "Master Trader",              description: "Achieve expertise & beyond",            x: 87, y:  4, hitboxRadius: 47, state: "locked",    route: "/course/foundations/boss-ownership-walkthrough"     },
];

const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const GREEN = "#22ff77";

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
            onClick={onClose}
            style={{
              flexShrink: 0, width: 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 6, cursor: "pointer",
              color: "rgba(180,190,205,0.7)", fontSize: 15, lineHeight: 1, padding: 0,
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
          onClick={() => !isLocked && onStart(node.route)}
          disabled={isLocked}
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
          ) : node.state === "completed" ? (
            "Review lesson"
          ) : (
            "Start lesson →"
          )}
        </button>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function MountainRoadmap() {
  const router = useRouter();
  const [hoveredId,  setHoveredId]  = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const hoveredNode  = ROADMAP_NODES.find((n) => n.id === hoveredId)  ?? null;
  const selectedNode = ROADMAP_NODES.find((n) => n.id === selectedId) ?? null;

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

      {/* ── Invisible hitboxes ────────────────────────────────────────────── */}
      {ROADMAP_NODES.map((node) => (
        <div
          key={node.id}
          onMouseEnter={() => setHoveredId(node.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={(e) => { e.stopPropagation(); handleClick(node); }}
          style={{
            position: "absolute",
            left: `${node.x}%`,
            top:  `${node.y}%`,
            transform: "translate(-50%, -50%)",
            width:  node.hitboxRadius,
            height: node.hitboxRadius,
            borderRadius: "50%",
            zIndex: 10,
            cursor: node.state === "locked" ? "not-allowed" : "pointer",
            // ── Debug mode: uncomment to visualise hitboxes ──
            // outline: "2px dashed rgba(34,255,119,0.5)",
            // background: "rgba(34,255,119,0.06)",
          }}
        />
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
    </div>
  );
}
