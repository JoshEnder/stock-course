"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AwardIcon, BrainIcon, ClockIcon, DownloadIcon, ShareIcon } from "../components/icons";
import {
  getNickname,
  subscribeToCourseStorage,
  subscribeToHydration,
} from "../lib/course-storage";

const EMERALD = "#10b981";
const BG = "#0a0f1a";
const SURFACE = "#1a2942";
const CREAM = "#e8e2d4";
const TEXT = "#cbd5e1";
const MUTED = "#94a3b8";
const DIM = "#5f687a";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

export function CompletionScreen() {
  const router = useRouter();
  const storedNickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const nickname = isHydrated ? storedNickname : "Learner";
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowConfetti(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleShare() {
    const shareData = {
      title: "Stoked Certificate",
      text: `${nickname} completed Beginner Stock Foundations.`,
      url: `${window.location.origin}/certificate`,
    };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: sans, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {Array.from({ length: 36 }, (_, i) => (
            <span
              key={i}
              className={`confetti-dot ${i % 3 === 0 ? "confetti-rect" : i % 3 === 1 ? "confetti-dot--light" : "confetti-dot--leaf"}`}
              style={{
                left: `${(i / 36) * 100}%`,
                animationDelay: `${(i % 6) * 120}ms`,
                animationDuration: `${2600 + (i % 5) * 260}ms`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 600 }}>
        <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
          {/* Medal */}
          <div className="completion-medal-wrap" style={{ margin: "0 auto 24px" }}>
            <div className="completion-medal" style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${EMERALD}, #059669)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AwardIcon style={{ width: 36, height: 36, color: "#fff" }} />
            </div>
          </div>

          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD, marginBottom: 16 }}>Course complete</p>
          <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontFamily: serif, fontWeight: 600, color: CREAM, letterSpacing: "-0.01em", marginBottom: 14, lineHeight: 1.15 }}>
            Congratulations, {nickname}
          </h1>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            You&apos;ve completed Beginner Stock Foundations
          </p>
          <div style={{ width: 40, height: 2, background: EMERALD, borderRadius: 99, margin: "20px auto 0", opacity: 0.6 }} />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          <CompletionStat icon={<ClockIcon style={{ width: 16, height: 16, color: EMERALD }} />} label="Time" value="74 min" />
          <CompletionStat icon={<BrainIcon style={{ width: 16, height: 16, color: EMERALD }} />} label="Lessons" value="10" />
          <CompletionStat icon={<AwardIcon style={{ width: 16, height: 16, color: EMERALD }} />} label="Accuracy" value="96%" />
        </div>

        {/* Certificate */}
        <div style={{ borderLeft: `2px solid ${EMERALD}`, paddingLeft: 16, marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD, marginBottom: 6 }}>Your achievement</p>
          <p style={{ fontSize: 17, fontFamily: serif, fontWeight: 600, color: CREAM, marginBottom: 4 }}>Certificate of Completion</p>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>
            This certifies that <span style={{ color: CREAM, fontWeight: 500 }}>{nickname}</span> has successfully completed the Beginner Stock Foundations course
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <PremiumBtn onClick={() => router.push("/certificate")}>
              <AwardIcon style={{ width: 14, height: 14 }} /> View certificate
            </PremiumBtn>
            <GhostBtn onClick={() => router.push("/certificate/print")}>
              <DownloadIcon style={{ width: 14, height: 14 }} /> Download
            </GhostBtn>
            <GhostBtn onClick={handleShare}>
              <ShareIcon style={{ width: 14, height: 14 }} /> Share
            </GhostBtn>
          </div>
        </div>

        <button
          onClick={() => router.push("/course")}
          type="button"
          style={{ background: "none", border: "none", cursor: "pointer", color: DIM, fontSize: 14, fontFamily: sans }}
        >
          &larr; Back to course overview
        </button>
      </div>
    </div>
  );
}

function CompletionStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 20, fontWeight: 600, color: TEXT, fontVariantNumeric: "tabular-nums", marginBottom: 2 }}>{value}</p>
      <p style={{ fontSize: 11, color: DIM, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
    </div>
  );
}

function PremiumBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 22px", borderRadius: 10, border: "none",
        background: CREAM, color: "#111",
        fontFamily: sans, fontWeight: 500, fontSize: 14,
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 22px", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "transparent", color: TEXT,
        fontFamily: sans, fontWeight: 500, fontSize: 14,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
