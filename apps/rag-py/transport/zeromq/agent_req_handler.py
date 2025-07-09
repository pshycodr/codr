from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from utils.sanitize_text import sanitize_text
from config.settings import settings
from core.vectorstore import initialize_vectorstore
from utils.sanitize_collection_name import sanitize_collection_name
import json
import time
import os
from core.retriever import Retriever



def agent_handler(request):
    start_time = time.time()
    os.environ['USER_AGENT'] = settings.USER_AGENT
    urls = request.get('urls')
    query = request.get('query')
    loader = loader_multiple_pages = WebBaseLoader(urls)

    docs = loader.load()
    for doc in docs:
        doc.page_content = sanitize_text(doc.page_content)

    text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
        )
        
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks") 
    COLLECTION_NAME = sanitize_collection_name(json.dumps(urls))

    vectorstore = initialize_vectorstore(COLLECTION_NAME, splits)

    retriever = Retriever(vectorstore=vectorstore)

    results = retriever.invoke(query)

    duration = time.time() - start_time
    print(f"RAG completed in {duration:.2f} seconds")     

    # print('\n\n')
    # print(docs)
    return [doc.page_content for doc in results]

