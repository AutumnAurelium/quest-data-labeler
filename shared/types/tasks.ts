import { PresentationType, PresentationDisplayType, DatasetRef } from './presentation';
import { Feedback } from './feedback';
import { Sample } from './samples';

export type TaskDef = {
  taskInfo: {
    name: string;
    description: string;
    instructions: string;
  };
  presentation: {
    type: PresentationType;
    displayType: PresentationDisplayType;
  };
  feedback: Record<string, Feedback>;
  dataset: DatasetRef;
  results: string;
  resultsCount?: number;  // Number of lines in the results file
};

export type TaskResult = {
  sample: Sample;
  feedback: Record<string, string | string[] | number>;
  timestamp: string;
}; 