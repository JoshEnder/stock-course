"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CourseEntryCinematic } from "../components/course/CourseEntryCinematic";
import { CourseJourney } from "../components/course/CourseJourney";
import { useAuth } from "../lib/auth-context";
import {
  deriveCourseState,
  getNextLessonRoute,
  type DerivedLesson,
} from "../lib/course-engine";
import {
  getEffectiveHearts,
  getServerCourseProgressSnapshot,
  getStoredCourseProgress,
  refreshStoredHearts,
  subscribeToCourseProgress,
} from "../lib/course-progress";
import { getNickname, subscribeToCourseStorage } from "../lib/course-storage";
import { getQuizData } from "../lib/onboarding-quiz";
import {
  clearRoadmapLoginGateTrigger,
  hasRoadmapLoginGateTrigger,
  hasSeenRoadmapLoginGate,
  markRoadmapLoginGateSeen,
} from "../lib/post-onboarding-login-gate";

const shellSans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const shellSerif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const COURSE_ENTRY_TRIGGER_KEY = "stoked-course-cinematic-entry";

function getDisplayStageTitle(title: string) {
  return title.replace(/^Module\s+\d+\s*[·-]\s*/i, "").trim();
}

function StokedLogo() {
  return (
    <Link
      href="/landing"
      className="inline-flex items-end gap-1"
      prefetch={false}
      style={{ pointerEvents: "auto" }}
    >
      <span
        className="text-[1.4rem] font-semibold tracking-[-0.05em] text-[#f3ede3]"
        style={{ fontFamily: shellSerif }}
      >
        stoked
      </span>
      <span
        aria-hidden="true"
        className="mb-[0.24em] inline-block h-2.5 w-2.5 rounded-full"
        style={{
          background: "rgba(89,240,223,0.9)",
          boxShadow: "0 0 14px rgba(89,240,223,0.34)",
        }}
      />
    </Link>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-full border px-3 py-1.5"
      style={{
        borderColor: "rgba(176,196,212,0.12)",
        background:
          "linear-gradient(180deg, rgba(34,50,67,0.28) 0%, rgba(15,24,35,0.42) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 22px rgba(3,9,17,0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 46%)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 bottom-[6px] h-4 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(215,227,236,0.08) 1px, transparent 1px)",
          backgroundSize: "100% 8px",
          maskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)",
        }}
      />
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[rgba(187,202,215,0.56)]">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-medium text-[#eef3f6]">{value}</p>
    </div>
  );
}

