#!/bin/bash

# PyroNotes Backend Start Script

echo "🔥 Starting PyroNotes Backend..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    echo "✅ Created .env file. Please edit it with your OpenAI API key."
    cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://localhost:5432/pyronotes
OPENAI_API_KEY=sk-your-key-here
UPLOAD_DIR=./uploads
CORS_ORIGINS=http://localhost:5173
EOF
    exit 1
fi

# Activate venv
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    brew services start postgresql@15
    sleep 2
fi

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw pyronotes; then
    echo "📊 Creating database 'pyronotes'..."
    createdb pyronotes
fi

# Create uploads directory
mkdir -p uploads

echo "🚀 Starting FastAPI server..."
echo "📍 API: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --reload --port 8000
