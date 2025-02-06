import pandas as pd
import json
import argparse

def convert_parquet_to_dataset(input_path, output_path):
    # Read parquet file
    df = pd.read_parquet(input_path)
    
    # Shuffle the dataframe
    df = df.sample(frac=1, random_state=2468).reset_index(drop=True)
    
    # Create metadata header
    metadata = {
        "total_samples": len(df),
        "sample_type": "text",
        "samples_per_line": 2,
        "hidden_metadata": []
    }
    
    # Write to JSONL format
    with open(output_path, 'w') as f:
        # Write metadata line
        f.write(json.dumps(metadata) + '\n')
        
        # Write pairs of samples
        for i in range(0, len(df), 2):
            if i + 1 >= len(df):
                break
            # Get two consecutive rows
            row1 = df.iloc[i]
            row2 = df.iloc[i+1]
            
            # Create pair of samples
            sample_pair = [
                {
                    "type": "text",
                    "id": str(row1['id']),
                    "metadata": {"url": row1['url']},
                    "text": row1['text']
                },
                {
                    "type": "text",
                    "id": str(row2['id']),
                    "metadata": {"url": row2['url']},
                    "text": row2['text']
                }
            ]
            f.write(json.dumps(sample_pair) + '\n')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Convert Parquet file to dataset JSONL format',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('input', help='Path to input Parquet file')
    parser.add_argument('output', help='Path to output JSONL file')
    args = parser.parse_args()
    
    convert_parquet_to_dataset(args.input, args.output)