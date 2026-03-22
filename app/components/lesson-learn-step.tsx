"use client";

import { useRef, useState } from "react";
import { learnContent, type LearnContent } from "../lib/course-data";
import { AlertCircleIcon, LightbulbIcon } from "./icons";
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
    // Slide-in the next panel body
    requestAnimationFrame(() => {
      const el = panelBodyRef.current;
      if (!el) return;
      el.style.animation = "none";
      // Force reflow so animation restarts
      void el.offsetWidth;
      el.style.animation = "ha-slam-in 300ms cubic-bezier(0.22,1,0.36,1) both";
    });
  }

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  return (
    <div style={{ fontFamily: font }}>
      {/* Panel counter dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#22c55e" }}>
          {panel.eyebrow ?? "Learn"}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {panels.map((item, index) => (
            <span key={item.id} style={{
              width: index === panelIndex ? 20 : 10,
              height: 10,
              borderRadius: 99,
              background: index <= panelIndex ? "#22c55e" : "#e5e7eb",
              transition: "all 300ms",
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={panelBodyRef} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "clamp(20px,3.5vw,36px)", fontWeight: 900, color: "#172b4d", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 12 }}>
          {capitalizeLead(panel.title)}
        </h2>
        <p style={{ fontSize: "clamp(14px,2.5vw,18px)" as string, color: "#4b5563", lineHeight: 1.55 }}>{capitalizeLead(panel.copy)}</p>
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
            <span key={item} style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 99, padding: "6px 14px", fontSize: 14, color: "#4b5563", fontWeight: 600 }}>
              {capitalizeLead(item)}
            </span>
          ))}
        </div>
      ) : null}

      {panel.note ? (
        <div style={{ background: "#f0fdf4", borderRadius: 16, padding: 12, marginBottom: 16, boxShadow: "inset 0 0 0 1px #bbf7d0" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <LightbulbIcon style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: "#172b4d", marginBottom: 4 }}>{capitalizeLead(panel.noteLabel ?? "What this means")}</p>
              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>{capitalizeLead(panel.note)}</p>
            </div>
          </div>
        </div>
      ) : null}

      {!content.panels?.length ? (
        <>
          <div style={{ background: "#f0fdf4", borderRadius: 16, padding: 12, marginBottom: 10, boxShadow: "inset 0 0 0 1px #bbf7d0" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <LightbulbIcon style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#172b4d", marginBottom: 4 }}>What this means</p>
                <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.5 }}>{capitalizeLead(content.whatThisMeans)}</p>
              </div>
            </div>
          </div>
          <div style={{ background: "#fff1f2", borderRadius: 16, padding: 12, marginBottom: 16, boxShadow: "inset 0 0 0 1px #fecdd3" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <AlertCircleIcon style={{ width: 20, height: 20, color: "#e11d48", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#172b4d", marginBottom: 4 }}>Common mistake</p>
                <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>{capitalizeLead(content.commonMistake)}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Bottom CTA */}
      <div style={{ marginTop: 20 }}>
        <button
          disabled={!isPanelReady}
          onClick={handleAdvance}
          type="button"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: 16,
            fontFamily: font,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#fff",
            background: isPanelReady ? "#22c55e" : "#d1d5db",
            boxShadow: isPanelReady ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3",
            border: "none",
            borderRadius: 16,
            cursor: isPanelReady ? "pointer" : "not-allowed",
            transition: "background 200ms",
          }}
          onMouseDown={(e) => {
            if (!isPanelReady) return;
            const el = e.currentTarget;
            el.style.transform = "translateY(3px)";
            el.style.boxShadow = "0 2px 0 #16a34a";
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget;
            el.style.transform = "";
            el.style.boxShadow = isPanelReady ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3";
          }}
        >
          {isLastPanel ? "Start practice →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
