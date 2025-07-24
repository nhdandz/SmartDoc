# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config
import os

# Database URL - supports both PostgreSQL and SQLite
DATABASE_URL = config(
    'DATABASE_URL',
    default='sqlite:///./smartdoc.db'
)

# For PostgreSQL in production:
# DATABASE_URL = "postgresql://username:password@localhost/smartdoc"

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Only needed for SQLite
        echo=config('DEBUG', default=False, cast=bool)
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=config('DEBUG', default=False, cast=bool)
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# app/auth.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from decouple import config
from typing import Optional

# Security configuration
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-change-this-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(config('ACCESS_TOKEN_EXPIRE_MINUTES', default=1440))  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# app/config.py
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