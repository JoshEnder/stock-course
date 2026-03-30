"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SkillTreeRoadmap, type SkillLesson } from "../components/skill-tree-roadmap";
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

// ─── Stoked logo ──────────────────────────────────────────────────────────────
function StokedLogo() {
  return (
    <Link href="/" className="inline-flex items-end gap-0.5">
      <span
        className="text-2xl font-black tracking-tight text-[#1a2b4a]"
        style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
      >
        stoked
      </span>
      <span className="mb-[0.2em] h-3 w-3 flex-shrink-0 rounded-full bg-[#22c55e]" />
    </Link>
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
    { label: "Learn",          icon: "📚", href: "/course",     active: true  },
    { label: "Leaderboards",   icon: "🏆", href: "/leaderboard", active: false },
    { label: "Profile",        icon: "👤", href: "/profile",    active: false },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[200px] flex-shrink-0 flex-col border-r border-gray-100 bg-white py-8 lg:flex">
      {/* Logo */}
      <div className="px-5 pb-8">
        <StokedLogo />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wide transition-all ${
              item.active
                ? "bg-[#f0fdf4] text-[#22c55e] shadow-[0_3px_0_#bbf7d0] border-2 border-[#bbf7d0]"
                : "text-gray-400 hover:bg-gray-50 hover:text-[#1a2b4a]"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Stats */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-3 pt-6">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-[0_2px_0_#ebebeb]">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-lg font-black text-[#ff9600]">{streak}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Day streak</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-[0_2px_0_#ebebeb]">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="text-lg font-black text-[#fbbf24]">{totalXp} XP</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total earned</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-[0_2px_0_#ebebeb]">
          <span className="text-2xl">❤️</span>
          <div>
            <div className="text-lg font-black text-[#ef4444]">{hearts} / 5</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Hearts left</div>
          </div>
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
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white px-4 lg:hidden">
      <div className="flex h-14 items-center justify-between gap-4">
        <StokedLogo />
        <div className="flex flex-1 items-center gap-3">
          <div className="flex flex-1 items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-black text-[#ff9600]">{streak}</span>
            <div className="flex-1">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#22c55e]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#172b4d] shadow-[0_3px_0_#e5e7eb]"
            prefetch={false}
          >
            Profile
          </Link>
          <Link
            href={resumeHref}
            className="rounded-xl bg-[#22c55e] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[0_3px_0_#16a34a] active:translate-y-[1px] active:shadow-[0_1px_0_#16a34a]"
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
        className="flex min-h-screen bg-[#faf9f6]"
        style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
      >
        {/* Left sidebar */}
        <LeftSidebar
          hearts={hearts}
          streak={courseState.streak}
          totalXp={courseState.totalXp}
        />

        {/* Center content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <MobileTopBar
            streak={courseState.streak}
            completionPercent={courseState.completionPercent}
            resumeHref={resumeHref}
          />

          <main className="mx-auto w-full max-w-[1380px] px-6 pb-24 pt-10 lg:px-8 xl:px-10">
            {/* Greeting */}
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Welcome back
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#1a2b4a]">
                {nickname}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {courseState.completedLessons}/{courseState.totalLessons} lessons complete &mdash; keep going!
              </p>
            </div>

            <div className="space-y-16">
              {courseState.modules.map((module) => {
                  return (
                    <div
                      key={module.id}
                      id={`module-${module.slug}`}
                      style={{ opacity: module.locked ? 0.52 : 1, transition: "opacity 400ms" }}
                    >
                      {/* World header */}
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white"
                          style={{
                            background: module.locked ? "#cbd5e1" : module.accentColor,
                            boxShadow: module.locked ? "0 3px 0 #b0bec5" : `0 3px 0 color-mix(in srgb, ${module.accentColor} 60%, #000)`,
                          }}
                        >
                          {module.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-base font-black text-[#1a2b4a]">{module.title}</span>
                            <span className="text-xs text-gray-400">{module.subtitle}</span>
                          </div>
                          <div className="mt-0.5">
                            {module.locked ? (
                              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                Locked — finish the previous world first
                              </span>
                            ) : module.completed ? (
                              <span className="text-xs font-bold uppercase tracking-wide text-[#22c55e]">
                                ✓ World complete
                              </span>
                            ) : (
                              <span
                                className="text-xs font-bold uppercase tracking-wide"
                                style={{ color: module.accentColor }}
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
                            background: "#fafaf8",
                            border: "2px solid #e5e7eb",
                            borderRadius: 24,
                            boxShadow: "0 4px 0 #e0e0dc",
                            padding: "52px 32px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              background: "#f1f5f9",
                              borderRadius: 16,
                              border: "2px solid #e2e8f0",
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
                              fontWeight: 800,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              margin: 0,
                            }}
                          >
                            Finish the previous world to unlock
                          </p>
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

                <FinalAchievementCard completionPercent={courseState.completionPercent} />
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
