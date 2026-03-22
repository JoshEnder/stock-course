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
  amount?: string;
  outcome?: string;
};

type StateCard = {
  id: string;
  label: string;
  detail?: string;
  support?: string;
  source?: string;
  shares?: number;
  price?: number;
  earnings?: number;
  buy?: number;
  sell?: number;
  outcome?: string;
  amount?: string;
  explanation?: string;
};

type MatchCard = {
  clue: string;
  answer: string;
};

type MarkerCard = {
  id: string;
  badge?: string;
  label: string;
  index: number;
  tone?: "primary" | "secondary";
  timeLabel?: string;
  priceLabel?: string;
  detail?: string;
  support?: string;
};

type FadeFrame = {
  label: string;
  points: number[];
  meter?: string;
};

type SequenceOption = {
  id: string;
  label: string;
  description?: string;
  points?: number[];
};

type OrderedChecklistItem = {
  id: string;
  label: string;
  detail?: string;
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

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildSparklinePath(points: number[], width = 300, height = 140) {
  if (!points.length) {
    return "";
  }

  const paddingX = 18;
  const paddingY = 16;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  return points
    .map((point, index) => {
      const x = paddingX + (innerWidth * index) / Math.max(points.length - 1, 1);
      const y = paddingY + innerHeight - (clamp(point, 0, 100) / 100) * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getPointPosition(points: number[], index: number, width = 300, height = 140) {
  const paddingX = 18;
  const paddingY = 16;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const x = paddingX + (innerWidth * index) / Math.max(points.length - 1, 1);
  const y = paddingY + innerHeight - (clamp(points[index] ?? 0, 0, 100) / 100) * innerHeight;
  return { x, y };
}

function humanize(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function capitalizeLead(value: string) {
  return value.replace(/^([a-z])/, (letter) => letter.toUpperCase());
}

function bucketHint(bucket: string) {
  const normalized = bucket.toLowerCase();

  if (normalized.includes("chart")) return "Price behavior and structure";
  if (normalized.includes("business")) return "Company performance and fundamentals";
  if (normalized.includes("valuation")) return "Price compared with earnings or expectations";
  if (normalized.includes("growth")) return "Real business use or expansion";
  if (normalized.includes("false") || normalized.includes("promise")) return "Sounds certain or unrealistic";
  if (normalized.includes("stock")) return "Ownership and company shares";
  if (normalized.includes("bond")) return "Lending money for repayment";
  if (normalized.includes("savings")) return "Cash parked with low risk";
  if (normalized.includes("earlier")) return "Comes first in the flow";
  if (normalized.includes("later")) return "Happens after earlier steps";
  if (normalized.includes("gain")) return "Price finished above the starting point";
  if (normalized.includes("loss")) return "Price finished below the starting point";
  if (normalized.includes("break-even")) return "No price change from start to finish";
  if (normalized.includes("dividend")) return "Cash paid out by the company";
  if (normalized.includes("support")) return "Area where price may hold";
  if (normalized.includes("resistance")) return "Area where price may stall";
  return "Pick the lane that fits best";
}

function hashSeed(value: string) {
  return value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
}

function shuffleDeterministic<T>(items: T[], seedKey: string) {
  const output = [...items];
  let seed = hashSeed(seedKey);

  for (let index = output.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const swapIndex = seed % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

function outcomeTone(label?: string) {
  const normalized = (label ?? "").toLowerCase();
  if (normalized.includes("gain") || normalized.includes("up")) {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      color: "#16a34a",
      bg: "#ecfdf5",
    };
  }
  if (normalized.includes("loss") || normalized.includes("down")) {
    return {
      badge: "border-red-200 bg-red-50 text-red-700",
      color: "#dc2626",
      bg: "#fef2f2",
    };
  }
  if (normalized.includes("break-even") || normalized.includes("flat") || normalized.includes("unclear")) {
    return {
      badge: "border-slate-200 bg-slate-100 text-slate-700",
      color: "#64748b",
      bg: "#f8fafc",
    };
  }

  return {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    color: "#16a34a",
    bg: "#ecfdf5",
  };
}

function Sparkline({
  points,
  accent = "#16a34a",
  markers = [],
  activeMarkerId,
  candleMode = false,
}: {
  points: number[];
  accent?: string;
  markers?: MarkerCard[];
  activeMarkerId?: string | null;
  candleMode?: boolean;
}) {
  const width = 300;
  const height = 140;

  if (!points.length) {
    return null;
  }

  return (
    <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <path
        d={`M 18 ${height - 18} L ${width - 18} ${height - 18}`}
        fill="none"
        stroke="#d9e1eb"
        strokeDasharray="3 6"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
      <path
        d={buildSparklinePath(points, width, height)}
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      {candleMode
        ? points.map((point, index) => {
            const x = getPointPosition(points, index, width, height).x;
            const candleHeight = 18 + ((index % 3) * 5);
            const y = getPointPosition(points, index, width, height).y;
            return (
              <g key={`${index}-${point}`}>
                <line x1={x} x2={x} y1={y - candleHeight / 1.8} y2={y + candleHeight / 1.8} stroke="#64748b" strokeWidth="2" />
                <rect
                  x={x - 6}
                  y={y - candleHeight / 3}
                  width={12}
                  height={candleHeight * 0.66}
                  rx={4}
                  fill={index % 2 === 0 ? "#16a34a" : "#1e293b"}
                  opacity="0.88"
                />
              </g>
            );
          })
        : null}
      {markers.map((marker) => {
        const position = getPointPosition(points, marker.index, width, height);
        const isActive = marker.id === activeMarkerId;
        const tone = marker.tone === "secondary" ? "#3b82f6" : "#16a34a";
        return (
          <g key={marker.id}>
            <line
              x1={position.x}
              x2={position.x}
              y1={position.y}
              y2={height - 18}
              stroke={tone}
              strokeDasharray="4 4"
              strokeOpacity={isActive ? 0.9 : 0.35}
              strokeWidth={1.5}
            />
            <line
              x1={18}
              x2={position.x}
              y1={position.y}
              y2={position.y}
              stroke={tone}
              strokeDasharray="4 4"
              strokeOpacity={isActive ? 0.9 : 0.35}
              strokeWidth={1.5}
            />
            <circle
              cx={position.x}
              cy={position.y}
              fill="#fff"
              r={isActive ? 10 : 7}
              stroke={tone}
              strokeWidth={isActive ? 4 : 3}
            />
            {marker.badge ? (
              <g transform={`translate(${position.x - 10}, ${position.y - 34})`}>
                <rect width="20" height="20" rx="10" fill={tone} />
                <text
                  x="10"
                  y="13"
                  fill="#fff"
                  fontFamily="var(--font-dm-sans,'DM Sans',system-ui,sans-serif)"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {marker.badge}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function Stat({
  label,
  value,
  accent,
  surfaceClass,
}: {
  label: string;
  value: string;
  accent?: string;
  surfaceClass?: string;
}) {
  return (
    <div className={surfaceClass ?? "rounded-2xl bg-slate-50/80 p-3"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {capitalizeLead(label)}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900" style={accent ? { color: accent } : undefined}>
        {capitalizeLead(value)}
      </p>
    </div>
  );
}

function TagPill({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {children}
    </span>
  );
}

function OutcomeBadge({ label }: { label: string }) {
  const tone = outcomeTone(label);
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.badge}`}>
      {capitalizeLead(label)}
    </span>
  );
}

export function LessonActivity({
  activityKind,
  activityData,
  activityStartValue,
  onReadyChange,
}: LessonActivityProps) {
  const data = asObject(activityData);
  const variant = stringOr(data.variant, "");
  const [revealed, setRevealed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [sequence, setSequence] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [meterValue, setMeterValue] = useState(
    activityStartValue ?? numberOr(data.sell, numberOr(data.buy, 50)),
  );
  const lastReadyRef = useRef<boolean | null>(null);

  useEffect(() => {
    setRevealed(false);
    setSelectedId(null);
    setAssignments({});
    setSequence([]);
    setChecked([]);
    setMeterValue(activityStartValue ?? numberOr(data.sell, numberOr(data.buy, 50)));
    lastReadyRef.current = null;
  }, [activityKind, activityData, activityStartValue, data.buy, data.sell]);

  const buckets = asArray<string>(data.buckets);
  const cards = asArray<BucketCard>(data.cards);
  const states = asArray<StateCard>(data.states);
  const checklistItems = asArray<string>(data.items);
  const orderedChecklist = asArray<OrderedChecklistItem>(data.orderedItems);
  const clues = asArray<{ title: string; detail?: string }>(data.clues);
  const candidates = asArray<{ id: string; label: string; top?: number; height?: number }>(data.candidates);
  const labels = asArray<{ id: string; label: string; target?: string }>(data.labels);
  const steps = asArray<{ id: string; label: string; description?: string; points?: number[] }>(data.steps);
  const orderedSteps = asArray<{ id: string; label: string }>(data.orderedSteps);
  const headlines = asArray<string>(data.headlines);
  const scenarios = asArray<string>(data.scenarios);
  const galleryScenarios = asArray<StateCard>(data.scenarios);
  const returnCases = asArray<StateCard>(data.cases);
  const matches = asArray<MatchCard>(data.matches);
  const evidenceCards = asArray<string>(data.evidence);
  const markers = asArray<MarkerCard>(data.markers);
  const frames = asArray<FadeFrame>(data.frames);
  const checklist = asArray<string>(data.checklist);
  const chartPoints = asArray<number>(data.chartPoints);

  const stepsHaveIds = steps.length > 0 && typeof steps[0]?.id === "string";
  const sequenceItems = stepsHaveIds ? steps : orderedSteps;
  const sequenceTarget = useMemo(
    () => sequenceItems.map((step) => step.id),
    [sequenceItems],
  );
  const sequenceOptionDetails = useMemo(
    () =>
      sequenceItems.map((step) => ({
        id: step.id,
        label: step.label,
        description: "description" in step && typeof step.description === "string" ? step.description : undefined,
        points: "points" in step && Array.isArray(step.points) ? (step.points as number[]) : undefined,
      }) satisfies SequenceOption),
    [sequenceItems],
  );

  const derivedPointMarkers = useMemo(() => {
    if (markers.length) {
      return markers;
    }

    if (!chartPoints.length) {
      return [] as MarkerCard[];
    }

    const lowIndex = numberOr(data.lowIndex, 0);
    const highIndex = numberOr(data.highIndex, chartPoints.length - 1);
    const pointLabels = asArray<string>(data.points);

    return [
      {
        id: "marker-a",
        badge: "A",
        label: pointLabels[0] ?? "Lower point",
        index: clamp(lowIndex, 0, chartPoints.length - 1),
        tone: "secondary" as const,
        timeLabel: "Compare its time position",
        priceLabel: "Lower price",
        detail: "This point sits lower on the chart.",
        support: "Vertical height is the price clue.",
      },
      {
        id: "marker-b",
        badge: "B",
        label: pointLabels[1] ?? "Higher point",
        index: clamp(highIndex, 0, chartPoints.length - 1),
        tone: "primary" as const,
        timeLabel: "Compare its time position",
        priceLabel: "Higher price",
        detail: "This point sits higher on the chart.",
        support: "Higher on the chart usually means a higher price.",
      },
    ];
  }, [markers, chartPoints, data.lowIndex, data.highIndex, data.points]);

  const axesReady = labels.length > 0 && labels.every((label) => assignments[label.id] === label.target);
  const checklistReady =
    orderedChecklist.length > 0
      ? checked.length === orderedChecklist.length
      : checklistItems.length > 0 && checked.length === checklistItems.length;
  const walkthroughReady = checklist.length > 0 && checked.length === checklist.length;
  const trendClinicReady = clues.length > 0 && checked.length === clues.length;
  const highLowReady = checked.includes("peak") && checked.includes("low");
  const initialMeter = activityStartValue ?? numberOr(data.sell, numberOr(data.buy, 50));

  const ready = useMemo(() => {
    switch (activityKind) {
      case "reveal-card":
        return revealed;
      case "tap-sort":
      case "bucket-sort":
        return cards.length > 0 && cards.every((card) => assignments[card.id] === card.target);
      case "sequence-lab":
        return (
          sequenceTarget.length > 0 &&
          sequence.length === sequenceTarget.length &&
          sequence.every((stepId, index) => stepId === sequenceTarget[index])
        );
      case "checklist":
        return checklistReady;
      case "ownership-board":
        return Boolean(selectedId);
      case "funding-simulator":
        return meterValue !== initialMeter;
      case "news-chart":
        return Boolean(selectedId);
      case "return-builder":
        if (variant === "gain-loss") {
          return meterValue !== initialMeter;
        }
        return Boolean(selectedId);
      case "chart-lab":
        if (variant === "axes") return axesReady;
        if (variant === "high-low") return highLowReady;
        if (variant === "boss-walkthrough") return walkthroughReady;
        if (variant === "trend-clinic") return trendClinicReady;
        return Boolean(selectedId);
      case "signal-stack":
      case "voice-ready":
      case "confidence-meter":
        return Boolean(selectedId || checked.length || revealed || meterValue !== initialMeter);
      default:
        return true;
    }
  }, [
    activityKind,
    axesReady,
    cards,
    assignments,
    sequenceTarget,
    sequence,
    checklistReady,
    selectedId,
    revealed,
    meterValue,
    initialMeter,
    variant,
    highLowReady,
    walkthroughReady,
    trendClinicReady,
    checked.length,
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
    const statement = capitalizeLead(stringOr(data.statement, "Open the card"));
    const actionLabel = capitalizeLead(stringOr(data.actionLabel, "Reveal"));
    const revealTitle = capitalizeLead(stringOr(data.revealTitle, "What it means"));
    const revealCopy = capitalizeLead(stringOr(data.revealCopy, ""));
    const highlightText = stringOr(data.highlightText, "");

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_100%)] p-6 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <p className="text-base leading-7 text-slate-700">{statement}</p>
        <div className="mt-5">
          {revealed ? (
            <div className="rounded-2xl bg-emerald-50/80 p-5 shadow-[inset_0_0_0_1px_rgba(134,239,172,0.95)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {revealTitle}
                </p>
                <TagPill active>Got it</TagPill>
              </div>
              <p className="text-base leading-7 text-slate-800">
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

  if (activityKind === "ownership-board" && states.length) {
    const current = states.find((state) => state.id === selectedId) ?? states[0];
    const totalShares = numberOr(data.totalShares, 1000);
    const shares = numberOr(current.shares, 1);
    const ownershipValue = (shares / totalShares) * 100;
    const ownership = ownershipValue.toFixed(2).replace(/\.00$/, "");
    const companyLeft = (100 - ownershipValue).toFixed(2).replace(/\.00$/, "");
    const pieLabel = ownershipValue < 0.1 ? "Tiny slice" : `${ownership}%`;

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {states.map((state) => {
            const active = (selectedId ?? states[0]?.id) === state.id;
            return (
              <button
                key={state.id}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-[0_8px_20px_rgba(34,197,94,0.14)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setSelectedId(state.id)}
                type="button"
              >
                {capitalizeLead(state.label)}
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-5">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div
                  className="relative h-[196px] w-[196px] rounded-full border border-slate-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
                  style={{
                    background: `conic-gradient(#16a34a 0 ${ownershipValue}%, #dbe4f0 ${ownershipValue}% 100%)`,
                  }}
                >
                  <div className="absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white/96 text-center shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                    <p className="text-[30px] font-semibold leading-none text-slate-900">{pieLabel}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      owned
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Your slice
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    Rest of company
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Example company: {totalShares.toLocaleString()} total shares
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              <Stat label="Owned shares" value={`${shares}`} accent="#16a34a" />
              <Stat label="Ownership" value={`${ownership}%`} accent="#16a34a" />
              <Stat label="Company left" value={`${companyLeft}%`} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">{capitalizeLead(current.detail ?? current.support ?? "")}</p>
              {current.support ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{capitalizeLead(current.support)}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "funding-simulator") {
    const sold = clamp(Math.round(meterValue), 10, 90);
    const kept = 100 - sold;
    const raiseTone = sold >= 70 ? "Higher" : sold >= 40 ? "Balanced" : "Lower";

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <TagPill active>Capital raised</TagPill>
            <TagPill>Ownership kept</TagPill>
          </div>
          <input
            className="mt-5 w-full accent-emerald-600"
            max={90}
            min={10}
            onChange={(event) => setMeterValue(Number(event.target.value))}
            type="range"
            value={sold}
          />
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
              <div className="mx-auto flex w-full max-w-[220px] flex-col items-center">
                <div
                  className="relative h-44 w-44 rounded-full"
                  style={{
                    background: `conic-gradient(#16a34a 0 ${sold}%, #334155 ${sold}% 100%)`,
                  }}
                >
                  <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                    <p className="text-3xl font-semibold text-slate-900">{kept}%</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      kept
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid w-full gap-2">
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      New investors
                    </span>
                    <span className="text-sm font-semibold text-emerald-800">{sold}%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Original owners
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{kept}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Stat label="Ownership sold" value={`${sold}%`} accent="#16a34a" />
                <Stat label="Ownership kept" value={`${kept}%`} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>Capital raised</span>
                  <span>{raiseTone}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${sold}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  More ownership sold usually means more cash for growth. The tradeoff is a smaller slice kept by the original owners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "tap-sort") {
    const solvedCards = cards.filter((card) => assignments[card.id] === card.target);
    const currentCard =
      cards.find((card) => assignments[card.id] !== card.target) ?? cards[cards.length - 1];
    const activeAttempt = currentCard && selectedId?.startsWith(`${currentCard.id}::`)
      ? selectedId.split("::")[1]
      : null;
    const bucketChoices = currentCard
      ? shuffleDeterministic(buckets, `${currentCard.id}:${currentCard.label}`)
      : buckets;

    function chooseBucket(bucket: string) {
      if (!currentCard) {
        return;
      }

      if (bucket === currentCard.target) {
        setAssignments((current) => ({
          ...current,
          [currentCard.id]: bucket,
        }));
        setSelectedId(null);
        return;
      }

      setSelectedId(`${currentCard.id}::${bucket}`);
    }

    return (
      <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Card {Math.min(solvedCards.length + 1, Math.max(cards.length, 1))} / {cards.length}
          </p>
          <TagPill active>{solvedCards.length} solved</TagPill>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${cards.length ? (solvedCards.length / cards.length) * 100 : 0}%` }}
          />
        </div>

        {ready ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
              Nice. You sorted every card by the stronger read.
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {cards.map((card) => (
                <div key={card.id} className="rounded-2xl bg-slate-50/70 p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{capitalizeLead(card.label)}</p>
                      {card.description ? (
                        <p className="mt-1 text-sm leading-6 text-slate-500">{capitalizeLead(card.description)}</p>
                      ) : null}
                    </div>
                    {assignments[card.id] ? <TagPill active>{assignments[card.id]}</TagPill> : null}
                  </div>
                  {card.points?.length ? (
                    <div className="mt-3 h-20 rounded-xl bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-2">
                      <Sparkline points={card.points} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : currentCard ? (
          <div className="space-y-4 rounded-[1.5rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current clue
                  </p>
                  <TagPill active>{solvedCards.length + 1} / {cards.length}</TagPill>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{capitalizeLead(currentCard.label)}</p>
                {currentCard.description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{capitalizeLead(currentCard.description)}</p>
                ) : null}
                {currentCard.points?.length ? (
                  <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-3">
                    <Sparkline points={currentCard.points} />
                  </div>
                ) : null}
                <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Mission
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Put this clue in the strongest lane, then keep the streak going.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {bucketChoices.map((bucket) => {
                  const selectedWrong = activeAttempt === bucket && bucket !== currentCard.target;
                  return (
                    <button
                      key={bucket}
                      className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        selectedWrong
                          ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                      onClick={() => chooseBucket(bucket)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{capitalizeLead(bucket)}</p>
                          <p className={`mt-1 text-xs leading-5 ${selectedWrong ? "text-red-700" : "text-slate-500"}`}>
                            {bucketHint(bucket)}
                          </p>
                        </div>
                        <TagPill active={!selectedWrong}>{selectedWrong ? "Try again" : "Choose"}</TagPill>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {activeAttempt ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
                Not this lane. Compare the clue against the bucket hints and try again.
              </div>
            ) : (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                One strong read at a time.
              </p>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  if (activityKind === "bucket-sort") {
    const unassignedCards = cards.filter((card) => !assignments[card.id]);
    const allAssigned = cards.length > 0 && unassignedCards.length === 0;
    const sortedCorrectly =
      cards.length > 0 && cards.every((card) => assignments[card.id] === card.target);
    const currentCard =
      cards.find((card) => !assignments[card.id]) ??
      (allAssigned && !sortedCorrectly ? cards.find((card) => assignments[card.id] !== card.target) : undefined);
    const bucketChoices = currentCard
      ? shuffleDeterministic(buckets, `${currentCard.id}:${currentCard.label}:bucket`)
      : buckets;

    function setCardBucket(cardId: string, bucket?: string) {
      setAssignments((current) => {
        if (!bucket) {
          const next = { ...current };
          delete next[cardId];
          return next;
        }

        return {
          ...current,
          [cardId]: bucket,
        };
      });
    }

    function renderBucketCard(card: BucketCard, placed = false) {
      return (
        <div
          key={card.id}
          className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
                      <p className="font-medium text-slate-900">{capitalizeLead(card.label)}</p>
              {card.description ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">{card.description}</p>
              ) : null}
            </div>
            {card.amount ? <OutcomeBadge label={card.amount} /> : null}
            {card.outcome ? <OutcomeBadge label={card.outcome} /> : null}
          </div>
          {card.points?.length ? (
            <div className="mt-3 h-24 rounded-2xl bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-3">
              <Sparkline points={card.points} />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {buckets.map((bucket) => {
              const active = assignments[card.id] === bucket;
              return (
                <button
                  key={bucket}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() => setCardBucket(card.id, bucket)}
                  type="button"
                >
                  {capitalizeLead(bucket)}
                </button>
              );
            })}
            {placed ? (
              <button
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                onClick={() => setCardBucket(card.id)}
                type="button"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {allAssigned ? "Review your full sort" : `Card ${cards.length - unassignedCards.length + 1} / ${cards.length}`}
          </p>
          <TagPill active>{cards.length - unassignedCards.length} placed</TagPill>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${cards.length ? ((cards.length - unassignedCards.length) / cards.length) * 100 : 0}%` }}
          />
        </div>

        {!allAssigned && currentCard ? (
          <div className="grid gap-4 rounded-[1.5rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sort this clue
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{capitalizeLead(currentCard.label)}</p>
              {currentCard.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{capitalizeLead(currentCard.description)}</p>
              ) : null}
              {currentCard.points?.length ? (
                <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-3">
                  <Sparkline points={currentCard.points} />
                </div>
              ) : null}
            </div>
            <div className="space-y-3">
              {bucketChoices.map((bucket) => (
                <button
                  key={bucket}
                  className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                    assignments[currentCard.id] === bucket
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                  onClick={() => setCardBucket(currentCard.id, bucket)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{capitalizeLead(bucket)}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{bucketHint(bucket)}</p>
                    </div>
                    <TagPill active={assignments[currentCard.id] === bucket}>Choose</TagPill>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {allAssigned ? (
          <>
            <div className={`rounded-2xl border px-4 py-3 text-sm ${sortedCorrectly ? "border-emerald-200 bg-emerald-50/80 text-emerald-900" : "border-amber-200 bg-amber-50/80 text-amber-900"}`}>
              {sortedCorrectly
                ? "Everything is sorted. Scan the full board, then continue."
                : "Not quite. Reassign any clue from the review board until the whole sort makes sense."}
            </div>
            {buckets.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {buckets.map((bucket) => (
                  <div key={bucket} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {capitalizeLead(bucket)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{bucketHint(bucket)}</p>
                      </div>
                      <TagPill active={cards.some((card) => assignments[card.id] === bucket)}>
                        {cards.filter((card) => assignments[card.id] === bucket).length}
                      </TagPill>
                    </div>
                    <div className="mt-3 space-y-2">
                      {cards
                        .filter((card) => assignments[card.id] === bucket)
                        .map((card) => renderBucketCard(card, true))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  if (activityKind === "sequence-lab") {
    const sourceOptions: SequenceOption[] = [
      ...sequenceOptionDetails,
      ...asArray<string>(data.distractors).map((item) => ({ id: item, label: item })),
    ];
    const seedKey = sourceOptions.map((option) => option.id).join("|");
    const shuffledOptions = shuffleDeterministic(sourceOptions, seedKey);
    const inOriginalOrder = sourceOptions.every((option, index) => option.id === shuffledOptions[index]?.id);
    const sequenceOptions =
      inOriginalOrder && shuffledOptions.length > 1
        ? [...shuffledOptions.slice(1), shuffledOptions[0]]
        : shuffledOptions;

    return (
      <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.5rem] bg-slate-50/80 p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Ordered sequence
            </p>
            {sequence.length > 0 ? (
              <button
                className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                onClick={() => setSequence((current) => current.slice(0, -1))}
                type="button"
              >
                Undo
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {sequenceTarget.map((stepId, index) => {
              const selectedStepId = sequence[index];
              const selectedStep = sequenceOptions.find((option) => option.id === selectedStepId);
              const slotLabel = stepsHaveIds
                ? orderedSteps[index]?.label ?? `Step ${index + 1}`
                : `Step ${index + 1}`;

              return (
                <div key={stepId} className="rounded-2xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {capitalizeLead(slotLabel)}
                  </p>
                  <p className={`mt-2 text-sm font-semibold ${selectedStep ? "text-slate-900" : "text-slate-400"}`}>
                    {capitalizeLead(selectedStep?.label ?? "Choose a step")}
                  </p>
                  {selectedStep?.description ? (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {capitalizeLead(selectedStep.description)}
                    </p>
                  ) : null}
                  {selectedStep?.points?.length ? (
                    <div className="mt-3 h-20 rounded-xl bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-2">
                      <Sparkline points={selectedStep.points} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {sequenceOptions
            .filter((option) => !sequence.includes(option.id))
            .map((option) => (
              <button
                key={option.id}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-4 text-left shadow-[0_12px_26px_rgba(15,23,42,0.04)] transition hover:border-slate-300"
                onClick={() => {
                  if (sequence.length < sequenceTarget.length) {
                    setSequence((current) => [...current, option.id]);
                  }
                }}
                type="button"
              >
                {option.points?.length ? (
                  <div className="h-20 rounded-xl bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f7f4_100%)] p-2">
                    <Sparkline points={option.points} />
                  </div>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-slate-900">{capitalizeLead(option.label)}</p>
                {option.description ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {capitalizeLead(option.description)}
                  </p>
                ) : null}
              </button>
            ))}
        </div>
      </div>
    );
  }

  if (activityKind === "checklist") {
    if (orderedChecklist.length) {
      const currentIndex = checked.length;
      const currentItem = orderedChecklist[currentIndex];
      const remainingOptions = orderedChecklist.filter((item) => !checked.includes(item.id));
      const choiceOptions = shuffleDeterministic(
        remainingOptions,
        `${currentIndex}:${orderedChecklist.map((item) => item.id).join("|")}`,
      );
      const wrongAttempt = selectedId?.startsWith("wrong:") ? selectedId.replace("wrong:", "") : null;

      return (
        <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Workflow progress
            </p>
            <TagPill active>{checked.length} / {orderedChecklist.length}</TagPill>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {orderedChecklist.map((item, index) => {
              const done = checked.includes(item.id);
              const active = index === currentIndex;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border px-3 py-3 text-center text-sm transition ${
                    done
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : active
                        ? "border-slate-300 bg-slate-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 font-semibold">
                    {done ? capitalizeLead(item.label) : active ? "Pick next" : "Locked"}
                  </p>
                </div>
              );
            })}
          </div>

          {currentItem ? (
            <div className="grid gap-4 rounded-[1.5rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  What comes next?
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {currentIndex === 0 ? "Start the careful process." : "Keep the process in order."}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Build the beginner workflow one move at a time so the sequence feels automatic.
                </p>
                {currentItem.detail ? (
                  <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Clue
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      The next move should match this job in the process.
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="space-y-3">
                {choiceOptions.map((item) => {
                  const isWrong = wrongAttempt === item.id && item.id !== currentItem.id;
                  return (
                    <button
                      key={item.id}
                      className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        isWrong
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                      onClick={() => {
                        if (item.id === currentItem.id) {
                          setChecked((current) => [...current, item.id]);
                          setSelectedId(null);
                          return;
                        }
                        setSelectedId(`wrong:${item.id}`);
                      }}
                      type="button"
                    >
                      <p className="text-sm font-semibold text-slate-900">{capitalizeLead(item.label)}</p>
                      {item.detail ? (
                        <p className={`mt-2 text-xs leading-5 ${isWrong ? "text-red-700" : "text-slate-500"}`}>
                          {capitalizeLead(item.detail)}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
                {wrongAttempt ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
                    Not that one yet. Start with the evidence before you move into interpretation.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
              Nice. That is the full careful workflow from observation to interpretation.
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
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
              <span>{capitalizeLead(item)}</span>
              <TagPill active={active}>{active ? "Done" : "Tap"}</TagPill>
            </button>
          );
        })}
      </div>
    );
  }

  if (activityKind === "zone-map" && candidates.length) {
    const activeCandidate = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];
    const hasChartZones = variant === "chart-zones" && chartPoints.length > 0;

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        {hasChartZones ? (
          <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-4">
            <div className="rounded-[1.2rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              <div className="relative h-64 overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] px-4 py-3">
                {candidates.map((candidate) => {
                  const active = candidate.id === activeCandidate?.id;
                  const top = numberOr(candidate.top, 0);
                  const height = numberOr(candidate.height, 20);

                  return (
                    <button
                      key={candidate.id}
                      className={`absolute left-3 right-3 rounded-[1.2rem] border text-left transition ${
                        active
                          ? "border-emerald-400 bg-emerald-100/80 shadow-[0_10px_24px_rgba(34,197,94,0.14)]"
                          : "border-slate-300/90 bg-white/75 hover:border-slate-400"
                      }`}
                      onClick={() => setSelectedId(candidate.id)}
                      style={{ top, height }}
                      type="button"
                    >
                      <div className="flex h-full items-center justify-between gap-3 px-4">
                        <span className={`text-sm font-semibold ${active ? "text-emerald-900" : "text-slate-700"}`}>
                          {capitalizeLead(candidate.label)}
                        </span>
                        <TagPill active={active}>{active ? "Selected" : "Pick"}</TagPill>
                      </div>
                    </button>
                  );
                })}
                <div className="absolute inset-x-8 top-6 bottom-6">
                  <Sparkline accent="#16a34a" points={chartPoints} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {candidates.map((candidate) => {
                const active = candidate.id === activeCandidate?.id;
                return (
                  <button
                    key={candidate.id}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedId(candidate.id)}
                    type="button"
                  >
                    {capitalizeLead(candidate.label)}
                  </button>
                );
              })}
            </div>
            {activeCandidate ? (
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Selected zone
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {capitalizeLead(activeCandidate.label)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose the area that best matches where price repeatedly reacted on the chart.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-4">
            {candidates.map((candidate) => {
              const active = candidate.id === activeCandidate?.id;
              return (
                <button
                  key={candidate.id}
                  className={`flex w-full items-center justify-between rounded-full border px-4 py-2.5 text-sm transition ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                  onClick={() => setSelectedId(candidate.id)}
                  type="button"
                >
                  <span>{capitalizeLead(candidate.label)}</span>
                  <TagPill active={active}>{active ? "Selected" : "Pick"}</TagPill>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "axes" && labels.length) {
    const axes = [
      { id: "x-axis", label: "Time → x-axis" },
      { id: "y-axis", label: "Price → y-axis" },
    ];
    const timeChoice = assignments.time;
    const priceChoice = assignments.price;
    const xShowsTime = timeChoice === "x-axis";
    const xShowsPrice = priceChoice === "x-axis";
    const yShowsPrice = priceChoice === "y-axis";
    const yShowsTime = timeChoice === "y-axis";
    const xAxisTone = xShowsTime
      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-[0_8px_18px_rgba(34,197,94,0.12)]"
      : xShowsPrice
        ? "bg-red-50 border-red-300 text-red-700 shadow-[0_8px_18px_rgba(239,68,68,0.1)]"
        : "bg-white border-slate-200 text-slate-500";
    const yAxisTone = yShowsPrice
      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-[0_8px_18px_rgba(34,197,94,0.12)]"
      : yShowsTime
        ? "bg-red-50 border-red-300 text-red-700 shadow-[0_8px_18px_rgba(239,68,68,0.1)]"
        : "bg-white border-slate-200 text-slate-500";
    const xAxisLabel = xShowsTime ? "Time" : xShowsPrice ? "Price" : "Horizontal axis";
    const yAxisLabel = yShowsPrice ? "Price" : yShowsTime ? "Time" : "Vertical axis";
    const guideText =
      xShowsTime && yShowsPrice
        ? "Nice. Time runs across the chart and price runs vertically."
        : xShowsPrice || yShowsTime
          ? "Swap them. Time belongs on the horizontal axis and price belongs on the vertical axis."
          : "Tap the labels to map time across and price up-and-down.";

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-5">
            <div className="relative mx-auto h-52 max-w-lg rounded-[1.2rem] bg-white px-6 py-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
              <div className={`absolute bottom-8 left-10 right-6 h-1.5 rounded-full transition-all ${xShowsTime ? "bg-emerald-500" : xShowsPrice ? "bg-red-400" : "bg-slate-200"}`} />
              <div className={`absolute bottom-8 left-10 top-5 w-1.5 rounded-full transition-all ${yShowsPrice ? "bg-emerald-500" : yShowsTime ? "bg-red-400" : "bg-slate-200"}`} />
              <div className="absolute inset-x-16 bottom-14 top-8">
                <Sparkline points={[24, 34, 31, 48, 58, 72]} />
              </div>
              <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all ${xAxisTone}`}>
                {xAxisLabel}
              </div>
              <div className={`absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all ${yAxisTone}`}>
                {yAxisLabel}
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                What the chart is showing
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{guideText}</p>
            </div>
          </div>
          <div className="space-y-3">
            {labels.map((label) => (
              <div key={label.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{label.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {axes.map((axis) => {
                    const active = assignments[label.id] === axis.id;
                    return (
                      <button
                        key={axis.id}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                        onClick={() =>
                          setAssignments((current) => ({
                            ...current,
                            [label.id]: axis.id,
                          }))
                        }
                        type="button"
                      >
                        {axis.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {axesReady ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                Nice. Time runs across the chart, and price runs up and down.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "point-compare" && chartPoints.length) {
    const currentMarkers = derivedPointMarkers;
    const activeMarker = currentMarkers.find((marker) => marker.id === selectedId) ?? currentMarkers[0];
    const activeTone = activeMarker.tone === "secondary" ? "#3b82f6" : "#16a34a";

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-64 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline
              activeMarkerId={activeMarker?.id}
              markers={currentMarkers}
              points={chartPoints}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {currentMarkers.map((marker) => {
            const active = marker.id === activeMarker?.id;
            return (
              <button
                key={marker.id}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setSelectedId(marker.id)}
                type="button"
              >
                {marker.badge ? `${marker.badge} · ` : null}
                {marker.label}
              </button>
            );
          })}
        </div>
        {activeMarker ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {activeMarker.timeLabel ? <TagPill active>{activeMarker.timeLabel}</TagPill> : null}
              {activeMarker.priceLabel ? (
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{
                    borderColor: `${activeTone}33`,
                    background: `${activeTone}12`,
                    color: activeTone,
                  }}
                >
                  {activeMarker.priceLabel}
                </span>
              ) : null}
            </div>
            {activeMarker.detail ? (
              <p className="mt-3 text-sm font-semibold text-slate-900">{activeMarker.detail}</p>
            ) : null}
            {activeMarker.support ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{activeMarker.support}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "trace-path" && chartPoints.length) {
    const summaryChoices = asArray<string>(data.summaryChoices);
    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-52 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline points={chartPoints} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Trace the path from left to right first, then choose the best broad summary.
          </p>
        </div>
        {summaryChoices.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {summaryChoices.map((choice) => (
              <button
                key={choice}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  selectedId === choice
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setSelectedId(choice)}
                type="button"
              >
                {choice}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "high-low" && chartPoints.length) {
    const peakIndex = chartPoints.reduce((best, value, index, array) => (value > array[best] ? index : best), 0);
    const lowIndex = chartPoints.reduce((best, value, index, array) => (value < array[best] ? index : best), 0);
    const markersForRange: MarkerCard[] = [
      { id: "peak-marker", badge: "H", label: "Peak", index: peakIndex, tone: "primary" },
      { id: "low-marker", badge: "L", label: "Low", index: lowIndex, tone: "secondary" },
    ];

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-56 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline
              activeMarkerId={checked.includes("peak") ? "peak-marker" : checked.includes("low") ? "low-marker" : undefined}
              markers={markersForRange.filter((marker) =>
                marker.id === "peak-marker" ? checked.includes("peak") : checked.includes("low"),
              )}
              points={chartPoints}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              checked.includes("peak")
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() =>
              setChecked((current) => (current.includes("peak") ? current : [...current, "peak"]))
            }
            type="button"
          >
            <p className="text-sm font-semibold">Mark peak</p>
            <p className="mt-1 text-sm text-slate-500">Highest visible point on the screen.</p>
          </button>
          <button
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              checked.includes("low")
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() =>
              setChecked((current) => (current.includes("low") ? current : [...current, "low"]))
            }
            type="button"
          >
            <p className="text-sm font-semibold">Mark low</p>
            <p className="mt-1 text-sm text-slate-500">Lowest visible point on the screen.</p>
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Stat label="Peak price" value={`${chartPoints[peakIndex]}`} accent="#16a34a" />
          <Stat label="Low price" value={`${chartPoints[lowIndex]}`} accent="#3b82f6" />
          <Stat label="Visible range" value={`${chartPoints[peakIndex] - chartPoints[lowIndex]}`} />
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "toggle-view") {
    const activeView = selectedId ?? "line";
    const useCandles = activeView === "candles";
    const purposeCards = matches.length
      ? matches
      : [
          { clue: "Simpler overview", answer: "Line chart" },
          { clue: "More detailed session info", answer: "Candlestick chart" },
        ];

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "line", label: stringOr(data.leftLabel, "Line chart") },
            { id: "candles", label: stringOr(data.rightLabel, "Candlestick chart") },
          ].map((view) => (
            <button
              key={view.id}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeView === view.id
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setSelectedId(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-56 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline
              candleMode={useCandles}
              points={[22, 34, 30, 46, 40, 54, 48, 68]}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {purposeCards.map((match) => (
            <div key={match.clue} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{capitalizeLead(match.clue)}</p>
              <p className="mt-2 text-sm text-slate-600">{match.answer}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "noise-toggle") {
    const activeView = selectedId ?? "noisy";
    const points = activeView === "clean" ? asArray<number>(data.smoothPoints) : asArray<number>(data.noisyPoints);

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "noisy", label: "Noisy view" },
            { id: "clean", label: "Cleaner view" },
          ].map((view) => (
            <button
              key={view.id}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeView === view.id
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setSelectedId(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-56 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline points={points} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            The summary should survive the wiggles. That is how you know you are reading the trend instead of the noise.
          </p>
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "momentum-fade" && frames.length) {
    const activeFrame = frames.find((frame) => frame.label === selectedId) ?? frames[0];

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {frames.map((frame) => {
            const active = frame.label === activeFrame.label;
            return (
              <button
                key={frame.label}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
                onClick={() => setSelectedId(frame.label)}
                type="button"
              >
                {frame.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-56 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline points={activeFrame.points} />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Pace meter</span>
              <span>{activeFrame.meter ?? "Momentum"}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-emerald-500 transition-all"
                style={{
                  width:
                    activeFrame.label.toLowerCase().includes("fast")
                      ? "82%"
                      : activeFrame.label.toLowerCase().includes("cool")
                        ? "58%"
                        : "34%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "boss-walkthrough" && checklist.length) {
    return (
      <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-56 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline points={chartPoints} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {checklist.map((item) => {
            const active = checked.includes(item);
            return (
              <button
                key={item}
                className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
                onClick={() =>
                  setChecked((current) =>
                    current.includes(item) ? current : [...current, item],
                  )
                }
                type="button"
              >
                <span>{capitalizeLead(item)}</span>
                <TagPill active={active}>{active ? "Done" : "Tap"}</TagPill>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (activityKind === "chart-lab" && variant === "trend-clinic") {
    return (
      <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
          <div className="h-56 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
            <Sparkline points={chartPoints} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {clues.map((clue) => {
            const active = checked.includes(clue.title);
            return (
              <button
                key={clue.title}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
                onClick={() =>
                  setChecked((current) =>
                    current.includes(clue.title) ? current : [...current, clue.title],
                  )
                }
                type="button"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {clue.title}
                </p>
                {clue.detail ? <p className="mt-2 text-sm font-semibold">{clue.detail}</p> : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (activityKind === "news-chart" && (variant === "pressure-balance" || variant === "pressure-crowd")) {
    const activeScenario = selectedId ?? null;
    const normalizedScenario = activeScenario?.toLowerCase() ?? "";
    const pressureState = !activeScenario
      ? {
          buyerStrength: 0,
          sellerStrength: 0,
          pressureLabel: "None",
          accent: "#94a3b8",
          chartPoints: [] as number[],
          buyerDots: 0,
          sellerDots: 0,
          summary: "Choose a scenario first to see how the pressure shifts.",
        }
      : normalizedScenario.includes("balanced") || normalizedScenario.includes("mixed")
        ? {
            buyerStrength: 50,
            sellerStrength: 50,
            pressureLabel: "Balanced",
            accent: "#64748b",
            chartPoints: [48, 52, 49, 50, 48, 51, 50],
            buyerDots: 4,
            sellerDots: 4,
            summary: "Neither side has a clean edge yet, so pressure stays mixed.",
          }
        : normalizedScenario.includes("many eager buyers")
          ? {
              buyerStrength: 78,
              sellerStrength: 22,
              pressureLabel: "Upward",
              accent: "#16a34a",
              chartPoints: [24, 30, 39, 52, 63, 75, 88],
              buyerDots: 6,
              sellerDots: 2,
              summary: "Buyers are crowding in faster than sellers are stepping away.",
            }
          : {
              buyerStrength: 26,
              sellerStrength: 74,
              pressureLabel: "Downward",
              accent: "#dc2626",
              chartPoints: [78, 72, 64, 52, 40, 28, 18],
              buyerDots: 2,
              sellerDots: 6,
              summary: "Sellers are pressing harder while buyers hold back.",
            };
    const buyerSurface =
      pressureState.pressureLabel === "Upward"
        ? "rounded-2xl bg-emerald-50 p-3 shadow-[inset_0_0_0_1px_rgba(134,239,172,0.95)]"
        : "rounded-2xl bg-slate-50/80 p-3";
    const sellerSurface =
      pressureState.pressureLabel === "Downward"
        ? "rounded-2xl bg-red-50 p-3 shadow-[inset_0_0_0_1px_rgba(252,165,165,0.95)]"
        : "rounded-2xl bg-slate-50/80 p-3";

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeScenario === scenario
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setSelectedId(scenario)}
              type="button"
            >
              {capitalizeLead(scenario)}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Buyers" value={`${pressureState.buyerStrength}`} accent="#16a34a" surfaceClass={buyerSurface} />
            <Stat label="Sellers" value={`${pressureState.sellerStrength}`} accent="#dc2626" surfaceClass={sellerSurface} />
            <Stat
              label="Pressure"
              value={pressureState.pressureLabel}
              accent={pressureState.accent}
              surfaceClass="rounded-2xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]"
            />
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
            <div className="flex h-full w-full">
              <div className="bg-emerald-500 transition-all" style={{ width: `${pressureState.buyerStrength}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${pressureState.sellerStrength}%` }} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
              <div className="rounded-[1rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f8fbf9_100%)] p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Buyers
                    </p>
                    <div className="mt-3 flex min-h-10 flex-wrap gap-2">
                      {Array.from({ length: pressureState.buyerDots }).map((_, index) => (
                        <span key={`buyer-${index}`} className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_4px_10px_rgba(34,197,94,0.24)]" />
                      ))}
                      {!activeScenario ? (
                        <span className="text-xs text-slate-400">No activity yet</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Sellers
                    </p>
                    <div className="mt-3 flex min-h-10 flex-wrap gap-2">
                      {Array.from({ length: pressureState.sellerDots }).map((_, index) => (
                        <span key={`seller-${index}`} className="h-4 w-4 rounded-full bg-red-500 shadow-[0_4px_10px_rgba(239,68,68,0.22)]" />
                      ))}
                      {!activeScenario ? (
                        <span className="text-xs text-slate-400">No activity yet</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {variant === "pressure-crowd" ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Pressure board
                    </p>
                    {activeScenario ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                        <div className="rounded-2xl bg-emerald-50/80 p-4 shadow-[inset_0_0_0_1px_rgba(134,239,172,0.9)]">
                          <p className="text-sm font-semibold text-emerald-900">Buyer push</p>
                          <div className="mt-3 flex min-h-12 flex-wrap gap-2">
                            {Array.from({ length: pressureState.buyerDots }).map((_, index) => (
                              <span key={`crowd-buyer-${index}`} className="h-5 w-5 rounded-full bg-emerald-500" />
                            ))}
                          </div>
                        </div>
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold"
                          style={{
                            color: pressureState.accent,
                            backgroundColor: `${pressureState.accent}14`,
                          }}
                        >
                          {pressureState.pressureLabel === "Upward"
                            ? "↑"
                            : pressureState.pressureLabel === "Downward"
                              ? "↓"
                              : "↔"}
                        </div>
                        <div className="rounded-2xl bg-red-50/80 p-4 shadow-[inset_0_0_0_1px_rgba(252,165,165,0.9)]">
                          <p className="text-sm font-semibold text-red-900">Seller push</p>
                          <div className="mt-3 flex min-h-12 flex-wrap gap-2">
                            {Array.from({ length: pressureState.sellerDots }).map((_, index) => (
                              <span key={`crowd-seller-${index}`} className="h-5 w-5 rounded-full bg-red-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex h-24 items-center justify-center rounded-2xl bg-slate-50 text-sm font-medium text-slate-400">
                        Pick a scenario to see which side is pushing harder.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 h-24 rounded-2xl border border-slate-200 bg-white p-3">
                    {pressureState.chartPoints.length ? (
                      <Sparkline
                        accent={pressureState.accent}
                        points={pressureState.chartPoints}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                        Pick a scenario to see pressure.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                What stands out
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{pressureState.summary}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {activeScenario
                  ? "Price pressure starts with who is more eager. The stronger side tilts the next move, even though it never guarantees it."
                  : "The panel starts blank on purpose. Pick a scenario to compare buyer pressure against seller pressure."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "news-chart" && variant === "expectation-meter") {
    const activeHeadline = selectedId ?? headlines[0] ?? "Headline";
    const isPositive =
      /beat|expansion|new market|growth|launch|strong/i.test(activeHeadline);
    const isNegative =
      /recall|costs|jumped|delay|miss|weak/i.test(activeHeadline);
    const meter = isPositive ? 76 : isNegative ? 28 : 50;

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            {headlines.map((headline) => (
              <button
                key={headline}
                className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                  activeHeadline === headline
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
                onClick={() => setSelectedId(headline)}
                type="button"
              >
                {capitalizeLead(headline)}
              </button>
            ))}
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Expectation meter
            </p>
            <div className="mt-4 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${meter}%`,
                  background: isPositive ? "#16a34a" : isNegative ? "#dc2626" : "#64748b",
                }}
              />
            </div>
            <div className="mt-4">
              <OutcomeBadge label={isPositive ? "Outlook improved" : isNegative ? "Outlook weakened" : "Mixed outlook"} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Markets react to how the headline changes the future story, not just to whether the words sound dramatic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "return-builder" && variant === "gain-loss") {
    const buy = numberOr(data.buy, 20);
    const min = numberOr(data.min, 10);
    const max = numberOr(data.max, 30);
    const sell = clamp(meterValue, min, max);
    const difference = sell - buy;
    const label = difference > 0 ? "Gain" : difference < 0 ? "Loss" : "Break-even";
    const tone = outcomeTone(label);

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Buy" value={`${buy}`} />
            <Stat label="Sell" value={`${sell}`} accent={tone.color} />
            <Stat
              label="Outcome"
              value={`${difference > 0 ? "+" : ""}${difference}`}
              accent={tone.color}
            />
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative h-16">
              <div className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-slate-900 bg-white"
                style={{ left: `${((buy - min) / (max - min)) * 100}%`, marginLeft: -12 }}
              />
              <div
                className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-4 bg-white shadow-sm"
                style={{
                  left: `${((sell - min) / (max - min)) * 100}%`,
                  marginLeft: -14,
                  borderColor: tone.color,
                }}
              />
            </div>
            <input
              className="mt-4 w-full accent-emerald-600"
              max={max}
              min={min}
              onChange={(event) => setMeterValue(Number(event.target.value))}
              type="range"
              value={sell}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <OutcomeBadge label={label} />
            <p className="text-sm font-semibold" style={{ color: tone.color }}>
              {difference > 0 ? `+${difference}` : difference}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "return-builder" && variant === "scenario-gallery" && galleryScenarios.length) {
    const current = galleryScenarios.find((scenario) => scenario.id === selectedId) ?? galleryScenarios[0];
    const tone = outcomeTone(current.outcome);

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {galleryScenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                (selectedId ?? galleryScenarios[0]?.id) === scenario.id
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setSelectedId(scenario.id)}
              type="button"
            >
              {scenario.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Buy" value={`${numberOr(current.buy, 20)}`} />
            <Stat label="Sell" value={`${numberOr(current.sell, 20)}`} accent={tone.color} />
            <Stat label="Result" value={current.amount ?? current.outcome ?? "0"} accent={tone.color} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <OutcomeBadge label={current.outcome ?? "Outcome"} />
            <p className="text-sm text-slate-600">{capitalizeLead(current.explanation ?? "")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (activityKind === "return-builder" && variant === "dividend-vs-gain" && matches.length) {
    const current = matches.find((match) => match.clue === selectedId) ?? matches[0];
    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-3 md:grid-cols-2">
          {matches.map((match) => (
            <button
              key={match.clue}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                (selectedId ?? matches[0]?.clue) === match.clue
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setSelectedId(match.clue)}
              type="button"
            >
              <p className="text-sm font-semibold">{capitalizeLead(match.clue)}</p>
              <p className="mt-2 text-sm text-slate-500">{capitalizeLead(match.answer)}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <OutcomeBadge label={current.answer} />
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {current.answer === "Dividend"
              ? "This return comes from company cash paid out to shareholders."
              : "This return comes from the difference between your buy price and your sale price."}
          </p>
        </div>
      </div>
    );
  }

  if (activityKind === "return-builder" && variant === "boss-return-map" && returnCases.length) {
    const current = returnCases.find((item) => item.id === selectedId) ?? returnCases[0];
    const tone = outcomeTone(current.outcome);
    const isDividend = (current.outcome ?? "").toLowerCase().includes("dividend");
    const buy = numberOr(current.buy, 22);
    const sell = numberOr(current.sell, buy);
    const min = Math.max(0, Math.min(buy, sell) - 6);
    const max = Math.max(buy, sell) + 8;
    const buyPosition = ((buy - min) / Math.max(max - min, 1)) * 100;
    const sellPosition = ((sell - min) / Math.max(max - min, 1)) * 100;

    return (
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-3 md:grid-cols-2">
          {returnCases.map((item) => {
            const active = (selectedId ?? returnCases[0]?.id) === item.id;
            return (
              <button
                key={item.id}
                className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-[0_10px_24px_rgba(34,197,94,0.12)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{capitalizeLead(item.label)}</p>
                    {item.source ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {capitalizeLead(item.source)}
                      </p>
                    ) : null}
                  </div>
                  {item.outcome ? <OutcomeBadge label={item.outcome} /> : null}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Source" value={current.source ?? "Market price"} accent={tone.color} />
            <Stat label="Result" value={current.outcome ?? "Outcome"} accent={tone.color} />
            <Stat label="Amount" value={current.amount ?? "0"} accent={tone.color} />
          </div>
          {isDividend ? (
            <div className="mt-5 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Company</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Pays cash out</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: "100%" }} />
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Dividend cash flow
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Shareholder</p>
                  <p className="mt-2 text-sm font-semibold text-amber-900">Receives cash</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
              <div className="relative h-16">
                <div className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                <div
                  className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-slate-900 bg-white"
                  style={{ left: `${buyPosition}%`, marginLeft: -12 }}
                />
                <div
                  className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-4 bg-white shadow-sm"
                  style={{
                    left: `${sellPosition}%`,
                    marginLeft: -14,
                    borderColor: tone.color,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>Buy {buy}</span>
                <span>Sell {sell}</span>
              </div>
            </div>
          )}
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              What this case shows
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {capitalizeLead(current.explanation ?? "")}
            </p>
            {current.support ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{capitalizeLead(current.support)}</p>
            ) : null}
          </div>
        </div>
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
      <div className="space-y-3 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Evidence board
          </p>
          <TagPill active>{checked.length} reviewed</TagPill>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {cardsToShow.map((card, index) => {
              const active = selectedId === card.id || (!selectedId && index === 0);
              const seen = checked.includes(card.id);
              return (
                <button
                  key={card.id}
                  className={`flex w-full items-start justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
                    <p className="font-medium">{capitalizeLead(card.label)}</p>
                    {card.detail ? <p className="mt-1 text-sm text-slate-500">{capitalizeLead(card.detail)}</p> : null}
                  </div>
                  <TagPill active={active}>{seen ? "Seen" : "Open"}</TagPill>
                </button>
              );
            })}
          </div>
          {(() => {
            const activeCard =
              cardsToShow.find((card) => card.id === selectedId) ??
              cardsToShow[0];
            return activeCard ? (
              <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Focused clue
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{capitalizeLead(activeCard.label)}</p>
                {activeCard.detail ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{capitalizeLead(activeCard.detail)}</p>
                ) : null}
                <div className="mt-4 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Why it matters
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Review each clue, then build the stronger interpretation from the full stack.
                  </p>
                </div>
                {activityKind === "confidence-meter" ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
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
            ) : null;
          })()}
        </div>
      </div>
    );
  }

  if (
    activityKind === "news-chart" ||
    activityKind === "market-cap-board" ||
    activityKind === "business-builder" ||
    activityKind === "ratio-builder" ||
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
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f5_100%)] p-4">
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(data)
                .filter(([, value]) => typeof value === "number")
                .slice(0, 3)
                .map(([key, value]) => (
                  <Stat key={key} label={humanize(key)} value={String(value)} />
                ))}
            </div>
            <div className="mt-4 h-28 rounded-[1.1rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
              <Sparkline points={chartPoints.length ? chartPoints : [10, 18, 30, 26, 44, 58, 72]} />
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
                      {capitalizeLead(option)}
                    </button>
                  );
                })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
      <button
        className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
        onClick={() => setSelectedId("done")}
        type="button"
      >
        Tap to confirm this step
      </button>
    </div>
  );
}
