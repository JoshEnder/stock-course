"use client";

import { motion } from "framer-motion";
import { CardStack } from "./CardStack";

interface HeroRightProps {
  activeCard: number;
  selectedAnswers: Record<number, number | null>;
  onSelectAnswer: (cardIndex: number, answerIndex: number) => void;
  onFocusCard: (index: number) => void;
}

export function HeroRight({ activeCard, selectedAnswers, onSelectAnswer, onFocusCard }: HeroRightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <CardStack
        activeCard={activeCard}
        selectedAnswers={selectedAnswers}
        onSelectAnswer={onSelectAnswer}
        onFocusCard={onFocusCard}
      />
    </motion.div>
  );
}
