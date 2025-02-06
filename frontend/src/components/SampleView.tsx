import {
  Sample,
  ChatMessage,
  TextCompletionSample,
  ChatCompletionSample,
  TextSample,
} from "shared/types";

export default function SampleViewer(props: { sample: Sample }) {
  const renderMetadata = () => {
    if (!props.sample.metadata || Object.keys(props.sample.metadata).length === 0) {
      return null;
    }

    return (
      <div className="metadata-container">
        {Object.entries(props.sample.metadata).map(([key, value]) => (
          <div key={key} className="metadata-item">
            <code className="metadata-key">{key.toUpperCase()}</code>
            <div className="metadata-value">{value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSample = () => {
    switch (props.sample.type) {
      case "text_completion":
        return (
          <TextCompletionView
            sample={props.sample}
          />
        );
      case "chat_completion":
        return (
          <ChatCompletionView
            sample={props.sample}
          />
        );
      case "text":
        return <TextView sample={props.sample} />;
      default:
        // @ts-expect-error: this happens when the JSON is malformed/outdated
        return <span className="error">Unsupported sample type: {sample.type}</span>;
    }
  };

  return (
    <div className="prompt-completion-container">
      {renderMetadata()}
      <pre>{renderSample()}</pre>
    </div>
  );
}

function TextCompletionView(props: { sample: TextCompletionSample }) {
  return (
    <>
      <span className="prompt-text">{props.sample.prompt}</span>
      <span className="completion-text">{props.sample.completion}</span>
    </>
  );
}

function ChatCompletionView(props: { sample: ChatCompletionSample }) {
  return (
    <>
      {props.sample.prompt.map((msg, i) => (
        <ChatMessageView
          key={`prompt-${i}`}
          message={msg}
          messageType="prompt"
          index={i}
        />
      ))}
      <div className="section-divider">
        <div className="section-divider-line" />
        <span className="section-divider-text">COMPLETION</span>
      </div>
      {props.sample.completion.map((msg, i) => (
        <ChatMessageView
          key={`completion-${i}`}
          message={msg}
          messageType="completion"
          index={i}
        />
      ))}
    </>
  );
}

function ChatMessageView(props: {
  message: ChatMessage;
  messageType: string;
  index: number;
}) {
  return (
    <div
      key={`${props.messageType}-${props.index}`}
      className={`message message-${props.message.role} message-${props.messageType}`}
    >
      <div className="message-role">{props.message.role}</div>
      {props.message.content}
    </div>
  );
}

function TextView(props: { sample: TextSample }) {
  return <span className="text">{props.sample.text}</span>;
}