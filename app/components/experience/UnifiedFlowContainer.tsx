"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExperienceContainer from "./ExperienceContainer";
import OnboardingContainer from "@/app/components/onboard/OnboardingContainer";

type Phase = "experience" | "onboard";

export default function UnifiedFlowContainer() {
  const [phase, setPhase] = useState<Phase>("experience");

  return (
    <AnimatePresence mode="wait">
      {phase === "experience" && (
        <motion.div
          key="experience"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ExperienceContainer
            onComplete={() => setPhase("onboard")}
            continueLabel="See your path →"
          />
        </motion.div>
      )}

      {phase === "onboard" && (
        <motion.div
          key="onboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <OnboardingContainer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
