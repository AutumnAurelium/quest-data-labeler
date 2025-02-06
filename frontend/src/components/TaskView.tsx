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
import SampleViewer from "./SampleView";

export default function TaskView(props: { task: string }) {
  const [task, setTask] = useState<TaskDef | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [feedbackResults, setFeedback] = useState<
    Record<string, string | string[] | number>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch task definition and samples
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

        const fetchedSamples = await getSample(taskData.dataset);
        if (fetchedSamples.length === 0) {
          throw new Error("No samples available");
        }

        // Validate sample count for single presentation type
        if (taskData.presentation.type === "single" && fetchedSamples.length !== 1) {
          throw new Error("Single presentation type requires exactly one sample");
        }

        setSamples(fetchedSamples);
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
    if (!task || samples.length === 0) {
      setError("No task or sample data available");
      return;
    }

    try {
      setError(null);

      // Add default values for numeric inputs if not present
      const feedbackWithDefaults = { ...feedbackResults };
      Object.entries(task.feedback).forEach(([key, feedback]) => {
        if (feedback.type === "numeric" && !(key in feedbackResults)) {
          feedbackWithDefaults[key] = feedback.defaultValue ?? feedback.min;
        }
      });

      // Validate that all required feedback is provided
      const missingFields = Object.entries(task.feedback).filter(
        ([key, feedback]) => {
          if (feedback.required === false) return false;
          const value = feedbackWithDefaults[key];
          // For numeric feedback, check if value is a number (including 0)
          if (feedback.type === "numeric") {
            return typeof value !== "number";
          }
          // For other types, check if value is empty/undefined
          return !value;
        }
      );

      if (missingFields.length > 0) {
        window.alert("Please provide all feedback before submitting");
        return;
      }

      // Prepare and submit results with default values included
      const result: TaskResult = {
        sample: samples[0], // Submit first sample as the reference
        feedback: feedbackWithDefaults,
        timestamp: new Date().toISOString(),
      };

      await submitResult(task.results, result);

      // Reset form and fetch new samples
      setFeedback({});
      const newSamples = await getSample(task.dataset);
      if (newSamples.length === 0) {
        throw new Error("No more samples available");
      }
      
      // Validate sample count for single presentation type
      if (task.presentation.type === "single" && newSamples.length !== 1) {
        throw new Error("Single presentation type requires exactly one sample");
      }

      setSamples(newSamples);
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

  if (!task || samples.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h2>Task: {task.taskInfo.name}</h2>
      <p>{task.taskInfo.description}</p>
      <p>{task.taskInfo.instructions}</p>

      {/* Display samples based on presentation settings */}
      <div className="sample-display">
        {task.presentation.type === "comparison" && (
          <div
            className={
              task.presentation.displayType === "side_by_side"
                ? "side-by-side"
                : "stacked"
            }
          >
            {samples.map((sample, index) => (
              <div className="message-container" key={index}>
                <div className="section-divider">
                  <div className="section-divider-line" />
                  <span className="section-divider-text">SAMPLE {String.fromCharCode(65 + index)}</span>
                </div>
                <SampleViewer sample={sample} />
              </div>
            ))}
          </div>
        )}
        {task.presentation.type === "single" && (
          <div className="message-container">
            <SampleViewer sample={samples[0]} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {Object.entries(task.feedback).map(([key, feedback], index) => (
          <div key={index}>
            <FeedbackInput
              feedback={feedback}
              value={
                feedbackResults[key] ??
                (feedback.type === "numeric"
                  ? feedback.defaultValue ?? feedback.min
                  : feedback.type === "ranking"
                  ? feedback.options.map((option) => option.value)
                  : "")
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
