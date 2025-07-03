#!/usr/bin/env python3
"""
Test script to create an admin account via the API.

Usage:
    python test_admin_creation.py

This script will create an admin account using the API endpoint.
"""

import requests
import json

# API configuration
API_BASE_URL = "http://localhost:8000/api/v1"
SECRET_KEY = "tutorflow-admin-2024"  # Default secret key


def create_admin_via_api():
    """Create an admin account using the API endpoint."""

    admin_data = {
        "email": "admin@tutorflow.com",
        "password": "admin123",
        "first_name": "Admin",
        "last_name": "User",
    }

    url = f"{API_BASE_URL}/auth/create-admin"
    params = {"secret_key": SECRET_KEY}

    try:
        response = requests.post(url, json=admin_data, params=params)

        if response.status_code == 200:
            result = response.json()
            print("✅ Admin account created successfully!")
            print(f"User ID: {result['user_id']}")
            print(f"Email: {result['email']}")
            print(f"Message: {result['message']}")
            return True
        else:
            print(f"❌ Failed to create admin account: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server.")
        print("Make sure the backend server is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=== Admin Account Creation via API ===\n")
    success = create_admin_via_api()

    if success:
        print("\n🎉 Admin account creation completed!")
        print("\nYou can now log in with:")
        print("Email: admin@tutorflow.com")
        print("Password: admin123")
    else:
        print("\n❌ Admin account creation failed!")
