from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
import json

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@localhost:5432/diagnostic_db")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # API Base URL for generating report links in SMS/Emails
    API_BASE_URL: str = Field(default="http://localhost:8000")
    
    # CORS Allowed Origins
    CORS_ORIGINS: list[str] = Field(default=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://diagnose1.vercel.app",
        "https://diagnose1-admin.vercel.app",
        "https://diagnose-admin.vercel.app",
    ])

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                # Try to parse as JSON list
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed]
            except json.JSONDecodeError:
                pass
            # Fallback to comma-separated values
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, v):
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # Razorpay Credentials
    RAZORPAY_KEY_ID: str = Field(default="rzp_test_placeholder")
    RAZORPAY_KEY_SECRET: str = Field(default="secret_placeholder")
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="webhook_secret_placeholder")
    
    # Brevo SMS Credentials
    BREVO_API_KEY: str = Field(default="placeholder")
    
    # MSG91 WhatsApp/SMS Timeline: July 1
    MSG91_AUTH_KEY: str = Field(default="msg91_auth_key_placeholder")
    MSG91_TEMPLATE_CONFIRMATION: str = Field(default="booking_confirm_template")
    MSG91_TEMPLATE_CANCELLATION: str = Field(default="booking_cancel_template")
    MSG91_TEMPLATE_RESCHEDULED: str = Field(default="booking_reschedule_template")
    MSG91_TEMPLATE_REPORT_READY: str = Field(default="report_ready_template")
    MSG91_TEMPLATE_OTP: str = Field(default="otp_verification_template")
    
    # Cloud Storage (Private report buckets, short-lived URL signatures)
    STORAGE_BUCKET_NAME: str = Field(default="diagnostic-reports-bucket")
    
    # Internal Meilisearch typo-tolerant search
    MEILISEARCH_HOST: str = Field(default="http://localhost:7700")
    MEILISEARCH_API_KEY: str = Field(default="meili_master_key_placeholder")
    
    # OTP Security limits
    OTP_MAX_ATTEMPTS: int = Field(default=5)
    OTP_LOCKOUT_MINUTES: int = Field(default=15)
    OTP_EXPIRY_SECONDS: int = Field(default=300)
    
    ENABLE_MOCK_PAYMENTS: bool = Field(default=False)
    SECRET_KEY: str = Field(default="")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
