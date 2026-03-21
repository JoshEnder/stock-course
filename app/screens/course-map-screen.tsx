"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { FinalAchievementCard } from "../components/final-achievement-card";
import { JourneySurface } from "../components/journey-surface";
import { ModulePreviewCard } from "../components/module-preview-card";
import { ModuleSection } from "../components/module-section";
import { useAuth } from "../lib/auth-context";
import { deriveCourseState, getNextLessonRoute } from "../lib/course-engine";
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
  completedLessons: number;
};

function LeftSidebar({ hearts, streak, completedLessons }: SidebarProps) {
  const navItems = [
    { label: "Learn",          icon: "📚", href: "/course",     active: true  },
    { label: "Leaderboards",   icon: "🏆", href: "/course",     active: false },
    { label: "Profile",        icon: "👤", href: "/profile",    active: false },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] flex-shrink-0 flex-col border-r-2 border-gray-100 bg-white py-8 lg:flex">
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
                ? "border-b-2 border-[#16a34a] bg-green-50 text-[#22c55e]"
                : "text-gray-400 hover:bg-gray-50 hover:text-[#1a2b4a]"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Stats */}
      <div className="flex flex-col gap-3 border-t-2 border-gray-100 px-3 pt-6">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-[0_3px_0_#e5e5e5]">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-lg font-black text-[#ff9600]">{streak}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Day streak</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-[0_3px_0_#e5e5e5]">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="text-lg font-black text-[#fbbf24]">{completedLessons * 10} XP</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total earned</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-[0_3px_0_#e5e5e5]">
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

// ─── Right panel ──────────────────────────────────────────────────────────────
type RightPanelProps = {
  completionPercent: number;
  completedLessons: number;
  isSignedIn: boolean;
  onGoogleSignIn: () => void;
  profileHref: string;
  signedInEmail: string | null;
  totalLessons: number;
  rank: string;
  resumeHref: string;
  streak: number;
};

function RightPanel({
  completionPercent,
  completedLessons,
  isSignedIn,
  onGoogleSignIn,
  profileHref,
  signedInEmail,
  totalLessons,
  rank,
  resumeHref,
  streak,
}: RightPanelProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l-2 border-gray-100 bg-white px-5 py-8 xl:flex">
      {/* Daily goal */}
      <div className="rounded-3xl border-2 border-gray-100 bg-white p-5 shadow-[0_4px_0_#e5e5e5]">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">Daily goal</span>
        </div>
        <div className="mb-3 flex items-end justify-between">
          <span className="text-sm font-black text-[#1a2b4a]">{completedLessons} / {totalLessons} lessons</span>
          <span className="text-sm font-black text-[#22c55e]">{completionPercent}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#22c55e] transition-all duration-700"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="rounded-3xl border-2 border-[#ff9600] bg-orange-50 p-5 shadow-[0_4px_0_#f09000]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="text-2xl font-black text-[#ff9600]">{streak} day streak</div>
            <div className="text-xs font-semibold text-orange-400">Keep it going!</div>
          </div>
        </div>
      </div>

      {/* Rank */}
      <div className="rounded-3xl border-2 border-gray-100 bg-white p-5 shadow-[0_4px_0_#e5e5e5]">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">🏅</span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">Your rank</span>
        </div>
        <div className="text-xl font-black text-[#1a2b4a]">{rank}</div>
        <div className="mt-1 text-xs text-gray-400">Keep completing lessons to advance</div>
      </div>

      <div className={`rounded-3xl p-5 shadow-[0_4px_0_#e5e5e5] ${isSignedIn ? "border-2 border-[#bbf7d0] bg-[#f0fdf4]" : "border-2 border-gray-100 bg-white"}`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">{isSignedIn ? "☁️" : "🔐"}</span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">
            {isSignedIn ? "Synced progress" : "Save your progress"}
          </span>
        </div>
        <div className="text-base font-black text-[#1a2b4a]">
          {isSignedIn ? "Google account connected" : "Keep your lessons across visits"}
        </div>
        <div className="mt-2 text-xs leading-5 text-gray-500">
          {isSignedIn
            ? signedInEmail ?? "Your course progress now syncs to your account."
            : "Sign in with Google so your course path, nickname, and login metadata follow your account."}
        </div>
        {isSignedIn ? (
          <Link
            href={profileHref}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#22c55e] px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a]"
          >
            Open profile
          </Link>
        ) : (
          <button
            type="button"
            onClick={onGoogleSignIn}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-wide text-[#172b4d] shadow-[0_4px_0_#e5e5e5]"
          >
            Log in with Google
          </button>
        )}
      </div>

      {/* Resume CTA */}
      <Link
        href={resumeHref}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#22c55e] px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a] transition-all hover:bg-[#1eb356] active:translate-y-[2px] active:shadow-[0_2px_0_#16a34a]"
        prefetch={false}
      >
        Resume lesson
      </Link>
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
    <header className="sticky top-0 z-40 border-b-2 border-gray-100 bg-white px-4 lg:hidden">
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

// ─── Main screen ──────────────────────────────────────────────────────────────
export function CourseMapScreen() {
  const moduleAnchorRef = useRef<HTMLDivElement | null>(null);
  const { signInWithGoogle, user } = useAuth();
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
  const currentModule  = courseState.modules.find((m) => m.id === courseState.currentModuleId);
  const completedMods  = courseState.modules.filter((m) => m.id < courseState.currentModuleId);
  const upcomingMods   = courseState.modules.filter((m) => m.id > courseState.currentModuleId);
  const resumeHref     = useMemo(() => getNextLessonRoute(storedProgress), [storedProgress]);

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle("/course");
    } catch (error) {
      console.error("Failed to start Google sign-in from the course map", error);
    }
  }

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
    const section = moduleAnchorRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const outside = rect.top < 92 || rect.bottom > window.innerHeight - 28;
    if (!outside) return;
    const t = window.setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "nearest" }), 140);
    return () => window.clearTimeout(t);
  }, [currentModule?.id]);

  return (
    <JourneySurface surface="map">
      <div
        className="flex min-h-screen bg-white"
        style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
      >
        {/* Left sidebar */}
        <LeftSidebar
          hearts={hearts}
          streak={courseState.streak}
          completedLessons={courseState.completedLessons}
        />

        {/* Center content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <MobileTopBar
            streak={courseState.streak}
            completionPercent={courseState.completionPercent}
            resumeHref={resumeHref}
          />

          <main className="mx-auto w-full max-w-4xl px-6 pb-24 pt-10">
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

            <div className="space-y-10">
              {/* Current module */}
              {currentModule && (
                <div id={`module-${currentModule.slug}`} ref={moduleAnchorRef}>
                  <div className="mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#22c55e]">
                      Current path
                    </p>
                    <h2 className="text-xl font-black text-[#1a2b4a]">
                      {currentModule.title}
                    </h2>
                  </div>
                  <ModuleSection module={currentModule} />
                </div>
              )}

              {/* Upcoming modules */}
              {upcomingMods.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Locked ahead
                    </p>
                    <h3 className="mt-1 text-lg font-black text-[#1a2b4a]">Next worlds</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingMods.map((mod) => (
                      <ModulePreviewCard key={mod.id} module={mod} variant="locked" />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed modules */}
              {completedMods.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Completed
                    </p>
                    <h3 className="mt-1 text-lg font-black text-[#1a2b4a]">Finished worlds</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {completedMods.map((mod) => (
                      <ModulePreviewCard key={mod.id} module={mod} variant="completed" />
                    ))}
                  </div>
                </section>
              )}

              <FinalAchievementCard completionPercent={courseState.completionPercent} />
            </div>
          </main>
        </div>

        {/* Right panel */}
        <RightPanel
          completionPercent={courseState.completionPercent}
          completedLessons={courseState.completedLessons}
          isSignedIn={Boolean(user)}
          onGoogleSignIn={handleGoogleSignIn}
          profileHref="/profile"
          signedInEmail={user?.email ?? null}
          totalLessons={courseState.totalLessons}
          rank={courseState.rank}
          resumeHref={resumeHref}
          streak={courseState.streak}
        />
      </div>
    </JourneySurface>
  );
}
