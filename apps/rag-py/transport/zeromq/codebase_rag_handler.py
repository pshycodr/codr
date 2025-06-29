from core.codebase.create_embeddings import create_embeddings
from core.codebase.add_embeddings_to_vectorstore import add_embeddings_to_vectorstore
from core.vectorstore import get_vectorstore
from core.retriever import Retriever
import logging
from config.logging_config import configure_logging
from utils.sanitize_collection_name import sanitize_collection_name
import time
import os
from config.settings import settings
from core.codebase.check_existing_collection import check_existing_collection

logger = logging.getLogger(__name__)
configure_logging()


def retrieve_data(collection_name: str, query:str):

    logger.info(f"Retrieving Started for: {collection_name}")
    start_time = time.time()
    vectorstore = get_vectorstore(collection_name)
    retriever = Retriever(vectorstore=vectorstore)
    results = retriever.invoke(query)

    # Step 4: Format results
    formatted_results = []
    for doc in results:
        metadata = doc.metadata
        formatted_results.append((
            metadata.get("score", 0.0),
            {
                'file_path': metadata.get('file_path'),
                'entity_name': metadata.get('entity_name'),
                'code': doc.page_content,
                'description' : metadata.get('description'),
            }
        ))

    duration = time.time() - start_time
    logger.info(f"Query returned {len(formatted_results)} results in {duration:.2f} seconds")

    return {
        "success": True,
        "collection": collection_name,
        "query": query,
        "duration_seconds": round(duration, 2),
        "results": formatted_results
    }

def codebase_rag_handler(request):
    try:
        path = request.get('path')
        parsedCodebase = request.get('parsedCodebase')
        query = request.get('query')

        logger.info(f"Codebase Path: {path}")
        COLLECTION_NAME = sanitize_collection_name(path)
        logger.info(f"Sanitized collection name: {COLLECTION_NAME}")

        os.environ['USER_AGENT'] = settings.USER_AGENT


        isCollectionExist = check_existing_collection(COLLECTION_NAME) 
        print(isCollectionExist)
        if isCollectionExist:
            data = retrieve_data(COLLECTION_NAME, query)
            return data
        


        # Create embeddings
        embedded_chunks = create_embeddings(parsedCodebase)

        # Store them in ChromaDB
        added_embeddings = add_embeddings_to_vectorstore(COLLECTION_NAME, embedded_chunks)
        if not added_embeddings.get('success', False):
            raise Exception("Failed to add embeddings to vectorstore")

        data = retrieve_data(COLLECTION_NAME, query)
        return data

    except Exception as e:
        logger.warning(f"\n\nERROR: {e} \n\n")
        return {
            "success": False,
            "error": str(e)
        }


