"use client";

import { useEffect, useRef } from "react";
import { AnimatedNumber } from "./animated-number";
import { CheckCircleIcon, TrendingUpIcon } from "./icons";
import { triggerBossComplete, triggerLessonComplete, triggerModuleUnlock } from "../lib/animations";

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
  xpEarned: number;
};

const EMERALD = "var(--alpine-emerald)";
const CREAM = "var(--alpine-cream)";
const TEXT = "var(--alpine-text)";
const MUTED = "var(--alpine-text-secondary)";
const DIM = "var(--alpine-text-tertiary)";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

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
  xpEarned,
}: LessonRewardStepProps) {
  const milestoneRef = useRef<HTMLDivElement | null>(null);
  const firedCelebrationRef = useRef(false);
  const rewardEyebrow = moduleCompleted
    ? "Module complete"
    : isBossLesson
      ? "Checkpoint cleared"
      : "Lesson complete";
  const rewardTitle = moduleCompleted
    ? `${moduleTitle} complete`
    : isBossLesson
      ? `${lessonTitle} cleared`
      : `${lessonTitle} complete`;
  const rewardSupport = moduleCompleted
    ? nextUnlockTitle
      ? `${completionLine ?? "You cleared the module."} ${nextUnlockTitle} is now open.`
      : completionLine ?? "You cleared the final module."
    : completionLine ?? "Your path is updated and the next lesson is ready.";

  useEffect(() => {
    if (firedCelebrationRef.current) {
      return;
    }

    firedCelebrationRef.current = true;

    if (moduleCompleted && milestoneRef.current) {
      triggerModuleUnlock(milestoneRef.current);
    }

    if (isBossLesson || moduleCompleted) {
      triggerBossComplete();
      return;
    }

    triggerLessonComplete();
  }, [isBossLesson, moduleCompleted]);

  return (
    <div
      ref={milestoneRef}
      className="reward-panel-enter reward-surface journey-milestone-panel"
      data-milestone={moduleCompleted ? "module" : isBossLesson ? "boss" : "lesson"}
      style={{ fontFamily: sans }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD, marginBottom: 16 }}>{rewardEyebrow}</p>
        <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontFamily: serif, fontWeight: 600, color: CREAM, letterSpacing: "-0.01em", marginBottom: 14, lineHeight: 1.15 }}>
          {rewardTitle}
        </h2>
        <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>{rewardSupport}</p>
        {/* Completion accent — subtle emerald line */}
        <div style={{ width: 40, height: 2, background: EMERALD, borderRadius: 99, margin: "20px auto 0", opacity: 0.6 }} />
      </div>

      {/* Mastery tags */}
      {masteryTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 24 }}>
          {masteryTags.slice(0, 4).map((tag, i) => (
            <span key={tag} className="reward-chip" style={{ animationDelay: `${i * 90}ms`, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: DIM }}>
              <CheckCircleIcon style={{ width: 12, height: 12, color: EMERALD }} />
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Next unlock */}
      {nextUnlockTitle && (
        <div className="journey-unlock-card" style={{ borderLeft: `2px solid ${EMERALD}`, paddingLeft: 16, marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD, marginBottom: 6 }}>Next module</p>
          <p style={{ fontSize: 17, fontFamily: serif, fontWeight: 600, color: CREAM }}>{nextUnlockTitle}</p>
        </div>
      )}

      {/* Progress stats — flat, no card */}
      <div
        className="reward-progress-card"
        data-milestone={moduleCompleted ? "module" : isBossLesson ? "boss" : "lesson"}
        style={{ marginBottom: 28 }}
      >
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="reward-progress-row" style={{ animationDelay: "70ms", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: DIM }}>Lessons completed</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedNumber className="progress-value live" value={completedLessons} />
              </span>
            </div>
            <div className="reward-progress-row" style={{ animationDelay: "100ms", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: DIM }}>XP earned</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedNumber className="progress-value live" value={xpEarned} />
              </span>
            </div>
            <div className="reward-progress-row" style={{ animationDelay: "130ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: DIM }}>Course</span>
                <span style={{ fontWeight: 600, color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber className="progress-value live" suffix="%" value={courseCompletionPercent} />
                </span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${courseCompletionPercent}%`, borderRadius: 99, background: EMERALD, transition: "width 600ms cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
            </div>
            <div className="reward-progress-row" style={{ animationDelay: "160ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: DIM }}>{moduleTitle}</span>
                <span style={{ fontWeight: 600, color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber className="progress-value live" suffix="%" value={moduleProgressPercent} />
                </span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${moduleProgressPercent}%`, borderRadius: 99, background: EMERALD, transition: "width 600ms cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
            </div>
            <div className="reward-progress-row" style={{ animationDelay: "220ms", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUpIcon style={{ width: 14, height: 14, color: EMERALD }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: MUTED }}>{rankLabel}</span>
            </div>
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
          width: "100%", padding: "16px", fontFamily: sans, fontWeight: 500, fontSize: 15,
          letterSpacing: "0.01em", color: "#08111d", border: "none",
          borderRadius: 10, cursor: "pointer",
          background: "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28), 0 12px 32px rgba(0,0,0,0.18)",
          animation: "lessonStepEnter 400ms 200ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {nextUnlockTitle ? "Continue to next module" : "Continue"}
      </button>
    </div>
  );
}
