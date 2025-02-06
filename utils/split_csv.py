import csv
import os

def split_csv(file_path, output_dir, chunk_size):
    """
    Splits a CSV file into smaller chunks.
    
    :param file_path: Path to the input CSV file.
    :param output_dir: Directory where the split files will be saved.
    :param chunk_size: Number of rows per chunk (excluding header).
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    with open(file_path, 'r', encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        header = next(reader)  # Read the header row
        
        file_count = 1
        rows = []
        
        for i, row in enumerate(reader, start=1):
            rows.append(row)
            if i % chunk_size == 0:
                output_file = os.path.join(output_dir, f'chunk_{file_count}.csv')
                with open(output_file, 'w', encoding='utf-8', newline='') as output_file:
                    writer = csv.writer(output_file)
                    writer.writerow(header)  # Write the header
                    writer.writerows(rows)  # Write the rows
                print(f'Created: {output_file}')
                file_count += 1
                rows = []
        
        # Write remaining rows to a new file
        if rows:
            output_file = os.path.join(output_dir, f'chunk_{file_count}.csv')
            with open(output_file, 'w', encoding='utf-8', newline='') as output_file:
                writer = csv.writer(output_file)
                writer.writerow(header)  # Write the header
                writer.writerows(rows)  # Write the rows
            print(f'Created: {output_file}')


# Usage
if __name__ == "__main__":
    input_file = 'C:/Users/jpitt/Downloads/bg_11-16.csv'  # Path to the large CSV file
    output_directory = 'C:/Users/jpitt/Downloads/split_files'  # Output directory
    rows_per_chunk = 300000  # Number of rows per chunk (excluding header)
    
    split_csv(input_file, output_directory, rows_per_chunk)
