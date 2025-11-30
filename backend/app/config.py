from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/pyronotes"
    openai_api_key: str
    upload_dir: str = "./uploads"
    cors_origins: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"


settings = Settings()


