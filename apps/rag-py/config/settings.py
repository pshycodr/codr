from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 128
    TOP_K: int = 10
    PERSIST_DIR: str = "./chroma_db"
    MAX_RETRIES: int = 3
    TIMEOUT: int = 10
    USER_AGENT: str = "MyRAGPipeline/1.0" 
    EMBEDDING_MODEL: str = "thenlper/gte-small"
    EMBEDDING_DEVICE: str = "cpu"

    class Config:
        env_file = ".env"

settings = Settings()