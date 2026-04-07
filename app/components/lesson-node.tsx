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
  allowFreeJump?: boolean;
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
  allowFreeJump = false,
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
  const effectiveState = allowFreeJump && state === "locked" ? "unlocked" : state;
  const [visible, setVisible] = useState(false);
  const [lockedNotice, setLockedNotice] = useState(false);
  const [transitionState, setTransitionState] = useState<
    "idle" | "complete" | "activate" | "locked-bump" | "boss-awaken"
  >("idle");
  const previousStateRef = useRef(effectiveState);
  const lockedTimeoutRef = useRef<number | null>(null);
  const interactive = effectiveState !== "locked";
  const sizeClass = isBoss
    ? effectiveState === "current" ? "h-24 w-24" : "h-[5.5rem] w-[5.5rem]"
    : effectiveState === "current" ? "h-20 w-20"
    : effectiveState === "locked"  ? "h-14 w-14"
    : "h-16 w-16";
  const motionClass =
    effectiveState === "completed"
      ? "completed"
      : effectiveState === "current"
        ? "current"
        : effectiveState === "locked"
          ? "locked"
          : isBoss
            ? "boss-ready"
            : "";
  const statusClass =
    effectiveState === "completed"
      ? "border-transparent bg-[linear-gradient(135deg,var(--alpine-emerald)_0%,var(--alpine-teal)_100%)] text-[#08111d] shadow-[0_18px_34px_rgba(39,211,195,0.24)]"
      : effectiveState === "current" && isBoss
        ? "border-[var(--alpine-cyan)] bg-[rgba(232,226,212,0.96)] text-[#08111d] shadow-[0_28px_52px_rgba(127,231,242,0.22)]"
        : effectiveState === "current"
          ? "border-[var(--alpine-cyan)] bg-[rgba(236,244,247,0.96)] text-[#08111d] shadow-[0_28px_52px_rgba(127,231,242,0.18)]"
          : effectiveState === "unlocked" && isBoss
            ? "border-[var(--alpine-border-strong)] bg-[rgba(22,49,74,0.86)] text-[var(--alpine-cream)] shadow-[0_14px_28px_rgba(3,10,20,0.22)]"
            : effectiveState === "unlocked"
              ? "border-[rgba(95,143,179,0.22)] bg-[rgba(22,49,74,0.8)] text-[var(--alpine-text-secondary)] shadow-[0_10px_22px_rgba(3,10,20,0.18)]"
              : "border-[rgba(95,143,179,0.14)] bg-[rgba(10,22,38,0.62)] text-[var(--alpine-text-dim)] shadow-none";

  useEffect(() => {
    const previousState = previousStateRef.current;

    if (previousState !== state) {
      if (previousState === "current" && effectiveState === "completed") {
        setTransitionState("complete");
      } else if (effectiveState === "current") {
        setTransitionState("activate");
      } else if (previousState === "locked" && effectiveState !== "locked") {
        setTransitionState(isBoss ? "boss-awaken" : "activate");
      }
    }

    previousStateRef.current = effectiveState;
  }, [effectiveState, isBoss, state]);

  useEffect(() => {
    if (effectiveState === "current" && sequenceKey > 0) {
      setTransitionState("activate");
    }
  }, [effectiveState, sequenceKey]);

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
        completed={effectiveState === "completed"}
        estimatedTime={estimatedTime}
        isBoss={isBoss}
        lessonNumber={lessonNumber}
        lockedNotice={lockedNotice}
        state={effectiveState}
        title={title}
        visible={visible}
      />
      <div className="relative flex flex-col items-center gap-2">
        {effectiveState === "current" ? (
          <span
            className={`course-node-pulse current-node-aura absolute ${sizeClass} rounded-full`}
            style={{ borderColor: isBoss ? "var(--alpine-cyan)" : "var(--alpine-cyan)" }}
          />
        ) : null}
        {effectiveState === "completed" ? (
          <span
            className={`lesson-node-ring absolute ${sizeClass} rounded-full border`}
            style={{ borderColor: `${accentColor}55` }}
          />
        ) : null}
        {isBoss && effectiveState !== "locked" ? (
          <span
            className={`boss-node-halo absolute ${sizeClass} rounded-full ${effectiveState === "current" ? "is-current" : ""}`}
            style={{ color: effectiveState === "completed" ? accentColor : "var(--alpine-cyan)" }}
          />
        ) : null}
        <div
          className={`lesson-node-shell ${motionClass} relative flex ${sizeClass} items-center justify-center rounded-full border-2 transition duration-200 ${
            interactive ? "interactive-cta interactive-node scale-100 hover:scale-[1.06]" : "interactive-node-locked"
          } ${statusClass}`}
          data-boss={isBoss}
          data-state={effectiveState}
          data-transition={transitionState}
          style={{
            borderColor:
              effectiveState === "current" && isBoss ? "var(--alpine-cyan)"
              : effectiveState === "current" ? "var(--alpine-cyan)"
              : isBoss && effectiveState === "unlocked" ? "var(--alpine-border-strong)"
              : isBoss && effectiveState !== "locked" ? "var(--alpine-cyan)"
              : undefined,
          }}
        >
          {effectiveState === "locked" ? (
            <LockIcon className="h-4 w-4" />
          ) : effectiveState === "completed" ? (
            <CheckCircleIcon className="h-8 w-8 reward-badge-glow" />
          ) : isBoss ? (
            <StarIcon
              className="h-8 w-8"
              style={{ color: "var(--alpine-cream)" }}
            />
          ) : effectiveState === "current" ? (
            <ChevronIcon className="h-9 w-9" style={{ color: "var(--alpine-emerald)" }} />
          ) : (
            <span className="text-[1.1rem] font-black">{lessonNumber}</span>
          )}
        </div>
        <span
          className={`text-[11px] font-black uppercase tracking-[0.14em] ${
            effectiveState === "locked" ? "text-[var(--alpine-text-dim)]" : "text-[var(--alpine-text-tertiary)]"
          }`}
          style={{ color: effectiveState === "locked" ? undefined : accentColor }}
        >
          {isBoss ? "Boss" : lessonNumber}
        </span>
      </div>
    </>
  );

  const positionedClass = `absolute ${effectiveState === "current" ? "roadmap-node-anchor is-current" : "roadmap-node-anchor"} ${
    effectiveState === "completed" ? "is-completed" : ""
  } ${effectiveState === "locked" ? "is-locked" : ""}`;
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
        href={allowFreeJump ? `${href}?qa=1` : href}
        intent="lesson"
        prefetch={false}
      >
        {shell}
      </JourneyLink>
    </div>
  );
}
