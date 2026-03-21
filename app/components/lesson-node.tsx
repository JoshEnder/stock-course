"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  CircleIcon,
  LockIcon,
  StarIcon,
} from "./icons";
import { JourneyLink } from "./journey-link";
import { LessonTooltip } from "./lesson-tooltip";

type LessonNodeProps = {
  accentColor: string;
  estimatedTime: string;
  href: string;
  isBoss: boolean;
  lessonNumber: number;
  position: {
    x: number;
    y: number;
  };
  sequenceKey?: number;
  state: "locked" | "unlocked" | "current" | "completed";
  title: string;
};

export function LessonNode({
  accentColor,
  estimatedTime,
  href,
  isBoss,
  lessonNumber,
  position,
  sequenceKey = 0,
  state,
  title,
}: LessonNodeProps) {
  const ChevronIcon = ChevronRightIcon ?? CircleIcon;
  const [visible, setVisible] = useState(false);
  const [lockedNotice, setLockedNotice] = useState(false);
  const [transitionState, setTransitionState] = useState<
    "idle" | "complete" | "activate" | "locked-bump" | "boss-awaken"
  >("idle");
  const previousStateRef = useRef(state);
  const lockedTimeoutRef = useRef<number | null>(null);
  const interactive = state !== "locked";
  const sizeClass = isBoss ? "h-[5.5rem] w-[5.5rem]" : "h-[4.5rem] w-[4.5rem]";
  const motionClass =
    state === "completed"
      ? "completed"
      : state === "current"
        ? "current"
        : state === "locked"
          ? "locked"
          : isBoss
            ? "boss-ready"
            : "";
  const statusClass =
    state === "completed"
      ? "border-transparent bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_100%)] text-white shadow-[0_22px_36px_rgba(22,163,74,0.24)]"
      : state === "current"
        ? "border-white bg-white text-slate-950 shadow-[0_26px_40px_rgba(15,23,42,0.18)]"
        : state === "unlocked"
          ? "border-white/90 bg-white/95 text-slate-800 shadow-[0_18px_30px_rgba(15,23,42,0.12)]"
          : "border-slate-200 bg-slate-100 text-slate-400 shadow-none";

  useEffect(() => {
    const previousState = previousStateRef.current;

    if (previousState !== state) {
      if (previousState === "current" && state === "completed") {
        setTransitionState("complete");
      } else if (state === "current") {
        setTransitionState("activate");
      } else if (previousState === "locked" && state !== "locked") {
        setTransitionState(isBoss ? "boss-awaken" : "activate");
      }
    }

    previousStateRef.current = state;
  }, [isBoss, state]);

  useEffect(() => {
    if (state === "current" && sequenceKey > 0) {
      setTransitionState("activate");
    }
  }, [sequenceKey, state]);

  useEffect(() => {
    if (transitionState === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setTransitionState("idle");
    }, transitionState === "complete" ? 1180 : transitionState === "boss-awaken" ? 1120 : 980);

    return () => window.clearTimeout(timeout);
  }, [transitionState]);

  useEffect(() => {
    return () => {
      if (lockedTimeoutRef.current) {
        window.clearTimeout(lockedTimeoutRef.current);
      }
    };
  }, []);

  const handleLockedInteraction = () => {
    setVisible(true);
    setLockedNotice(true);
    setTransitionState("locked-bump");

    if (lockedTimeoutRef.current) {
      window.clearTimeout(lockedTimeoutRef.current);
    }

    lockedTimeoutRef.current = window.setTimeout(() => {
      setLockedNotice(false);
      setVisible(false);
      setTransitionState("idle");
    }, 1400);
  };

  const shell = (
    <>
      <LessonTooltip
        accentColor={accentColor}
        completed={state === "completed"}
        estimatedTime={estimatedTime}
        isBoss={isBoss}
        lessonNumber={lessonNumber}
        lockedNotice={lockedNotice}
        state={state}
        title={title}
        visible={visible}
      />
      <div className="relative flex flex-col items-center gap-2">
        {state === "current" ? (
          <span
            className={`course-node-pulse current-node-aura absolute ${sizeClass} rounded-full`}
            style={{ borderColor: accentColor }}
          />
        ) : null}
        {state === "completed" ? (
          <span
            className={`lesson-node-ring absolute ${sizeClass} rounded-full border`}
            style={{ borderColor: `${accentColor}55` }}
          />
        ) : null}
        {isBoss && state !== "locked" ? (
          <span
            className={`boss-node-halo absolute ${sizeClass} rounded-full ${state === "current" ? "is-current" : ""}`}
            style={{ color: accentColor }}
          />
        ) : null}
        <div
          className={`lesson-node-shell ${motionClass} relative flex ${sizeClass} items-center justify-center rounded-full border-2 transition duration-200 ${
            interactive ? "interactive-cta interactive-node scale-100 hover:scale-[1.06]" : "interactive-node-locked"
          } ${statusClass}`}
          data-boss={isBoss}
          data-state={state}
          data-transition={transitionState}
          style={{
            borderColor:
              state === "current" || (isBoss && state !== "locked") ? accentColor : undefined,
            boxShadow:
              state === "current"
                ? `0 24px 42px ${accentColor}33`
                : state === "unlocked" && isBoss
                  ? `0 22px 38px ${accentColor}28`
                  : undefined,
          }}
        >
          {state === "locked" ? (
            <LockIcon className="h-[1.15rem] w-[1.15rem]" />
          ) : state === "completed" ? (
            <CheckCircleIcon className="h-7 w-7 reward-badge-glow" />
          ) : isBoss ? (
            <StarIcon className="h-7 w-7" style={{ color: accentColor }} />
          ) : state === "current" ? (
                <ChevronIcon className="h-7 w-7" style={{ color: accentColor }} />
          ) : (
            <span className="text-[1.15rem] font-semibold">{lessonNumber}</span>
          )}
        </div>
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
            state === "locked" ? "text-slate-400" : "text-slate-500"
          }`}
          style={{ color: state === "locked" ? undefined : accentColor }}
        >
          {isBoss ? "Boss" : lessonNumber}
        </span>
      </div>
    </>
  );

  const positionedClass = `absolute ${state === "current" ? "roadmap-node-anchor is-current" : "roadmap-node-anchor"} ${
    state === "completed" ? "is-completed" : ""
  } ${state === "locked" ? "is-locked" : ""}`;
  const positionedStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: "translate(-50%, -50%)",
  } as const;

  if (!interactive) {
    return (
      <div
        className={positionedClass}
        style={positionedStyle}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => {
          setVisible(false);
          setLockedNotice(false);
        }}
      >
        <button
          aria-label={`${title} locked`}
          className="interactive-node block border-0 bg-transparent p-0"
          onClick={handleLockedInteraction}
          onFocus={() => setVisible(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleLockedInteraction();
            }
          }}
          type="button"
        >
          {shell}
        </button>
      </div>
    );
  }

  return (
    <div
      className={positionedClass}
      style={positionedStyle}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <JourneyLink
        aria-label={title}
        className="interactive-node block"
        href={href}
        intent="lesson"
        prefetch={false}
      >
        {shell}
      </JourneyLink>
    </div>
  );
}
