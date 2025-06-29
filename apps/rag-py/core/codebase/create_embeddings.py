from core.embeddings import get_embeddings
from tqdm import tqdm
import logging

logger = logging.getLogger(__name__)
embedder = get_embeddings()

def create_embeddings(code_chunks):
    logger.info("Starting embedding creation")

    input_texts = []
    enriched_chunks = []
    
    print(code_chunks[0])

    # Build input strings and attach metadata
    for chunk in code_chunks:
        description = chunk.get('description', '')          
        input_text = (
            f"File Path: {chunk['file_path']}\n"
            f"Entity Type: {chunk['entity_type']}\n"
            f"Entity Name: {chunk['entity_name']}\n"
            f"Start Line: {chunk['start_line']}\n"
            f"End Line: {chunk['end_line']}\n"
            f"Description: {description}\n"
            f"Code:\n{chunk['code']}"
        )

        enriched_chunks.append({
            'file_path': chunk['file_path'],
            'entity_type': chunk['entity_type'],
            'entity_name': chunk['entity_name'],
            'start_line': chunk['start_line'],
            'end_line': chunk['end_line'],
            'code': chunk['code'],
            'text': input_text,
            'description': description,
            'isFunction': chunk['entity_type'] == 'function'
        })

        input_texts.append(input_text)

    logger.info("Embedding all code chunks (batched)")
    vectors = embedder.embed_documents(input_texts)

    for i, vec in enumerate(vectors):
        enriched_chunks[i]['embedding'] = vec
        enriched_chunks[i]['id'] = f"{enriched_chunks[i]['file_path']}_{enriched_chunks[i]['entity_name']}_{i}"

    logger.info(f"Embedding creation completed. Created {len(enriched_chunks)} embeddings.")
    return enriched_chunks
