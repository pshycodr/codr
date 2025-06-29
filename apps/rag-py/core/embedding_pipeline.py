from core.embeddings import get_embeddings
from core.loaders import load_doc_file
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List
from tqdm import tqdm
import logging

logger = logging.getLogger(__name__)


def load_documents(path: str, req_type: str) -> List[Document]:
    return load_doc_file(path, req_type)


def split_documents(docs: List[Document]) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200, length_function=len
    )
    return splitter.split_documents(docs)


def create_input_texts(chunks: List[Document]) -> List[dict]:
    result = []
    for chunk in chunks:
        metadata = chunk.metadata or {}
        input_text = (
            f"Source: {metadata.get('source', '')}\n"
            f"Content:\n{chunk.page_content}"
        )
        result.append({
            "text": input_text,
            "original_text": chunk.page_content,
            "metadata": metadata,
        })
    return result


def create_embeddings(text_chunks: List[dict]) -> List[dict]:
    embedder = get_embeddings()
    texts = [item["text"] for item in text_chunks]
    vectors = embedder.embed_documents(texts)

    enriched = []
    for i, item in enumerate(text_chunks):
        enriched.append({
            "embedding": vectors[i],
            "text": item["original_text"],
            "metadata": item["metadata"],
            "id": f"{item['metadata'].get('source', 'doc')}_{i}"
        })
    return enriched


def add_embeddings_to_vectorstore(collection_name: str, enriched_chunks: List[dict]):
    from core.vectorstore import get_chroma_client
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=collection_name)

    texts = [e["text"] for e in enriched_chunks]
    metadatas = [e["metadata"] for e in enriched_chunks]
    vectors = [e["embedding"] for e in enriched_chunks]
    ids = [e["id"] for e in enriched_chunks]

    collection.add(
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas,
        ids=ids
    )

    logger.info(f"Added {len(texts)} chunks to collection: {collection_name}")
