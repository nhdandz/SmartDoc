# app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # admin, user, manager
    avatar = Column(String(500), nullable=True)
    department = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = relationship("Document", back_populates="user")
    ocr_results = relationship("OCRResult", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    reports = relationship("Report", foreign_keys="Report.created_by", back_populates="creator")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(500), nullable=False)
    original_name = Column(String(500), nullable=False)
    type = Column(String(100), nullable=False)  # PDF, DOCX, etc.
    size = Column(String(50), nullable=False)
    file_path = Column(String(1000), nullable=False)
    folder = Column(String(500), default="root")
    upload_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_processed = Column(Boolean, default=False)
    extracted_text = Column(Text, nullable=True)
    doc_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'doc_metadata'
    shared = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    permissions = relationship("DocumentPermission", back_populates="document")
    ocr_result = relationship("OCRResult", back_populates="document", uselist=False)

class DocumentPermission(Base):
    __tablename__ = "document_permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    permission = Column(String(20), nullable=False)  # read, write, admin
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="permissions")
    user = relationship("User", foreign_keys=[user_id])
    granter = relationship("User", foreign_keys=[granted_by])

class OCRResult(Base):
    __tablename__ = "ocr_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    original_file = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)
    process_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="processing")  # processing, completed, failed
    engine_used = Column(String(100), default="tesseract")
    language = Column(String(10), default="vi")
    ocr_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'ocr_metadata'
    
    # Relationships
    document = relationship("Document", back_populates="ocr_result")
    user = relationship("User", back_populates="ocr_results")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    type = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sources = Column(JSON, nullable=True)  # List of sources used for the answer
    rating = Column(String(10), nullable=True)  # up, down, null
    msg_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'msg_metadata'
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="generating")  # completed, generating, failed
    type = Column(String(100), nullable=False)  # summary, analysis, etc.
    content = Column(Text, nullable=True)
    file_path = Column(String(1000), nullable=True)
    config = Column(JSON, nullable=True)  # Report generation configuration
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="reports")

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    query = Column(String(1000), nullable=False)
    filters = Column(JSON, nullable=True)
    results_count = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class VectorStore(Base):
    __tablename__ = "vector_store"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # Store as JSON for simplicity
    vec_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'vec_metadata'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document")

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(255), unique=True, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(Text, nullable=True)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    updater = relationship("User")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # login, upload, download, etc.
    resource_type = Column(String(100), nullable=True)  # document, report, etc.
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")