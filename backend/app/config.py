from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql+pg8000://postgres:postgres@localhost:5432/farmer_dealer_db"
    
    # JWT Authentication
    secret_key: str = "your-super-secret-key-change-in-production-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    frontend_url: str = "http://localhost:3000"

    # Google Auth
    google_client_id: str = "your-google-client-id"
    
    # SMTP Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""
    from_name: str = "AgriConnect"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields in .env without errors


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
