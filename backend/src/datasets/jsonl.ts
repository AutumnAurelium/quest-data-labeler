import { DataSourceType, Sample } from "shared/types";
import { createReadStream } from "fs";
import * as readline from "readline";
import { dataDir } from "../data";
import { Dataset, DatasetMetadata } from "./index";

const JSONL_CACHE_MIN = 30;
const JSONL_CACHE_SIZE = 100;

export function datasetDir() {
    return `${dataDir()}/datasets`;
}

export class JSONLDataset implements Dataset {
    type: DataSourceType = "jsonl";
    metadata: DatasetMetadata | null;
    private name: string;
    private filePath: string;

    private cache: Sample[][] = [];

    constructor(name: string) {
        this.name = name;
        this.filePath = `${datasetDir()}/${name}` + (name.endsWith(".jsonl") ? "" : ".jsonl");

        this.metadata = null;
    }

    async init(): Promise<void> {
        const stream = createReadStream(this.filePath, { encoding: "utf-8" });
        const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

        const metadataLine = await rl[Symbol.asyncIterator]().next();
        if (!metadataLine.value || !metadataLine.value.trim()) {
            throw new Error("Dataset file is empty");
        }

        this.metadata = JSON.parse(metadataLine.value);

        if (!this.metadata) {
            throw new Error("Invalid dataset metadata format");
        }

        // validate metadata
        if (!this.metadata.total_samples || !this.metadata.sample_type || !this.metadata.samples_per_line) {
            throw new Error("Invalid dataset metadata format");
        }

        // Dummy run to fill cache
        await this.get_samples(1);
    }

    async get_samples(n: number): Promise<Sample[][]> {
        if (this.cache.length < n || this.cache.length < JSONL_CACHE_MIN) {
            this.cache = await sampleJSONL(this.name, JSONL_CACHE_SIZE);
        }

        const result = this.cache.splice(0, n);

        this.cache = this.cache.slice(n);

        return result;
    }
}

async function sampleJSONL(name: string, samples: number): Promise<Sample[][]> {
    const filePath = `${datasetDir()}/${name}` + (name.endsWith(".jsonl") ? "" : ".jsonl");
    const reservoir: Sample[][] = [];
    let lineCount = 0;

    // Create a readable stream for the dataset file.
    const stream = createReadStream(filePath, { encoding: "utf-8" });
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    // Read and validate metadata first
    const metadataLine = await rl[Symbol.asyncIterator]().next();
    if (!metadataLine.value || !metadataLine.value.trim()) {
        throw new Error("Dataset file is empty");
    }

    let metadata: DatasetMetadata;
    try {
        metadata = JSON.parse(metadataLine.value);
        if (!metadata.total_samples || !metadata.sample_type || !metadata.samples_per_line) {
            throw new Error("Invalid dataset metadata format");
        }
    } catch (error) {
        throw new Error(`Error parsing dataset metadata: ${error}`);
    }

    // Now process the samples
    for await (const line of rl) {
        if (!line.trim()) {
            // Skip empty lines.
            continue;
        }

        // Attempt to parse the JSON line.
        let sampleArray: Sample[];
        try {
            sampleArray = JSON.parse(line);
            if (!Array.isArray(sampleArray)) {
                throw new Error(`Line ${lineCount + 1} is not an array of samples`);
            }

            // Validate samples against metadata
            if (sampleArray.length !== metadata.samples_per_line) {
                throw new Error(`Line ${lineCount + 1} has ${sampleArray.length} samples, expected ${metadata.samples_per_line}`);
            }
            for (const sample of sampleArray) {
                if (sample.type !== metadata.sample_type) {
                    throw new Error(`Sample on line ${lineCount + 1} has type ${sample.type}, expected ${metadata.sample_type}`);
                }
            }
        } catch (error) {
            console.error(`Error parsing/validating JSON on line ${lineCount + 1}:`, error);
            continue;
        }

        if (lineCount < samples) {
            // Fill the reservoir array until we have 'samples' elements.
            reservoir.push(sampleArray);
        } else {
            // Randomly decide whether to include the current line.
            // Generate a random integer between 0 and the current lineCount (inclusive).
            const randomIndex = Math.floor(Math.random() * (lineCount + 1));
            if (randomIndex < samples) {
                reservoir[randomIndex] = sampleArray;
            }
        }
        lineCount++;
    }

    return reservoir;
}
