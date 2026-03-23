"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SkillTreeRoadmap, type SkillLesson } from "../components/skill-tree-roadmap";
import { useEffect, useMemo, useSyncExternalStore } from "react";
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
  const { user } = useAuth();
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
    </JourneySurface>
  );
}
