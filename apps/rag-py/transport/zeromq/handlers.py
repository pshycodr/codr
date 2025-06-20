from services.rag_pipeline import run_rag_pipeline

def handle_rag_request(request: dict) -> dict:
    url = request.get("url")
    query = request.get("query")

    if not url or not query:
        return { "error": "Missing 'url' or 'query'" }

    try:
        results = run_rag_pipeline(url, query)
        return { "results": results }
    except Exception as e:
        return { "error": str(e) }
