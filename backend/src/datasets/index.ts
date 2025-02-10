import { DatasetType, Sample, DatasetRef } from "shared/types";
import { JSONLDataset } from "./jsonl";

export interface Dataset {
    type: DatasetType;
    metadata: DatasetMetadata | null;

    init(): Promise<void>;
    get_samples(n: number): Promise<Sample[][]>;
}

export interface DatasetMetadata {
    total_samples: number;
    sample_type: string;
    samples_per_line: number;
    hidden_metadata: string[];
}

const DATASET_REGISTRY: Record<string, Dataset> = {};

export function getOrCreateDataset(ref: DatasetRef): Dataset {
    if (!DATASET_REGISTRY[ref.name]) {
        if (ref.type === "jsonl") {
            DATASET_REGISTRY[ref.name] = new JSONLDataset(ref.name);
            DATASET_REGISTRY[ref.name].init();
        } else {
            throw new Error(`Unknown dataset type: ${ref.type}`);
        }
    }

    return DATASET_REGISTRY[ref.name];
}
