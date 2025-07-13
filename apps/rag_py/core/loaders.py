import os
from pathlib import Path
from urllib.parse import urlparse

from langchain_community.document_loaders import (
    CSVLoader,
    PyMuPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
    UnstructuredWordDocumentLoader,
    WebBaseLoader,
)
from langchain_core.documents import Document

from apps.rag_py.config.settings import settings
from apps.rag_py.utils.sanitize_text import sanitize_text


def load_doc_file(file_path: str, req_type: str) -> list[Document]:
    print(f"File Path: {file_path}")
    path = Path(file_path)
    suffix = path.suffix.lower()
    try:
        if req_type == 'webpage' : 
            parsed_url = urlparse(file_path)
            loader = WebBaseLoader(
                file_path,
                requests_kwargs={
                    'headers': {'User-Agent': os.environ['USER_AGENT']},
                    'timeout': settings.TIMEOUT
                }
            )

        elif suffix == ".pdf":
           loader = PyMuPDFLoader(str(path))
        elif suffix == ".txt":
            loader = TextLoader(str(path), encoding="utf-8")
        elif suffix == ".csv":
            loader = CSVLoader(str(path))
        elif suffix == ".docx":
            loader = UnstructuredWordDocumentLoader(str(path))
        elif suffix == ".md":
            loader = UnstructuredMarkdownLoader(str(path))
        else:
            print(f"Unsupported file type: {suffix}")
            return []

        docs = loader.load()
        for doc in docs:
            doc.metadata["source"] = str(path)
            doc.page_content = sanitize_text(doc.page_content)

        return docs
    except Exception as e:
        print(f"Failed to load {file_path}: {e}")
        return []
