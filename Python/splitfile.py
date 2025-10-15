import sys
import os

# -------------------------------------------------------------
# simple text file splitter
# -------------------------------------------------------------
# python splitfile.py yourfile.txt 10000
# This will create files like:
# 1-10000.txt
# 10001-20000.txt
# 20001-30000.txt
# ...

def split_file(filename, chunk_size):
    if not os.path.isfile(filename):
        print(f"Error: File '{filename}' not found.")
        return

    with open(filename, 'r', encoding='utf-8') as f:
        line_count = 0
        chunk_index = 0
        lines = []
        for line in f:
            lines.append(line)
            line_count += 1
            if line_count % chunk_size == 0:
                start = chunk_index * chunk_size + 1
                end = start + chunk_size - 1
                output_filename = f"{start}-{end}.txt"
                with open(output_filename, 'w', encoding='utf-8') as out:
                    out.writelines(lines)
                lines = []
                chunk_index += 1

        # Write remaining lines if any
        if lines:
            start = chunk_index * chunk_size + 1
            end = start + len(lines) - 1
            output_filename = f"{start}-{end}.txt"
            with open(output_filename, 'w', encoding='utf-8') as out:
                out.writelines(lines)

    print("File splitting complete.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python splitfile.py <filename> <chunk_size>")
    else:
        input_filename = sys.argv[1]
        chunk_size = int(sys.argv[2])
        split_file(input_filename, chunk_size)
