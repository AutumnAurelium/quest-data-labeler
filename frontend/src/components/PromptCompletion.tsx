export default function PromptCompletion(props: {
  prompt: string;
  completion: string;
}) {
  return (
    <div className="prompt-completion-container">
      <pre>
        <span className="prompt-text">{props.prompt}</span>
        <span className="completion-text">{props.completion}</span>
      </pre>
    </div>
  );
}
