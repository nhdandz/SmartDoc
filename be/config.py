from decouple import config

class Settings:
    DATABASE_URL: str = config('DATABASE_URL', default='sqlite:///./smartdoc.db')
    SECRET_KEY: str = config('SECRET_KEY', default='your-secret-key')
    REDIS_URL: str = config('REDIS_URL', default='redis://localhost:6379')
    DEBUG: bool = config('DEBUG', default=False, cast=bool)

settings = Settings()