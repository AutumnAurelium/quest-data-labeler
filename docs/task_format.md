# Task Format Documentation

Tasks are defined using JSON files stored in the `backend/data/tasks` directory. Each task file specifies:
- Basic task information (name, description, instructions)
- How samples should be presented to labelers
- What feedback should be collected
- Which dataset to use and where to store results

## Task Definition Structure

A task is defined using the following JSON structure:

```json
{
  "taskInfo": {
    "name": string,
    "description": string,
    "instructions": string
  },
  "presentation": {
    "type": "comparison" | "single",
    "displayType": "side_by_side" | "stacked" | "standard"
  },
  "feedback": {
    [key: string]: FeedbackConfig
  },
  "dataset": string,
  "results": string
}
```

### Task Info

The `taskInfo` section contains basic information about the task:
- `name`: A short, descriptive name for the task
- `description`: A brief description of what the task involves
- `instructions`: Detailed instructions for labelers on how to complete the task

### Presentation

The `presentation` section defines how samples should be displayed:

- `type`: How many samples to show at once
  - `"comparison"`: Show multiple samples for comparison
  - `"single"`: Show one sample at a time
  
- `displayType`: How to arrange the samples
  - `"side_by_side"`: Display samples horizontally next to each other (for comparison tasks)
  - `"stacked"`: Display samples vertically one above the other (for comparison tasks)
  - `"standard"`: Display a single sample (for single tasks)

### Feedback Types

The `feedback` section defines what feedback to collect from labelers. Each feedback item is defined by a unique key and a configuration object. The following feedback types are supported:

#### Select Feedback
Single-choice selection from a list of options.
```json
{
  "type": "select",
  "description": string,
  "required": boolean,
  "options": [
    {
      "label": string,
      "value": string
    }
  ]
}
```

#### Numeric Feedback
Numeric rating or score within a defined range.
```json
{
  "type": "numeric",
  "description": string,
  "required": boolean,
  "min": number,
  "max": number,
  "step": number,
  "minLabel": string,
  "maxLabel": string,
  "defaultValue": number
}
```

The numeric feedback type allows collecting numeric ratings or scores:
- `min`, `max`: Define the allowed range of values
- `step`: The increment between allowed values
- `minLabel`: Label to show at the minimum end of the scale (e.g., "Poor" or "A is better")
- `maxLabel`: Label to show at the maximum end of the scale (e.g., "Excellent" or "B is better")
- `defaultValue`: Optional initial value for the slider. If not provided, defaults to `min`

#### Multiselect Feedback
Multiple-choice selection from a list of options.
```json
{
  "type": "multiselect",
  "description": string,
  "required": boolean,
  "options": [
    {
      "label": string,
      "value": string
    }
  ]
}
```

#### Ranking Feedback
Ordering a list of options by preference or criteria.
```json
{
  "type": "ranking",
  "description": string,
  "required": boolean,
  "options": [
    {
      "label": string,
      "value": string
    }
  ]
}
```

#### Text Feedback
Free-form text input.
```json
{
  "type": "text",
  "description": string,
  "required": boolean
}
```

### Dataset and Results

- `dataset`: Path to the JSONL file containing samples to label, relative to the `backend/data/datasets` directory. See [Dataset Format](dataset_format.md) for details on the dataset file structure.
- `results`: Path where labeling results will be stored as JSONL, relative to the `backend/data/results` directory

## Example Tasks

### Comparison Task
```json
{
  "taskInfo": {
    "name": "Basic Comparison Task",
    "description": "Compare two AI responses and rate their quality",
    "instructions": "Read both responses carefully and provide ratings for each aspect."
  },
  "dataset": "comparison_test.jsonl",
  "results": "comparison_results.jsonl",
  "presentation": {
    "type": "comparison",
    "displayType": "side_by_side"
  },
  "feedback": {
    "overall_quality": {
      "type": "numeric",
      "description": "Rate the overall quality of the responses",
      "min": 1,
      "max": 5,
      "step": 1,
      "minLabel": "Poor",
      "maxLabel": "Excellent",
      "defaultValue": 3
    },
    "preferred_response": {
      "type": "select",
      "description": "Which response do you prefer?",
      "options": [
        {"label": "Response 1", "value": "1"},
        {"label": "Response 2", "value": "2"}
      ]
    }
  }
}
```

### Single Evaluation Task
```json
{
  "taskInfo": {
    "name": "Single Response Evaluation",
    "description": "Evaluate the quality of individual AI responses",
    "instructions": "Read the response and rate various aspects of its quality."
  },
  "dataset": "single_test.jsonl",
  "results": "single_results.jsonl",
  "presentation": {
    "type": "single",
    "displayType": "standard"
  },
  "feedback": {
    "clarity": {
      "type": "numeric",
      "description": "Rate how clear and understandable the response is",
      "min": 1,
      "max": 5
    },
    "issues": {
      "type": "multiselect",
      "description": "Select any issues present in the response",
      "options": [
        {"label": "Grammar", "value": "grammar"},
        {"label": "Factual errors", "value": "factual_errors"},
        {"label": "Unclear explanation", "value": "unclear_explanation"}
      ]
    }
  }
}
```