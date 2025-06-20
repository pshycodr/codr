from core.vectorstore import initialize_vectorstore
from core.retriever import Retriever
from core.document_processing import load_and_split_documents
from config.settings import settings
from config.logging_config import configure_logging
import logging
import time
import os

logger = logging.getLogger(__name__)

configure_logging()

def run_rag_pipeline(url: str, query: str) -> list[str]:
    COLLECTION_NAME = url.replace('https://', '').replace('/', '_')[:400]
    os.environ['USER_AGENT'] = settings.USER_AGENT

    start_time = time.time()
    documents = load_and_split_documents(url)
    vectorstore = initialize_vectorstore(COLLECTION_NAME, documents)
    retriever = Retriever(vectorstore=vectorstore)
    results = retriever.invoke(query)

    logger.info(f"RAG completed in {time.time() - start_time:.2f}s")
    return [doc.page_content for doc in results]
