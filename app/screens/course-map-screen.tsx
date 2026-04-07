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
        className="text-[1.45rem] font-semibold tracking-[-0.05em] text-[#f4efe5]"
        style={{ fontFamily: shellSerif }}
      >
        stoked
      </span>
      <span className="mb-[0.26em] h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#86f6a5] shadow-[0_0_18px_rgba(134,246,165,0.5)]" />
    </Link>
  );
}

function NavDot({ active = false }: { active?: boolean }) {
  return (
    <span
      className={`inline-flex h-2.5 w-2.5 rounded-full ${
        active
          ? "bg-[#86f6a5] shadow-[0_0_18px_rgba(134,246,165,0.5)]"
          : "border border-white/20 bg-white/5"
      }`}
      aria-hidden="true"
    />
  );
}

function MetricBadge({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f98ab]">
        {label}
      </div>
      <div className={`mt-1 text-[22px] font-semibold tracking-[-0.04em] ${valueClassName}`}>
        {value}
      </div>
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
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-shrink-0 border-r border-white/8 bg-[#07111c]/92 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col px-5 pb-6 pt-7">
        <div className="pb-8">
          <StokedLogo />
          <p className="mt-3 max-w-[18ch] text-[12px] leading-5 text-[#8f98ab]">
            A calmer course shell so the climb feels deliberate all the way through.
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-[18px] border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all ${
                item.active
                  ? "border-[#234530] bg-[linear-gradient(180deg,rgba(21,40,28,0.95),rgba(10,23,17,0.9))] text-[#eff8f0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.16)]"
                  : "border-white/6 bg-white/[0.03] text-[#8f98ab] hover:border-white/10 hover:bg-white/[0.05] hover:text-[#dce3ef]"
              }`}
            >
              <span className="flex items-center gap-3">
                <NavDot active={item.active} />
                {item.label}
              </span>
              <span className={`text-[11px] tracking-[0.08em] ${item.active ? "text-[#86f6a5]" : "text-[#5f687a]"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 space-y-3 border-t border-white/8 pt-6">
          <MetricBadge label="Streak" value={String(streak)} valueClassName="text-[#ffb767]" />
          <MetricBadge label="XP Earned" value={`${totalXp}`} valueClassName="text-[#f4efe5]" />
          <MetricBadge label="Hearts" value={`${hearts} / 5`} valueClassName="text-[#ff9a95]" />
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
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#07111c]/94 px-4 backdrop-blur-xl lg:hidden">
      <div className="flex min-h-[72px] items-center justify-between gap-4 py-3">
        <StokedLogo />
        <div className="flex flex-1 items-center gap-3">
          <div className="min-w-0 flex-1 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f98ab]">
              <span>Streak</span>
              <span className="text-[#ffb767]">{streak}</span>
            </div>
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#86f6a5,#e3f7da)]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#dce3ef]"
            prefetch={false}
          >
            Profile
          </Link>
          <Link
            href={resumeHref}
            className="rounded-[16px] border border-[#234530] bg-[linear-gradient(180deg,rgba(21,40,28,0.95),rgba(10,23,17,0.9))] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#eff8f0]"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm md:p-6">
      <div
        className="w-full max-w-[460px] rounded-[28px] border border-[#dcfce7] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] md:p-7"
        style={{ animation: "bounceIn 320ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="inline-flex items-center rounded-full bg-[#f0fdf4] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#16a34a]">
          SAVE PROGRESS
        </div>

        <h2 className="mt-4 text-[28px] font-black leading-[1.05] tracking-[-0.04em] text-[#1a2b4a] md:text-[32px]">
          Save your progress
        </h2>

        <p className="mt-3 max-w-[34ch] text-[15px] leading-6 text-[#475569] md:text-base">
          Continue with Google to save your roadmap, streak, and lesson history. Then you’ll choose your username.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="flex items-center justify-center gap-3 rounded-[18px] bg-[#22c55e] px-5 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_4px_0_#16a34a] transition-transform active:translate-y-[1px] active:shadow-[0_2px_0_#16a34a] md:text-[15px]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[15px] shadow-[0_1px_0_rgba(15,23,42,0.08)]">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 18 18">
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
            className="rounded-[18px] border border-[#dbe4f0] bg-white px-5 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-[#475569] transition-colors hover:bg-[#f8fafc] md:text-[15px]"
          >
            Continue as guest
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-[#64748b]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onContinueWithGoogle}
            className="font-bold text-[#1a2b4a] underline decoration-[#cbd5e1] underline-offset-4"
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
        className="relative flex min-h-screen overflow-hidden bg-[#07111c]"
        style={{ fontFamily: shellSans }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.06),transparent_28%),radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.08),transparent_26%),linear-gradient(180deg,#08111a_0%,#0b1520_38%,#0d1722_100%)]" />
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

          <main className="mx-auto w-full max-w-[1420px] px-5 pb-24 pt-8 lg:px-8 xl:px-10">
            {/* Greeting */}
            <div className="mb-8 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_80px_rgba(0,0,0,0.18)] lg:px-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f98ab]">
                    Your climb
                  </p>
                  <h1
                    className="mt-2 text-[40px] leading-none tracking-[-0.05em] text-[#f4efe5] sm:text-[48px]"
                    style={{ fontFamily: shellSerif }}
                  >
                    Welcome back, {nickname}
                  </h1>
                  <p className="mt-3 max-w-[38ch] text-[15px] leading-6 text-[#a9b2c3]">
                    The course now opens with a calmer shell so the mountain roadmap feels like part of the same journey, not a separate product.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f98ab]">
                      Completion
                    </div>
                    <div className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-[#f4efe5]">
                      {courseState.completedLessons}/{courseState.totalLessons}
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f98ab]">
                      Current rank
                    </div>
                    <div className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-[#dff5e4]">
                      {courseState.rank}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {courseState.modules.map((module) => {
                  const isMountainModule = module.id === 1;
                  return (
                    <div
                      key={module.id}
                      id={`module-${module.slug}`}
                      className={`rounded-[32px] border px-5 py-5 transition-all lg:px-6 lg:py-6 ${
                        isMountainModule
                          ? "border-[#203242] bg-[linear-gradient(180deg,rgba(14,24,36,0.96),rgba(10,18,29,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_40px_90px_rgba(0,0,0,0.28)]"
                          : "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_26px_70px_rgba(0,0,0,0.18)]"
                      }`}
                      style={{ opacity: module.locked ? 0.58 : 1 }}
                    >
                      {/* World header */}
                      <div className="mb-5 flex items-center gap-4">
                        <div
                          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] text-sm font-semibold text-white"
                          style={{
                            background: module.locked
                              ? "rgba(148,163,184,0.18)"
                              : `linear-gradient(180deg, color-mix(in srgb, ${module.accentColor} 84%, white), color-mix(in srgb, ${module.accentColor} 58%, black))`,
                            boxShadow: module.locked
                              ? "inset 0 1px 0 rgba(255,255,255,0.08)"
                              : `0 14px 32px color-mix(in srgb, ${module.accentColor} 22%, transparent), inset 0 1px 0 rgba(255,255,255,0.14)`,
                          }}
                        >
                          {module.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span
                              className="text-[28px] leading-none tracking-[-0.04em] text-[#f4efe5]"
                              style={{ fontFamily: shellSerif }}
                            >
                              {module.title}
                            </span>
                            <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#7d8799]">
                              {module.subtitle}
                            </span>
                          </div>
                          <div className="mt-2">
                            {module.locked ? (
                              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8799]">
                                Locked — finish the previous world first
                              </span>
                            ) : module.completed ? (
                              <span className="inline-flex rounded-full border border-[#294936] bg-[#13241a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9bf3af]">
                                World complete
                              </span>
                            ) : (
                              <span
                                className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                                style={{
                                  color: module.accentColor,
                                  borderColor: `color-mix(in srgb, ${module.accentColor} 34%, transparent)`,
                                  background: `color-mix(in srgb, ${module.accentColor} 10%, transparent)`,
                                }}
                              >
                                {module.completionCount}/{module.lessons.length} lessons done
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Roadmap or locked placeholder */}
                      {module.locked ? (
                        <div
                          style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 24,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                            padding: "52px 32px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            fontFamily: shellSans,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: 16,
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
                              <path d="M5 12V8a6 6 0 0 1 12 0v4" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                              <rect x="1" y="12" width="20" height="13" rx="4" fill="#cbd5e1" />
                              <circle cx="11" cy="18.5" r="2.5" fill="#94a3b8" />
                              <rect x="9.5" y="18.5" width="3" height="4" rx="1" fill="#94a3b8" />
                            </svg>
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#8f98ab",
                              textTransform: "uppercase",
                              letterSpacing: "0.18em",
                              margin: 0,
                            }}
                          >
                            Finish the previous world to unlock
                          </p>
                        </div>
                      ) : module.id === 1 ? (
                        <MountainRoadmap lessons={module.lessons} />
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

                <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_26px_70px_rgba(0,0,0,0.18)]">
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
