import logging
import os
import time

from apps.rag_py.config.logging_config import configure_logging
from apps.rag_py.config.settings import settings
from apps.rag_py.core.document_processing import load_and_split_documents
from apps.rag_py.core.retriever import Retriever
from apps.rag_py.core.vectorstore import initialize_vectorstore
from apps.rag_py.utils.sanitize_collection_name import sanitize_collection_name

logger = logging.getLogger(__name__)
configure_logging()

# session_id -> Retriever
session_store: dict[str, Retriever] = {}

def run_rag_pipeline(path: str, query: str, req_type: str) -> list[str]:
    logger.info("Starting RAG pipeline")

    COLLECTION_NAME = sanitize_collection_name(path)
    logger.info(f"Sanitized collection name: {COLLECTION_NAME}")
    os.environ['USER_AGENT'] = settings.USER_AGENT

    start_time = time.time()

    documents = load_and_split_documents(path, req_type)
    logger.info(f"Loaded and split {len(documents)} documents")

    vectorstore = initialize_vectorstore(COLLECTION_NAME, documents)

    retriever = Retriever(vectorstore=vectorstore)

    results = retriever.invoke(query)

    duration = time.time() - start_time
    logger.info(f"RAG completed in {duration:.2f} seconds")

    return [doc.page_content for doc in results]



def init_session(session_id: str, path: str, doc_type: str):
    logger.info(f"Initializing session: {session_id}")

    COLLECTION_NAME = sanitize_collection_name(path)
    logger.info(f"Sanitized collection name: {COLLECTION_NAME}")

    documents = load_and_split_documents(path, doc_type)
    logger.info(f"Loaded and split {len(documents)} documents for session: {session_id}")

    vectorstore = initialize_vectorstore(COLLECTION_NAME, documents)

    retriever = Retriever(vectorstore=vectorstore)

    from services import rag_pipeline
    rag_pipeline.session_store[session_id] = retriever
    logger.info(f"Retriever stored for session: {session_id}")

    return retriever


def query_session(session_id: str, query: str) -> list[str]:
    logger.info(f"Querying session: {session_id}")

    retriever = session_store.get(session_id)
    if not retriever:
        logger.error("Invalid session_id")
        raise ValueError("Invalid session_id")

    results = retriever.invoke(query)

    logger.info(f"Query completed for session: {session_id}")
    return [doc.page_content for doc in results]
