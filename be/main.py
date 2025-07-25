# app/main.py
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
import os
from datetime import datetime
from typing import List, Optional

from database import get_db, engine, Base
from models import User, Document, OCRResult, ChatSession, Report
from schemas import *
# Fix the import paths
from database import create_access_token, verify_token, hash_password, verify_password
from services.document_service import DocumentService
from services.ocr_service import OCRService
from services.search_service import SearchService
from services.qa_service import QAService
from services.search_service import ReportService

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartDoc API",
    description="Hệ thống quản lý và khai thác tài liệu thông minh",
    version="1.0.0"
)

# CORS middleware - fix syntax
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Static files
os.makedirs("uploads", exist_ok=True)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Services
document_service = DocumentService()
ocr_service = OCRService()
search_service = SearchService()
qa_service = QAService()
report_service = ReportService()

# Auth dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Root endpoint
@app.get("/")
async def root():
    return {"message": "SmartDoc API is running", "version": "1.0.0"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# ======================= AUTH ENDPOINTS =======================

@app.post("/api/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Đăng nhập người dùng"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    token = create_access_token(data={"user_id": str(user.id)})
    
    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Đăng ký người dùng mới"""
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    
    # Create new user
    hashed_pw = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role or "user"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(data={"user_id": str(new_user.id)})
    
    return {
        "token": token,
        "user": {
            "id": str(new_user.id),
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Lấy thông tin người dùng hiện tại"""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "avatar": current_user.avatar,
        "department": current_user.department,
        "phone": current_user.phone
    }

# ======================= DOCUMENT ENDPOINTS =======================

@app.get("/api/documents")
async def get_documents(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    type_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tài liệu"""
    return await document_service.get_documents(
        db, current_user.id, page, limit, search, type_filter
    )

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload tài liệu mới"""
    return await document_service.upload_document(db, file, current_user.id)

@app.delete("/api/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa tài liệu"""
    return await document_service.delete_document(db, document_id, current_user.id)

@app.post("/api/documents/{document_id}/share")
async def share_document(
    document_id: str,
    share_data: DocumentShare,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chia sẻ tài liệu"""
    return await document_service.share_document(db, document_id, share_data, current_user.id)

# ======================= OCR ENDPOINTS =======================

@app.post("/api/ocr/process")
async def process_ocr(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xử lý OCR cho file ảnh/PDF"""
    return await ocr_service.process_file(db, file, current_user.id)

@app.get("/api/ocr/results")
async def get_ocr_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách kết quả OCR"""
    return await ocr_service.get_results(db, current_user.id)

@app.get("/api/ocr/results/{result_id}")
async def get_ocr_result(
    result_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết kết quả OCR"""
    return await ocr_service.get_result(db, result_id, current_user.id)

@app.put("/api/ocr/results/{result_id}")
async def update_ocr_result(
    result_id: str,
    update_data: OCRResultUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật kết quả OCR"""
    return await ocr_service.update_result(db, result_id, update_data, current_user.id)

# ======================= SEARCH ENDPOINTS =======================

@app.post("/api/search")
async def search_documents(
    search_data: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tìm kiếm tài liệu"""
    return await search_service.search(db, search_data, current_user.id)

@app.get("/api/search/suggestions")
async def get_search_suggestions(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy gợi ý tìm kiếm"""
    return await search_service.get_suggestions(db, q, current_user.id)

# ======================= Q&A ENDPOINTS =======================

@app.post("/api/qa/ask")
async def ask_question(
    qa_request: QARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Đặt câu hỏi"""
    return await qa_service.ask_question(db, qa_request, current_user.id)

@app.get("/api/qa/history")
async def get_qa_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử hỏi đáp"""
    return await qa_service.get_history(db, current_user.id)

@app.post("/api/qa/sessions")
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo phiên chat mới"""
    return await qa_service.create_session(db, session_data, current_user.id)

@app.get("/api/qa/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết phiên chat"""
    return await qa_service.get_session(db, session_id, current_user.id)

# ======================= REPORT ENDPOINTS =======================

@app.post("/api/reports/generate")
async def generate_report(
    report_config: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo báo cáo"""
    return await report_service.generate_report(db, report_config, current_user.id)

@app.get("/api/reports")
async def get_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách báo cáo"""
    return await report_service.get_reports(db, current_user.id)

@app.get("/api/reports/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết báo cáo"""
    return await report_service.get_report(db, report_id, current_user.id)

@app.get("/api/reports/{report_id}/download")
async def download_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tải báo cáo"""
    return await report_service.download_report(db, report_id, current_user.id)

# ======================= SETTINGS ENDPOINTS =======================

@app.get("/api/settings")
async def get_settings(current_user: User = Depends(get_current_user)):
    """Lấy cài đặt hệ thống"""
    # Mock settings for now
    return {
        "ai_models": [
            {"id": "gpt-4", "name": "GPT-4", "provider": "OpenAI"},
            {"id": "claude-3", "name": "Claude 3", "provider": "Anthropic"},
            {"id": "llama2", "name": "Llama 2", "provider": "Local"}
        ],
        "ocr_engines": [
            {"id": "tesseract", "name": "Tesseract", "languages": ["vi", "en"]},
            {"id": "easyocr", "name": "EasyOCR", "languages": ["vi", "en", "zh"]}
        ],
        "current_settings": {
            "default_ai_model": "gpt-4",
            "default_ocr_engine": "tesseract",
            "auto_backup": True,
            "backup_frequency": "daily"
        }
    }

@app.put("/api/settings")
async def update_settings(
    settings: dict,
    current_user: User = Depends(get_current_user)
):
    """Cập nhật cài đặt hệ thống"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền thay đổi cài đặt")
    
    # Mock update for now
    return {"message": "Cài đặt đã được cập nhật thành công"}

# ======================= STATS ENDPOINTS =======================

@app.get("/api/stats/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thống kê cho dashboard"""
    # Get counts for user's documents
    total_documents = db.query(Document).filter(Document.user_id == current_user.id).count()
    total_ocr = db.query(OCRResult).filter(OCRResult.user_id == current_user.id).count()
    total_reports = db.query(Report).filter(Report.created_by == current_user.id).count()
    
    # Mock recent activity
    recent_documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.upload_date.desc()).limit(5).all()
    
    return {
        "total_documents": total_documents,
        "total_ocr_processed": total_ocr,
        "total_questions": 0,  # Will be implemented with chat history
        "total_reports": total_reports,
        "recent_documents": [
            {
                "id": str(doc.id),
                "name": doc.name,
                "size": doc.size,
                "uploadDate": doc.upload_date.isoformat(),
                "type": doc.type
            } for doc in recent_documents
        ],
        "recent_questions": []  # Will be implemented with chat history
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)