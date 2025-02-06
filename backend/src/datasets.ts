import { createReadStream } from "fs";
import { dataDir } from "./data";
import * as readline from "readline";
import { Sample } from "../../shared/types";

interface DatasetMetadata {
  total_samples: number;
  sample_type: string;
  samples_per_line: number;
  hidden_metadata: string[];
}

const CACHE_MIN = 30;
const CACHE_SIZE = 100;
const sampleCache = new Map<string, Sample[][]>();

function datasetDir() {
  return `${dataDir()}/datasets`;
}

export async function sampleDataset(name: string, samples: number): Promise<Sample[][]> {
  // Check if we need to refill cache
  if (!sampleCache.has(name) || sampleCache.get(name)!.length < CACHE_MIN) {
    const newSamples = await fetchSamples(name, CACHE_SIZE);
    const existing = sampleCache.get(name) || [];
    sampleCache.set(name, existing.concat(newSamples));
  }

  // Get samples from cache
  const cache = sampleCache.get(name)!;
  const result = cache.splice(0, samples);
  return result;
}

async function fetchSamples(name: string, samples: number): Promise<Sample[][]> {
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
