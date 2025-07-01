# TutorFlow

A modern, full-stack tutoring platform built with FastAPI, Next.js 14, and AWS. This project serves as a portfolio piece demonstrating advanced web development capabilities, AWS infrastructure expertise, and complex system integration.

## 🎯 Project Overview

**TutorFlow** is a comprehensive tutoring platform that connects students with qualified tutors through an intuitive booking system, integrated payment processing, and virtual classroom capabilities.

### Key Features

- **Multi-Role User System** - Students, Parents, Tutors, and Admin roles with role-based permissions
- **Real-Time Booking System** - Conflict-free scheduling with availability management
- **Integrated Payments** - Stripe-powered payment processing with automated invoicing
- **Virtual Classroom** - Zoom API integration for seamless video sessions
- **Content Management** - File upload system and educational resource library
- **Communication Hub** - Email notifications and in-app messaging
- **Analytics Dashboard** - Performance tracking and revenue analytics

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Framework:** FastAPI + Python 3.11+
- **Database:** PostgreSQL (AWS RDS)
- **ORM:** SQLAlchemy with SQLModel
- **Authentication:** JWT tokens with refresh mechanism
- **Validation:** Pydantic models
- **File Storage:** AWS S3
- **Email:** AWS SES

**Frontend:**
- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + hooks
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios

**Infrastructure (AWS):**
- **Compute:** ECS with Fargate containers
- **Database:** RDS PostgreSQL
- **Storage:** S3 for file uploads
- **CDN:** CloudFront for static assets
- **Load Balancer:** Application Load Balancer
- **DNS:** Route 53
- **SSL:** AWS Certificate Manager
- **Monitoring:** CloudWatch

**Third-Party Integrations:**
- **Payments:** Stripe API
- **Video Meetings:** Zoom API
- **Notifications:** AWS SES

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)
- AWS CLI (for deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TutorFlow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Run database migrations
   alembic upgrade head
   
   # Start the development server
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env.local
   # Edit .env.local with your configuration
   
   # Start the development server
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Install PostgreSQL locally or use Docker
   docker run --name tutorflow-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=tutorflow -p 5432:5432 -d postgres:15
   ```

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tutorflow
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tutorflow-uploads
SES_FROM_EMAIL=noreply@tutorflow.com
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📁 Project Structure

```
TutorFlow/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── core/              # Core functionality
│   │   │   ├── models/            # SQLAlchemy models
│   │   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── services/          # Business logic
│   │   │   └── utils/             # Utility functions
│   │   ├── tests/                 # Backend tests
│   │   └── requirements.txt
│   ├── frontend/                   # Next.js frontend
│   │   ├── app/                   # App router pages
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utility libraries
│   │   ├── hooks/                 # Custom React hooks
│   │   └── types/                 # TypeScript types
│   ├── docs/                      # Documentation
│   ├── DesignDoc.md              # Project design document
│   ├── PLANNING.md               # Technical planning
│   └── TASKS.md                  # Development tasks
└── README.md                 # This file
```

## 🔧 Development

### Code Style

**Backend (Python):**
- Follow PEP8 with black formatting
- Use type hints for all functions
- Google style docstrings
- Pydantic for data validation

**Frontend (TypeScript):**
- Strict TypeScript (no `any` types)
- Functional components with hooks
- Tailwind CSS for styling
- React Hook Form + Zod validation

### Testing

**Backend Testing:**
```bash
cd backend
pytest
```

**Frontend Testing:**
```bash
cd frontend
npm test
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## 🚀 Deployment

### AWS Deployment

1. **Set up AWS Infrastructure**
   ```bash
   # Configure AWS CLI
   aws configure
   
   # Deploy infrastructure (using CDK or Terraform)
   cd infrastructure
   npm run deploy
   ```

2. **Deploy Backend**
   ```bash
   # Build and push Docker image
   docker build -t tutorflow-backend .
   docker tag tutorflow-backend:latest <ecr-repository-url>
   docker push <ecr-repository-url>
   
   # Deploy to ECS
   aws ecs update-service --cluster tutorflow-cluster --service tutorflow-backend --force-new-deployment
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   npm run export
   
   # Upload to S3 and invalidate CloudFront
   aws s3 sync out/ s3://tutorflow-static
   aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
   ```

### Environment Configuration

Set up the following AWS services:
- **ECS Cluster** with Fargate tasks
- **RDS PostgreSQL** instance
- **S3 Buckets** for file storage
- **CloudFront** distribution
- **Route 53** domain configuration
- **SSL Certificate** via ACM

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Key Endpoints

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

**Bookings:**
- `GET /bookings/availability/{tutor_id}` - Check availability
- `POST /bookings` - Create booking
- `GET /bookings` - List user bookings

**Payments:**
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment

## 🔒 Security

- JWT tokens with expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- API rate limiting
- CORS configuration
- SQL injection prevention
- XSS protection
- File upload validation

## 📊 Monitoring

- **CloudWatch** for application metrics
- **RDS Performance Insights** for database monitoring
- **S3 Access Logs** for file access tracking
- **CloudFront Analytics** for CDN performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Project Goals

- **Portfolio Piece:** Demonstrate full-stack development capabilities
- **AWS Experience:** Gain hands-on experience with AWS services
- **Complex Integration:** Test appetite for complex web application development
- **Reusable Foundation:** Create a foundation for future projects

## 📞 Support

For questions or support, please refer to:
- [DesignDoc.md](DesignDoc.md) - Detailed project design
- [PLANNING.md](PLANNING.md) - Technical architecture and planning
- [TASKS.md](TASKS.md) - Development task tracking

---

**Built with ❤️ for MetrIQ Consulting** 