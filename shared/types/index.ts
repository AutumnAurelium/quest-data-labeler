export type DatasetFormat = "JSONL"; // TODO: add other formats
export type PresentationType = "comparison" | "single"; // TODO: add other types
export type PresentationDisplayType = "side_by_side" | "stacked" | "standard"; // TODO: add other display types
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

export type Sample = {
  id: string;
  timestamp: string;
  options: {
    prompt: string;
    completion: string;
  }[];
};

export type TaskDef = {
  taskInfo: {
    name: string;
    description: string;
    instructions: string;
  };
  presentation: {
    type: PresentationType;
    displayType: PresentationDisplayType;
  };
  feedback: Record<string, Feedback>;
  dataset: string;
  results: string;
};

export type TaskResult = {
  sample: Sample;
  feedback: Record<string, string | string[] | number>;
  timestamp: string;
}; 