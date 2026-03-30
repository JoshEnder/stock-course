export type ScenarioOption = "UP" | "DOWN" | "FLAT";

export type Scenario = {
  id: string;
  title: string;
  context: string;
  currentPrice: number;
  ticker: string;
  correct: ScenarioOption;
  actualResult: {
    direction: ScenarioOption;
    priceChange: number;
    changePercent: number;
  };
  successMessage: string;
  failureMessage: string;
  insight: string;
};

export type UserResult = {
  scenarioId: string;
  choice: ScenarioOption;
  correct: boolean;
  timestamp: number;
};

export type ExperienceState =
  | "entry_hook"
  | "scenario_1"
  | "scenario_2"
  | "scenario_3"
  | "identity_result";

export type ProgressionNode = {
  id: string;
  title: string;
  locked: boolean;
  level: number;
};
