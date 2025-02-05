import { createReadStream } from "fs";
import { dataDir } from "./data";
import * as readline from "readline";
import { Sample } from "../../shared/types";

function datasetDir() {
  return `${dataDir()}/datasets`;
}

export async function sampleDataset(name: string, samples: number): Promise<Sample[]> {
  const filePath = `${datasetDir()}/${name}` + (name.endsWith(".jsonl") ? "" : ".jsonl");
  const reservoir: Sample[] = [];
  let lineCount = 0;

  // Create a readable stream for the dataset file.
  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    if (!line.trim()) {
      // Optionally skip empty lines.
      continue;
    }

    // Attempt to parse the JSON line.
    let obj;
    try {
      obj = JSON.parse(line);
    } catch (error) {
      console.error(`Error parsing JSON on line ${lineCount + 1}:`, error);
      continue;
    }
    
    if (lineCount < samples) {
      // Fill the reservoir array until we have 'samples' elements.
      reservoir.push(obj);
    } else {
      // Randomly decide whether to include the current line.
      // Generate a random integer between 0 and the current lineCount (inclusive).
      const randomIndex = Math.floor(Math.random() * (lineCount + 1));
      if (randomIndex < samples) {
        reservoir[randomIndex] = obj;
      }
    }
    lineCount++;
  }
  
  return reservoir;
}
