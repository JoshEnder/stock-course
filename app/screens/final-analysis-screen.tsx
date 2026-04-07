"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  BrainIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
} from "../components/icons";
import { performanceData } from "../lib/course-data";
import {
  getNickname,
  subscribeToCourseStorage,
  subscribeToHydration,
} from "../lib/course-storage";

function StokedLogo() {
  return (
    <Link href="/" className="alpine-brand-link">
      <span className="alpine-brand-link__word">stoked</span>
      <span className="alpine-brand-link__dot" />
    </Link>
  );
}

export function FinalAnalysisScreen() {
  const router = useRouter();
  const storedNickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const nickname = isHydrated ? storedNickname : "Learner";

  const overallScore = useMemo(
    () =>
      Math.round(
        performanceData.reduce((acc, item) => acc + item.score, 0) /
          performanceData.length,
      ),
    [],
  );

  return (
    <main className="alpine-page">
      <div className="alpine-page__inner">
        <div className="alpine-topbar">
          <StokedLogo />
          <Link href="/course" className="alpine-back-link">
            Back to course
          </Link>
        </div>

        <div className="alpine-page-head">
          <p className="alpine-kicker">Final analysis</p>
          <h1 className="alpine-heading">Your learning analysis</h1>
          <p className="alpine-copy">
            A full-course snapshot of how you performed across the beginner path,
            {` ${nickname}`}.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="alpine-panel alpine-panel--accent p-8 text-center md:p-10">
              <div
                className="mx-auto mb-5 flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(39,211,195,0.24), rgba(25,184,156,0.3))",
                  boxShadow: "0 20px 40px rgba(9, 34, 54, 0.42)",
                }}
              >
                <TrendingUpIcon
                  className="h-9 w-9"
                  style={{ color: "var(--alpine-cyan)" }}
                />
              </div>
              <p className="alpine-kicker">Overall performance</p>
              <h2
                className="mt-3 text-[clamp(3.5rem,10vw,5.5rem)] font-semibold leading-none"
                style={{ color: "var(--alpine-cream)" }}
              >
                {overallScore}%
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--alpine-text-secondary)" }}>
                Strong retention across the full beginner course.
              </p>
              <div className="mt-6 inline-flex">
                <span className="alpine-chip alpine-chip--accent">
                  <CheckCircleIcon className="h-4 w-4" />
                  Excellent work
                </span>
              </div>
            </div>

            <div className="alpine-panel p-6">
              <div className="mb-5">
                <p className="alpine-label">Concept breakdown</p>
                <h2
                  className="mt-2 flex items-center gap-2 text-xl font-semibold"
                  style={{ color: "var(--alpine-text)" }}
                >
                  <BrainIcon
                    className="h-5 w-5"
                    style={{ color: "var(--alpine-teal)" }}
                  />
                  Strength by topic
                </h2>
              </div>

              <div className="space-y-3">
                {performanceData.map((item) => (
                  <div
                    key={item.concept}
                    className="rounded-[1.15rem] border px-4 py-4"
                    style={{
                      borderColor: "rgba(127, 231, 242, 0.1)",
                      background:
                        "linear-gradient(180deg, rgba(12, 27, 43, 0.8), rgba(9, 20, 33, 0.76))",
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--alpine-text)" }}
                      >
                        {item.concept}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xl font-semibold"
                          style={{
                            color:
                              item.score === 100
                                ? "var(--alpine-teal)"
                                : "var(--alpine-cream)",
                          }}
                        >
                          {item.score}%
                        </span>
                        {item.score === 100 ? (
                          <CheckCircleIcon
                            className="h-4 w-4"
                            style={{ color: "var(--alpine-teal)" }}
                          />
                        ) : null}
                      </div>
                    </div>
                    <div
                      className="mb-3 h-2.5 overflow-hidden rounded-full"
                      style={{ background: "rgba(127, 231, 242, 0.12)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.score}%`,
                          background:
                            "linear-gradient(90deg, var(--alpine-teal), var(--alpine-cyan))",
                          boxShadow: "0 0 18px rgba(89, 240, 223, 0.24)",
                          transition: "width 800ms cubic-bezier(0.22,1,0.36,1)",
                        }}
                      />
                    </div>
                    <p
                      className="text-sm leading-6"
                      style={{ color: "var(--alpine-text-tertiary)" }}
                    >
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="alpine-panel alpine-panel--muted p-6">
              <p className="alpine-label">Course stats</p>
              <div className="mt-5 space-y-4">
                <StatCard
                  icon={<ClockIcon className="h-5 w-5" style={{ color: "var(--alpine-teal)" }} />}
                  label="Total time"
                  value="74 min"
                />
                <StatCard
                  icon={<BrainIcon className="h-5 w-5" style={{ color: "var(--alpine-cyan)" }} />}
                  label="Lessons mastered"
                  value="10 lessons"
                />
              </div>
            </div>

            <div className="alpine-panel p-6">
              <p className="alpine-label" style={{ color: "var(--alpine-teal)" }}>
                Next step
              </p>
              <h2
                className="mt-3 text-xl font-semibold"
                style={{ color: "var(--alpine-cream)" }}
              >
                Claim your certificate
              </h2>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
                Your results are locked in. Move into the completion flow to see the
                final milestone screen and certificate preview.
              </p>
              <button
                type="button"
                onClick={() => router.push("/completion")}
                className="alpine-cta-primary mt-6"
              >
                View certificate
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="alpine-list-row">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(39,211,195,0.16), rgba(17,49,74,0.94))",
          border: "1px solid rgba(127, 231, 242, 0.12)",
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="alpine-label">{label}</p>
        <p className="mt-1 text-lg font-semibold" style={{ color: "var(--alpine-text)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}
