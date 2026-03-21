"use client";

import { AnimatedNumber } from "./animated-number";
import { CheckCircleIcon, SparklesIcon, TrendingUpIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

type LessonRewardStepProps = {
  accentColor: string;
  completedLessons: number;
  completionLine?: string;
  courseCompletionPercent: number;
  isBossLesson: boolean;
  lessonTitle: string;
  masteryTags: string[];
  moduleCompleted: boolean;
  moduleProgressPercent: number;
  moduleTitle: string;
  moduleProgressLabel: string;
  nextUnlockTitle?: string | null;
  onContinue: () => void;
  rankLabel: string;
};

export function LessonRewardStep({
  completedLessons,
  completionLine,
  courseCompletionPercent,
  isBossLesson,
  lessonTitle,
  masteryTags,
  moduleCompleted,
  moduleProgressPercent,
  moduleTitle,
  nextUnlockTitle,
  onContinue,
  rankLabel,
}: LessonRewardStepProps) {
  const rewardEyebrow = moduleCompleted
    ? "Module complete"
    : isBossLesson
      ? "Boss cleared"
      : "Reward";
  const rewardTitle = moduleCompleted
    ? `${moduleTitle} is complete.`
    : isBossLesson
      ? `${lessonTitle} cleared.`
      : `${lessonTitle} is complete.`;
  const rewardSupport = moduleCompleted
    ? nextUnlockTitle
      ? `${completionLine ?? "You cleared the module."} ${nextUnlockTitle} is now open.`
      : completionLine ?? "You cleared the final module."
    : completionLine ?? "Nice work. Your path is updated and the next lesson is ready.";

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const celebEmoji = moduleCompleted ? "🏆" : isBossLesson ? "⭐" : "🎉";

  return (
    <div
      className="reward-panel-enter reward-surface journey-milestone-panel"
      data-milestone={moduleCompleted ? "module" : isBossLesson ? "boss" : "lesson"}
      style={{ fontFamily: font }}
    >
      {/* Celebration header */}
      <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }}>{celebEmoji}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 99, padding: "6px 16px", marginBottom: 16 }}>
          <SparklesIcon style={{ width: 16, height: 16, color: "#16a34a" }} />
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#16a34a" }}>{rewardEyebrow}</span>
        </div>
        <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 12, lineHeight: 1.2 }}>
          {rewardTitle}
        </h2>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>{rewardSupport}</p>
      </div>

      {/* Mastery tags */}
      {masteryTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {masteryTags.slice(0, 4).map((tag, i) => (
            <span key={tag} className="reward-chip" style={{ animationDelay: `${i * 90}ms`, display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#15803d" }}>
              <CheckCircleIcon style={{ width: 12, height: 12 }} />
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Next unlock banner */}
      {nextUnlockTitle && (
        <div className="journey-unlock-card" style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: 16, marginBottom: 24, boxShadow: "0 4px 0 #16a34a" }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#22c55e", marginBottom: 6 }}>Next unlock</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: "#172b4d" }}>{nextUnlockTitle}</p>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Your next path is open and ready.</p>
        </div>
      )}

      {/* Progress stats */}
      <div
        className="reward-progress-card"
        data-milestone={moduleCompleted ? "module" : isBossLesson ? "boss" : "lesson"}
        style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 16, padding: 20, marginBottom: 24 }}
      >
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 16 }}>Progress update</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="reward-progress-row" style={{ animationDelay: "70ms" }}>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Total lessons completed</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#172b4d" }}>
              <AnimatedNumber className="progress-value live" value={completedLessons} /> lessons
            </p>
          </div>
          <div className="reward-progress-row" style={{ animationDelay: "130ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Course progress</span>
              <AnimatedNumber className="progress-value live" suffix="%" value={courseCompletionPercent} style={{ fontWeight: 800, color: "#172b4d" }} />
            </div>
            <div style={{ height: 12, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
              <ProgressBar className="reward-progress-bar" value={courseCompletionPercent} />
            </div>
          </div>
          <div className="reward-progress-row" style={{ animationDelay: "190ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>{moduleTitle}</span>
              <AnimatedNumber className="progress-value live" suffix="%" value={moduleProgressPercent} style={{ fontWeight: 800, color: "#172b4d" }} />
            </div>
            <div style={{ height: 12, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
              <ProgressBar className="reward-progress-bar" value={moduleProgressPercent} />
            </div>
          </div>
          <div className="reward-progress-row" style={{ animationDelay: "310ms", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUpIcon style={{ width: 16, height: 16, color: "#22c55e" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{rankLabel}</span>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        className="interactive-cta journey-forward-cta reward-cta"
        data-ready="true" data-success="true" data-win="true"
        data-milestone={moduleCompleted ? "module" : isBossLesson ? "boss" : "lesson"}
        onClick={onContinue}
        type="button"
        style={{
          width: "100%", padding: "18px", fontFamily: font, fontWeight: 800, fontSize: 17,
          textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none",
          borderRadius: 16, cursor: "pointer", background: "#22c55e", boxShadow: "0 5px 0 #16a34a",
        }}
        onMouseDown={(e) => { const el = e.currentTarget; el.style.transform = "translateY(3px)"; el.style.boxShadow = "0 2px 0 #16a34a"; }}
        onMouseUp={(e) => { const el = e.currentTarget; el.style.transform = ""; el.style.boxShadow = "0 5px 0 #16a34a"; }}
      >
        {nextUnlockTitle ? "Enter the next module →" : "Start next lesson →"}
      </button>
    </div>
  );
}
