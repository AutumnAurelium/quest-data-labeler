import { readFileSync, createWriteStream, readdirSync, existsSync } from "fs";
import { dataDir } from "./data";
import { TaskDef } from "../../shared/types";

function taskDir() {
  return `${dataDir()}/tasks`;
}

function resultsDir() {
  return `${dataDir()}/results`;
}

function countFileLines(filePath: string): number {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(line => line.trim().length > 0).length;
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return 0;  // File doesn't exist yet
    }
    throw error;
  }
}

export function getTasks(): string[] {
  const tasks = readdirSync(taskDir());
  return tasks.map((task) => task.replace(".json", ""));
}

export function getTask(name: string): TaskDef {
  try {
    const taskFile = readFileSync(`${taskDir()}/${name}.json`, "utf-8");
    const task = JSON.parse(taskFile) as TaskDef;

    // Validate required fields
    if (
      !task.taskInfo?.name ||
      !task.taskInfo?.description ||
      !task.taskInfo?.instructions
    ) {
      throw new Error("Missing required taskInfo fields");
    }
    if (!task.presentation?.type || !task.presentation?.displayType) {
      throw new Error("Missing required presentation fields");
    }
    if (!task.feedback || Object.keys(task.feedback).length === 0) {
      throw new Error("Task must have at least one feedback type");
    }
    if (!task.dataset || !task.results) {
      throw new Error("Missing dataset or results path");
    }

    // Count lines in results file
    const resultsFile = `${resultsDir()}/${task.results}` + (task.results.endsWith(".jsonl") ? "" : ".jsonl");
    task.resultsCount = countFileLines(resultsFile);

    return task;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        throw new Error(`Task '${name}' not found`);
      }
      throw error;
    }
    throw new Error("Unknown error while reading task file");
  }
}

export async function appendResults(name: string, results: object) {
  // Verify that object matches existing results
  const resultsFile = `${resultsDir()}/${name}` + (name.endsWith(".jsonl") ? "" : ".jsonl");
  try {
    // Read first line of results file if it exists
    const firstLine = readFileSync(resultsFile, "utf-8").split("\n")[0];
    if (firstLine) {
      const existingFormat = Object.keys(JSON.parse(firstLine)).sort();
      const newFormat = Object.keys(results).sort();

      if (JSON.stringify(existingFormat) !== JSON.stringify(newFormat)) {
        throw new Error("New results format does not match existing format");
      }
    }
  } catch (error) {
    if (error instanceof Error && !error.message.includes("ENOENT")) {
      // Ignore file not found error
      throw error;
    }
  }

  // Append results to JSONL file
  const stream = createWriteStream(resultsFile, { flags: existsSync(resultsFile) ? "a" : "w" });
  stream.write(JSON.stringify(results) + "\n");
}
