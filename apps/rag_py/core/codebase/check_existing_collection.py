import logging

from apps.rag_py.core.vectorstore import get_chroma_client

logger = logging.getLogger(__name__)

def check_existing_collection(collection_name: str):
    try:
        logger.info(f"Check exiting collecion for: '{collection_name}'")
    
        client = get_chroma_client()
        collection = client.get_collection(name=collection_name)
        print(collection)
        return True
    except:
        return False