# TutorFlow - Technical Planning & Architecture

## Project Overview

**Project Name:** TutorFlow  
**Purpose:** Portfolio/demo tutoring platform showcasing full-stack development capabilities  
**Timeline:** 6-8 weeks  
**Primary Goals:** Build impressive portfolio piece, gain AWS experience, test complex web development appetite

## Technology Stack

### Backend Architecture
- **Framework:** FastAPI + Python 3.12+
- **Database:** PostgreSQL (AWS RDS)
- **ORM:** SQLAlchemy with SQLModel
- **Authentication:** JWT tokens with refresh mechanism
- **Validation:** Pydantic models
- **File Storage:** AWS S3
- **Email:** AWS SES
- **API Documentation:** Auto-generated with FastAPI/Swagger

### Frontend Architecture
- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + hooks
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios or Fetch API
- **Routing:** App Router (Next.js 14)

### Infrastructure (AWS)
- **Compute:** ECS with Fargate containers
- **Database:** RDS PostgreSQL with Multi-AZ
- **Storage:** S3 for file uploads
- **CDN:** CloudFront for static assets
- **Load Balancer:** Application Load Balancer
- **DNS:** Route 53
- **SSL:** AWS Certificate Manager
- **Monitoring:** CloudWatch

### Third-Party Integrations
- **Payments:** Stripe API
- **Video Meetings:** Zoom API
- **Notifications:** AWS SES + optional Twilio for SMS

## Database Design

### Core Tables

```sql
-- Users table with role-based access
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'parent', 'tutor', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extended profile information
user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutor-specific information
tutors (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    subjects JSONB NOT NULL, -- Array of subject objects
    hourly_rate DECIMAL(10,2) NOT NULL,
    availability_schedule JSONB, -- Weekly schedule structure
    stripe_account_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2),
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-parent relationships
student_parents (
    student_id UUID REFERENCES users(id),
    parent_id UUID REFERENCES users(id),
    PRIMARY KEY (student_id, parent_id)
);

-- Booking system
bookings (
    id UUID PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    zoom_link VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment tracking
payments (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    stripe_payment_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content management
resources (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(100),
    tags JSONB, -- Array of tags
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts
blog_posts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID NOT NULL REFERENCES users(id),
    category VARCHAR(100),
    tags JSONB, -- Array of tags
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Structure

### Authentication Endpoints
```
POST /auth/register - User registration
POST /auth/login - User login
POST /auth/refresh - Token refresh
POST /auth/logout - User logout
```

### User Management
```
GET /users/profile - Get current user profile
PUT /users/profile - Update user profile
GET /users/tutors - List available tutors
GET /users/tutors/{id} - Get tutor details
```

### Booking System
```
GET /bookings/availability/{tutor_id} - Check tutor availability
POST /bookings - Create new booking
GET /bookings - List user bookings
PUT /bookings/{id} - Update booking
DELETE /bookings/{id} - Cancel booking
```

### Payment Processing
```
POST /payments/create-intent - Create Stripe payment intent
POST /payments/confirm - Confirm payment
GET /payments/history - Payment history
```

### Content Management
```
GET /resources - List educational resources
POST /resources - Upload new resource
GET /blog - List blog posts
POST /blog - Create blog post (admin only)
```

## Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connection
│   ├── models/                # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── booking.py
│   │   ├── payment.py
│   │   └── content.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── booking.py
│   │   └── payment.py
│   ├── api/                   # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── bookings.py
│   │   ├── payments.py
│   │   └── content.py
│   ├── core/                  # Core functionality
│   │   ├── __init__.py
│   │   ├── security.py        # JWT, password hashing
│   │   ├── permissions.py     # Role-based access
│   │   └── dependencies.py    # FastAPI dependencies
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── booking_service.py
│   │   ├── payment_service.py
│   │   └── notification_service.py
│   └── utils/                 # Utility functions
│       ├── __init__.py
│       ├── email.py
│       └── file_upload.py
├── tests/                     # Test files
├── alembic/                   # Database migrations
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### Frontend Structure
```
frontend/
├── app/                       # Next.js 14 app router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── student/
│   │   ├── tutor/
│   │   └── admin/
│   ├── bookings/
│   ├── payments/
│   └── resources/
├── components/                # Reusable components
│   ├── ui/                    # Base UI components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   └── features/              # Feature-specific components
├── lib/                       # Utility libraries
│   ├── api.ts                 # API client
│   ├── auth.ts                # Authentication utilities
│   ├── utils.ts               # General utilities
│   └── validations.ts         # Zod schemas
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript type definitions
├── public/                    # Static assets
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## Development Guidelines

### Code Style & Conventions

