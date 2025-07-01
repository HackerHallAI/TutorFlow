"""
Configuration settings for the TutorFlow application.
"""

from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "TutorFlow API"
    app_version: str = "0.1.0"
    debug: bool = Field(default=False, description="Debug mode")

    # Database
    database_url: str = Field(
        default="postgresql://tutorflow:tutorflow@localhost:5432/tutorflow",
        description="Database connection URL",
    )
    database_echo: bool = Field(default=False, description="Echo SQL queries")

    # Security
    secret_key: str = Field(description="Secret key for JWT tokens")
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(
        default=15, description="Access token expiration"
    )
    refresh_token_expire_days: int = Field(
        default=7, description="Refresh token expiration"
    )

    # CORS
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Allowed CORS origins",
    )

    # AWS Configuration
    aws_access_key_id: Optional[str] = Field(default=None, description="AWS access key")
    aws_secret_access_key: Optional[str] = Field(
        default=None, description="AWS secret key"
    )
    aws_region: str = Field(default="us-east-1", description="AWS region")
    s3_bucket_name: str = Field(
        default="tutorflow-uploads", description="S3 bucket for uploads"
    )

    # Email Configuration
    ses_from_email: str = Field(
        default="noreply@tutorflow.com", description="SES from email"
    )
    ses_region: str = Field(default="us-east-1", description="SES region")

    # Stripe Configuration
    stripe_secret_key: Optional[str] = Field(
        default=None, description="Stripe secret key"
    )
    stripe_webhook_secret: Optional[str] = Field(
        default=None, description="Stripe webhook secret"
    )

    # Zoom Configuration
    zoom_api_key: Optional[str] = Field(default=None, description="Zoom API key")
    zoom_api_secret: Optional[str] = Field(default=None, description="Zoom API secret")

    # File Upload
    max_file_size: int = Field(
        default=10 * 1024 * 1024, description="Max file size in bytes (10MB)"
    )
    allowed_file_types: list[str] = Field(
        default=[".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".gif"],
        description="Allowed file types",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_database_url() -> str:
    """Get database URL with proper formatting."""
    return settings.database_url


def get_settings() -> Settings:
    """Get application settings."""
    return settings
