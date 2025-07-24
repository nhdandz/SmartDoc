# app/tasks/report_tasks.py
from celery import current_task
from sqlalchemy.orm import Session
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Report
from app.services.report_service import ReportService
from app.schemas import ReportCreate
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def generate_report_task(self, report_id: str, report_config_dict: dict, user_id: str):
    """Generate report in background"""
    
    db = SessionLocal()
    try:
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'initializing', 'progress': 10}
        )
        
        # Convert dict back to Pydantic model
        report_config = ReportCreate(**report_config_dict)
        report_service = ReportService()
        
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'generating_content', 'progress': 50}
        )
        
        # Generate report content
        if report_config.type == "document_summary":
            content, file_path = await report_service._generate_document_summary(
                db, report_config.config, user_id
            )
        elif report_config.type == "qa_analysis":
            content, file_path = await report_service._generate_qa_analysis(
                db, report_config.config, user_id
            )
        elif report_config.type == "activity_report":
            content, file_path = await report_service._generate_activity_report(
                db, report_config.config, user_id
            )
        else:
            raise ValueError(f"Unsupported report type: {report_config.type}")
        
        current_task.update_state(
            state='PROGRESS',
            meta={'step': 'saving_report', 'progress': 90}
        )
        
        # Update report record
        report = db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.content = content
            report.file_path = file_path
            report.status = "completed"
            db.commit()
        
        return {
            'status': 'completed',
            'report_id': str(report_id),
            'file_path': file_path
        }
        
    except Exception as e:
        logger.error(f"Report generation failed for {report_id}: {e}")
        
        # Update status to failed
        report = db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.status = "failed"
            report.config = {**report.config, "error": str(e)}
            db.commit()
        
        current_task.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise
        
    finally:
        db.close()