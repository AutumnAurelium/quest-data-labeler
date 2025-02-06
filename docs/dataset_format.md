# Dataset Format Documentation

Datasets are stored as JSONL (JSON Lines) files in the `backend/data/datasets` directory. Each dataset file begins with a metadata line followed by data lines containing samples to be labeled together.

## File Format

- Files must use the `.jsonl` extension
- The first line must be a JSON object containing dataset metadata:
  ```json
  {
    "total_samples": number,
    "sample_type": "text_completion" | "chat_completion" | "text",
    "samples_per_line": number,
    "hidden_metadata": string[]
  }
  ```
- Each subsequent line must be a valid JSON array containing one or more samples
- Empty lines are ignored
- All samples in a dataset must be of the same type specified in the metadata
- All lines must have the same number of samples specified in `samples_per_line`

## Sample Types

The platform supports several different sample types, with each type being presented differently.

Each sample must have a unique `id` field and can optionally have a `metadata` field. These fields are used to identify the sample, and provide additional information to the labeler.

### Text Completion Sample
For labeling prompt-completion pairs, such as those from base models.
```json
{
  "type": "text_completion",
  "id": string,
  "metadata": Record<string, string>,
  "prompt": string,
  "completion": string
}
```

### Chat Completion Sample
For labeling multi-turn chat-formatted interactions.
```json
{
  "type": "chat_completion",
  "id": string,
  "metadata": Record<string, string>,
  "prompt": [
    {
      "role": "user" | "assistant" | "system",
      "content": string
    }
  ],
  "completion": [
    {
      "role": "assistant",
      "content": string
    }
  ]
}
```

### Text Sample
For labeling individual text snippets.
```json
{
  "type": "text",
  "id": string,
  "metadata": Record<string, string>,
  "text": string
}
```

## Results Format

When tasks are completed, the results are stored in JSONL files in the `backend/data/results` directory. Each line contains a result object with:
- The original sample that was labeled
- The feedback provided by the labeler
- A timestamp of when the labeling was completed