# app/tasks/document_tasks.py
from celery import current_task
from sqlalchemy.orm import Session
from celery_app import celery_app
from database import SessionLocal
from models import Document
from services.qa_service import QAService
import os
import logging

logger = logging.getLogger(__name__)

@celery_task(bind=True)
def process_document_for_search(self, document_id: str):
    """Process document for search indexing"""
    
    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError(f"Document {document_id} not found")
        
        # Update task progress
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'extracting_text', 'progress': 25}
        )
        
        # Extract text if not already done
        if not document.extracted_text and document.file_path and os.path.exists(document.file_path):
            from services.document_service import DocumentService
            doc_service = DocumentService()
            
            try:
                extracted_text = doc_service._extract_text_from_file(
                    document.file_path, document.type
                )
                document.extracted_text = extracted_text
                document.is_processed = True
                db.commit()
            except Exception as e:
                logger.error(f"Failed to extract text from {document_id}: {e}")
                raise
        
        # Update task progress
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'indexing_vectors', 'progress': 75}
        )
        
        # Index document for vector search
        if document.extracted_text:
            qa_service = QAService()
            success =  qa_service.index_document(
                document.id,
                document.extracted_text,
                {
                    "title": document.name,
                    "type": document.type,
                    "upload_date": document.upload_date.isoformat()
                }
            )
            
            if not success:
                logger.warning(f"Failed to index document {document_id} for vector search")
        
        return {
            'status': 'completed',
            'document_id': str(document.id),
            'message': 'Document processed successfully'
        }
        
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        current_task.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise
    finally:
        db.close()

@celery_task(bind=True)
def batch_process_documents(self, document_ids: list):
    """Process multiple documents in batch"""
    
    total_docs = len(document_ids)
    processed = 0
    failed = []
    
    for i, doc_id in enumerate(document_ids):
        try:
            current_task.update_state(
                state='PROGRESS',
                meta={
                    'current': i + 1,
                    'total': total_docs,
                    'progress': int((i / total_docs) * 100)
                }
            )
            
            # Process individual document
            result = process_document_for_search.delay(doc_id)
            result.get(timeout=300)  # 5 minute timeout per document
            processed += 1
            
        except Exception as e:
            logger.error(f"Failed to process document {doc_id}: {e}")
            failed.append({'document_id': doc_id, 'error': str(e)})
    
    return {
        'status': 'completed',
        'processed': processed,
        'failed': len(failed),
        'failed_documents': failed
    }
