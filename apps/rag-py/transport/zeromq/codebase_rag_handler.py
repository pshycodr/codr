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
from services.session_manager import SessionManager

logger = logging.getLogger(__name__)
configure_logging()




def format_codebase_results(results, collection_name, query, start_time):
    formatted_results = []
    for doc in results:
        metadata = doc.metadata
        formatted_results.append((
            metadata.get("score", 0.0),
            {
                'file_path': metadata.get('file_path'),
                'entity_name': metadata.get('entity_name'),
                'code': doc.page_content,
                'description': metadata.get('description'),
            }
        ))

    duration = time.time() - start_time
    logger.info(f"Query returned {len(formatted_results)} results in {duration:.2f} seconds")

    return {
        "collection": collection_name,
        "query": query,
        "duration_seconds": round(duration, 2),
        "results": formatted_results
    }


def retrieve_data(collection_name: str, query:str):

    logger.info(f"Retrieving Started for: {collection_name}")
    start_time = time.time()
    vectorstore = get_vectorstore(collection_name)
    retriever = Retriever(vectorstore=vectorstore)
    results = retriever.invoke(query)
    return format_codebase_results(results, collection_name, query, time.time())

def handle_chat(request):
    chat = SessionManager(request)
    chat_type = request.get("chat_type", "").strip().lower()
    print(f">> chat_type: {chat_type}")
    if chat_type == "init_chat":
        print("\n>> Inside init_chat")
        response = chat.initialize_session()
        if not response.get("success"):
            err = response.get("error")
            logger.error(f"Chat initialization Failed: {err}")
            return {"success": False, "error": str(err)}
        return {"msg": "Chat Session Created"}

    elif chat_type == "chat_message":
        print("\n>> Inside chat_message")
        response = chat.query_session()
        if not response.get("success"):
            err = response.get("error")
            logger.error(f"Chat Query Failed: {err}")
            return {"success": False, "error": str(err)} 
        results = response.get("results")
        collection_name = response.get("collection_name")
        data = format_codebase_results(results, collection_name, chat.query, time.time())  
        return {'success': True, 'type': request.get('type'), 'data': data }

    else:
        print(f"\n>> Unknown chat_type: {chat_type}")
        return {"success": False, "error": f"Unknown chat_type: {chat_type}"}


def codebase_rag_handler(request):
    try:

        print(f"\n\n>> Incoming request: {request}\n")
        chat_type = request.get("chat_type", "").strip().lower() or ""
        print(f">> chat_type: {chat_type}")

        if chat_type == 'init_chat' or chat_type == 'chat_message':
            return handle_chat(request)


        path = request.get('path')
        parsedCodebase = request.get('parsedCodebase')
        query = request.get('query')

        COLLECTION_NAME = sanitize_collection_name(path)

        if not check_existing_collection(COLLECTION_NAME):
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


