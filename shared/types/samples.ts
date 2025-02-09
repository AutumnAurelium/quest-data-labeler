export type ChatMessage = {
  role: "user" | "assisant" | "system";
  content: string;
}

export type Sample = TextCompletionSample | ChatCompletionSample | TextSample;

export type TextCompletionSample = {
  type: "text_completion";
  id: string;
  metadata: Record<string, string>;
  prompt: string;
  completion: string;
};

export type ChatCompletionSample = {
  type: "chat_completion";
  id: string;
  metadata: Record<string, string>;
  prompt: ChatMessage[];
  completion: ChatMessage[];
};

export type TextSample = {
  type: "text";
  id: string;
  metadata: Record<string, string>;
  text: string;
}; 