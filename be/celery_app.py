
# app/celery_app.py
from celery import Celery
from celery.schedules import crontab
from app.config import settings
import os

# Create Celery instance
celery_app = Celery(
    "smartdoc",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.document_tasks",
        "app.tasks.ocr_tasks", 
        "app.tasks.report_tasks",
        "app.tasks.maintenance_tasks"
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Scheduled tasks
celery_app.conf.beat_schedule = {
    # Clean up temporary files every hour
    'cleanup-temp-files': {
        'task': 'app.tasks.maintenance_tasks.cleanup_temp_files',
        'schedule': crontab(minute=0),  # Every hour
    },
    # Backup database daily at 2 AM
    'backup-database': {
        'task': 'app.tasks.maintenance_tasks.backup_database',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    # Update search index every 6 hours
    'update-search-index': {
        'task': 'app.tasks.maintenance_tasks.update_search_index',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
}
