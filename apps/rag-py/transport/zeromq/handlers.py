from services.rag_pipeline import run_rag_pipeline

def handle_rag_request(request: dict) -> dict:
    path = request.get("url")
    query = request.get("query")
    req_type = request.get('type')

    if not path or not query:
        return { "error": "Missing 'path or url' or 'query'" }

    try:
        results = run_rag_pipeline(path, query, req_type)
        return { "results": results }
    except Exception as e:
        return { "error": str(e) }
