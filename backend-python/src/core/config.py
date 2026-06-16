from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    sql_server: str = "localhost"
    sql_database: str = "AI_Study_Hub"
    sql_username: str = "sa"
    sql_password: str = ""
    sql_driver: str = "ODBC Driver 17 for SQL Server"
    use_mock_data: bool = True

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def odbc_connection_string(self) -> str:
        return (
            f"DRIVER={{{self.sql_driver}}};"
            f"SERVER={self.sql_server};"
            f"DATABASE={self.sql_database};"
            f"UID={self.sql_username};"
            f"PWD={self.sql_password};"
            "TrustServerCertificate=yes;"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()

