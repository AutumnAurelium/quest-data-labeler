import { useState, useEffect, FormEvent } from "react";
import {
  getTask,
  TaskDef,
  Sample,
  getSample,
  submitResult,
  TaskResult,
} from "../api_util";
import FeedbackInput from "./FeedbackInput";
import PromptCompletion from "./PromptCompletion";
import MetadataContainer from "./MetadataContainer";

export default function TaskView(props: { task: string }) {
  const [task, setTask] = useState<TaskDef | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [feedbackResults, setFeedback] = useState<
    Record<string, string | string[] | number>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch task definition and a sample
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const taskData = await getTask(props.task);
        if ("error" in taskData) {
          throw new Error(`Failed to fetch task: ${taskData.error}`);
        }
        setTask(taskData);

        const samples = await getSample(taskData.dataset);
        if (samples.length === 0) {
          throw new Error("No samples available");
        }
        setSample(samples[0]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [props.task]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task || !sample) {
      setError("No task or sample data available");
      return;
    }

    try {
      setError(null);

      // Validate that all required feedback is provided
      const missingFields = Object.entries(task.feedback).filter(
        ([key]) => !feedbackResults[key]
      );

      if (missingFields.length > 0) {
        window.alert("Please provide all feedback before submitting");
        return;
      }

      // Prepare and submit results
      const result: TaskResult = {
        sample,
        feedback: feedbackResults,
        timestamp: new Date().toISOString(),
      };

      await submitResult(task.results, result);

      // Reset form and fetch new sample
      setFeedback({});
      const samples = await getSample(task.dataset);
      if (samples.length === 0) {
        throw new Error("No more samples available");
      }
      setSample(samples[0]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error submitting feedback:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!task || !sample) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h2>Task: {task.taskInfo.name}</h2>
      <p>{task.taskInfo.description}</p>
      <p>{task.taskInfo.instructions}</p>

      {/* Display sample based on presentation settings */}
      <div className="sample-display">
        <MetadataContainer
          metadata={{
            ID: sample.id,
            Timestamp: sample.timestamp,
          }}
        />
        {task.presentation.type === "comparison" && (
          <div
            className={
              task.presentation.displayType === "side_by_side"
                ? "side-by-side"
                : "stacked"
            }
          >
            {sample.options.map((option, index) => (
              <div className="message-container" key={index}>
                <PromptCompletion
                  prompt={option.prompt}
                  completion={option.completion}
                />
              </div>
            ))}
          </div>
        )}
        {task.presentation.type === "single" && sample.options[0] && (
          <div className="message-container">
            <PromptCompletion
              prompt={sample.options[0].prompt}
              completion={sample.options[0].completion}
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {Object.entries(task.feedback).map(([key, feedback], index) => (
          <div key={index}>
            <FeedbackInput
              feedback={feedback}
              value={
                feedbackResults[key] ||
                (feedback.type === "numeric" ? feedback.min : "")
              }
              onChange={(value) =>
                setFeedback((prev) => ({ ...prev, [key]: value }))
              }
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
