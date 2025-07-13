import asyncio
import json
import os
import time

from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from unstructured.documents.elements import Title
from unstructured.partition.md import partition_md

from apps.rag_py.config.settings import settings
from apps.rag_py.core.retriever import Retriever
from apps.rag_py.core.vectorstore import initialize_vectorstore
from apps.rag_py.utils.sanitize_collection_name import sanitize_collection_name
from apps.rag_py.utils.sanitize_text import sanitize_text


def crawl_markdown_from_url(url: str) -> str:
    async def _crawl():
        browser_conf = BrowserConfig(headless=True)
        run_conf = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)

        async with AsyncWebCrawler(config=browser_conf) as crawler:
            result = await crawler.arun(url=url, config=run_conf)
            return result.markdown

    return asyncio.run(_crawl())



def split_markdown_by_headings(markdown: str) -> list[Document]:
    try:
        elements = partition_md(text=markdown)
    except Exception as e:
        raise RuntimeError(f"Markdown partitioning failed: {e}")

    docs = []
    current_chunk = []
    current_heading = ""

    for el in elements:
        if isinstance(el, Title):
            level = getattr(el.metadata, "heading_level", None)
            if level in [1, 2]:  # Only # and ## headers
                if current_chunk:
                    chunk_text = "\n".join(str(e) for e in current_chunk)
                    docs.append(Document(
                        page_content=sanitize_text(chunk_text),
                        metadata={"heading": current_heading}
                    ))
                    current_chunk = []
                current_heading = str(el)

        current_chunk.append(el)

    # Final chunk
    if current_chunk:
        chunk_text = "\n".join(str(e) for e in current_chunk)
        docs.append(Document(
            page_content=sanitize_text(chunk_text),
            metadata={"heading": current_heading}
        ))

    return docs



def agent_handler(request: dict) -> list[str]:
    """
    RAG Agent for querying content from crawled markdown pages.
    Args:
        request = {
            "urls": [...],
            "query": "...",
            "type": "agent"
        }
    Returns:
        list of relevant chunk texts
    """
    start_time = time.time()
    os.environ['USER_AGENT'] = settings.USER_AGENT

    urls = request.get("urls")
    query = request.get("query")

    if not urls or not isinstance(urls, list) or not urls:
        raise ValueError("`urls` must be a non-empty list")
    if not query:
        raise ValueError("`query` is required")

    all_docs = []
    for url in urls:
        markdown = crawl_markdown_from_url(url)
        docs = split_markdown_by_headings(markdown)
        all_docs.extend(docs)

    print(f"Grouped into {len(all_docs)} heading-based chunks")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len,
        is_separator_regex=False,
    )

    smart_splits = []
    for doc in all_docs:
        if len(doc.page_content) > settings.CHUNK_SIZE:
            smart_splits.extend(text_splitter.split_documents([doc]))
        else:
            smart_splits.append(doc)

    print(f"Final stored chunks: {len(smart_splits)}")

    # Store in vector DB (e.g., Chroma)
    COLLECTION_NAME = sanitize_collection_name(json.dumps(urls))
    vectorstore = initialize_vectorstore(COLLECTION_NAME, smart_splits)

    # Retrieve
    retriever = Retriever(vectorstore=vectorstore)
    results = retriever.invoke(query)

    duration = time.time() - start_time
    print(f"RAG completed in {duration:.2f} seconds")

    return [doc.page_content for doc in results]
