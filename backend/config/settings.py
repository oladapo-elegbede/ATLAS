"""
ATLAS - Application Configuration

Centralizes all environment-based configuration using pydantic-settings.
All configuration values are read from environment variables or the .env file.
"""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# Path to the .env file (located at the project root, two levels up from this file)
ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    """
    Application settings, loaded from environment variables or .env file.
    """

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --- Application ---
    APP_NAME: str = Field(default="ATLAS")
    APP_VERSION: str = Field(default="0.1.0")
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # --- Neo4j ---
    NEO4J_URI: str = Field(default="bolt://localhost:7687")
    NEO4J_USER: str = Field(default="neo4j")
    NEO4J_PASSWORD: str = Field(default="atlas_dev_password")


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached instance of the application settings.
    Using @lru_cache ensures we only instantiate Settings once,
    avoiding repeated .env file reads.
    """
    return Settings()