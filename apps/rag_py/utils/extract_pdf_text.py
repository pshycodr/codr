import pymupdf  # fitz is now pymupdf


def extract_pdf_text(file_path: str) -> str:
    with pymupdf.open(file_path) as doc:
        text = chr(12).join([page.get_text() for page in doc])
    return text
