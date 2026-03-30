"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

export interface Character {
  id: string;
  name: string;
  assetLabel: string;
  tag: string;
  tagColor: string;
  profile: string;
  emoji: string;
}

export interface CharacterCard {
  id: string;
  text: string;
  targetCharacterId: string;
}

interface CharacterSortProps {
  characters: Character[];
  cards: CharacterCard[];
  onReadyChange?: (ready: boolean) => void;
}

export function CharacterSort({
  characters,
  cards,
  onReadyChange,
}: CharacterSortProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // cardId → characterId
  const [wrongs, setWrongs] = useState<Record<string, boolean>>({});
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const currentCard = cards[currentCardIdx];
  const allDone = currentCardIdx >= cards.length;

  const handleCharSelect = useCallback((charId: string) => {
    setSelectedCharId((prev) => (prev === charId ? null : charId));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedCharId || !currentCard) return;
    const correct = selectedCharId === currentCard.targetCharacterId;

    if (!correct) {
      setWrongs((w) => ({ ...w, [currentCard.id]: true }));
      // Bounce card back — just clear selection after a moment
      setTimeout(() => setSelectedCharId(null), 500);
      return;
    }

    setAssignments((a) => ({ ...a, [currentCard.id]: selectedCharId }));
    setSelectedCharId(null);
    const nextIdx = currentCardIdx + 1;
    setCurrentCardIdx(nextIdx);

    if (nextIdx >= cards.length) {
      onReadyChange?.(true);
    }
  }, [selectedCharId, currentCard, currentCardIdx, cards.length, onReadyChange]);

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {/* Character portraits */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {characters.map((char) => {
          const isSelected = selectedCharId === char.id;
          const isExpanded = expanded === char.id;
          const assignedCount = Object.values(assignments).filter(
            (v) => v === char.id,
          ).length;

          return (
            <motion.div
              key={char.id}
              layout
              className="relative"
            >
              <button
                onClick={() =>
                  isExpanded
                    ? setExpanded(null)
                    : handleCharSelect(char.id)
                }
                onDoubleClick={() =>
                  setExpanded((e) => (e === char.id ? null : char.id))
                }
                className={`w-full rounded-2xl border-2 p-3 text-center transition-all ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                <div className="mb-1 text-2xl">{char.emoji}</div>
                <p className="text-xs font-black">{char.name}</p>
                <p
                  className="mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: char.tagColor + "22",
                    color: char.tagColor,
                  }}
                >
                  {char.tag}
                </p>
                {assignedCount > 0 && (
                  <div className="mt-1.5 flex justify-center gap-0.5">
                    {Array.from({ length: assignedCount }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      />
                    ))}
                  </div>
                )}
              </button>

              {/* Profile tooltip on double-tap */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl bg-white p-3 text-left shadow-lg ring-1 ring-slate-200"
                  >
                    <p className="text-[11px] font-bold text-slate-900">
                      {char.assetLabel}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {char.profile}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Current card to sort */}
      <AnimatePresence mode="wait">
        {!allDone && currentCard ? (
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={`rounded-2xl border-2 p-4 transition-all ${
              wrongs[currentCard.id] && !selectedCharId
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-center text-sm font-bold text-slate-800">
              "{currentCard.text}"
            </p>
            <p className="mt-1 text-center text-xs text-slate-400">
              {selectedCharId
                ? `Assigning to ${characters.find((c) => c.id === selectedCharId)?.name} →`
                : "Tap a character above, then confirm"}
            </p>

            <button
              onClick={handleConfirm}
              disabled={!selectedCharId}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-black text-white disabled:opacity-25 transition-transform active:scale-95"
                style={{ background: "#22c55e", boxShadow: "0 3px 0 #16a34a" }}
            >
              Confirm →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-emerald-50 p-4 text-center"
          >
            <p className="text-sm font-black text-emerald-700">
              {cards.length}/{cards.length} sorted.
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              You remember Alex, Jordan, and Riley — not just abstract categories.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          animate={{ width: `${(currentCardIdx / cards.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        />
      </div>
      <p className="mt-1.5 text-center text-[11px] text-slate-400">
        {currentCardIdx} / {cards.length} sorted
      </p>
    </div>
  );
}
