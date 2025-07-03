#!/usr/bin/env python3
"""
Script to create an admin account for TutorFlow.

Usage:
    python create_admin.py

This script will prompt for admin credentials and create an admin user in the database.
"""

import sys
import os
import getpass
from datetime import datetime
import uuid

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole, UserProfile
from app.core.auth import get_password_hash


def create_admin_user():
    """Create an admin user with interactive prompts."""

    print("=== TutorFlow Admin Account Creation ===\n")

    # Get admin details
    email = input("Enter admin email: ").strip()
    if not email:
        print("Email is required!")
        return False

    first_name = input("Enter first name: ").strip()
    if not first_name:
        print("First name is required!")
        return False

    last_name = input("Enter last name: ").strip()
    if not last_name:
        print("Last name is required!")
        return False

    # Get password securely
    password = getpass.getpass("Enter password: ")
    if not password:
        print("Password is required!")
        return False

    confirm_password = getpass.getpass("Confirm password: ")
    if password != confirm_password:
        print("Passwords do not match!")
        return False

    if len(password) < 8:
        print("Password must be at least 8 characters long!")
        return False

    # Create database session
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email {email} already exists!")
            return False

        # Create admin user
        admin_user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(admin_user)
        db.flush()  # Get the user ID

        # Create user profile
        admin_profile = UserProfile(
            user_id=admin_user.id,
            first_name=first_name,
            last_name=last_name,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(admin_profile)

        # Commit the transaction
        db.commit()

        print(f"\n✅ Admin account created successfully!")
        print(f"Email: {email}")
        print(f"Name: {first_name} {last_name}")
        print(f"Role: Admin")
        print(f"\nYou can now log in to access admin features.")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin account: {e}")
        return False

    finally:
        db.close()


def main():
    """Main function."""
    try:
        success = create_admin_user()
        if success:
            print("\n🎉 Admin account creation completed!")
        else:
            print("\n❌ Admin account creation failed!")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