#### Python (Backend)
- **Style:** Follow PEP8 with black formatting
- **Type Hints:** Use type hints for all functions
- **Docstrings:** Google style docstrings for all functions
- **Imports:** Use relative imports within packages
- **Error Handling:** Use custom exception classes
- **Validation:** Use Pydantic for all data validation

#### TypeScript (Frontend)
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS with component-based approach
- **State Management:** React Context + hooks
- **Forms:** React Hook Form + Zod validation
- **Type Safety:** Strict TypeScript, no `any` types
- **Components:** Functional components with hooks

### Security Practices

#### Authentication & Authorization
- JWT tokens with expiration (15 minutes access, 7 days refresh)
- Role-based access control (RBAC)
- Password hashing with bcrypt
- API rate limiting
- CORS configuration

#### Data Protection
- SQL injection prevention (ORM parameterized queries)
- XSS protection in frontend
- File upload validation and scanning
- Input sanitization

#### AWS Security
- IAM roles with least privilege
- Security groups with minimal access
- RDS encryption at rest
- S3 bucket policies
- CloudWatch monitoring

### Testing Strategy

#### Backend Testing
- **Unit Tests:** Pytest for business logic
- **Integration Tests:** API endpoint testing
- **Database Tests:** Transaction testing
- **Payment Tests:** Stripe test mode

#### Frontend Testing
- **Component Tests:** React Testing Library
- **Integration Tests:** User flow testing
- **E2E Tests:** Playwright or Cypress

### Deployment Strategy

#### Development Environment
- Local PostgreSQL instance
- Docker containers for consistency
- Environment variables for configuration
- Hot reload for rapid development

#### Production Deployment
- Blue-green deployment strategy
- Database migrations with rollback
- Health checks and monitoring
- Automated backup procedures

## AWS Infrastructure Architecture

### VPC Design
```
VPC: 10.0.0.0/16
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│   ├── Application Load Balancer
│   └── NAT Gateway
└── Private Subnets (10.0.3.0/24, 10.0.4.0/24)
    ├── ECS Fargate Tasks
    └── RDS PostgreSQL
```

### ECS Configuration
```yaml
Task Definition:
  CPU: 512
  Memory: 1024MB
  Container: FastAPI app
  Health Check: /health endpoint
  Environment Variables:
    - DATABASE_URL
    - JWT_SECRET
    - STRIPE_SECRET_KEY
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
```

### RDS Configuration
```yaml
PostgreSQL Setup:
  Engine: PostgreSQL 15
  Instance: db.t3.micro (development)
  Storage: 20GB GP2
  Backup: 7 day retention
  Multi-AZ: No (development)
  Encryption: At rest
```

### S3 Buckets
- `tutorflow-uploads` - User uploaded files
- `tutorflow-static` - Static assets
- `tutorflow-backups` - Database backups

## Integration Patterns

### Stripe Integration
- Webhook handling for payment events
- Payment intent creation and confirmation
- Refund processing
- Subscription management (future)

### Zoom Integration
- Meeting creation via API
- Automatic link generation
- Meeting management
- Recording access (future)

### AWS SES Integration
- Email template system
- Transactional emails
- Bounce and complaint handling
- Email analytics

## Performance Considerations

### Backend Optimization
- Database connection pooling
- Query optimization with indexes
- Caching strategies (Redis for future)
- API response compression

### Frontend Optimization
- Next.js static generation
- Image optimization
- Code splitting
- Bundle analysis

### AWS Optimization
- CloudFront caching
- S3 lifecycle policies
- RDS performance insights
- Cost monitoring and alerts

## Monitoring & Logging

### Application Monitoring
- CloudWatch metrics
- Custom application metrics
- Error tracking and alerting
- Performance monitoring

### Infrastructure Monitoring
- ECS service monitoring
- RDS performance insights
- S3 access logs
- CloudFront analytics

### Logging Strategy
- Structured logging (JSON)
- Log levels (DEBUG, INFO, WARNING, ERROR)
- Centralized log aggregation
- Log retention policies

## Risk Management

### Technical Risks
- **Complex Zoom API integration** → Start early, have backup plan
- **AWS learning curve** → Allocate extra time for infrastructure
- **Payment system complexity** → Use Stripe's excellent documentation

### Mitigation Strategies
- Regular progress reviews
- Incremental development approach
- Fallback options for complex features
- Extra time buffer for learning curve

## Success Metrics

### Technical Success
- All features working as specified
- Deployed and running on AWS
- Performance meets expectations
- Security best practices implemented

### Business Success
- Impressive portfolio piece for consulting
- AWS experience gained and documented
- Realistic project estimation abilities
- Confidence in full-stack development

### Learning Success
- FastAPI proficiency demonstrated
- AWS skills acquired and proven
- Complex integration experience
- Project management skills improved

---

**Last Updated:** [Current Date]  
**Version:** 1.0  
**Status:** Planning Complete 