from services.rag_pipeline import run_rag_pipeline, init_session
session_store = {}

def docs_rag_handler(request: dict) -> dict:
    chat_type = request.get("chat_type")

    if chat_type == "init_chat":
        session_id = request.get("session_id")
        path = request.get("path")
        query = request.get("query")
        type = request.get("type") or "doc"

        if not session_id or not path or not query:
            return {"error": "Missing 'session_id', 'path', or 'query'"}

        try:
            retriever = init_session(session_id, path, type)
            session_store[session_id] = retriever 
            return { "msg": "Chat Session Created"}
        except Exception as e:
            return { "error": str(e) }

    elif chat_type == "chat_message":
        session_id = request.get("session_id")
        query = request.get("message")

        if not session_id or not query:
            return {"error": "Missing 'session_id' or 'message'"}

        retriever = session_store.get(session_id)
        if not retriever:
            return {"error": "Invalid session_id or session expired."}

        try:
            results = retriever.invoke(query)
            return { "results": [doc.page_content for doc in results] }
        except Exception as e:
            return { "error": str(e) }

    else:
        path = request.get("path")
        query = request.get("query")
        type = request.get("type") or "doc"

        if not path or not query:
            return { "error": "Missing 'path' or 'query'" }

        try:
            results = run_rag_pipeline(path, query, type)
            return { "results": results }
        except Exception as e:
            return { "error": str(e) }
