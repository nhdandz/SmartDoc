from decouple import config
from typing import List

class Settings:
    # Database
    DATABASE_URL: str = config('DATABASE_URL', default='sqlite:///./smartdoc.db')
    
    # Security
    SECRET_KEY: str = config('SECRET_KEY', default='your-secret-key-change-this-in-production')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config('ACCESS_TOKEN_EXPIRE_MINUTES', default=1440, cast=int)
    
    # File storage
    UPLOAD_DIR: str = config('UPLOAD_DIR', default='uploads')
    MAX_FILE_SIZE: int = config('MAX_FILE_SIZE', default=100 * 1024 * 1024, cast=int)  # 100MB
    ALLOWED_EXTENSIONS: List[str] = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']
    
    # AI Configuration
    OPENAI_API_KEY: str = config('OPENAI_API_KEY', default='')
    ANTHROPIC_API_KEY: str = config('ANTHROPIC_API_KEY', default='')
    DEFAULT_LLM_MODEL: str = config('DEFAULT_LLM_MODEL', default='gpt-3.5-turbo')
    
    # OCR Configuration
    DEFAULT_OCR_ENGINE: str = config('DEFAULT_OCR_ENGINE', default='tesseract')
    TESSERACT_CMD: str = config('TESSERACT_CMD', default='tesseract')
    
    # Vector Database
    VECTOR_DB_TYPE: str = config('VECTOR_DB_TYPE', default='chromadb')
    CHROMA_DB_PATH: str = config('CHROMA_DB_PATH', default='./chroma_db')
    
    # Redis (for caching and task queue)
    REDIS_URL: str = config('REDIS_URL', default='redis://localhost:6379')
    
    # Environment
    DEBUG: bool = config('DEBUG', default=False, cast=bool)
    ENVIRONMENT: str = config('ENVIRONMENT', default='development')
    
    # CORS
    CORS_ORIGINS: List[str] = config('CORS_ORIGINS', default='http://localhost:3000,http://localhost:3001', cast=lambda x: x.split(','))

settings = Settings()