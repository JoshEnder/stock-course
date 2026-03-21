"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AwardIcon, BrainIcon, ClockIcon, DownloadIcon, ShareIcon } from "../components/icons";
import {
  getNickname,
  subscribeToCourseStorage,
  subscribeToHydration,
} from "../lib/course-storage";

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
      title: "Stock Academy Certificate",
      text: `${nickname} completed Beginner Stock Foundations.`,
      url: `${window.location.origin}/certificate`,
    };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
  }

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
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
        {/* Main card */}
        <div style={{ background: "#fff", borderRadius: 24, border: "2px solid #e5e7eb", boxShadow: "0 8px 0 #e5e7eb", padding: 40, textAlign: "center" }}>

          {/* Trophy */}
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }}>🏆</div>

          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 99, padding: "6px 16px", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#16a34a" }}>Course complete</span>
          </div>

          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 12, lineHeight: 1.2 }}>
            Congratulations, {nickname}!
          </h1>
          <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.6, marginBottom: 32 }}>
            You&apos;ve completed Beginner Stock Foundations
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
            <CompletionStat icon={<ClockIcon style={{ width: 20, height: 20, color: "#22c55e", margin: "0 auto 8px" }} />} label="Time" value="74 min" />
            <CompletionStat icon={<BrainIcon style={{ width: 20, height: 20, color: "#22c55e", margin: "0 auto 8px" }} />} label="Lessons" value="10" />
            <CompletionStat icon={<AwardIcon style={{ width: 20, height: 20, color: "#22c55e", margin: "0 auto 8px" }} />} label="Accuracy" value="96%" />
          </div>

          {/* Certificate card */}
          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 4px 0 #16a34a" }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#22c55e", marginBottom: 8 }}>Your achievement</p>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#172b4d", marginBottom: 8 }}>Certificate of Completion</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 20 }}>
              This certifies that <strong style={{ color: "#172b4d" }}>{nickname}</strong> has successfully completed the Beginner Stock Foundations course
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              <DuoBtn onClick={() => router.push("/certificate")}>
                <AwardIcon style={{ width: 16, height: 16 }} /> View certificate
              </DuoBtn>
              <DuoBtn secondary onClick={() => window.print()}>
                <DownloadIcon style={{ width: 16, height: 16 }} /> Download
              </DuoBtn>
              <DuoBtn secondary onClick={handleShare}>
                <ShareIcon style={{ width: 16, height: 16 }} /> Share
              </DuoBtn>
            </div>
          </div>

          <button
            onClick={() => router.push("/course")}
            type="button"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, fontFamily: font }}
          >
            &larr; Back to course overview
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletionStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 16, padding: "16px 8px", textAlign: "center" }}>
      {icon}
      <p style={{ fontSize: 22, fontWeight: 900, color: "#172b4d", marginBottom: 2 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
    </div>
  );
}

function DuoBtn({
  children,
  onClick,
  secondary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const bg = secondary ? "#fff" : "#22c55e";
  const shadow = secondary ? "0 4px 0 #e5e7eb" : "0 4px 0 #16a34a";
  const color = secondary ? "#374151" : "#fff";
  const border = secondary ? "2px solid #e5e7eb" : "2px solid transparent";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 18px", borderRadius: 12, border,
        background: bg, boxShadow: shadow, color,
        fontFamily: font, fontWeight: 800, fontSize: 14,
        cursor: "pointer", transition: "all 150ms",
      }}
      onMouseDown={(e) => { const el = e.currentTarget; el.style.transform = "translateY(2px)"; el.style.boxShadow = secondary ? "0 2px 0 #e5e7eb" : "0 2px 0 #16a34a"; }}
      onMouseUp={(e) => { const el = e.currentTarget; el.style.transform = ""; el.style.boxShadow = shadow; }}
    >
      {children}
    </button>
  );
}
