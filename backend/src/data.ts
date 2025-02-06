import fs from "fs";

export function dataDir(): string {
    // if $DATA_DIR is set, use it, otherwise use ./data
    return process.env.DATA_DIR || "./data";
}

export function ensureDirectoriesExist() {
    const dataDirName = dataDir();
    if (!fs.existsSync(dataDirName)) {
        fs.mkdirSync(dataDirName, { recursive: true });
    }

    const datasetsDir = `${dataDirName}/datasets`;
    if (!fs.existsSync(datasetsDir)) {
        fs.mkdirSync(datasetsDir, { recursive: true });
    }

    const resultsDir = `${dataDirName}/results`;
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    const tasksDir = `${dataDirName}/tasks`;
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir, { recursive: true });
    }
}
