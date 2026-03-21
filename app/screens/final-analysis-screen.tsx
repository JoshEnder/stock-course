"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BrainIcon, CheckCircleIcon, ClockIcon, TrendingUpIcon } from "../components/icons";
import { performanceData } from "../lib/course-data";
import {
  getNickname,
  subscribeToCourseStorage,
  subscribeToHydration,
} from "../lib/course-storage";

export function FinalAnalysisScreen() {
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

  const overallScore = useMemo(
    () =>
      Math.round(
        performanceData.reduce((acc, item) => acc + item.score, 0) /
          performanceData.length,
      ),
    [],
  );

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: font }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #e5e7eb", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo */}
          <a href="/course" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, textDecoration: "none" }}>
            <span style={{ fontWeight: 900, fontSize: 20, color: "#172b4d", letterSpacing: "-0.5px", lineHeight: 1 }}>stoked</span>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, marginBottom: 2 }} />
          </a>
        </div>
      </div>

      {/* Sub-header */}
      <div style={{ borderBottom: "2px solid #e5e7eb", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 24px" }}>
          <h2 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Your Learning Analysis
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280" }}>
            See how you performed across the full beginner course, {nickname}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

        {/* Overall score card */}
        <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 20, padding: "40px 24px", textAlign: "center", marginBottom: 24, boxShadow: "0 4px 0 #16a34a" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: "50%", background: "#22c55e", marginBottom: 16 }}>
            <TrendingUpIcon style={{ width: 36, height: 36, color: "#fff" }} />
          </div>
          <h3 style={{ fontSize: "clamp(48px,8vw,72px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-2px", lineHeight: 1, marginBottom: 8 }}>
            {overallScore}%
          </h3>
          <p style={{ fontSize: 18, color: "#6b7280", marginBottom: 20 }}>Overall Performance</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "2px solid #bbf7d0", borderRadius: 99, padding: "8px 20px" }}>
            <CheckCircleIcon style={{ width: 16, height: 16, color: "#22c55e" }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: "#15803d" }}>Excellent work!</span>
          </div>
        </div>

        {/* Concept breakdown */}
        <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 900, color: "#172b4d", marginBottom: 20 }}>
            <BrainIcon style={{ width: 20, height: 20, color: "#22c55e" }} />
            Concept Breakdown
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {performanceData.map((item) => (
              <div key={item.concept} style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#172b4d" }}>{item.concept}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: item.score === 100 ? "#22c55e" : "#172b4d" }}>{item.score}%</span>
                    {item.score === 100 && <CheckCircleIcon style={{ width: 16, height: 16, color: "#22c55e" }} />}
                  </div>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", borderRadius: 99, background: "#22c55e", width: `${item.score}%`, transition: "width 800ms cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard icon={<ClockIcon style={{ width: 24, height: 24, color: "#22c55e" }} />} label="Total Time" value="74 min" />
          <StatCard icon={<BrainIcon style={{ width: 24, height: 24, color: "#22c55e" }} />} label="Lessons Mastered" value="10 lessons" />
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => router.push("/completion")}
            style={{
              padding: "18px 48px", borderRadius: 16, border: "none",
              background: "#22c55e", boxShadow: "0 5px 0 #16a34a",
              color: "#fff", fontFamily: font, fontWeight: 800, fontSize: 17,
              textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
            }}
            onMouseDown={(e) => { const el = e.currentTarget; el.style.transform = "translateY(3px)"; el.style.boxShadow = "0 2px 0 #16a34a"; }}
            onMouseUp={(e) => { const el = e.currentTarget; el.style.transform = ""; el.style.boxShadow = "0 5px 0 #16a34a"; }}
          >
            View certificate &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#172b4d" }}>{value}</p>
      </div>
    </div>
  );
}
