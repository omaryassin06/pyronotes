# Backend

FastAPI backend for PyroNotes.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://localhost:5432/pyronotes
OPENAI_API_KEY=sk-your-key-here
UPLOAD_DIR=./uploads
CORS_ORIGINS=http://localhost:5173
EOF

# Start
./start.sh
```

## API Endpoints

- `POST /api/transcriptions` - Upload audio
- `WS /api/transcriptions/{id}/stream` - Real-time streaming
- `GET /api/lectures` - List lectures
- `GET /api/folders` - List folders
- `POST /api/generate` - Generate study materials

Docs: `http://localhost:8000/docs`
