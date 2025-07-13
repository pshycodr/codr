import logging

from apps.rag_py.core.retriever import Retriever
from apps.rag_py.core.vectorstore import get_vectorstore
from apps.rag_py.utils.sanitize_collection_name import sanitize_collection_name

logger = logging.getLogger(__name__)


SESSION_STORE = {} 

class SessionManager:
    def __init__(self, request):
        self.session_id = request.get('session_id')
        self.path = request.get('path')
        self.type = request.get('type')
        self.query = request.get('query') or request.get('message')

    def initialize_session(self):
        try:
            collection_name = sanitize_collection_name(self.path)
            vectorstore = get_vectorstore(collection_name)
            retriever = Retriever(vectorstore=vectorstore)

            SESSION_STORE[self.session_id] = {
                'retriever' : retriever,
                'collection_name' : collection_name
            }

            logger.info(f'\n\nChat initialization Successfull \n\n')
            return {'success': True,'retriever':retriever, 'collection_name' : collection_name}
        except Exception as e:    
            return {'success': False,'error':e}

    def query_session(self):
        try:
            print('\n\n inside query session \n\n')
            print(f'\n\n self.session_id = {self.session_id}  \n\n')
            print(f'\n\n self.query = {self.query}  \n\n')

            retriever = SESSION_STORE.get(self.session_id).get('retriever')
            collection_name = SESSION_STORE.get(self.session_id).get('collection_name')
            print(f'\n\n retriever got successfully \n\n')
            if not retriever:
                raise ValueError("Invalid session ID")

            results = retriever.invoke(self.query)
            print(f'\n\n Results got successfully: \n {results} \n\n')

            logger.info(f'\n\nChat Query Successful. Received {len(results)} documents \n\n')
            return {'success': True, 'results': results, 'collection_name': collection_name}
        except Exception as e:    
            return {'success': False, 'error': e}
