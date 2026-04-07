"use client";

import { useEffect, useState } from "react";
import { AwardIcon, TrendingUpIcon } from "./icons";
import { triggerConfetti } from "../lib/animations";

const EMERALD = "#10b981";
const CREAM = "#e8e2d4";
const TEXT = "#cbd5e1";
const MUTED = "#94a3b8";
const DIM = "#5f687a";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

type MilestoneModalProps = {
  lessonNumber: number;
  lessonTitle: string;
  onContinue: () => void;
};

export function MilestoneModal({
  lessonNumber,
  lessonTitle,
  onContinue,
}: MilestoneModalProps) {
  const rank = 1840 - lessonNumber * 73;
  const newRank = rank - (110 + lessonNumber * 17);
  const [animatedRank, setAnimatedRank] = useState(rank);

  useEffect(() => {
    const t = window.setTimeout(() => {
      triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.25, 55);
    }, 180);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const decrement = (rank - newRank) / steps;
    let currentStep = 0;

    const interval = window.setInterval(() => {
      currentStep += 1;

      if (currentStep >= steps) {
        setAnimatedRank(newRank);
        window.clearInterval(interval);
      } else {
        setAnimatedRank(Math.round(rank - decrement * currentStep));
      }
    }, duration / steps);

    return () => window.clearInterval(interval);
  }, [newRank, rank]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
      <div
        style={{
          maxWidth: 440, width: "100%", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "#1a2942", padding: 32,
          textAlign: "center", fontFamily: sans,
          animation: "bounceIn 420ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${EMERALD}, #059669)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AwardIcon style={{ width: 32, height: 32, color: "#fff" }} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD, marginBottom: 12 }}>Lesson complete</p>
        <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontFamily: serif, fontWeight: 600, color: CREAM, letterSpacing: "-0.01em", marginBottom: 8 }}>
          {lessonTitle}
        </h2>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>
          You climbed again on the course leaderboard.
        </p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <TrendingUpIcon style={{ width: 14, height: 14, color: EMERALD }} />
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>Leaderboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <span style={{ fontSize: 22, color: DIM, textDecoration: "line-through", fontVariantNumeric: "tabular-nums" }}>#{rank}</span>
            <span style={{ fontSize: 14, color: DIM }}>&rarr;</span>
            <span style={{ fontSize: 32, fontWeight: 600, color: CREAM, fontVariantNumeric: "tabular-nums" }}>#{animatedRank}</span>
          </div>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
            You moved up {rank - newRank} positions after lesson {lessonNumber}.
          </p>
        </div>

        <button
          onClick={onContinue}
          type="button"
          style={{
            width: "100%", padding: "16px", fontFamily: sans, fontWeight: 500, fontSize: 15,
            letterSpacing: "0.01em", color: "#111", border: "none",
            borderRadius: 10, cursor: "pointer", background: CREAM,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
          }}
        >
          Continue to the next lesson
        </button>
      </div>
    </div>
  );
}
