# TutorFlow Backend

A FastAPI-based backend for the TutorFlow tutoring platform.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Application configuration
│   ├── database.py             # Database connection and session management
│   ├── api/                    # API routes package
│   │   ├── __init__.py
│   │   └── v1/                 # API version 1
│   │       ├── __init__.py
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── users.py        # User management endpoints
│   │       └── bookings.py     # Booking management endpoints
│   ├── core/                   # Core functionality
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication utilities
│   │   └── config.py           # Configuration management
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py             # User model
│   │   ├── booking.py          # Booking model
│   │   └── tutor.py            # Tutor model
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication schemas
│   │   ├── user.py             # User schemas
│   │   └── booking.py          # Booking schemas
│   ├── services/               # Business logic services
│   │   ├── __init__.py
│   │   └── booking_service.py  # Booking business logic
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       └── validators.py       # Validation utilities
├── tests/                      # Test files
│   ├── __init__.py
│   ├── conftest.py             # Pytest configuration
│   └── test_auth.py            # Authentication tests
├── alembic/                    # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── alembic.ini                 # Alembic configuration
├── pyproject.toml              # Project dependencies and configuration
├── uv.lock                     # Dependency lock file
├── docker-compose.yml          # Docker Compose configuration
├── env.example                 # Environment variables example
└── README.md                   # This file
```

## Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Student, Tutor, Admin)
- Password hashing with bcrypt
- Token refresh mechanism

### User Management
- User registration and login
- Profile management
- Role management (admin only)
- User status management

### Booking System
- Create and manage tutoring sessions
- Availability checking
- Conflict detection
- Booking status management
- Cancellation policies

### API Features
- RESTful API design
- Request/response validation with Pydantic
- Comprehensive error handling
- CORS support
- API documentation (Swagger/ReDoc)

## Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt with passlib
- **Validation**: Pydantic
- **Migrations**: Alembic
- **Testing**: pytest with FastAPI TestClient
- **Documentation**: Auto-generated with FastAPI

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL
- uv (Python package manager)

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   uv sync
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   # Create database and run migrations
   alembic upgrade head
   ```

5. Run the development server:
   ```bash
   uv run python -m app.main
   ```

The API will be available at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Running Tests

```bash
uv run pytest
```

### Code Formatting

```bash
uv run black .
uv run isort .
```

### Linting

```bash
uv run flake8 .
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/` - List users (admin only)
- `GET /api/v1/users/{user_id}` - Get user details (admin only)
- `PUT /api/v1/users/{user_id}/role` - Update user role (admin only)
- `PUT /api/v1/users/{user_id}/status` - Update user status (admin only)

### Bookings
- `POST /api/v1/bookings/` - Create new booking
- `GET /api/v1/bookings/` - List user's bookings
- `GET /api/v1/bookings/{booking_id}` - Get booking details
- `PUT /api/v1/bookings/{booking_id}` - Update booking
- `DELETE /api/v1/bookings/{booking_id}` - Cancel booking
- `POST /api/v1/bookings/availability/{tutor_id}` - Check tutor availability

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/tutorflow

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_HOSTS=["http://localhost:3000", "http://localhost:8000"]

# Environment
ENVIRONMENT=development
DEBUG=true
```

## Contributing

1. Follow the existing code style and structure
2. Write tests for new features
3. Update documentation as needed
4. Use meaningful commit messages

## License

This project is part of the TutorFlow platform. 