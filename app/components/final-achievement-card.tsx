"use client";

import { AnimatedNumber } from "./animated-number";

type FinalAchievementCardProps = {
  completionPercent: number;
};

export function FinalAchievementCard({
  completionPercent,
}: FinalAchievementCardProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[2rem] px-8 py-10"
      style={{
        border: "1px solid var(--alpine-border-soft)",
        background:
          "linear-gradient(135deg, rgba(22,49,74,0.96) 0%, rgba(16,36,58,0.94) 48%, rgba(10,22,38,0.98) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), var(--alpine-shadow-xl)",
      }}
    >
      <div className="course-grid absolute inset-0 opacity-55" />
      <div className="relative flex items-center justify-between gap-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--alpine-text-tertiary)" }}>
            End goal
          </p>
          <h3 className="mt-3 text-4xl font-black tracking-[-0.04em]" style={{ color: "var(--alpine-text)" }}>
            Reach lesson 100 and unlock the graduate finish line.
          </h3>
          <p className="mt-4 text-base leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
            Finish every module to reach the final milestone.
          </p>
        </div>

        <div className="surface-lift min-w-[240px] rounded-[1.8rem] p-5 text-center">
          <div className="reward-badge-glow mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--alpine-emerald)_0%,var(--alpine-teal)_100%)] text-3xl font-semibold text-[#08111d] shadow-[0_18px_34px_rgba(39,211,195,0.22)]">
            100
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.16em]" style={{ color: "var(--alpine-text-tertiary)" }}>
            Course summit
          </p>
          <p className="mt-1 text-2xl font-black tracking-[-0.03em]" style={{ color: "var(--alpine-text)" }}>
            <AnimatedNumber
              className="progress-value live"
              suffix="% complete"
              value={completionPercent}
            />
          </p>
        </div>
      </div>
    </section>
  );
}
