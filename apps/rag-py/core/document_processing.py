from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document
from config.settings import settings
import os
import logging
from urllib.parse import urlparse
from utils.sanitize_text import sanitize_text

logger = logging.getLogger(__name__)

def load_and_split_documents(url: str) -> List[Document]:
    """Load and split documents from URL"""
    try:
        logger.info(f"Loading documents from: {url}")
        
        # Configure loader
        parsed_url = urlparse(url)
        loader = WebBaseLoader(
            url,
            requests_kwargs={
                'headers': {'User-Agent': os.environ['USER_AGENT']},
                'timeout': settings.TIMEOUT
            }
        )
        
        # Load and split documents
        docs = loader.load()

        for doc in docs:
            doc.page_content = sanitize_text(doc.page_content)
        
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