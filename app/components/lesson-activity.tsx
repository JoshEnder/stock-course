"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticeActivityKind } from "../lib/course-data";

type LessonActivityProps = {
  activityKind?: PracticeActivityKind;
  activityData?: Record<string, unknown>;
  activityStartValue?: number;
  onReadyChange?: (ready: boolean) => void;
};

type BucketCard = {
  id: string;
  label: string;
  description?: string;
  target?: string;
  points?: number[];
};

type StateCard = {
  id: string;
  label: string;
  detail?: string;
  support?: string;
  shares?: number;
  price?: number;
  earnings?: number;
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function numberOr(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function LessonActivity({
  activityKind,
  activityData,
  activityStartValue,
  onReadyChange,
}: LessonActivityProps) {
  const data = asObject(activityData);
  const [revealed, setRevealed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [sequence, setSequence] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [meterValue, setMeterValue] = useState(activityStartValue ?? 50);
  const lastReadyRef = useRef<boolean | null>(null);

  const buckets = asArray<string>(data.buckets);
  const cards = asArray<BucketCard>(data.cards);
  const states = asArray<StateCard>(data.states);
  const checklistItems = asArray<string>(data.items);
  const clues = asArray<{ title: string; detail?: string }>(data.clues);
  const candidates = asArray<{ id: string; label: string; top?: number; height?: number }>(
    data.candidates,
  );
  const labels = asArray<{ id: string; label: string; target?: string }>(data.labels);
  const steps = asArray<{ id: string; label: string; description?: string }>(data.steps);
  const orderedSteps = asArray<{ id: string; label: string }>(data.orderedSteps);
  const headlines = asArray<string>(data.headlines);
  const scenarios = asArray<string>(data.scenarios);
  const matches = asArray<{ clue: string; answer: string }>(data.matches);
  const evidenceCards = asArray<string>(data.evidence);

  // Two data patterns for sequence-lab:
  // Pattern A: `steps` is objects with proper `id` fields, `orderedSteps` is only slot labels.
  //            Correct order = steps order, options = steps items.
  // Pattern B: `steps` is strings or empty, `orderedSteps` has real IDs + labels.
  //            Correct order = orderedSteps order, options = orderedSteps items.
  const stepsHaveIds = steps.length > 0 && typeof (steps[0] as { id?: unknown }).id === "string";
  const sequenceItems = stepsHaveIds ? steps : orderedSteps;
  const sequenceTarget = useMemo(
    () => sequenceItems.map((step) => step.id),
    [sequenceItems],
  );

  const ready = useMemo(() => {
    switch (activityKind) {
      case "reveal-card":
        return revealed;
      case "bucket-sort":
        return cards.length > 0 && cards.every((card) => assignments[card.id] === card.target);
      case "sequence-lab":
        return (
          sequenceTarget.length > 0 &&
          sequence.length === sequenceTarget.length &&
          sequence.every((stepId, index) => stepId === sequenceTarget[index])
        );
      case "checklist":
        return checklistItems.length > 0 && checked.length === checklistItems.length;
      case "signal-stack":
      case "voice-ready":
      case "confidence-meter":
      case "chart-lab":
      case "zone-map":
      case "ownership-board":
      case "funding-simulator":
      case "return-builder":
      case "news-chart":
      case "market-cap-board":
      case "business-builder":
      case "ratio-builder":
        return Boolean(selectedId || checklistItems.length && checked.length || revealed);
      default:
        return true;
    }
  }, [
    activityKind,
    assignments,
    cards,
    checklistItems.length,
    checked.length,
    revealed,
    selectedId,
    sequence,
    sequenceTarget,
  ]);

  useEffect(() => {
    if (lastReadyRef.current === ready) {
      return;
    }
    lastReadyRef.current = ready;
    onReadyChange?.(ready);
  }, [onReadyChange, ready]);

  if (!activityKind) {
    return null;
  }

  if (activityKind === "reveal-card") {
    const statement = String(data.statement ?? "Open the card");
    const actionLabel = String(data.actionLabel ?? "Reveal");
    const revealTitle = String(data.revealTitle ?? "What it means");
    const revealCopy = String(data.revealCopy ?? "");
    const highlightText = String(data.highlightText ?? "");

    return (
      <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_100%)] p-6 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium leading-7 text-slate-600">{statement}</p>
        <div className="mt-5">
          {revealed ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {revealTitle}
              </p>
              <p className="mt-2 text-base leading-7 text-slate-800">
                {highlightText && revealCopy.includes(highlightText) ? (
                  <>
                    {revealCopy.split(highlightText)[0]}
                    <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-800">
                      {highlightText}
                    </span>
                    {revealCopy.split(highlightText).slice(1).join(highlightText)}
                  </>
                ) : (
                  revealCopy
                )}
              </p>
            </div>
          ) : (
            <button
              className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              onClick={() => setRevealed(true)}
              type="button"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activityKind === "bucket-sort") {
    return (
      <div className="space-y-4 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        {buckets.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {buckets.map((bucket) => (
              <div key={bucket} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {bucket}
                </p>
                <div className="mt-3 space-y-2">
                  {cards
                    .filter((card) => assignments[card.id] === bucket)
                    .map((card) => (
                      <div
                        key={card.id}
                        className="rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-slate-700"
                      >
                        {card.label}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-3">
          {cards.map((card) => (
            <div key={card.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{card.label}</p>
              {card.description ? (
                <p className="mt-1 text-sm text-slate-500">{card.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {buckets.map((bucket) => {
                  const active = assignments[card.id] === bucket;
                  return (
                    <button
                      key={bucket}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                      onClick={() =>
                        setAssignments((current) => ({
                          ...current,
                          [card.id]: bucket,
                        }))
                      }
                      type="button"
                    >
                      {bucket}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activityKind === "sequence-lab") {
    const sequenceOptions = [
      ...sequenceItems.map((step) => ({ id: step.id, label: step.label })),
      ...asArray<string>(data.distractors).map((item) => ({ id: item, label: item })),
    ];

    return (
      <div className="space-y-4 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ordered sequence
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {sequenceTarget.map((_, index) => (
              <button
                key={index}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-700"
                onClick={() => {
                  if (index === sequence.length - 1) {
                    setSequence((current) => current.slice(0, -1));
                  }
                }}
                type="button"
              >
                {sequence[index]
                  ? sequenceOptions.find((option) => option.id === sequence[index])?.label
                  : stepsHaveIds
                    ? (orderedSteps[index]?.label ?? `Step ${index + 1}`)
                    : `Step ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {sequenceOptions.map((option) => (
            <button
              key={option.id}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                sequence.includes(option.id)
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
              onClick={() => {
                if (!sequence.includes(option.id) && sequence.length < sequenceTarget.length) {
                  setSequence((current) => [...current, option.id]);
                }
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activityKind === "checklist") {
    return (
      <div className="space-y-3 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        {checklistItems.map((item) => {
          const active = checked.includes(item);
          return (
            <button
              key={item}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition ${
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
              onClick={() =>
                setChecked((current) =>
                  current.includes(item)
                    ? current.filter((entry) => entry !== item)
                    : [...current, item],
                )
              }
              type="button"
            >
              <span>{item}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                {active ? "Done" : "Tap"}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (activityKind === "ownership-board" && states.length) {
    const current = states.find((state) => state.id === selectedId) ?? states[0];
    const totalShares = numberOr(data.totalShares, 1000);
    const shares = numberOr(current?.shares, 1);
    const ownership = ((shares / totalShares) * 100).toFixed(shares === 1 ? 1 : 1);
    return (
      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {states.map((state) => (
            <button
              key={state.id}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                (selectedId ?? states[0]?.id) === state.id
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setSelectedId(state.id)}
              type="button"
            >
              {state.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="h-3 rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.max(Number(ownership), 0.1)}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat label="Owned shares" value={`${shares}`} />
            <Stat label="Ownership" value={`${ownership}%`} />
            <Stat label="Company left" value={`${(100 - Number(ownership)).toFixed(1)}%`} />
          </div>
          <p className="mt-4 text-sm text-slate-600">{current.detail ?? current.support}</p>
        </div>
      </div>
    );
  }

  if (activityKind === "zone-map" && candidates.length) {
    return (
      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          {candidates.map((candidate) => {
            const active = selectedId === candidate.id;
            return (
              <button
                key={candidate.id}
                className={`flex w-full items-center justify-between rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
                onClick={() => setSelectedId(candidate.id)}
                type="button"
              >
                <span>{candidate.label}</span>
                <span className="text-xs uppercase tracking-[0.18em]">
                  {active ? "Selected" : "Pick"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && String(data.variant ?? "") === "axes" && labels.length) {
    const assignmentsReady = labels.every((label) => assignments[label.id] === label.target);
    const axes = ["x-axis", "y-axis"];
    return (
      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="mx-auto h-44 max-w-md rounded-2xl border border-slate-200 bg-white p-5">
            <div className="relative h-full">
              <div className="absolute bottom-4 left-8 right-4 h-2 rounded-full bg-slate-200" />
              <div className="absolute bottom-4 left-8 top-4 w-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-x-16 bottom-12 top-10">
                <svg className="h-full w-full" viewBox="0 0 260 110" preserveAspectRatio="none">
                  <path
                    d="M20 80 L70 62 L120 68 L170 34 L230 16"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {labels.map((label) => (
            <div key={label.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{label.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {axes.map((axis) => (
                  <button
                    key={axis}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      assignments[label.id] === axis
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                    onClick={() =>
                      setAssignments((current) => ({
                        ...current,
                        [label.id]: axis,
                      }))
                    }
                    type="button"
                  >
                    {axis}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {assignmentsReady ? <input type="hidden" value="ready" readOnly /> : null}
      </div>
    );
  }

  if (
    activityKind === "signal-stack" ||
    activityKind === "voice-ready" ||
    activityKind === "confidence-meter"
  ) {
    const cardsToShow =
      clues.length > 0
        ? clues.map((clue) => ({ id: clue.title, label: clue.title, detail: clue.detail }))
        : evidenceCards.map((card) => ({ id: card, label: card, detail: "" }));

    return (
      <div className="space-y-3 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        {cardsToShow.map((card) => {
          const active = selectedId === card.id || checked.includes(card.id);
          return (
            <button
              key={card.id}
              className={`flex w-full items-start justify-between rounded-2xl border px-4 py-4 text-left transition ${
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => {
                setSelectedId(card.id);
                if (!checked.includes(card.id)) {
                  setChecked((current) => [...current, card.id]);
                }
              }}
              type="button"
            >
              <div>
                <p className="font-medium">{card.label}</p>
                {card.detail ? <p className="mt-1 text-sm text-slate-500">{card.detail}</p> : null}
              </div>
              <span className="text-xs uppercase tracking-[0.18em]">
                {active ? "Open" : "Review"}
              </span>
            </button>
          );
        })}
        {activityKind === "confidence-meter" ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <input
              className="w-full accent-emerald-600"
              max={100}
              min={0}
              onChange={(event) => {
                setMeterValue(Number(event.target.value));
                setSelectedId(`confidence-${event.target.value}`);
              }}
              type="range"
              value={meterValue}
            />
            <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (
    activityKind === "news-chart" ||
    activityKind === "funding-simulator" ||
    activityKind === "market-cap-board" ||
    activityKind === "business-builder" ||
    activityKind === "ratio-builder" ||
    activityKind === "return-builder" ||
    activityKind === "chart-lab"
  ) {
    const interactiveOptions =
      headlines.length > 0
        ? headlines
        : scenarios.length > 0
          ? scenarios
          : states.length > 0
            ? states.map((state) => state.label)
            : matches.length > 0
              ? matches.map((match) => match.clue)
              : ["Compare", "Switch", "Inspect"];

    return (
      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(data)
                .filter(([, value]) => typeof value === "number")
                .slice(0, 3)
                .map(([key, value]) => (
                  <Stat key={key} label={humanize(key)} value={String(value)} />
                ))}
            </div>
            <div className="mt-4 h-24 rounded-2xl bg-[linear-gradient(180deg,#f8fafc_0%,#eef6f1_100%)] p-4">
              <svg className="h-full w-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path
                  d="M10 76 L80 64 L140 70 L200 42 L290 26"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            {interactiveOptions.map((option) => {
              const active = selectedId === option;
              return (
                <button
                  key={option}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  onClick={() => setSelectedId(option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
      <button
        className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
        onClick={() => setSelectedId("done")}
        type="button"
      >
        Mark interaction complete
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function humanize(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
