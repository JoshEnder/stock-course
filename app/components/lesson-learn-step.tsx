"use client";

import { useRef, useState } from "react";
import { learnContent, type LearnContent } from "../lib/course-data";
import { LessonActivity } from "./lesson-activity";

function capitalizeLead(value: string) {
  return value.replace(/^([a-z])/, (letter) => letter.toUpperCase());
}

type LegacyLessonLearnStepProps = {
  stepId: string;
  onContinue: () => void;
  content?: never;
};

type ModernLessonLearnStepProps = {
  content: LearnContent;
  onContinue: () => void;
  stepId?: never;
};

type LessonLearnStepProps =
  | LegacyLessonLearnStepProps
  | ModernLessonLearnStepProps;

const EMERALD = "var(--alpine-emerald)";
const CREAM = "var(--alpine-cream)";
const TEXT = "var(--alpine-text)";
const MUTED = "var(--alpine-text-secondary)";
const DIM = "var(--alpine-text-tertiary)";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

export function LessonLearnStep(props: LessonLearnStepProps) {
  const content = (
    "content" in props
      ? props.content
      : learnContent[props.stepId] ?? learnContent["1-1"]
  ) as LearnContent;

  const panels = content.panels?.length
    ? content.panels
    : [
        {
          id: "core",
          title: content.title,
          copy: content.explanation,
          eyebrow: "Learn",
          highlights: content.supportActivities,
          noteLabel: "What this means",
          note: content.whatThisMeans,
        },
      ];

  const [panelIndex, setPanelIndex] = useState(0);
  const [readyPanels, setReadyPanels] = useState<Record<string, boolean>>({});
  const panelBodyRef = useRef<HTMLDivElement>(null);
  const panel = panels[Math.min(panelIndex, panels.length - 1)];
  const hasInteractivePanel = Boolean(panel?.activityKind);
  const isPanelReady = readyPanels[panel?.id ?? ""] || !hasInteractivePanel;
  const isLastPanel = panelIndex === panels.length - 1;

  function handleAdvance() {
    if (isLastPanel) {
      props.onContinue();
      return;
    }
    setPanelIndex((current) => current + 1);
    requestAnimationFrame(() => {
      const el = panelBodyRef.current;
      if (!el) return;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "ha-slam-in 300ms cubic-bezier(0.22,1,0.36,1) both";
    });
  }

  return (
    <div style={{ fontFamily: sans }}>
      {/* Panel counter dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>
          {panel.eyebrow ?? "Learn"}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {panels.map((item, index) => (
            <span key={item.id} style={{
              width: index === panelIndex ? 20 : 8,
              height: 8,
              borderRadius: 99,
              background: index <= panelIndex ? EMERALD : "rgba(159,199,222,0.12)",
              transition: "all 300ms",
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={panelBodyRef} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "clamp(24px,3.8vw,38px)", fontFamily: serif, fontWeight: 600, color: CREAM, lineHeight: 1.12, letterSpacing: "-0.01em", marginBottom: 16 }}>
          {capitalizeLead(panel.title)}
        </h2>
        <p style={{ fontSize: "clamp(14px,2.5vw,17px)" as string, color: MUTED, lineHeight: 1.65 }}>{capitalizeLead(panel.copy)}</p>
      </div>

      {panel.activityKind ? (
        <div style={{ marginBottom: 20 }}>
          <LessonActivity
            key={panel.id}
            activityData={panel.activityData}
            activityKind={panel.activityKind}
            activityStartValue={panel.activityStartValue}
            onReadyChange={(ready) =>
              setReadyPanels((current) => {
                if (current[panel.id] === ready) return current;
                return { ...current, [panel.id]: ready };
              })
            }
          />
        </div>
      ) : null}

      {panel.highlights?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {panel.highlights.map((item) => (
            <span
              key={item}
              style={{
                background: "rgba(22,49,74,0.68)",
                border: "1px solid rgba(95,143,179,0.16)",
                borderRadius: 99,
                padding: "5px 13px",
                fontSize: 13,
                color: DIM,
                fontWeight: 500,
              }}
            >
              {capitalizeLead(item)}
            </span>
          ))}
        </div>
      ) : null}

      {panel.note ? (
        <div style={{ borderLeft: `2px solid ${EMERALD}`, paddingLeft: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: TEXT, marginBottom: 4 }}>{capitalizeLead(panel.noteLabel ?? "What this means")}</p>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{capitalizeLead(panel.note)}</p>
        </div>
      ) : null}

      {!content.panels?.length ? (
        <>
          <div style={{ borderLeft: `2px solid ${EMERALD}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 13, color: TEXT, marginBottom: 4 }}>What this means</p>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{capitalizeLead(content.whatThisMeans)}</p>
          </div>
          <div style={{ borderLeft: "2px solid rgba(239,68,68,0.4)", paddingLeft: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 13, color: TEXT, marginBottom: 4 }}>Common mistake</p>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{capitalizeLead(content.commonMistake)}</p>
          </div>
        </>
      ) : null}

      {/* Bottom CTA */}
      <div style={{ marginTop: 24 }}>
        <button
          disabled={!isPanelReady}
          onClick={handleAdvance}
          type="button"
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 14,
            fontFamily: sans,
            fontWeight: 500,
            letterSpacing: "0.01em",
            color: isPanelReady ? "#08111d" : "var(--alpine-text-dim)",
            background: isPanelReady
              ? "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)"
              : "rgba(22,49,74,0.68)",
            border: "none",
            borderRadius: 10,
            cursor: isPanelReady ? "pointer" : "not-allowed",
            transition: "all 200ms",
            boxShadow: isPanelReady
              ? "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)"
              : "none",
          }}
        >
          {isLastPanel ? "Start practice" : "Continue"}
        </button>
      </div>
    </div>
  );
}
