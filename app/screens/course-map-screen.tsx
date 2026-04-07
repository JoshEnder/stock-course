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
        className="text-[1.45rem] font-semibold tracking-[-0.05em] text-[#e8e2d4]"
        style={{ fontFamily: shellSerif }}
      >
        stoked
      </span>
      <span className="mb-[0.26em] h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#10b981] shadow-[0_0_14px_rgba(16,185,129,0.45)]" />
    </Link>
  );
}

function NavDot({ active = false }: { active?: boolean }) {
  return (
    <span
      className={`inline-flex h-2.5 w-2.5 rounded-full ${
        active
          ? "bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "border border-white/15 bg-white/5"
      }`}
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
      <span className="text-[12px] text-[#5f687a]">
        {label}
      </span>
      <span className="text-[14px] font-medium tabular-nums text-[#cbd5e1]">
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
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-shrink-0 border-r border-white/6 bg-[#0a0f1a]/94 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col px-5 pb-6 pt-7">
        <div className="pb-8">
          <StokedLogo />
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-[14px] border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all ${
                item.active
                  ? "border-white/10 bg-[#1a2942] text-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "border-transparent bg-transparent text-[#7d8799] hover:border-white/8 hover:bg-white/[0.04] hover:text-[#cbd5e1]"
              }`}
            >
              <span className="flex items-center gap-3">
                <NavDot active={item.active} />
                {item.label}
              </span>
              <span className={`text-[11px] tracking-[0.08em] ${item.active ? "text-[#10b981]" : "text-[#5f687a]"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-white/[0.04] pt-5">
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
  streak: number;
  completionPercent: number;
  resumeHref: string;
};

function MobileTopBar({ streak, completionPercent, resumeHref }: MobileBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-[#0a0f1a]/94 px-4 backdrop-blur-xl lg:hidden">
      <div className="flex min-h-[64px] items-center justify-between gap-4 py-3">
        <StokedLogo />
        <div className="flex flex-1 items-center gap-3">
          <div className="min-w-0 flex-1 rounded-[12px] border border-white/8 bg-[#1a2942] px-3 py-2.5">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d8799]">
              <span>Progress</span>
              <span className="text-[#e8e2d4]">{completionPercent}%</span>
            </div>
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full bg-[#10b981]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="rounded-[12px] border border-white/8 bg-[#1a2942] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cbd5e1]"
            prefetch={false}
          >
            Profile
          </Link>
          <Link
            href={resumeHref}
            className="rounded-[12px] bg-[#e8e2d4] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111]"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm md:p-6">
      <div
        className="w-full max-w-[460px] rounded-[24px] border border-white/8 bg-[#1a2942] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] md:p-8"
        style={{ animation: "bounceIn 320ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#10b981]">
          Save your progress
        </p>

        <h2
          className="mt-3 text-[28px] leading-[1.08] tracking-[-0.03em] text-[#e8e2d4] md:text-[32px]"
          style={{ fontFamily: shellSerif }}
        >
          Pick up where you left off
        </h2>

        <p className="mt-3 max-w-[34ch] text-[15px] leading-6 text-[#cbd5e1]">
          Sign in with Google to keep your progress, streak, and lesson history across devices.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="flex items-center justify-center gap-3 rounded-[12px] bg-[#e8e2d4] px-5 py-3.5 text-sm font-semibold tracking-[0.01em] text-[#111] transition-colors hover:bg-[#f0ece3] md:text-[15px]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28), 0 8px 28px rgba(0,0,0,0.22)" }}
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
            className="rounded-[12px] border border-white/10 bg-transparent px-5 py-3.5 text-sm font-medium text-[#cbd5e1] transition-colors hover:bg-white/[0.04] md:text-[15px]"
          >
            Continue as guest
          </button>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#7d8799]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="font-semibold text-[#e8e2d4] underline decoration-white/20 underline-offset-4"
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
        className="relative flex min-h-screen overflow-hidden bg-[#0a0f1a]"
        style={{ fontFamily: shellSans }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.03),transparent_40%),linear-gradient(180deg,#0a0f1a_0%,#0d1525_50%,#0a0f1a_100%)]" />
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
            streak={courseState.streak}
            completionPercent={courseState.completionPercent}
            resumeHref={resumeHref}
          />

          <main className="mx-auto w-full max-w-[960px] px-5 pb-24 pt-10 lg:px-8">
            {/* Greeting — aligned with spine gutter */}
            <div className="mb-14 pl-10 pt-2">
              <h1
                className="text-[34px] leading-none tracking-[-0.025em] text-[#e8e2d4] sm:text-[40px]"
                style={{ fontFamily: shellSerif }}
              >
                {nickname}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-[2px] w-20 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#10b981]"
                    style={{ width: `${courseState.completionPercent}%`, opacity: 0.8, transition: "width 0.6s ease" }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-[#5f687a]">
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
                  background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 70%, transparent 100%)",
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
                        opacity: module.locked ? 0.55 : 1,
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
                            style={{ boxShadow: "0 0 6px rgba(16,185,129,0.3)" }}
                          />
                        ) : isActive ? (
                          /* Ring with emerald fill — current */
                          <div
                            className="h-[11px] w-[11px] rounded-full border-[2px] border-[#10b981]"
                            style={{
                              background: "rgba(16,185,129,0.15)",
                              boxShadow: "0 0 8px rgba(16,185,129,0.25)",
                            }}
                          />
                        ) : (
                          /* Hollow dim — locked */
                          <div className="h-[7px] w-[7px] rounded-full border border-white/10" />
                        )}
                      </div>

                      {/* Module header */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className="text-[13px] font-medium tabular-nums tracking-[0.06em]"
                            style={{ color: module.locked ? "#3d4654" : "#5f687a" }}
                          >
                            {String(module.id).padStart(2, "0")}
                          </span>
                          <span
                            className="text-[28px] leading-none tracking-[-0.03em]"
                            style={{
                              fontFamily: shellSerif,
                              color: module.completed ? "#7d8799"
                                   : module.locked ? "#3d4654"
                                   : "#cbd5e1",
                            }}
                          >
                            {module.title}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <span className="text-[12px] tracking-[0.04em] text-[#5f687a]">
                            {module.subtitle}
                          </span>
                        </div>

                        {/* Per-module progress — visual, not just text */}
                        {!module.locked && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-[2px] w-20 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-[#10b981]"
                                style={{
                                  width: `${module.completed ? 100 : progressPct}%`,
                                  opacity: module.completed ? 0.5 : 0.8,
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                            <span className="text-[11px] tabular-nums text-[#5f687a]">
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
                          <svg width="14" height="16" viewBox="0 0 22 26" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
                            <path d="M5 12V8a6 6 0 0 1 12 0v4" stroke="#5f687a" strokeWidth="2" strokeLinecap="round" />
                            <rect x="1" y="12" width="20" height="13" rx="4" fill="#5f687a" fillOpacity="0.25" />
                          </svg>
                          <p style={{ fontSize: 13, color: "#3d4654", margin: 0 }}>
                            Complete the previous module to continue
                          </p>
                        </div>
                      ) : isMountainModule ? (
                        <div className="rounded-[20px] border border-white/[0.04] bg-[#0d1322]/60 p-1">
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
                    <div className="h-[5px] w-[5px] rounded-full bg-white/[0.08]" />
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
