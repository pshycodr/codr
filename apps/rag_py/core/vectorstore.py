import logging
from typing import List, Optional

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document

from apps.rag_py.config.settings import settings
from apps.rag_py.core.embeddings import get_embeddings

logger = logging.getLogger(__name__)

def get_chroma_client():
    """Create and return a ChromaDB client"""
    return chromadb.PersistentClient(path=settings.PERSIST_DIR)

def initialize_vectorstore(collection_name: str, documents: List[Document] = None) -> Chroma:
    """Initialize vectorstore with optional documents"""
    client = get_chroma_client()
    embeddings = get_embeddings()
    
    try:
        # Check if collection exists and has documents
        existing_collections = [col.name for col in client.list_collections()]
        if collection_name in existing_collections:
            collection = client.get_collection(collection_name)
            if collection.count() > 0:
                logger.info(f"Using existing collection with {collection.count()} documents")
                return Chroma(
                    client=client,
                    collection_name=collection_name,
                    embedding_function=embeddings,
                    persist_directory=settings.PERSIST_DIR
                )
        
        # Create new collection with documents if provided
        logger.info(f"Creating new collection: {collection_name}")
        if documents:
            logger.info(f"Indexing {len(documents)} documents")
            return Chroma.from_documents(
                documents=documents,
                embedding=embeddings,
                collection_name=collection_name,
                persist_directory=settings.PERSIST_DIR,
                client=client
            )
        return Chroma(
            client=client,
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=settings.PERSIST_DIR
        )
    except Exception as e:
        logger.error(f"Vectorstore initialization failed: {e}")
        raise

def get_vectorstore(collection_name: str) -> Chroma:
    client = get_chroma_client()
    embeddings = get_embeddings()
    return Chroma(
        client=client,
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=settings.PERSIST_DIR,
    )