function CourseHeader({
  nickname,
  currentLessonTitle,
  currentModuleTitle,
  completionPercent,
  currentStageProgress,
  currentStageIndex,
  totalStages,
  hearts,
  streak,
  totalXp,
  resumeHref,
}: {
  nickname: string;
  currentLessonTitle: string;
  currentModuleTitle: string;
  completionPercent: number;
  currentStageProgress: number;
  currentStageIndex: number;
  totalStages: number;
  hearts: number;
  streak: number;
  totalXp: number;
  resumeHref: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,15,24,0.32) 0%, rgba(8,15,24,0.14) 58%, rgba(8,15,24,0) 100%)",
        }}
      />
      <div className="mx-auto flex w-full max-w-[1380px] items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-2">
          <StokedLogo />
          <div
            className="hidden items-center gap-4 md:flex"
            style={{ pointerEvents: "auto" }}
          >
            <div className="relative flex min-w-0 items-start gap-3 overflow-hidden rounded-[24px] border px-3.5 py-3"
              style={{
                borderColor: "rgba(176,196,212,0.12)",
                background:
                  "linear-gradient(180deg, rgba(34,50,67,0.34) 0%, rgba(14,23,34,0.46) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 28px rgba(3,9,17,0.08)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full opacity-60"
                viewBox="0 0 100 30"
                preserveAspectRatio="none"
              >
                <path d="M0 22 C18 19, 34 19, 50 16 C66 13, 82 9, 100 6" fill="none" stroke="rgba(216,226,236,0.08)" strokeWidth="0.4" />
                <path d="M0 28 C18 25, 34 24, 50 21 C66 18, 82 14, 100 10" fill="none" stroke="rgba(216,226,236,0.05)" strokeWidth="0.4" />
              </svg>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 18% 22%, rgba(241,203,120,0.08) 0%, transparent 16%), radial-gradient(circle at 86% 14%, rgba(157,194,220,0.08) 0%, transparent 20%)",
                }}
              />
              <div
                className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{
                  background: "rgba(241,203,120,0.92)",
                  boxShadow: "0 0 14px rgba(241,203,120,0.24)",
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(190,205,218,0.56)]">
                  <span>Current foothold</span>
                  <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[rgba(190,205,218,0.4)]" />
                  <span>{`Stage ${String(currentStageIndex).padStart(2, "0")} of ${String(totalStages).padStart(2, "0")}`}</span>
                </div>
                <p className="mt-1 text-[14px] font-medium text-[#eef2f6]">
                  {currentLessonTitle}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[rgba(183,199,214,0.62)]">
                  {nickname} · {getDisplayStageTitle(currentModuleTitle)}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="h-[2px] w-24 overflow-hidden rounded-full"
                    style={{ background: "rgba(159,199,222,0.14)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(currentStageProgress, 6)}%`,
                        background:
                          "linear-gradient(90deg, rgba(83,224,204,0.96) 0%, rgba(184,230,240,0.92) 100%)",
                        boxShadow: "0 0 18px rgba(128,226,221,0.2)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-[rgba(188,204,217,0.62)]">
                    {Math.round(currentStageProgress)}% through this stage · {completionPercent}% climb
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3" style={{ pointerEvents: "auto" }}>
          <div className="hidden items-center gap-3 lg:flex">
            <MetricPill label="Hearts" value={`${hearts}/5`} />
            <MetricPill label="Consistency" value={`${streak} days`} />
            <MetricPill label="Climb pts" value={String(totalXp)} />
          </div>

          <Link
            href="/profile"
            prefetch={false}
            className="hidden rounded-full border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(217,227,235,0.74)] md:inline-flex"
            style={{
              borderColor: "rgba(176,196,212,0.12)",
              background:
                "linear-gradient(180deg, rgba(28,42,58,0.28) 0%, rgba(14,23,34,0.42) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 22px rgba(3,9,17,0.08)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            Profile
          </Link>

          <Link
            href={resumeHref}
            prefetch={false}
            className="inline-flex rounded-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#07111d] sm:px-5"
            style={{
              background: "linear-gradient(180deg, #f0e7d8 0%, rgba(225,216,198,0.94) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.58), 0 14px 30px rgba(0,0,0,0.18)",
            }}
          >
            Continue ascent
          </Link>
        </div>
      </div>
    </div>
  );
}

type LoginGateModalProps = {
  onContinueAsGuest: () => void;
  onContinueWithGoogle: () => void;
};

function CourseLoginGateModal({
  onContinueAsGuest,
  onContinueWithGoogle,
}: LoginGateModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm md:p-6"
      style={{ background: "rgba(3,10,20,0.54)" }}
    >
      <div
        className="w-full max-w-[460px] rounded-[26px] p-6 md:p-8"
        style={{
          border: "1px solid rgba(126,149,171,0.16)",
          background:
            "linear-gradient(180deg, rgba(11,24,38,0.95) 0%, rgba(8,17,28,0.98) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.42)",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(104,240,224,0.82)]">
          Save your climb
        </p>
        <h2
          className="mt-3 text-[28px] leading-[1.06] tracking-[-0.03em] text-[#f3ede3] md:text-[32px]"
          style={{ fontFamily: shellSerif }}
        >
          Keep your mountain moving
        </h2>
        <p className="mt-3 max-w-[34ch] text-[15px] leading-6 text-[rgba(214,225,234,0.72)]">
          Sign in with Google to keep your progress, streak, and lesson history across devices.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="flex items-center justify-center gap-3 rounded-[14px] px-5 py-3.5 text-sm font-semibold tracking-[0.01em] md:text-[15px]"
            style={{
              background: "linear-gradient(180deg, #efe8d9 0%, rgba(224,214,195,0.94) 100%)",
              color: "#08111d",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28), 0 8px 28px rgba(0,0,0,0.22)",
            }}
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="rounded-[14px] border bg-transparent px-5 py-3.5 text-sm font-medium transition-colors md:text-[15px]"
            style={{
              borderColor: "rgba(126,149,171,0.16)",
              color: "rgba(214,225,234,0.72)",
            }}
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportCard({
  eyebrow,
  title,
  children,
  accent = "rgba(241,203,120,0.92)",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[26px] border p-4"
      style={{
        borderColor: "rgba(177,197,212,0.12)",
        background:
          "linear-gradient(180deg, rgba(37,53,71,0.36) 0%, rgba(16,25,36,0.52) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 38px rgba(3,9,17,0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 82% 12%, ${accent.replace(/0\.\d+\)/, "0.12)") ?? accent} 0%, transparent 26%),
            radial-gradient(circle at 18% 78%, rgba(166,194,214,0.08) 0%, transparent 24%),
            linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 28%, rgba(255,255,255,0) 100%)
          `,
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0 18 C20 16, 38 16, 54 14 C68 12, 84 9, 100 6" fill="none" stroke="rgba(216,226,236,0.05)" strokeWidth="0.18" />
        <path d="M0 34 C18 31, 36 31, 54 28 C70 25, 86 20, 100 16" fill="none" stroke="rgba(216,226,236,0.045)" strokeWidth="0.18" />
        <path d="M0 62 C20 58, 38 57, 56 52 C72 48, 86 41, 100 34" fill="none" stroke="rgba(216,226,236,0.04)" strokeWidth="0.18" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-70"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
      >
        <path
          d="M0 21 C16 18, 30 18, 46 15 C60 13, 76 8, 100 5"
          fill="none"
          stroke="rgba(215,227,236,0.08)"
          strokeWidth="0.4"
        />
        <path
          d="M0 26 C16 23, 34 22, 50 19 C66 17, 82 13, 100 10"
          fill="none"
          stroke="rgba(215,227,236,0.05)"
          strokeWidth="0.4"
        />
      </svg>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(190,205,218,0.58)]">
          {eyebrow}
        </p>
      </div>
      <h3
        className="relative mt-3 text-[22px] leading-[1.02] tracking-[-0.03em] text-[#f5ede2]"
        style={{ fontFamily: shellSerif }}
      >
        {title}
      </h3>
      <div className="relative mt-4">{children}</div>
    </section>
  );
}

function SupportStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] border px-3 py-3"
      style={{
        borderColor: "rgba(177,197,212,0.1)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 55%)",
        }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(188,203,216,0.56)]">
        {label}
      </p>
      <p className="mt-2 text-[17px] font-medium tracking-[-0.02em] text-[#eff3f6]">{value}</p>
    </div>
  );
}

function StageDots({
  currentModuleIndex,
  totalModules,
  unlockedModules,
}: {
  currentModuleIndex: number;
  totalModules: number;
  unlockedModules: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalModules }, (_, index) => {
        const isCurrent = index + 1 === currentModuleIndex;
        const isUnlocked = index < unlockedModules;
        return (
          <span
            key={index + 1}
            className={`inline-block rounded-full transition-all ${isCurrent ? "w-7" : "w-2.5"}`}
            style={{
              height: isCurrent ? 9 : 7,
              background: isCurrent
                ? "linear-gradient(90deg, rgba(241,203,120,0.98) 0%, rgba(255,235,196,0.9) 100%)"
                : isUnlocked
                  ? "rgba(127,231,242,0.46)"
                  : "rgba(164,181,194,0.16)",
              boxShadow: isCurrent ? "0 0 18px rgba(241,203,120,0.18)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function DesktopSupportRail({
  resumeHref,
  currentLessonTitle,
  currentModuleTitle,
  currentLessonTime,
  streak,
  totalXp,
  hearts,
  completionPercent,
  completedLessons,
  totalLessons,
  unlockedModules,
  totalModules,
  currentModuleIndex,
  lessonsRemainingInModule,
  nextStageTitle,
  currentModuleSubtitle,
  milestoneTitle,
  milestoneDetail,
  focusDetail,
  rank,
}: {
  resumeHref: string;
  currentLessonTitle: string;
  currentModuleTitle: string;
  currentLessonTime: string;
  streak: number;
  totalXp: number;
  hearts: number;
  completionPercent: number;
  completedLessons: number;
  totalLessons: number;
  unlockedModules: number;
  totalModules: number;
  currentModuleIndex: number;
  lessonsRemainingInModule: number;
  nextStageTitle: string | null;
  currentModuleSubtitle: string;
  milestoneTitle: string;
  milestoneDetail: string;
  focusDetail: string;
  rank: string;
}) {
  const displayStageTitle = getDisplayStageTitle(currentModuleTitle);
  const displayNextStageTitle = nextStageTitle ? getDisplayStageTitle(nextStageTitle) : null;

  return (
    <div className="space-y-3">
      <SupportCard eyebrow={`Continue ascent · stage ${String(currentModuleIndex).padStart(2, "0")}`} title={currentLessonTitle}>
        <p className="text-[13px] leading-6 text-[rgba(214,225,234,0.74)]">
          {displayStageTitle} · {currentLessonTime}
        </p>
        <p className="mt-2 text-[12px] leading-5 text-[rgba(188,204,217,0.64)]">
          {currentModuleSubtitle}
        </p>
        <div
          className="mt-4 rounded-[20px] border px-3.5 py-3.5"
          style={{
            borderColor: "rgba(177,197,212,0.1)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(188,203,216,0.58)]">
            <span>Altitude in this band</span>
            <span>{Math.round(completionPercent)}%</span>
          </div>
          <div
            className="mt-3 h-[4px] overflow-hidden rounded-full"
            style={{ background: "rgba(171,192,208,0.14)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(completionPercent, 6)}%`,
                background:
                  "linear-gradient(90deg, rgba(83,224,204,0.96) 0%, rgba(184,230,240,0.92) 100%)",
                boxShadow: "0 0 18px rgba(128,226,221,0.18)",
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[rgba(194,209,223,0.62)]">
            <span>{lessonsRemainingInModule} to next ridge</span>
            <span>{unlockedModules}/{totalModules} bands open</span>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-[rgba(188,204,217,0.64)]">{focusDetail}</p>
        <Link
          href={resumeHref}
          prefetch={false}
          className="mt-4 inline-flex w-full items-center justify-between rounded-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#07111d]"
          style={{
            background: "linear-gradient(180deg, #f0e7d8 0%, rgba(225,216,198,0.94) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.58), 0 12px 26px rgba(0,0,0,0.16)",
          }}
        >
          <span>Continue ascent</span>
          <span aria-hidden="true">→</span>
        </Link>
      </SupportCard>

      <SupportCard eyebrow="Field journal" title={rank} accent="rgba(89,240,223,0.9)">
        <div className="grid grid-cols-2 gap-3">
          <SupportStat label="Consistency" value={`${streak} days`} />
          <SupportStat label="Climb pts" value={String(totalXp)} />
          <SupportStat label="Terrain" value={`${completedLessons}/${totalLessons}`} />
          <SupportStat label="Open bands" value={`${unlockedModules}/${totalModules}`} />
        </div>
        <div
          className="mt-3 rounded-[18px] border px-3.5 py-3"
          style={{
            borderColor: "rgba(177,197,212,0.1)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(188,203,216,0.56)]">
                Stage ladder
              </p>
              <p className="mt-1 text-[12px] leading-5 text-[rgba(214,225,234,0.72)]">
                Hearts are at {hearts}/5 and the route is open through stage {String(unlockedModules).padStart(2, "0")}.
              </p>
            </div>
            <StageDots
              currentModuleIndex={currentModuleIndex}
              totalModules={totalModules}
              unlockedModules={unlockedModules}
            />
          </div>
        </div>
      </SupportCard>

      <SupportCard eyebrow="Ridge ahead" title={milestoneTitle} accent="rgba(241,203,120,0.92)">
        <div className="space-y-3 text-[12px] leading-5 text-[rgba(214,225,234,0.72)]">
          <p>{milestoneDetail}</p>
          <p>
            {unlockedModules}/{totalModules} stages are open, and the next shift in terrain is{" "}
            {displayNextStageTitle ? displayNextStageTitle : "the summit finish"}.
          </p>
        </div>
        <div
          className="mt-4 rounded-[18px] border px-3.5 py-3"
          style={{
            borderColor: "rgba(177,197,212,0.1)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.012) 100%)",
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(188,203,216,0.56)]">
            <span>Threshold map</span>
            <span>{displayNextStageTitle ? "Unlock ahead" : "Summit run"}</span>
          </div>
          <div className="mt-3">
            <StageDots
              currentModuleIndex={currentModuleIndex}
              totalModules={totalModules}
              unlockedModules={Math.min(totalModules, unlockedModules + 1)}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-[rgba(214,225,234,0.72)]">
            You are climbing through {displayStageTitle}. The next ridge will widen the course and reveal the band above.
          </p>
        </div>
      </SupportCard>
    </div>
  );
}

function MobileSupportRail({
  streak,
  totalXp,
  completedLessons,
  totalLessons,
  milestoneTitle,
  stageProgressPercent,
}: {
  streak: number;
  totalXp: number;
  completedLessons: number;
  totalLessons: number;
  milestoneTitle: string;
  stageProgressPercent: number;
}) {
  const items = [
    { label: "Consistency", value: `${streak} days` },
    { label: "Climb pts", value: String(totalXp) },
    { label: "Terrain", value: `${completedLessons}/${totalLessons}` },
    { label: "Altitude", value: `${Math.round(stageProgressPercent)}%` },
    { label: "Next ridge", value: milestoneTitle },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative min-w-[148px] overflow-hidden rounded-[20px] border px-3.5 py-3"
          style={{
            borderColor: "rgba(177,197,212,0.12)",
            background:
              "linear-gradient(180deg, rgba(28,42,58,0.34) 0%, rgba(14,23,34,0.46) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 30px rgba(3,9,17,0.08)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 48%)",
            }}
          />
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[rgba(188,203,216,0.56)]">
            {item.label}
          </p>
          <p className="mt-2 text-[14px] font-medium leading-5 text-[#eff3f6]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CourseMapScreen() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const [showRoadmapLoginGate, setShowRoadmapLoginGate] = useState(false);
  const [showEntryCinematic, setShowEntryCinematic] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const nickname = useSyncExternalStore(subscribeToCourseStorage, getNickname, () => "Learner");
  const storedProgress = useSyncExternalStore(
    subscribeToCourseProgress,
    getStoredCourseProgress,
    getServerCourseProgressSnapshot,
  );

  const courseState = useMemo(() => deriveCourseState(storedProgress), [storedProgress]);
  const hearts = getEffectiveHearts(storedProgress, Boolean(user));
  const resumeHref = useMemo(() => getNextLessonRoute(storedProgress), [storedProgress]);
  const currentLesson = useMemo(
    () =>
      courseState.modules
        .flatMap((module) => module.lessons)
        .find((lesson) => lesson.id === courseState.currentLessonId) ??
      courseState.modules[0]?.lessons[0] ??
      null,
    [courseState],
  );
  const currentModule = useMemo(
    () => courseState.modules.find((module) => module.id === courseState.currentModuleId) ?? courseState.modules[0],
    [courseState],
  );
  const lessonsRemainingInModule = useMemo(() => {
    if (!currentModule) {
      return 0;
    }

    return Math.max(0, currentModule.lessons.length - currentModule.completionCount);
  }, [currentModule]);
  const nextStage = useMemo(
    () => courseState.modules.find((module) => module.locked) ?? null,
    [courseState.modules],
  );
  const nextMilestone = useMemo(() => {
    const thresholds = [
      { count: 15, label: "First ridge" },
      { count: 25, label: "Quarter climb" },
      { count: 50, label: "Halfway ridge" },
      { count: 75, label: "Upper mountain" },
      { count: 100, label: "Summit" },
    ];

    return thresholds.find((threshold) => threshold.count > courseState.completedLessons) ?? null;
  }, [courseState.completedLessons]);
  const milestoneTitle = nextStage
    ? `Unlock ${nextStage.title}`
    : nextMilestone
      ? nextMilestone.label
      : "Final summit";
  const milestoneDetail = nextStage
    ? `${Math.max(lessonsRemainingInModule, 1)} more lessons opens the next stage of the climb.`
    : nextMilestone
      ? `${nextMilestone.count - courseState.completedLessons} more lessons gets you to ${nextMilestone.label}.`
      : "Everything is unlocked. Finish the final stretch to complete the course.";
  const focusDetail = currentLesson
    ? `A short push here keeps consistency alive, secures this foothold, and pulls the next ridge into view.`
    : "Your next move is ready.";

  const handleEntryCinematicComplete = useCallback(() => {
    setShowEntryCinematic(false);
    setChromeVisible(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const shouldPlayEntryCinematic =
      window.sessionStorage.getItem(COURSE_ENTRY_TRIGGER_KEY) === "1";

    if (!shouldPlayEntryCinematic) {
      setChromeVisible(true);
      return;
    }

    window.sessionStorage.removeItem(COURSE_ENTRY_TRIGGER_KEY);
    setShowEntryCinematic(true);
    setChromeVisible(false);
  }, []);

  useEffect(() => {
    if (!showEntryCinematic) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setChromeVisible(true);
    }, 1720);

    return () => window.clearTimeout(timeoutId);
  }, [showEntryCinematic]);

  useEffect(() => {
    if (user) {
      refreshStoredHearts(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return () => undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshStoredHearts(true);
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (user) {
      clearRoadmapLoginGateTrigger();
      markRoadmapLoginGateSeen();
      return;
    }

    const triggeredFromOnboarding = hasRoadmapLoginGateTrigger();
    const hasCompletedOnboarding = Boolean(getQuizData());

    if (!triggeredFromOnboarding && (!hasCompletedOnboarding || hasSeenRoadmapLoginGate())) {
      return;
    }

    const revealDelayMs = triggeredFromOnboarding ? 1850 : 640;
    const timeoutId = window.setTimeout(() => {
      clearRoadmapLoginGateTrigger();
      setShowRoadmapLoginGate(true);
    }, revealDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  function handleLessonSelect(lesson: DerivedLesson) {
    if (lesson.state === "locked") {
      return;
    }

    router.push(lesson.route);
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ fontFamily: shellSans, background: "#0b1420" }}
    >
      <div
        style={{
          opacity: chromeVisible ? 1 : 0,
          transform: chromeVisible ? "translateY(0)" : "translateY(-14px)",
          transition: "opacity 640ms cubic-bezier(0.22, 1, 0.36, 1), transform 920ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <CourseHeader
          nickname={nickname}
          currentLessonTitle={currentLesson?.title ?? "Your next lesson"}
          currentModuleTitle={currentModule?.title ?? "Foundations"}
          completionPercent={Math.round(courseState.completionPercent)}
          currentStageProgress={Math.round(currentModule?.progressPercent ?? 0)}
          currentStageIndex={currentModule?.id ?? 1}
          totalStages={courseState.modules.length}
          hearts={hearts}
          streak={courseState.streak}
          totalXp={courseState.totalXp}
          resumeHref={resumeHref}
        />
      </div>

      <CourseJourney
        modules={courseState.modules}
        currentLessonId={courseState.currentLessonId}
        onLessonSelect={handleLessonSelect}
        supportRail={
          <div
            style={{
              opacity: chromeVisible ? 1 : 0,
              transform: chromeVisible ? "translateX(0)" : "translateX(28px)",
              transition: "opacity 640ms cubic-bezier(0.22, 1, 0.36, 1), transform 960ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <DesktopSupportRail
              resumeHref={resumeHref}
              currentLessonTitle={currentLesson?.title ?? "Your next lesson"}
              currentModuleTitle={currentModule?.title ?? "Foundations"}
              currentLessonTime={currentLesson?.estimatedTime ?? "3–4 min"}
              streak={courseState.streak}
              totalXp={courseState.totalXp}
              hearts={hearts}
              completionPercent={Math.round(currentModule?.progressPercent ?? 0)}
              completedLessons={courseState.completedLessons}
              totalLessons={courseState.totalLessons}
              unlockedModules={courseState.unlockedModules}
              totalModules={courseState.modules.length}
              currentModuleIndex={currentModule?.id ?? 1}
              lessonsRemainingInModule={lessonsRemainingInModule}
              nextStageTitle={nextStage?.title ?? null}
              currentModuleSubtitle={currentModule?.subtitle ?? "Your current band is open."}
              milestoneTitle={milestoneTitle}
              milestoneDetail={milestoneDetail}
              focusDetail={focusDetail}
              rank={courseState.rank}
            />
          </div>
        }
        mobileSupportRail={
          <div
            style={{
              opacity: chromeVisible ? 1 : 0,
              transform: chromeVisible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 640ms cubic-bezier(0.22, 1, 0.36, 1), transform 920ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <MobileSupportRail
              streak={courseState.streak}
              totalXp={courseState.totalXp}
              completedLessons={courseState.completedLessons}
              totalLessons={courseState.totalLessons}
              milestoneTitle={milestoneTitle}
              stageProgressPercent={Math.round(currentModule?.progressPercent ?? 0)}
            />
          </div>
        }
      />

      <CourseEntryCinematic
        active={showEntryCinematic}
        onComplete={handleEntryCinematicComplete}
      />

      {showRoadmapLoginGate && (
        <CourseLoginGateModal
          onContinueAsGuest={() => {
            markRoadmapLoginGateSeen();
            setShowRoadmapLoginGate(false);
          }}
          onContinueWithGoogle={() => {
            markRoadmapLoginGateSeen();
            setShowRoadmapLoginGate(false);
            void signInWithGoogle("/course");
          }}
        />
      )}
    </div>
  );
}
