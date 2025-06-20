from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from typing import List
from config.settings import settings
import logging
from pydantic import Field
from langchain_chroma import Chroma

logger = logging.getLogger(__name__)

class Retriever(BaseRetriever):
    
    vectorstore: Chroma = Field(...)
    top_k: int = Field(default=settings.TOP_K)

    def _get_relevant_documents(self, query: str) -> List[Document]:
        try:
            docs = self.vectorstore.similarity_search(query, k=self.top_k)
            logger.info(f"Retrieved {len(docs)} documents for query: {query}")
            return docs
        except Exception as e:
            logger.error(f"Retrieval failed for query '{query}': {e}")
            raise