"use client";

const CREAM = "var(--alpine-cream)";
const MUTED = "var(--alpine-text-secondary)";
const DIM = "var(--alpine-text-tertiary)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

type LessonTooltipProps = {
  accentColor: string;
  completed: boolean;
  estimatedTime: string;
  isBoss: boolean;
  lessonNumber: number;
  lockedNotice?: boolean;
  state: "locked" | "unlocked" | "current" | "completed";
  title: string;
  visible: boolean;
};

export function LessonTooltip({
  accentColor,
  completed,
  estimatedTime,
  isBoss,
  lessonNumber,
  lockedNotice = false,
  state,
  title,
  visible,
}: LessonTooltipProps) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-[-6.5rem] z-20 w-52 -translate-x-1/2 transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
      style={{
        borderRadius: 10,
        border: "1px solid rgba(95,143,179,0.22)",
        background: "linear-gradient(180deg, rgba(22,49,74,0.95) 0%, rgba(10,22,38,0.98) 100%)",
        backdropFilter: "blur(12px)",
        padding: 12,
        fontFamily: sans,
        boxShadow: "0 16px 38px rgba(3,10,20,0.34)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: accentColor }}>
          {isBoss ? "Boss" : `Lesson ${lessonNumber}`}
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: DIM }}>{estimatedTime}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, lineHeight: 1.3 }}>{title}</p>
      <p style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
        {completed
          ? "Completed. Locked in on your path."
          : state === "locked"
            ? lockedNotice
              ? "Unlock the earlier lessons to open this step."
              : "Finish earlier lessons first."
            : state === "current"
              ? "Your next lesson. This is the live target."
              : "Available now. Open when you're ready."}
      </p>
    </div>
  );
}
