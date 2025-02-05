export function dataDir() {
    // if $DATA_DIR is set, use it, otherwise use ./data
    return process.env.DATA_DIR || "./data";
}
