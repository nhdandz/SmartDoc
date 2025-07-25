# app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# Fix EmailStr import - use regular str if email-validator not available
try:
    from pydantic import EmailStr
except ImportError:
    # Fallback to regular str if email-validator not installed
    EmailStr = str

# ======================= USER SCHEMAS =======================

class UserBase(BaseModel):
    name: str
    email: str  # Changed from EmailStr to str to avoid dependency issues
    role: Optional[str] = "user"
    department: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str  # Changed from EmailStr to str
    password: str

class UserResponse(UserBase):
    id: UUID
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

# ======================= DOCUMENT SCHEMAS =======================

class DocumentBase(BaseModel):
    name: str
    type: str
    folder: Optional[str] = "root"

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: UUID
    original_name: str
    size: str
    file_path: str
    upload_date: datetime
    user_id: UUID
    is_processed: bool
    shared: bool
    doc_metadata: Optional[Dict[str, Any]] = None  # Updated field name
    
    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    folder: Optional[str] = None
    shared: Optional[bool] = None
    doc_metadata: Optional[Dict[str, Any]] = None  # Updated field name

class DocumentShare(BaseModel):
    user_email: str  # Changed from EmailStr to str
    permission: str = Field(..., pattern="^(read|write|admin)$")

class DocumentPermissionResponse(BaseModel):
    id: UUID
    user_id: UUID
    permission: str
    granted_at: datetime
    
    class Config:
        from_attributes = True

# ======================= OCR SCHEMAS =======================

class OCRResultBase(BaseModel):
    extracted_text: str
    confidence: float
    engine_used: str = "tesseract"
    language: str = "vi"

class OCRResultCreate(OCRResultBase):
    document_id: UUID
    original_file: str

class OCRResultResponse(OCRResultBase):
    id: UUID
    document_id: UUID
    user_id: UUID
    original_file: str
    process_date: datetime
    status: str
    ocr_metadata: Optional[Dict[str, Any]] = None  # Updated field name
    
    class Config:
        from_attributes = True

class OCRResultUpdate(BaseModel):
    extracted_text: Optional[str] = None
    confidence: Optional[float] = None
    ocr_metadata: Optional[Dict[str, Any]] = None  # Updated field name

# ======================= SEARCH SCHEMAS =======================

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    page: int = 1
    limit: int = 10

class SearchResultItem(BaseModel):
    id: UUID
    title: str
    content: str
    author: str
    department: Optional[str] = None
    date: datetime
    type: str
    highlights: List[str] = []
    score: Optional[float] = None

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    total: int
    page: int
    limit: int
    query: str
    took: float  # Time taken for search in seconds

# ======================= Q&A SCHEMAS =======================

class QARequest(BaseModel):
    question: str
    context: Optional[List[str]] = None  # Document IDs for context
    session_id: Optional[UUID] = None

class QASource(BaseModel):
    title: str
    page: Optional[int] = None
    excerpt: str
    document_id: Optional[UUID] = None

class QAResponse(BaseModel):
    id: UUID
    type: str = "assistant"
    content: str
    timestamp: datetime
    sources: List[QASource] = []
    confidence: Optional[float] = None

class ChatSessionCreate(BaseModel):
    title: str

class ChatSessionResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    
    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: UUID
    type: str
    content: str
    timestamp: datetime
    sources: Optional[List[QASource]] = None
    rating: Optional[str] = None
    
    class Config:
        from_attributes = True

# ======================= REPORT SCHEMAS =======================

class ReportCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    config: Dict[str, Any]  # Configuration for report generation

class ReportResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    created_by: UUID
    created_date: datetime
    status: str
    type: str
    file_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    content: Optional[str] = None
    file_path: Optional[str] = None

# ======================= DASHBOARD SCHEMAS =======================

class DashboardStats(BaseModel):
    total_documents: int
    total_ocr_processed: int
    total_questions: int
    total_reports: int
    recent_documents: List[DocumentResponse]
    recent_questions: List[ChatMessageResponse]

class RecentDocument(BaseModel):
    id: UUID
    name: str
    size: str
    upload_date: datetime
    type: str

class RecentQuestion(BaseModel):
    id: UUID
    question: str
    answer: str
    timestamp: datetime

# ======================= SETTINGS SCHEMAS =======================

class AIModelConfig(BaseModel):
    id: str
    name: str
    provider: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class OCREngineConfig(BaseModel):
    id: str
    name: str
    languages: List[str]
    parameters: Optional[Dict[str, Any]] = None

class SystemSettingsResponse(BaseModel):
    ai_models: List[AIModelConfig]
    ocr_engines: List[OCREngineConfig]
    current_settings: Dict[str, Any]

class SystemSettingsUpdate(BaseModel):
    default_ai_model: Optional[str] = None
    default_ocr_engine: Optional[str] = None
    auto_backup: Optional[bool] = None
    backup_frequency: Optional[str] = None
    ai_models: Optional[List[AIModelConfig]] = None
    ocr_engines: Optional[List[OCREngineConfig]] = None

# ======================= ACTIVITY LOG SCHEMAS =======================

class ActivityLogCreate(BaseModel):
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[UUID] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ActivityLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[UUID] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

# ======================= GENERAL SCHEMAS =======================

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    message: str
    error_code: Optional[str] = None
    success: bool = False

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int

# ======================= FILE UPLOAD SCHEMAS =======================

class FileUploadResponse(BaseModel):
    filename: str
    original_filename: str
    size: int
    content_type: str
    file_path: str
    upload_date: datetime

class UploadProgress(BaseModel):
    filename: str
    progress: float
    status: str  # uploading, processing, completed, failed
    message: Optional[str] = None