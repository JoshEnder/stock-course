"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MountainRoadmap } from "../components/cinematic-roadmap";
import { deriveCourseState, getNextLessonRoute } from "../lib/course-engine";
import {
  getServerCourseProgressSnapshot,
  getStoredCourseProgress,
  subscribeToCourseProgress,
} from "../lib/course-progress";

const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans  = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

export default function RoadmapPage() {
  const router = useRouter();

  const progress = useSyncExternalStore(
    subscribeToCourseProgress,
    getStoredCourseProgress,
    getServerCourseProgressSnapshot,
  );

  const courseState = useMemo(() => deriveCourseState(progress), [progress]);
  const foundationsModule = courseState.modules.find(m => m.id === 1);
  const lessons = foundationsModule?.lessons ?? [];
  const resumeHref = useMemo(() => getNextLessonRoute(progress), [progress]);

  function handleNodeClick(_id: number, route?: string) {
    if (route) router.push(route);
  }

  return (
    <>
      <MountainRoadmap
        lessons={lessons.length > 0 ? lessons : undefined}
        onNodeClick={handleNodeClick}
      />

      {/* ── Minimal chrome ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 20,
        pointerEvents: "none",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 28px",
        }}>
          {/* Logo */}
          <Link href="/course" prefetch={false} style={{
            pointerEvents: "auto",
            display: "inline-flex", alignItems: "flex-end", gap: 4,
            textDecoration: "none",
          }}>
            <span style={{
              fontSize: "1.32rem", fontWeight: 600, letterSpacing: "-0.05em",
              color: "rgba(232,226,212,0.90)", fontFamily: serif, lineHeight: 1,
            }}>
              stoked
            </span>
            <span style={{
              marginBottom: "0.16em", width: 8, height: 8, borderRadius: "50%",
              flexShrink: 0, display: "inline-block",
              background: "rgba(89,240,223,0.82)",
              boxShadow: "0 0 10px rgba(89,240,223,0.36)",
            }} />
          </Link>

          {/* Course link */}
          <Link href="/course" prefetch={false} style={{
            pointerEvents: "auto",
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(195,210,222,0.65)", fontFamily: sans,
            textDecoration: "none",
            padding: "7px 15px", borderRadius: 8,
            background: "rgba(8,13,22,0.52)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}>
            ← Overview
          </Link>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex", justifyContent: "flex-end",
          padding: "0 28px 28px",
        }}>
          {resumeHref && resumeHref !== "/course" && (
            <Link href={resumeHref} prefetch={false} style={{
              pointerEvents: "auto",
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "10px 22px", borderRadius: 11,
              fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
              fontFamily: sans, textDecoration: "none",
              background: "linear-gradient(148deg, rgba(234,228,214,0.97) 0%, rgba(212,206,192,0.93) 100%)",
              color: "#07111d",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 4px 22px rgba(0,0,0,0.44)",
            }}>
              Continue
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
