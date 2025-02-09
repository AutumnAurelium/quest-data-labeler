export type DatasetType = "jsonl" | "corruption";

export interface DatasetRef {
    type: DatasetType;
    name: string;
}

export interface JSONLDatasetRef extends DatasetRef {
    type: "jsonl";
}