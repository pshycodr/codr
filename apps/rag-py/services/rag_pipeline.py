from core.vectorstore import initialize_vectorstore
from core.retriever import Retriever
from core.document_processing import load_and_split_documents
from config.settings import settings
from config.logging_config import configure_logging
import logging
import time
import os
from utils.sanitize_collection_name import sanitize_collection_name

logger = logging.getLogger(__name__)

configure_logging()

def run_rag_pipeline(path: str, query: str, req_type: str) -> list[str]:
    COLLECTION_NAME = sanitize_collection_name(path)
    os.environ['USER_AGENT'] = settings.USER_AGENT

    start_time = time.time()
    documents = load_and_split_documents(path, req_type)
    vectorstore = initialize_vectorstore(COLLECTION_NAME, documents)
    retriever = Retriever(vectorstore=vectorstore)
    results = retriever.invoke(query)

    logger.info(f"RAG completed in {time.time() - start_time:.2f}s")
    return [doc.page_content for doc in results]
