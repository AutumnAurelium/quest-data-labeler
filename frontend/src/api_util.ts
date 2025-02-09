import {
  TaskDef,
  Sample,
  TaskResult,
  Feedback,
  SelectFeedback,
  NumericFeedback,
  MultiselectFeedback,
  RankingFeedback,
  TextFeedback,
  DatasetRef
} from "../../shared/types";

export function apiURL(path: string) {
  return `/api/${path}`;
}

export function getTasks() {
  return fetch(apiURL("task"))
    .then((res) => res.json())
    .then((data) => data);
}

export function getTask(task: string): Promise<TaskDef | ErrorResponse> {
  return fetch(apiURL(`task/${task}`))
    .then((res) => res.json())
    .then((data) => data);
}

export type ErrorResponse = {
  error: string;
};

// Re-export types that are used by components
export type {
  TaskDef,
  Sample,
  TaskResult,
  Feedback,
  SelectFeedback,
  NumericFeedback,
  MultiselectFeedback,
  RankingFeedback,
  TextFeedback,
  DatasetRef
};

export async function getSample(ref: DatasetRef): Promise<Sample[]> {
  const response = await fetch(apiURL(`dataset`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ref),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch sample: ${error.error}`);
  }
  return response.json().then((data) => {
    console.log(data);
    return data[0];
  });
}

export async function submitResult(
  resultsFile: string,
  result: TaskResult
): Promise<void> {
  const response = await fetch(apiURL(`results/${resultsFile}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to submit result: ${error.error}`);
  }
}
