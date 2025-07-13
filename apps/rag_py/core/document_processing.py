import logging
import os
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from apps.rag_py.config.settings import settings
from apps.rag_py.core.loaders import load_doc_file

logger = logging.getLogger(__name__)

def load_and_split_documents(path: str, req_type: str) -> List[Document]:
    """Load and split documents from URL"""
    try:
        logger.info(f"Loading documents from: {path}")
        
        docs = load_doc_file(path, req_type)
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
        )
        
        splits = text_splitter.split_documents(docs)
        logger.info(f"Split into {len(splits)} chunks")        
        return splits
    except Exception as e:
        logger.error(f"Failed to load documents: {e}")
        raise