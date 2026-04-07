"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SkillTreeRoadmap, type SkillLesson } from "../components/skill-tree-roadmap";
import { MountainRoadmap } from "../components/mountain-roadmap";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FinalAchievementCard } from "../components/final-achievement-card";
import { JourneySurface } from "../components/journey-surface";
import { useAuth } from "../lib/auth-context";
import { deriveCourseState, getNextLessonRoute, type DerivedLesson, type DerivedModule } from "../lib/course-engine";
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
  hasSeenRoadmapLoginGate,
  hasRoadmapLoginGateTrigger,
  markRoadmapLoginGateSeen,
} from "../lib/post-onboarding-login-gate";

const shellSans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const shellSerif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";

// ─── Stoked logo ──────────────────────────────────────────────────────────────
function StokedLogo() {
  return (
    <Link href="/" className="inline-flex items-end gap-0.5">
      <span
        className="text-[1.45rem] font-semibold tracking-[-0.05em]"
        style={{ color: "var(--alpine-cream)", fontFamily: shellSerif }}
      >
        stoked
      </span>
      <span
        className="mb-[0.26em] h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{
          background: "var(--alpine-teal)",
          boxShadow: "0 0 16px rgba(89,240,223,0.42)",
        }}
      />
    </Link>
  );
}

function NavDot({ active = false }: { active?: boolean }) {
  return (
    <span
      className="inline-flex h-2.5 w-2.5 rounded-full"
      style={
        active
          ? {
              background: "var(--alpine-teal)",
              boxShadow: "0 0 14px rgba(89,240,223,0.35)",
            }
          : {
              border: "1px solid var(--alpine-border-soft)",
              background: "rgba(95,143,179,0.12)",
            }
      }
      aria-hidden="true"
    />
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[12px]" style={{ color: "var(--alpine-text-tertiary)" }}>
        {label}
      </span>
      <span
        className="text-[14px] font-medium tabular-nums"
        style={{ color: "var(--alpine-text-secondary)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
type SidebarProps = {
  hearts: number;
  streak: number;
  totalXp: number;
};

function LeftSidebar({ hearts, streak, totalXp }: SidebarProps) {
  const navItems = [
    { label: "Course", href: "/course", active: true },
    { label: "Leaderboard", href: "/leaderboard", active: false },
    { label: "Profile", href: "/profile", active: false },
  ];

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[248px] flex-shrink-0 backdrop-blur-xl lg:block"
      style={{
        borderRight: "1px solid var(--alpine-border-soft)",
        background:
          "linear-gradient(180deg, rgba(11,28,46,0.94) 0%, rgba(10,22,38,0.98) 100%)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex h-full flex-col px-5 pb-6 pt-7">
        <div className="pb-8">
          <StokedLogo />
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-[14px] border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all"
              style={
                item.active
                  ? {
                      borderColor: "var(--alpine-border-strong)",
                      background:
                        "linear-gradient(180deg, rgba(22,49,74,0.96) 0%, rgba(16,36,58,0.92) 100%)",
                      color: "var(--alpine-text)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 34px rgba(3,10,20,0.28)",
                    }
                  : {
                      borderColor: "transparent",
                      background: "transparent",
                      color: "var(--alpine-text-tertiary)",
                    }
              }
            >
              <span className="flex items-center gap-3">
                <NavDot active={item.active} />
                {item.label}
              </span>
              <span
                className="text-[11px] tracking-[0.08em]"
                style={{
                  color: item.active
                    ? "var(--alpine-cyan)"
                    : "var(--alpine-text-dim)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </nav>

        <div
          className="mt-6 rounded-[18px] pt-5"
          style={{
            borderTop: "1px solid rgba(95,143,179,0.16)",
            background:
              "linear-gradient(180deg, rgba(16,36,58,0.36) 0%, rgba(10,22,38,0) 100%)",
          }}
        >
          <MetricRow label="Streak" value={String(streak)} />
          <MetricRow label="XP" value={String(totalXp)} />
          <MetricRow label="Hearts" value={`${hearts}/5`} />
        </div>
      </div>
    </aside>
  );
}

// ─── Mobile top bar (shown instead of sidebar on small screens) ───────────────
type MobileBarProps = {
  completionPercent: number;
  resumeHref: string;
};

function MobileTopBar({ completionPercent, resumeHref }: MobileBarProps) {
  return (
    <header
      className="sticky top-0 z-40 px-4 backdrop-blur-xl lg:hidden"
      style={{
        borderBottom: "1px solid var(--alpine-border-soft)",
        background: "rgba(10,22,38,0.92)",
      }}
    >
      <div className="flex min-h-[64px] items-center justify-between gap-4 py-3">
        <StokedLogo />
        <div className="flex flex-1 items-center gap-3">
          <div
            className="min-w-0 flex-1 rounded-[12px] px-3 py-2.5"
            style={{
              border: "1px solid var(--alpine-border-soft)",
              background:
                "linear-gradient(180deg, rgba(22,49,74,0.94) 0%, rgba(16,36,58,0.92) 100%)",
            }}
          >
            <div
              className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--alpine-text-tertiary)" }}
            >
              <span>Progress</span>
              <span style={{ color: "var(--alpine-cream)" }}>{completionPercent}%</span>
            </div>
            <div className="mt-2">
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(159,199,222,0.12)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${completionPercent}%`,
                    background:
                      "linear-gradient(90deg, var(--alpine-emerald) 0%, var(--alpine-teal) 100%)",
                    boxShadow: "0 0 14px rgba(89,240,223,0.22)",
                  }}
                />
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="rounded-[12px] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              border: "1px solid var(--alpine-border-soft)",
              background:
                "linear-gradient(180deg, rgba(22,49,74,0.94) 0%, rgba(16,36,58,0.92) 100%)",
              color: "var(--alpine-text-secondary)",
            }}
            prefetch={false}
          >
            Profile
          </Link>
          <Link
            href={resumeHref}
            className="rounded-[12px] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              background:
                "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)",
              color: "#08111d",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 28px rgba(3,10,20,0.24)",
            }}
            prefetch={false}
          >
            Resume
          </Link>
        </div>
      </div>
    </header>
  );
}

type RoadmapLoginGateModalProps = {
  onContinueAsGuest: () => void;
  onContinueWithGoogle: () => void;
};

function RoadmapLoginGateModal({
  onContinueAsGuest,
  onContinueWithGoogle,
}: RoadmapLoginGateModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm md:p-6"
      style={{ background: "rgba(3,10,20,0.56)" }}
    >
      <div
        className="w-full max-w-[460px] rounded-[24px] p-6 md:p-8"
        style={{
          animation: "bounceIn 320ms cubic-bezier(0.22,1,0.36,1) both",
          border: "1px solid var(--alpine-border-soft)",
          background:
            "linear-gradient(180deg, rgba(22,49,74,0.95) 0%, rgba(10,22,38,0.98) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.45)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--alpine-teal)" }}
        >
          Save your progress
        </p>

        <h2
          className="mt-3 text-[28px] leading-[1.08] tracking-[-0.03em] md:text-[32px]"
          style={{ color: "var(--alpine-cream)", fontFamily: shellSerif }}
        >
          Pick up where you left off
        </h2>

        <p
          className="mt-3 max-w-[34ch] text-[15px] leading-6"
          style={{ color: "var(--alpine-text-secondary)" }}
        >
          Sign in with Google to keep your progress, streak, and lesson history across devices.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="flex items-center justify-center gap-3 rounded-[12px] px-5 py-3.5 text-sm font-semibold tracking-[0.01em] md:text-[15px]"
            style={{
              background:
                "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)",
              color: "#08111d",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28), 0 8px 28px rgba(0,0,0,0.22)",
            }}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/80">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 18 18">
                <path d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2087 1.125-.8427 2.0782-1.7973 2.7155v2.2582h2.9086c1.7018-1.5664 2.6851-3.8737 2.6851-6.6146Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9086-2.2582c-.806.54-1.8368.8591-3.0478.8591-2.3455 0-4.3282-1.5845-5.0364-3.7136H.9573v2.3318A9 9 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.9636 10.7068A5.4094 5.4094 0 0 1 3.6818 9c0-.5927.1027-1.1682.2818-1.7068V4.9614H.9573A9 9 0 0 0 0 9c0 1.4523.3477 2.8273.9573 4.0386l3.0063-2.3318Z" fill="#FBBC05"/>
                <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.3454l2.5804-2.5804C13.4636.8918 11.4264 0 9 0A9 9 0 0 0 .9573 4.9614l3.0063 2.3318C4.6718 5.1641 6.6545 3.5795 9 3.5795Z" fill="#EA4335"/>
              </svg>
            </span>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="rounded-[12px] border bg-transparent px-5 py-3.5 text-sm font-medium transition-colors md:text-[15px]"
            style={{
              borderColor: "var(--alpine-border-soft)",
              color: "var(--alpine-text-secondary)",
            }}
          >
            Continue as guest
          </button>
        </div>

        <p
          className="mt-4 text-center text-[13px]"
          style={{ color: "var(--alpine-text-tertiary)" }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="font-semibold underline underline-offset-4"
            style={{
              color: "var(--alpine-cream)",
              textDecorationColor: "rgba(159,199,222,0.26)",
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a DerivedModule's lessons to the flat SkillLesson[] shape the roadmap needs. */
function toSkillLessons(module: DerivedModule): SkillLesson[] {
  return (module.lessons as DerivedLesson[]).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    xpReward: lesson.xp,
    route: lesson.route,
    state:
      lesson.state === "completed" ? "completed" :
      lesson.state === "current"   ? "current"   :
      "locked",
  }));
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function CourseMapScreen() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const [showRoadmapLoginGate, setShowRoadmapLoginGate] = useState(false);
  const nickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const storedProgress = useSyncExternalStore(
    subscribeToCourseProgress,
    getStoredCourseProgress,
    getServerCourseProgressSnapshot,
  );
  const courseState = useMemo(() => deriveCourseState(storedProgress), [storedProgress]);
  const hearts = getEffectiveHearts(storedProgress, Boolean(user));
  const resumeHref    = useMemo(() => getNextLessonRoute(storedProgress), [storedProgress]);

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

    return () => {
      window.clearInterval(intervalId);
    };
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

    // Let the roadmap land as the reward before introducing auth friction.
    const revealDelayMs = triggeredFromOnboarding ? 1400 : 320;
    const timeoutId = window.setTimeout(() => {
      clearRoadmapLoginGateTrigger();
      setShowRoadmapLoginGate(true);
    }, revealDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user]);

  return (
    <JourneySurface surface="map">
      <div
        className="relative flex min-h-screen overflow-hidden"
        style={{
          fontFamily: shellSans,
          background:
            "linear-gradient(180deg, var(--alpine-bg) 0%, var(--alpine-bg-deep) 48%, var(--alpine-bg) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(95,143,179,0.14) 0%, transparent 42%), radial-gradient(ellipse at top right, rgba(127,231,242,0.1) 0%, transparent 36%), linear-gradient(180deg, rgba(8,17,29,0.04) 0%, rgba(8,17,29,0.2) 100%)",
          }}
        />
        {/* Left sidebar */}
        <LeftSidebar
          hearts={hearts}
          streak={courseState.streak}
          totalXp={courseState.totalXp}
        />

        {/* Center content */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <MobileTopBar
            completionPercent={courseState.completionPercent}
            resumeHref={resumeHref}
          />

          <main className="mx-auto w-full max-w-[960px] px-5 pb-24 pt-10 lg:px-8">
            {/* Greeting — aligned with spine gutter */}
            <div className="mb-14 pl-10 pt-2">
              <h1
                className="text-[34px] leading-none tracking-[-0.025em] sm:text-[40px]"
                style={{ color: "var(--alpine-cream)", fontFamily: shellSerif }}
              >
                {nickname}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="h-[2px] w-20 overflow-hidden rounded-full"
                  style={{ background: "rgba(159,199,222,0.12)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${courseState.completionPercent}%`,
                      opacity: 0.9,
                      transition: "width 0.6s ease",
                      background:
                        "linear-gradient(90deg, var(--alpine-emerald) 0%, var(--alpine-teal) 100%)",
                    }}
                  />
                </div>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: "var(--alpine-text-tertiary)" }}
                >
                  {courseState.completedLessons}/{courseState.totalLessons} lessons
                </span>
              </div>
            </div>

            {/* Module list with vertical spine */}
            <div className="relative pl-10">
              {/* Spine line — runs full height of module list */}
              <div
                className="absolute left-[5px] w-px"
                style={{
                  top: 8,
                  bottom: 40,
                  background:
                    "linear-gradient(180deg, rgba(159,199,222,0.2) 0%, rgba(95,143,179,0.14) 68%, transparent 100%)",
                }}
              />

              {courseState.modules.map((module, moduleIdx) => {
                  const isMountainModule = module.id === 1;
                  const isFirst = moduleIdx === 0;
                  const isActive = !module.locked && !module.completed;
                  const progressPct = module.lessons.length > 0
                    ? Math.round((module.completionCount / module.lessons.length) * 100)
                    : 0;

                  return (
                    <div
                      key={module.id}
                      id={`module-${module.slug}`}
                      className={`relative ${isFirst ? "" : "mt-20"}`}
                      style={{
                        opacity: module.locked ? 0.62 : 1,
                        filter: module.locked ? "saturate(0.5)" : undefined,
                        transition: "opacity 0.3s, filter 0.3s",
                      }}
                    >
                      {/* Station marker — sits on the spine */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{ left: -40, top: 6, width: 11, height: 11 }}
                      >
                        {module.completed ? (
                          /* Filled emerald — done */
                          <div
                            className="h-[9px] w-[9px] rounded-full bg-[#10b981]"
                            style={{
                              background: "var(--alpine-emerald)",
                              boxShadow: "0 0 10px rgba(39,211,195,0.24)",
                            }}
                          />
                        ) : isActive ? (
                          /* Ring with emerald fill — current */
                          <div
                            className="h-[11px] w-[11px] rounded-full border-[2px] border-[#10b981]"
                            style={{
                              borderColor: "var(--alpine-teal)",
                              background: "rgba(39,211,195,0.16)",
                              boxShadow: "0 0 10px rgba(127,231,242,0.22)",
                            }}
                          />
                        ) : (
                          <div
                            className="h-[7px] w-[7px] rounded-full border"
                            style={{ borderColor: "rgba(95,143,179,0.18)" }}
                          />
                        )}
                      </div>

                      {/* Module header */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className="text-[13px] font-medium tabular-nums tracking-[0.06em]"
                            style={{
                              color: module.locked
                                ? "rgba(95,116,136,0.72)"
                                : "var(--alpine-text-tertiary)",
                            }}
                          >
                            {String(module.id).padStart(2, "0")}
                          </span>
                          <span
                            className="text-[28px] leading-none tracking-[-0.03em]"
                            style={{
                              fontFamily: shellSerif,
                              color: module.completed
                                ? "var(--alpine-text-tertiary)"
                                : module.locked
                                  ? "rgba(95,116,136,0.82)"
                                  : "var(--alpine-text)",
                            }}
                          >
                            {module.title}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <span
                            className="text-[12px] tracking-[0.04em]"
                            style={{ color: "var(--alpine-text-tertiary)" }}
                          >
                            {module.subtitle}
                          </span>
                        </div>

                        {/* Per-module progress — visual, not just text */}
                        {!module.locked && (
                          <div className="mt-3 flex items-center gap-3">
                            <div
                              className="h-[2px] w-20 overflow-hidden rounded-full"
                              style={{ background: "rgba(159,199,222,0.12)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${module.completed ? 100 : progressPct}%`,
                                  opacity: module.completed ? 0.62 : 0.88,
                                  transition: "width 0.6s ease",
                                  background:
                                    "linear-gradient(90deg, var(--alpine-emerald) 0%, var(--alpine-teal) 100%)",
                                }}
                              />
                            </div>
                            <span
                              className="text-[11px] tabular-nums"
                              style={{ color: "var(--alpine-text-tertiary)" }}
                            >
                              {module.completed
                                ? "Complete"
                                : `${module.completionCount}/${module.lessons.length}`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Roadmap or locked state */}
                      {module.locked ? (
                        <div
                          style={{
                            padding: "28px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontFamily: shellSans,
                          }}
                        >
                          <svg width="14" height="16" viewBox="0 0 22 26" fill="none" style={{ opacity: 0.62, flexShrink: 0 }}>
                            <path d="M5 12V8a6 6 0 0 1 12 0v4" stroke="#7f97ab" strokeWidth="2" strokeLinecap="round" />
                            <rect x="1" y="12" width="20" height="13" rx="4" fill="#7f97ab" fillOpacity="0.18" />
                          </svg>
                          <p style={{ fontSize: 13, color: "var(--alpine-text-dim)", margin: 0 }}>
                            Complete the previous module to continue
                          </p>
                        </div>
                      ) : isMountainModule ? (
                        <div
                          className="rounded-[20px] p-1"
                          style={{
                            border: "1px solid rgba(95,143,179,0.14)",
                            background:
                              "linear-gradient(180deg, rgba(10,22,38,0.8) 0%, rgba(8,17,29,0.56) 100%)",
                          }}
                        >
                          <MountainRoadmap lessons={module.lessons} />
                        </div>
                      ) : (
                        <SkillTreeRoadmap
                          moduleName={module.title}
                          moduleColor={module.accentColor}
                          lessons={toSkillLessons(module)}
                          onLessonClick={(lesson) => router.push(lesson.route ?? "/course")}
                        />
                      )}
                    </div>
                  );
                })}

                {/* End marker */}
                <div className="relative mt-20 pb-8">
                  <div
                    className="absolute flex items-center justify-center"
                    style={{ left: -40, top: 4, width: 11, height: 11 }}
                  >
                    <div
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ background: "rgba(159,199,222,0.16)" }}
                    />
                  </div>
                  <FinalAchievementCard completionPercent={courseState.completionPercent} />
                </div>
              </div>
          </main>
        </div>

      </div>

      {showRoadmapLoginGate && !user && (
        <RoadmapLoginGateModal
          onContinueAsGuest={() => {
            markRoadmapLoginGateSeen();
            setShowRoadmapLoginGate(false);
          }}
          onContinueWithGoogle={() => {
            markRoadmapLoginGateSeen();
            void signInWithGoogle("/course");
          }}
        />
      )}
    </JourneySurface>
  );
}
