# app/tasks/ocr_tasks.py
from celery import current_task
from sqlalchemy.orm import Session
from celery_app import celery_app
from database import SessionLocal
from models import OCRResult, Document
from services.ocr_service import OCRService
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def process_ocr_task(self, ocr_result_id: str, file_path: str, file_ext: str, document_id: str):
    """Process OCR in background"""
    
    db = SessionLocal()
    try:
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'initializing', 'progress': 10}
        )
        
        ocr_service = OCRService()
        
        # Process OCR
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'processing_ocr', 'progress': 50}
        )
        
        if file_ext == 'pdf':
            extracted_text, confidence =  ocr_service._process_pdf(file_path)
        else:
            extracted_text, confidence =  ocr_service._process_image(file_path)
        
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'saving_results', 'progress': 90}
        )
        
        # Update OCR result
        ocr_result = db.query(OCRResult).filter(OCRResult.id == ocr_result_id).first()
        if ocr_result:
            ocr_result.extracted_text = extracted_text
            ocr_result.confidence = confidence
            ocr_result.status = "completed"
            ocr_result.metadata = {
                "processing_time": datetime.now().isoformat(),
                "text_length": len(extracted_text),
                "engine_version": ocr_service._get_engine_version()
            }
            
            # Also update the document with extracted text
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.extracted_text = extracted_text
                document.is_processed = True
            
            db.commit()
        
        return {
            'status': 'completed',
            'ocr_result_id': str(ocr_result_id),
            'extracted_text_length': len(extracted_text),
            'confidence': confidence
        }
        
    except Exception as e:
        logger.error(f"OCR processing failed for {ocr_result_id}: {e}")
        
        # Update status to failed
        ocr_result = db.query(OCRResult).filter(OCRResult.id == ocr_result_id).first()
        if ocr_result:
            ocr_result.status = "failed"
            ocr_result.metadata = {
                "error": str(e),
                "processing_time": datetime.now().isoformat()
            }
            db.commit()
        
        current_task.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise
        
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)
        db.close()
