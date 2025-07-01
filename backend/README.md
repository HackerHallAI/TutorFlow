# TutorFlow Backend

FastAPI backend for the TutorFlow tutoring platform.

## 🚀 Quick Start with UV

### Prerequisites

- Python 3.12+
- [UV package manager](https://docs.astral.sh/uv/)
- Docker (optional, for database)

### Setup

1. **Install dependencies with UV**
   ```bash
   # Install all dependencies
   uv sync
   
   # Or install with dev dependencies
   uv sync --dev
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   # Make sure to set a strong SECRET_KEY
   ```

3. **Start the database**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres
   
   # Or install PostgreSQL locally
   # Then create database: createdb tutorflow
   ```

4. **Run database migrations**
   ```bash
   # Initialize Alembic (first time only)
   uv run alembic init alembic
   
   # Create initial migration
   uv run alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   uv run alembic upgrade head
   ```

5. **Start the development server**
   ```bash
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/             # Pydantic schemas
│   ├── api/                 # API routes
│   ├── core/                # Core functionality
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── tests/                   # Test files
├── alembic/                 # Database migrations
├── pyproject.toml          # UV project configuration
├── docker-compose.yml      # Local development services
└── init.sql               # Database initialization
```

## 🔧 Development Commands

### Using UV

```bash
# Install dependencies
uv sync

# Run development server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=app

# Format code
uv run black .

# Lint code
uv run flake8 .

# Type checking
uv run mypy .

# Database migrations
uv run alembic revision --autogenerate -m "Description"
uv run alembic upgrade head
uv run alembic downgrade -1
```

### Database Management

```bash
# Start database services
docker-compose up -d

# View database logs
docker-compose logs postgres

# Access pgAdmin (optional)
# http://localhost:5050
# Email: admin@tutorflow.com
# Password: admin

# Connect to database directly
docker-compose exec postgres psql -U tutorflow -d tutorflow
```

## 🔒 Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://tutorflow:tutorflow@localhost:5432/tutorflow

# Security
SECRET_KEY=your-super-secret-key

# Optional (for full functionality)
STRIPE_SECRET_KEY=sk_test_...
ZOOM_API_KEY=your-zoom-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🧪 Testing

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_auth.py

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run integration tests
uv run pytest -m integration

# Run unit tests only
uv run pytest -m unit
```

## 🚀 Production Deployment

### Using UV

```bash
# Install production dependencies only
uv sync --no-dev

# Run production server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Using Docker

```bash
# Build Docker image
docker build -t tutorflow-backend .

# Run container
docker run -p 8000:8000 tutorflow-backend
```

## 🔍 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Ensure PostgreSQL is running: `docker-compose up -d postgres`
   - Check DATABASE_URL in `.env`
   - Verify database exists: `createdb tutorflow`

2. **Import errors**
   - Ensure you're using UV: `uv sync`
   - Check Python version: `python --version` (should be 3.12+)

3. **Migration errors**
   - Reset database: `docker-compose down -v && docker-compose up -d postgres`
   - Re-run migrations: `uv run alembic upgrade head`

4. **Port already in use**
   - Change port: `uv run uvicorn app.main:app --port 8001`
   - Or kill existing process: `lsof -ti:8000 | xargs kill -9`

## 📝 Contributing

1. Follow the code style (Black + Flake8)
2. Add tests for new features
3. Update documentation
4. Run pre-commit hooks: `uv run pre-commit run --all-files` 