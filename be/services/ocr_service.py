# app/services/ocr_service.py
import os
import asyncio
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import aiofiles
from datetime import datetime
from PIL import Image
import pytesseract
import easyocr
from pdf2image import convert_from_path
import numpy as np

from models import OCRResult, Document
from schemas import OCRResultUpdate
from config import settings

class OCRService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.tesseract_cmd = settings.TESSERACT_CMD
        
        # Initialize EasyOCR reader
        try:
            self.easyocr_reader = easyocr.Reader(['vi', 'en'])
        except Exception as e:
            print(f"Warning: Could not initialize EasyOCR: {e}")
            self.easyocr_reader = None
        
        # Set Tesseract command path if specified
        if self.tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_cmd

    async def process_file(self, db: Session, file: UploadFile, user_id: UUID):
        """Xử lý OCR cho file upload"""
        
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="Tên file không hợp lệ")
        
        file_ext = file.filename.split('.')[-1].lower()
        supported_formats = ['jpg', 'jpeg', 'png', 'pdf']
        
        if file_ext not in supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Định dạng file không được hỗ trợ cho OCR. Chỉ chấp nhận: {', '.join(supported_formats)}"
            )
        
        # Create temp directory for processing
        temp_dir = os.path.join(self.upload_dir, "temp", str(user_id))
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded file temporarily
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_filename = f"{timestamp}_{file.filename}"
        temp_file_path = os.path.join(temp_dir, temp_filename)
        
        try:
            async with aiofiles.open(temp_file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # First, save the file as a document
            document = await self._create_document_record(db, file.filename, temp_file_path, user_id)
            
            # Create OCR result record with processing status
            ocr_result = OCRResult(
                document_id=document.id,
                user_id=user_id,
                original_file=file.filename,
                extracted_text="",
                confidence=0.0,
                status="processing",
                engine_used=settings.DEFAULT_OCR_ENGINE
            )
            
            db.add(ocr_result)
            db.commit()
            db.refresh(ocr_result)
            
            # Process OCR asynchronously
            asyncio.create_task(self._process_ocr_async(
                db, ocr_result.id, temp_file_path, file_ext, document.id
            ))
            
            return {
                "id": ocr_result.id,
                "document_id": document.id,
                "status": "processing",
                "message": "File đã được tải lên và đang xử lý OCR..."
            }
            
        except Exception as e:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý file: {str(e)}")

    async def _process_ocr_async(self, db: Session, ocr_result_id: UUID, file_path: str, file_ext: str, document_id: UUID):
        """Xử lý OCR bất đồng bộ"""
        
        try:
            # Extract text based on file type
            if file_ext == 'pdf':
                extracted_text, confidence = await self._process_pdf(file_path)
            else:
                extracted_text, confidence = await self._process_image(file_path)
            
            # Update OCR result
            ocr_result = db.query(OCRResult).filter(OCRResult.id == ocr_result_id).first()
            if ocr_result:
                ocr_result.extracted_text = extracted_text
                ocr_result.confidence = confidence
                ocr_result.status = "completed"
                ocr_result.metadata = {
                    "processing_time": datetime.now().isoformat(),
                    "text_length": len(extracted_text),
                    "engine_version": self._get_engine_version()
                }
                
                # Also update the document with extracted text
                document = db.query(Document).filter(Document.id == document_id).first()
                if document:
                    document.extracted_text = extracted_text
                    document.is_processed = True
                
                db.commit()
            
        except Exception as e:
            # Update status to failed
            ocr_result = db.query(OCRResult).filter(OCRResult.id == ocr_result_id).first()
            if ocr_result:
                ocr_result.status = "failed"
                ocr_result.metadata = {
                    "error": str(e),
                    "processing_time": datetime.now().isoformat()
                }
                db.commit()
        
        finally:
            # Clean up temp file
            if os.path.exists(file_path):
                os.remove(file_path)

    async def _process_pdf(self, pdf_path: str) -> tuple[str, float]:
        """Xử lý OCR cho file PDF"""
        
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            
            all_text = []
            all_confidences = []
            
            for i, image in enumerate(images):
                # Save image temporarily
                temp_image_path = f"{pdf_path}_page_{i}.png"
                image.save(temp_image_path, 'PNG')
                
                try:
                    # Process image
                    text, confidence = await self._extract_text_from_image(temp_image_path)
                    all_text.append(f"--- Trang {i+1} ---\n{text}")
                    all_confidences.append(confidence)
                finally:
                    # Clean up temp image
                    if os.path.exists(temp_image_path):
                        os.remove(temp_image_path)
            
            # Combine results
            combined_text = "\n\n".join(all_text)
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0
            
            return combined_text, avg_confidence
            
        except Exception as e:
            raise Exception(f"Lỗi khi xử lý PDF: {str(e)}")

    async def _process_image(self, image_path: str) -> tuple[str, float]:
        """Xử lý OCR cho file ảnh"""
        
        try:
            text, confidence = await self._extract_text_from_image(image_path)
            return text, confidence
        except Exception as e:
            raise Exception(f"Lỗi khi xử lý ảnh: {str(e)}")

    async def _extract_text_from_image(self, image_path: str) -> tuple[str, float]:
        """Trích xuất text từ ảnh sử dụng engine được cấu hình"""
        
        engine = settings.DEFAULT_OCR_ENGINE
        
        if engine == "easyocr" and self.easyocr_reader:
            return await self._extract_with_easyocr(image_path)
        else:
            return await self._extract_with_tesseract(image_path)

    async def _extract_with_tesseract(self, image_path: str) -> tuple[str, float]:
        """Trích xuất text bằng Tesseract"""
        
        try:
            # Load image
            image = Image.open(image_path)
            
            # Extract text with confidence
            data = pytesseract.image_to_data(
                image, 
                lang='vie+eng',  # Vietnamese + English
                output_type=pytesseract.Output.DICT
            )
            
            # Filter out low confidence words
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            words = []
            
            for i, conf in enumerate(data['conf']):
                if int(conf) > 30:  # Only include words with confidence > 30%
                    word = data['text'][i].strip()
                    if word:
                        words.append(word)
            
            text = ' '.join(words)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return text, avg_confidence / 100.0  # Convert to 0-1 scale
            
        except Exception as e:
            raise Exception(f"Lỗi Tesseract: {str(e)}")

    async def _extract_with_easyocr(self, image_path: str) -> tuple[str, float]:
        """Trích xuất text bằng EasyOCR"""
        
        try:
            # Read image
            results = self.easyocr_reader.readtext(image_path)
            
            # Extract text and confidences
            words = []
            confidences = []
            
            for (bbox, text, conf) in results:
                if conf > 0.3:  # Only include results with confidence > 30%
                    words.append(text)
                    confidences.append(conf)
            
            combined_text = ' '.join(words)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return combined_text, avg_confidence
            
        except Exception as e:
            raise Exception(f"Lỗi EasyOCR: {str(e)}")

    async def get_results(self, db: Session, user_id: UUID) -> List[dict]:
        """Lấy danh sách kết quả OCR của người dùng"""
        
        results = db.query(OCRResult).filter(
            OCRResult.user_id == user_id
        ).order_by(OCRResult.process_date.desc()).all()
        
        return [
            {
                "id": result.id,
                "original_file": result.original_file,
                "status": result.status,
                "confidence": result.confidence,
                "process_date": result.process_date.isoformat(),
                "engine_used": result.engine_used,
                "text_preview": result.extracted_text[:200] + "..." if result.extracted_text and len(result.extracted_text) > 200 else result.extracted_text
            } for result in results
        ]

    async def get_result(self, db: Session, result_id: str, user_id: UUID) -> dict:
        """Lấy chi tiết kết quả OCR"""
        
        result = db.query(OCRResult).filter(
            OCRResult.id == result_id,
            OCRResult.user_id == user_id
        ).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy kết quả OCR")
        
        return {
            "id": result.id,
            "document_id": result.document_id,
            "original_file": result.original_file,
            "extracted_text": result.extracted_text,
            "confidence": result.confidence,
            "process_date": result.process_date.isoformat(),
            "status": result.status,
            "engine_used": result.engine_used,
            "language": result.language,
            "metadata": result.metadata
        }

    async def update_result(self, db: Session, result_id: str, update_data: OCRResultUpdate, user_id: UUID):
        """Cập nhật kết quả OCR (cho phép chỉnh sửa text)"""
        
        result = db.query(OCRResult).filter(
            OCRResult.id == result_id,
            OCRResult.user_id == user_id
        ).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy kết quả OCR")
        
        # Update fields
        if update_data.extracted_text is not None:
            result.extracted_text = update_data.extracted_text
            
            # Also update the associated document
            document = db.query(Document).filter(Document.id == result.document_id).first()
            if document:
                document.extracted_text = update_data.extracted_text
        
        if update_data.confidence is not None:
            result.confidence = update_data.confidence
        
        if update_data.metadata is not None:
            result.metadata = {**(result.metadata or {}), **update_data.metadata}
        
        db.commit()
        
        return {
            "message": "Kết quả OCR đã được cập nhật thành công",
            "id": result.id
        }

    async def _create_document_record(self, db: Session, filename: str, file_path: str, user_id: UUID) -> Document:
        """Tạo record document cho file OCR"""
        
        file_ext = filename.split('.')[-1].lower()
        file_size = os.path.getsize(file_path)
        
        document = Document(
            name=filename,
            original_name=filename,
            type=file_ext.upper(),
            size=self._format_file_size(file_size),
            file_path=file_path,
            user_id=user_id,
            metadata={
                "source": "ocr_upload",
                "file_size_bytes": file_size,
                "upload_timestamp": datetime.now().isoformat()
            }
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document

    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size to human readable string"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        size = float(size_bytes)
        
        while size >= 1024.0 and i < len(size_names) - 1:
            size /= 1024.0
            i += 1
        
        return f"{size:.1f} {size_names[i]}"

    def _get_engine_version(self) -> str:
        """Lấy version của OCR engine"""
        try:
            if settings.DEFAULT_OCR_ENGINE == "easyocr":
                import easyocr
                return f"EasyOCR {easyocr.__version__}"
            else:
                return f"Tesseract {pytesseract.get_tesseract_version()}"
        except:
            return "Unknown"