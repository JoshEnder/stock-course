"use client";

import { useCallback, useState } from "react";
import { lessons } from "./lessons";

export interface HeroState {
  activeCard: number;
  selectedAnswers: Record<number, number | null>;
  revealedCards: Set<number>;
}

export function useHeroState() {
  const [activeCard, setActiveCard] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const selectAnswer = useCallback((cardIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [cardIndex]: answerIndex }));
  }, []);

  const focusCard = useCallback((index: number) => {
    setActiveCard(index);
    if (!lessons[index].locked) {
      setRevealedCards((prev) => new Set(prev).add(index));
    }
  }, []);

  const isCorrect = useCallback(
    (cardIndex: number) => {
      const selected = selectedAnswers[cardIndex];
      if (selected == null) return null;
      return selected === lessons[cardIndex].correctIndex;
    },
    [selectedAnswers],
  );

  return {
    activeCard,
    selectedAnswers,
    revealedCards,
    selectAnswer,
    focusCard,
    isCorrect,
    totalCards: lessons.length,
  };
}
