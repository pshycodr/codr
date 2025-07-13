import re
from pathlib import Path


def sanitize_collection_name(path: str) -> str:
    # 1. Replace invalid chars with underscore
    name = re.sub(r'[^a-zA-Z0-9._-]', '_', path)

    # 2. Trim to 512 chars max
    name = name[:512]

    # 3. Ensure starts and ends with alphanumeric
    name = re.sub(r'^[^a-zA-Z0-9]+', '', name)  # Remove invalid prefix
    name = re.sub(r'[^a-zA-Z0-9]+$', '', name)  # Remove invalid suffix

    # 4. Ensure minimum length
    return name if len(name) >= 3 else "default_collection"
