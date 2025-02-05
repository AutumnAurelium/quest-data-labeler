import json
from datetime import datetime, timedelta
import random
import string
import os
from typing import List, Dict, Any

def uid():
    return "".join([random.choice(string.ascii_letters + string.digits) for _ in range(32)])

lorem_ipsum_words = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"
]

def lorem_ipsum(length: int):
    return " ".join([random.choice(lorem_ipsum_words) for _ in range(length)])

PROMPT_FORMAT = """EXAMPLE PROMPT {}\n\n{}"""
RESPONSE_FORMAT = """ {}"""

def generate_dataset(num_samples: int, num_options: int = 2) -> List[Dict[str, Any]]:
    time_end = datetime.now()
    time_start = time_end - timedelta(days=7)
    samples = []
    
    for _ in range(num_samples):
        random_timestamp = time_start + timedelta(
            seconds=random.randint(0, int((time_end - time_start).total_seconds()))
        )
        cur_uid = uid()
        
        data = {
            "id": cur_uid,
            "timestamp": random_timestamp.isoformat(),
            "options": [
                {
                    "prompt": PROMPT_FORMAT.format(cur_uid, lorem_ipsum(random.randint(10, 200))),
                    "completion": RESPONSE_FORMAT.format(lorem_ipsum(random.randint(10, 500)))
                } for _ in range(num_options)
            ]
        }
        samples.append(data)
    
    return samples

def save_dataset(samples: List[Dict[str, Any]], filename: str):
    with open(filename, "w") as f:
        f.write("\n".join(json.dumps(sample) for sample in samples))

def generate_task_config(
    name: str,
    description: str,
    instructions: str,
    dataset_path: str,
    results_path: str,
    presentation_type: str,
    display_type: str,
    feedback_config: Dict[str, Any]
) -> Dict[str, Any]:
    return {
        "taskInfo": {
            "name": name,
            "description": description,
            "instructions": instructions
        },
        "dataset": dataset_path,
        "results": results_path,
        "presentation": {
            "type": presentation_type,
            "displayType": display_type
        },
        "feedback": feedback_config
    }

# Ensure directories exist
os.makedirs("../datasets", exist_ok=True)
os.makedirs("../tasks", exist_ok=True)
os.makedirs("../results", exist_ok=True)

# Generate different types of datasets and tasks

# 1. Basic comparison task with side-by-side display
comparison_samples = generate_dataset(100, num_options=2)
save_dataset(comparison_samples, "../datasets/comparison_test.jsonl")

comparison_task = generate_task_config(
    name="Basic Comparison Task",
    description="Compare two AI responses and rate their quality",
    instructions="Read both responses carefully and provide ratings for each aspect.",
    dataset_path="comparison_test.jsonl",
    results_path="comparison_results.jsonl",
    presentation_type="comparison",
    display_type="side_by_side",
    feedback_config={
        "overall_quality": {
            "type": "numeric",
            "label": "Overall Quality",
            "description": "Rate the overall quality of the responses",
            "min": 1,
            "max": 5
        },
        "preferred_response": {
            "type": "select",
            "label": "Preferred Response",
            "description": "Which response do you prefer?",
            "options": ["Response 1", "Response 2"]
        },
        "comments": {
            "type": "text",
            "label": "Additional Comments",
            "description": "Provide any additional feedback"
        }
    }
)

# 2. Single response evaluation task
single_samples = generate_dataset(100, num_options=1)
save_dataset(single_samples, "../datasets/single_test.jsonl")

single_task = generate_task_config(
    name="Single Response Evaluation",
    description="Evaluate the quality of individual AI responses",
    instructions="Read the response and rate various aspects of its quality.",
    dataset_path="single_test.jsonl",
    results_path="single_results.jsonl",
    presentation_type="single",
    display_type="standard",
    feedback_config={
        "clarity": {
            "type": "numeric",
            "label": "Clarity",
            "description": "Rate how clear and understandable the response is",
            "min": 1,
            "max": 5
        },
        "accuracy": {
            "type": "numeric",
            "label": "Accuracy",
            "description": "Rate how accurate the information is",
            "min": 1,
            "max": 5
        },
        "issues": {
            "type": "multiselect",
            "label": "Issues",
            "description": "Select any issues present in the response",
            "options": ["Grammar", "Factual errors", "Unclear explanation", "Off-topic"]
        }
    }
)

# 3. Stacked comparison task
stacked_samples = generate_dataset(100, num_options=3)
save_dataset(stacked_samples, "../datasets/stacked_test.jsonl")

stacked_task = generate_task_config(
    name="Multi-Response Comparison",
    description="Compare three AI responses stacked vertically",
    instructions="Review all three responses and provide comparative feedback.",
    dataset_path="stacked_test.jsonl",
    results_path="stacked_results.jsonl",
    presentation_type="comparison",
    display_type="stacked",
    feedback_config={
        "ranking": {
            "type": "ranking",
            "label": "Response Ranking",
            "description": "Rank the responses from best to worst",
            "options": ["Response 1", "Response 2", "Response 3"]
        },
        "best_aspects": {
            "type": "text",
            "label": "Best Aspects",
            "description": "What made the top-ranked response better?"
        }
    }
)

# Save task configurations
for task_name, task_config in [
    ("comparison_task.json", comparison_task),
    ("single_task.json", single_task),
    ("stacked_task.json", stacked_task)
]:
    with open(f"../tasks/{task_name}", "w") as f:
        json.dump(task_config, f, indent=2)

print("Generated test datasets and task configurations successfully!")