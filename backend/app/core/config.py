import os
from typing import List, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "Nexus Multi-Agent AI Chatbot Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = Field(
        default="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
        description="Key used to encrypt passwords and tokens"
    )
    JWT_SECRET: str = Field(
        default="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
        description="Key used to sign JWT tokens"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = Field(
        default="mysql+pymysql://nexus_user:nexus_secure_password@localhost:3306/nexus_chatbot",
        description="SQLAlchemy database connection string"
    )

    CHROMA_SERVER_HOST: str = "localhost"
    CHROMA_SERVER_PORT: int = 8001
    CHROMA_DB_PATH: str = "./chroma_db"

    GROQ_API_KEY: str = Field(
        default="",
        description="Groq API key for enterprise-grade LLM inference"
    )
    OLLAMA_URL: str = Field(
        default="http://localhost:11434",
        description="Ollama endpoint URL for local fallback"
    )

    GROQ_MODELS: List[str] = [
        "llama-3.3-70b-versatile",
        "qwen/qwen3-32b",
        "deepseek-r1-distill-llama-70b"
    ]

    OLLAMA_MODELS: List[str] = [
        "llama3.2",
        "qwen2.5-coder",
        "deepseek-r1",
        "mistral",
        "gemma3",
        "nomic-embed-text"
    ]

    BACKEND_CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
