export type FeedbackType =
  | "select"
  | "numeric"
  | "multiselect"
  | "ranking"
  | "text";

export type SelectFeedback = {
  type: "select";
  description: string;
  required?: boolean;
  options: {
    label: string;
    value: string;
  }[];
};

export type NumericFeedback = {
  type: "numeric";
  description: string;
  required?: boolean;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  defaultValue?: number;
};

export type MultiselectFeedback = {
  type: "multiselect";
  description: string;
  required?: boolean;
  options: {
    label: string;
    value: string;
  }[];
};

export type RankingFeedback = {
  type: "ranking";
  description: string;
  required?: boolean;
  options: {
    label: string;
    value: string;
  }[];
};

export type TextFeedback = {
  type: "text";
  description: string;
  required?: boolean;
};

export type Feedback =
  | SelectFeedback
  | NumericFeedback
  | MultiselectFeedback
  | RankingFeedback
  | TextFeedback; 