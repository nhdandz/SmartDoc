# app/tasks/maintenance_tasks.py
import os
import shutil
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from celery_app import celery_app
from database import SessionLocal
from models import Document, OCRResult, ActivityLog
from config import settings
import logging

logger = logging.getLogger(__name__)

@celery_task
def cleanup_temp_files():
    """Clean up temporary files older than 24 hours"""
    
    try:
        temp_dirs = [
            os.path.join(settings.UPLOAD_DIR, "temp"),
            "/tmp"
        ]
        
        cutoff_time = datetime.now() - timedelta(hours=24)
        cleaned_files = 0
        
        for temp_dir in temp_dirs:
            if not os.path.exists(temp_dir):
                continue
            
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                        if file_mtime < cutoff_time:
                            os.remove(file_path)
                            cleaned_files += 1
                    except Exception as e:
                        logger.warning(f"Could not remove temp file {file_path}: {e}")
        
        logger.info(f"Cleaned up {cleaned_files} temporary files")
        return {"cleaned_files": cleaned_files}
        
    except Exception as e:
        logger.error(f"Error during temp file cleanup: {e}")
        return {"error": str(e)}

@celery_task
def backup_database():
    """Create database backup"""
    
    try:
        if not settings.DATABASE_URL.startswith("postgresql"):
            logger.info("Database backup only supported for PostgreSQL")
            return {"status": "skipped", "reason": "Not PostgreSQL"}
        
        # Create backup directory
        backup_dir = os.path.join(settings.UPLOAD_DIR, "backups")
        os.makedirs(backup_dir, exist_ok=True)
        
        # Generate backup filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(backup_dir, f"smartdoc_backup_{timestamp}.sql")
        
        # Extract database connection info
        db_url = settings.DATABASE_URL
        # Parse postgresql://user:password@host:port/dbname
        import re
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_url)
        if not match:
            raise ValueError("Could not parse database URL")
        
        user, password, host, port, dbname = match.groups()
        
        # Create pg_dump command
        os.environ['PGPASSWORD'] = password
        dump_cmd = f"pg_dump -h {host} -p {port} -U {user} -d {dbname} > {backup_file}"
        
        # Execute backup
        exit_code = os.system(dump_cmd)
        
        if exit_code == 0:
            # Clean up old backups (keep last 7 days)
            cutoff_time = datetime.now() - timedelta(days=7)
            for backup in os.listdir(backup_dir):
                if backup.startswith("smartdoc_backup_"):
                    backup_path = os.path.join(backup_dir, backup)
                    backup_mtime = datetime.fromtimestamp(os.path.getmtime(backup_path))
                    if backup_mtime < cutoff_time:
                        os.remove(backup_path)
            
            logger.info(f"Database backup created: {backup_file}")
            return {"status": "success", "backup_file": backup_file}
        else:
            raise Exception(f"pg_dump failed with exit code {exit_code}")
        
    except Exception as e:
        logger.error(f"Database backup failed: {e}")
        return {"status": "error", "error": str(e)}

@celery_task
def update_search_index():
    """Update search index for all documents"""
    
    db = SessionLocal()
    try:
        from services.qa_service import QAService
        
        qa_service = QAService()
        if not qa_service.vector_store:
            logger.warning("Vector store not available, skipping search index update")
            return {"status": "skipped", "reason": "Vector store not available"}
        
        # Get documents that need indexing
        documents = db.query(Document).filter(
            Document.extracted_text.isnot(None),
            Document.is_processed == True
        ).all()
        
        indexed_count = 0
        failed_count = 0
        
        for document in documents:
            try:
                success =  qa_service.index_document(
                    document.id,
                    document.extracted_text,
                    {
                        "title": document.name,
                        "type": document.type,
                        "upload_date": document.upload_date.isoformat()
                    }
                )
                
                if success:
                    indexed_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to index document {document.id}: {e}")
                failed_count += 1
        
        logger.info(f"Search index update completed: {indexed_count} indexed, {failed_count} failed")
        return {
            "status": "completed",
            "indexed": indexed_count,
            "failed": failed_count
        }
        
    except Exception as e:
        logger.error(f"Search index update failed: {e}")
        return {"status": "error", "error": str(e)}
    finally:
        db.close()

@celery_task
def clean_old_activity_logs():
    """Clean up activity logs older than 90 days"""
    
    db = SessionLocal()
    try:
        cutoff_date = datetime.now() - timedelta(days=90)
        
        deleted_count = db.query(ActivityLog).filter(
            ActivityLog.timestamp < cutoff_date
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleaned up {deleted_count} old activity log entries")
        return {"deleted_count": deleted_count}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clean old activity logs: {e}")
        return {"error": str(e)}
    finally:
        db.close()