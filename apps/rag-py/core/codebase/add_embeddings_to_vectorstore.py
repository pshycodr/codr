from core.vectorstore import get_chroma_client
from tqdm import tqdm
import logging

logger = logging.getLogger(__name__)

def add_embeddings_to_vectorstore(collection_name: str, enriched_chunks: list[dict]):
    logger.info(f"Storing embeddings in ChromaDB for collection '{collection_name}'")
    
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=collection_name)

    ids = []
    documents = []
    metadatas = []
    embeddings_list = []

    for i, chunk in enumerate(tqdm(enriched_chunks, desc="Preparing chunks for Chroma")):
        ids.append(str(i))
        documents.append(chunk['code'])
        metadatas.append({
            'file_path': chunk['file_path'],
            'entity_type': chunk['entity_type'],
            'entity_name': chunk['entity_name'],
            'start_line': chunk['start_line'],
            'end_line': chunk['end_line'],
            'description': chunk['description'],
            'isFunction': chunk['isFunction'],
        })
        embeddings_list.append(chunk['embedding'])

    try:
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings_list
        )
        logger.info(f"Successfully stored {len(documents)} embeddings in ChromaDB")

        return {'success' : True}
    except Exception as e:
        logger.error(f"Error storing embeddings in ChromaDB: {e}")
