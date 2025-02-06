import {
  Feedback,
  NumericFeedback,
  SelectFeedback,
  MultiselectFeedback,
  RankingFeedback,
} from "../api_util";
import React from "react";

export type FeedbackInputProps = {
  feedback: Feedback;
  onChange: (value: string | string[] | number) => void;
  value: string | string[] | number;
};

export default function FeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type === "select") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && (
            <span className="required-indicator">(required)</span>
          )}
        </p>
        <SelectFeedbackInput
          feedback={props.feedback as SelectFeedback}
          value={props.value as string}
          onChange={(value) => props.onChange(value)}
        />
      </div>
    );
  } else if (props.feedback.type === "numeric") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && (
            <span className="required-indicator">(required)</span>
          )}
        </p>
        <NumericFeedbackInput
          feedback={props.feedback as NumericFeedback}
          value={props.value as number}
          onChange={(value) => props.onChange(value)}
        />
      </div>
    );
  } else if (props.feedback.type === "multiselect") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && (
            <span className="required-indicator">(required)</span>
          )}
        </p>
        <MultiselectFeedbackInput
          feedback={props.feedback as MultiselectFeedback}
          value={props.value as string[]}
          onChange={(value) => props.onChange(value)}
        />
      </div>
    );
  } else if (props.feedback.type === "ranking") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && (
            <span className="required-indicator">(required)</span>
          )}
        </p>
        <RankingFeedbackInput
          feedback={props.feedback as RankingFeedback}
          value={props.value as string[]}
          onChange={(value) => props.onChange(value)}
        />
      </div>
    );
  } else if (props.feedback.type === "text") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && (
            <span className="required-indicator">(required)</span>
          )}
        </p>
        <TextFeedbackInput
          value={props.value as string}
          onChange={(value) => props.onChange(value)}
        />
      </div>
    );
  } else {
    // @ts-expect-error: In case of invalid type
    return <div>Invalid feedback type {props.feedback.type}</div>;
  }
}

type SelectFeedbackInputProps = {
  feedback: SelectFeedback;
  value: string;
  onChange: (value: string) => void;
};

function SelectFeedbackInput(props: SelectFeedbackInputProps) {
  return (
    <div>
      {props.feedback.options.map((option, index) => (
        <div key={index}>
          <input
            type="radio"
            id={`radio-${option.value}`}
            value={option.value}
            checked={props.value === option.value}
            onChange={(e) => props.onChange(e.target.value)}
          />
          <label htmlFor={`radio-${option.value}`}>{option.label}</label>
        </div>
      ))}
    </div>
  );
}

type MultiselectFeedbackInputProps = {
  feedback: MultiselectFeedback;
  value: string[];
  onChange: (value: string[]) => void;
};

function MultiselectFeedbackInput(props: MultiselectFeedbackInputProps) {
  return (
    <div>
      {props.feedback.options.map((option, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={`checkbox-${option.value}`}
            value={option.value}
            checked={props.value.includes(option.value)}
            onChange={(e) => {
              const newValue = props.value.includes(e.target.value)
                ? props.value.filter((v) => v !== e.target.value)
                : [...props.value, e.target.value];
              props.onChange(newValue);
            }}
          />
          <label htmlFor={`checkbox-${option.value}`}>{option.label}</label>
        </div>
      ))}
    </div>
  );
}

type RankingFeedbackInputProps = {
  feedback: RankingFeedback;
  value: string[];
  onChange: (value: string[]) => void;
};

function RankingFeedbackInput(props: RankingFeedbackInputProps) {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;

    const newOrder = [...props.value];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    props.onChange(newOrder);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...props.value];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    props.onChange(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === props.value.length - 1) return;
    const newOrder = [...props.value];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    props.onChange(newOrder);
  };

  const getOptionLabel = (optionValue: string) => {
    const option = props.feedback.options.find((opt) => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  return (
    <div className="ranking-container">
      {props.value.map((optionValue, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className="ranking-item"
        >
          <span className="ranking-number">{index + 1}</span>
          <span className="ranking-label">{getOptionLabel(optionValue)}</span>
          <div className="ranking-controls">
            <button
              type="button"
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="ranking-button"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => handleMoveDown(index)}
              disabled={index === props.value.length - 1}
              className="ranking-button"
              aria-label="Move down"
            >
              ↓
            </button>
            <span className="ranking-handle">⋮⋮</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type TextFeedbackInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function TextFeedbackInput(props: TextFeedbackInputProps) {
  return (
    <div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

type NumericFeedbackInputProps = {
  feedback: NumericFeedback;
  value: number;
  onChange: (value: number) => void;
};

function NumericFeedbackInput(props: NumericFeedbackInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const progress =
      ((value - props.feedback.min) / (props.feedback.max - props.feedback.min)) * 100;
    e.target.style.setProperty("--range-progress", `${progress}%`);
    props.onChange(value);
  };

  return (
    <div className="numeric-feedback">
      <div className="numeric-feedback-labels">
        <span className="numeric-feedback-min-label">{props.feedback.minLabel}</span>
        <span className="numeric-feedback-max-label">{props.feedback.maxLabel}</span>
      </div>
      <div className="numeric-feedback-input">
        <input
          type="range"
          min={props.feedback.min}
          max={props.feedback.max}
          step={props.feedback.step}
          value={props.value}
          onChange={handleChange}
          style={
            {
              "--range-progress": `${
                ((props.value - props.feedback.min) /
                  (props.feedback.max - props.feedback.min)) *
                100
              }%`,
            } as React.CSSProperties
          }
        />
        <span className="numeric-feedback-value">{props.value}</span>
      </div>
    </div>
  );
}
