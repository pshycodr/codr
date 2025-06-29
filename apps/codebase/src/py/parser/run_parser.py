import sys
import json
from extract_code_entities import extract_code_entities

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_parser.py <file_path>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        entities = extract_code_entities(file_path)
        print(json.dumps(entities))
    except Exception as e:
        print(f"❌ Error parsing file {file_path}: {str(e)}", file=sys.stderr)
        sys.exit(1)
