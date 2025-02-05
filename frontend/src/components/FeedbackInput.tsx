import { Feedback, NumericFeedback, SelectFeedback, MultiselectFeedback, RankingFeedback } from "../api_util";

export type FeedbackInputProps = {
    feedback: Feedback,
    onChange: (value: string | string[] | number) => void;
    value: string | string[] | number;
}

export default function FeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type === "select") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && <span className="required-indicator">(required)</span>}
        </p>
        <SelectFeedbackInput {...props} />
      </div>
    );
  } else if (props.feedback.type === "numeric") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && <span className="required-indicator">(required)</span>}
        </p>
        <NumericFeedbackInput {...props} />
      </div>
    );
  } else if (props.feedback.type === "multiselect") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && <span className="required-indicator">(required)</span>}
        </p>
        <MultiselectFeedbackInput {...props} />
      </div>
    );
  } else if (props.feedback.type === "ranking") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && <span className="required-indicator">(required)</span>}
        </p>
        <RankingFeedbackInput {...props} />
      </div>
    );
  } else if (props.feedback.type === "text") {
    return (
      <div className="feedback-input">
        <p>
          {props.feedback.description}
          {(props.feedback.required ?? true) && <span className="required-indicator">(required)</span>}
        </p>
        <TextFeedbackInput {...props} />
      </div>
    );
  } else {
    // @ts-expect-error: In case of invalid type
    return <div>Invalid feedback type {props.feedback.type}</div>;
  }
}

function SelectFeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type !== "select") {
    throw new Error("SelectFeedback must be used with a select feedback type");
  }

  const feedback = props.feedback as SelectFeedback;

  return <div>
    {feedback.options.map((option, index) => (
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
  </div>;
}

function MultiselectFeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type !== "multiselect") {
    throw new Error("MultiselectFeedback must be used with a multiselect feedback type");
  }

  const feedback = props.feedback as MultiselectFeedback;
  const value = props.value as string[];

  return <div>
    {feedback.options.map((option, index) => (
      <div key={index}>
        <input type="checkbox" id={`checkbox-${option.value}`} value={option.value} checked={value.includes(option.value)} onChange={(e) => props.onChange(e.target.value)} />
        <label htmlFor={`checkbox-${option.value}`}>{option.label}</label>
      </div>
    ))}
  </div>;
}

function RankingFeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type !== "ranking") {
    throw new Error("RankingFeedback must be used with a ranking feedback type");
  }

  const feedback = props.feedback as RankingFeedback;
  const value = Array.isArray(props.value) ? props.value : Array.from(feedback.options.map(opt => opt.value));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newOrder = [...value];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    props.onChange(newOrder);
  };

  const getOptionLabel = (optionValue: string) => {
    const option = feedback.options.find(opt => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  return (
    <div className="ranking-container">
      {value.map((optionValue, index) => (
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
          <span className="ranking-handle">⋮⋮</span>
        </div>
      ))}
    </div>
  );
}

function TextFeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type !== "text") {
    throw new Error("TextFeedback must be used with a text feedback type");
  }

  return <div>
    <textarea value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  </div>;
}

function NumericFeedbackInput(props: FeedbackInputProps) {
  if (props.feedback.type !== "numeric") {
    throw new Error("NumericFeedback must be used with a numeric feedback type");
  }

  const feedback = props.feedback as NumericFeedback;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const progress = ((Number(value) - feedback.min) / (feedback.max - feedback.min)) * 100;
    e.target.style.setProperty('--range-progress', `${progress}%`);
    props.onChange(value);
  };

  return <div>
    <input
      type="range"
      min={feedback.min}
      max={feedback.max}
      step={feedback.step}
      value={props.value}
      onChange={handleChange}
      style={{ '--range-progress': `${((Number(props.value) - feedback.min) / (feedback.max - feedback.min)) * 100}%` } as React.CSSProperties}
    />
    <span>{props.value}</span>
  </div>;
}