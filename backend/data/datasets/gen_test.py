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

def generate_metadata(timestamp: datetime, content_type: str, **kwargs) -> Dict[str, str]:
    metadata = {
        "timestamp": timestamp.isoformat(),
        "content_type": content_type,
    }
    
    # Add character counts and other metadata based on content type and kwargs
    if content_type == "chat_completion":
        metadata.update({
            "system_char_count": str(len(kwargs.get("system_content", ""))),
            "user_char_count": str(len(kwargs.get("user_content", ""))),
            "assistant_char_count": str(len(kwargs.get("assistant_content", ""))),
            "total_messages": str(len(kwargs.get("prompt", [])) + len(kwargs.get("completion", [])))
        })
    elif content_type == "text_completion":
        metadata.update({
            "prompt_char_count": str(len(kwargs.get("prompt", ""))),
            "completion_char_count": str(len(kwargs.get("completion", ""))),
            "total_char_count": str(len(kwargs.get("prompt", "")) + len(kwargs.get("completion", "")))
        })
    else:  # text
        metadata.update({
            "text_char_count": str(len(kwargs.get("text", "")))
        })
    
    # Add some random metadata for testing
    metadata["sample_temperature"] = f"{random.uniform(0.1, 1.0):.2f}"
    metadata["model_version"] = f"test-model-{random.randint(1, 5)}"
    
    return metadata

def generate_dataset(num_samples: int, sample_type: str = "text_completion", num_options: int = 2) -> List[List[Dict[str, Any]]]:
    time_end = datetime.now()
    time_start = time_end - timedelta(days=7)
    samples = []
    
    for _ in range(num_samples):
        random_timestamp = time_start + timedelta(
            seconds=random.randint(0, int((time_end - time_start).total_seconds()))
        )
        cur_uid = uid()
        
        if sample_type == "chat_completion":
            system_msg = "You are a helpful AI assistant."
            user_msg = lorem_ipsum(random.randint(10, 100))
            assistant_msg = lorem_ipsum(random.randint(10, 200))
            
            group = [
                {
                    "type": "chat_completion",
                    "id": f"{cur_uid}_{i}",
                    "metadata": generate_metadata(
                        random_timestamp,
                        "chat_completion",
                        system_content=system_msg,
                        user_content=user_msg,
                        assistant_content=assistant_msg,
                        prompt=[{"role": "system", "content": system_msg},
                               {"role": "user", "content": user_msg}],
                        completion=[{"role": "assistant", "content": assistant_msg}]
                    ),
                    "prompt": [
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    "completion": [
                        {"role": "assistant", "content": assistant_msg}
                    ]
                } for i in range(num_options)
            ]
        elif sample_type == "text_completion":
            prompt = PROMPT_FORMAT.format(cur_uid, lorem_ipsum(random.randint(10, 200)))
            completion = RESPONSE_FORMAT.format(lorem_ipsum(random.randint(10, 500)))
            
            group = [
                {
                    "type": "text_completion",
                    "id": f"{cur_uid}_{i}",
                    "metadata": generate_metadata(
                        random_timestamp,
                        "text_completion",
                        prompt=prompt,
                        completion=completion
                    ),
                    "prompt": prompt,
                    "completion": completion
                } for i in range(num_options)
            ]
        else:  # text
            text = lorem_ipsum(random.randint(50, 500))
            group = [
                {
                    "type": "text",
                    "id": f"{cur_uid}_{i}",
                    "metadata": generate_metadata(
                        random_timestamp,
                        "text",
                        text=text
                    ),
                    "text": text
                } for i in range(num_options)
            ]
        
        samples.append(group)
    
    return samples

def save_dataset(samples: List[List[Dict[str, Any]]], filename: str, hidden_metadata: List[str] = None):
    if not samples:
        raise ValueError("Cannot save empty dataset")
        
    # Validate samples
    sample_type = samples[0][0]["type"]
    samples_per_line = len(samples[0])
    
    for i, group in enumerate(samples):
        if len(group) != samples_per_line:
            raise ValueError(f"Group at index {i} has {len(group)} samples, expected {samples_per_line}")
        for sample in group:
            if sample["type"] != sample_type:
                raise ValueError(f"Sample in group {i} has type {sample['type']}, expected {sample_type}")
    
    # Create metadata
    metadata = {
        "total_samples": len(samples),
        "sample_type": sample_type,
        "samples_per_line": samples_per_line,
        "hidden_metadata": hidden_metadata or []
    }
    
    # Filter out hidden metadata if specified
    if hidden_metadata:
        for group in samples:
            for sample in group:
                if "metadata" in sample:
                    sample["metadata"] = {k: v for k, v in sample["metadata"].items() 
                                       if k not in hidden_metadata}
    
    with open(filename, "w") as f:
        # Write metadata as first line
        f.write(json.dumps(metadata) + "\n")
        # Write samples
        f.write("\n".join(json.dumps(group) for group in samples))

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

# 1. Chat completion comparison task
comparison_samples = generate_dataset(100, sample_type="chat_completion", num_options=2)
save_dataset(comparison_samples, "../datasets/comparison_test.jsonl", 
            hidden_metadata=["sample_temperature", "model_version"])

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
            "options": [
                {"label": "Response 1", "value": "1"},
                {"label": "Response 2", "value": "2"}
            ]
        },
        "comments": {
            "type": "text",
            "label": "Additional Comments",
            "description": "Provide any additional feedback"
        }
    }
)

# 2. Text completion single response evaluation task
single_samples = generate_dataset(100, sample_type="text_completion", num_options=1)
save_dataset(single_samples, "../datasets/single_test.jsonl",
            hidden_metadata=["sample_temperature"])

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
            "options": [
                {"label": "Grammar", "value": "grammar"},
                {"label": "Factual errors", "value": "factual_errors"},
                {"label": "Unclear explanation", "value": "unclear_explanation"},
                {"label": "Off-topic", "value": "off_topic"}
            ]
        }
    }
)

# 3. Text sample stacked comparison task
stacked_samples = generate_dataset(100, sample_type="text", num_options=3)
save_dataset(stacked_samples, "../datasets/stacked_test.jsonl",
            hidden_metadata=["model_version"])

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
            "options": [
                {"label": "Response 1", "value": "1"},
                {"label": "Response 2", "value": "2"},
                {"label": "Response 3", "value": "3"}
            ]
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