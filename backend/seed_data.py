"""
Seed data script for TutorFlow.

This script creates fake data for demonstration purposes.
"""

import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User, UserProfile, Tutor, UserRole
from app.core.auth import get_password_hash


def create_fake_tutors():
    """Create fake tutor data for demonstration."""

    fake_tutors = [
        {
            "email": "sarah.johnson@email.com",
            "password": "password123",
            "first_name": "Sarah",
            "last_name": "Johnson",
            "bio": "Experienced math tutor with 8+ years helping students excel in algebra, calculus, and statistics. I believe every student can succeed with the right approach!",
            "subjects": json.dumps(
                ["Mathematics", "Algebra", "Calculus", "Statistics"]
            ),
            "hourly_rate": 45.0,
            "rating": 4.8,
            "total_sessions": 156,
            "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            "email": "michael.chen@email.com",
            "password": "password123",
            "first_name": "Michael",
            "last_name": "Chen",
            "bio": "Physics and chemistry specialist with a PhD from MIT. I make complex concepts simple and engaging for students of all levels.",
            "subjects": json.dumps(
                ["Physics", "Chemistry", "AP Physics", "AP Chemistry"]
            ),
            "hourly_rate": 60.0,
            "rating": 4.9,
            "total_sessions": 203,
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        {
            "email": "emily.rodriguez@email.com",
            "password": "password123",
            "first_name": "Emily",
            "last_name": "Rodriguez",
            "bio": "Passionate English and literature tutor. I help students develop strong writing skills and a love for reading. Former high school teacher with 6 years experience.",
            "subjects": json.dumps(["English", "Literature", "Writing", "ESL"]),
            "hourly_rate": 40.0,
            "rating": 4.7,
            "total_sessions": 89,
            "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
        {
            "email": "david.kim@email.com",
            "password": "password123",
            "first_name": "David",
            "last_name": "Kim",
            "bio": "Computer science and programming tutor. I teach Python, Java, JavaScript, and web development. Let's build something amazing together!",
            "subjects": json.dumps(
                ["Computer Science", "Python", "Java", "JavaScript", "Web Development"]
            ),
            "hourly_rate": 55.0,
            "rating": 4.6,
            "total_sessions": 134,
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
            "email": "lisa.thompson@email.com",
            "password": "password123",
            "first_name": "Lisa",
            "last_name": "Thompson",
            "bio": "History and social studies tutor with a master's degree in education. I make history come alive and help students develop critical thinking skills.",
            "subjects": json.dumps(
                ["History", "Social Studies", "Government", "Geography"]
            ),
            "hourly_rate": 35.0,
            "rating": 4.5,
            "total_sessions": 67,
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        },
        {
            "email": "james.wilson@email.com",
            "password": "password123",
            "first_name": "James",
            "last_name": "Wilson",
            "bio": "Biology and environmental science tutor. I have a passion for teaching and helping students understand the natural world around them.",
            "subjects": json.dumps(
                ["Biology", "Environmental Science", "AP Biology", "Anatomy"]
            ),
            "hourly_rate": 42.0,
            "rating": 4.4,
            "total_sessions": 78,
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        },
    ]

    db = SessionLocal()

    try:
        for tutor_data in fake_tutors:
            # Check if user already exists
            existing_user = (
                db.query(User).filter(User.email == tutor_data["email"]).first()
            )
            if existing_user:
                print(f"User {tutor_data['email']} already exists, skipping...")
                continue

            # Create user
            user = User(
                id=str(uuid.uuid4()),
                email=tutor_data["email"],
                password_hash=get_password_hash(tutor_data["password"]),
                role=UserRole.TUTOR,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(user)
            db.flush()  # Get the user ID

            # Create user profile
            profile = UserProfile(
                user_id=user.id,
                first_name=tutor_data["first_name"],
                last_name=tutor_data["last_name"],
                bio=tutor_data["bio"],
                avatar_url=tutor_data["avatar_url"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(profile)

            # Create tutor profile
            tutor = Tutor(
                user_id=user.id,
                subjects=tutor_data["subjects"],
                hourly_rate=tutor_data["hourly_rate"],
                rating=tutor_data["rating"],
                total_sessions=tutor_data["total_sessions"],
                is_verified=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(tutor)

            print(
                f"Created tutor: {tutor_data['first_name']} {tutor_data['last_name']}"
            )

        db.commit()
        print("Successfully created all fake tutors!")

    except Exception as e:
        db.rollback()
        print(f"Error creating fake tutors: {e}")
        raise
    finally:
        db.close()


def create_fake_students():
    """Create fake student data for demonstration."""

    fake_students = [
        {
            "email": "alex.smith@email.com",
            "password": "password123",
            "first_name": "Alex",
            "last_name": "Smith",
            "bio": "High school student passionate about learning and improving my academic performance.",
        },
        {
            "email": "maya.patel@email.com",
            "password": "password123",
            "first_name": "Maya",
            "last_name": "Patel",
            "bio": "College freshman looking to strengthen my foundation in core subjects.",
        },
    ]

    db = SessionLocal()

    try:
        for student_data in fake_students:
            # Check if user already exists
            existing_user = (
                db.query(User).filter(User.email == student_data["email"]).first()
            )
            if existing_user:
                print(f"User {student_data['email']} already exists, skipping...")
                continue

            # Create user
            user = User(
                id=str(uuid.uuid4()),
                email=student_data["email"],
                password_hash=get_password_hash(student_data["password"]),
                role=UserRole.STUDENT,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(user)
            db.flush()  # Get the user ID

            # Create user profile
            profile = UserProfile(
                user_id=user.id,
                first_name=student_data["first_name"],
                last_name=student_data["last_name"],
                bio=student_data["bio"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(profile)

            print(
                f"Created student: {student_data['first_name']} {student_data['last_name']}"
            )

        db.commit()
        print("Successfully created all fake students!")

    except Exception as e:
        db.rollback()
        print(f"Error creating fake students: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database with fake data...")
    create_fake_tutors()
    create_fake_students()
    print("Database seeding completed!")
