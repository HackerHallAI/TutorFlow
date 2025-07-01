"""
Authentication tests for TutorFlow backend.

This module contains tests for authentication endpoints
including registration, login, and token management.
"""

import pytest
from fastapi import status


def test_register_user_success(client, test_user_data):
    """Test successful user registration."""
    response = client.post("/api/v1/auth/register", json=test_user_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert data["email"] == test_user_data["email"]
    assert data["first_name"] == test_user_data["first_name"]
    assert data["last_name"] == test_user_data["last_name"]
    assert data["role"] == test_user_data["role"]
    assert "id" in data
    assert "message" in data


def test_register_user_duplicate_email(client, test_user_data):
    """Test registration with duplicate email."""
    # Register first user
    client.post("/api/v1/auth/register", json=test_user_data)

    # Try to register with same email
    response = client.post("/api/v1/auth/register", json=test_user_data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]


def test_register_user_invalid_password(client, test_user_data):
    """Test registration with invalid password."""
    test_user_data["password"] = "short"

    response = client.post("/api/v1/auth/register", json=test_user_data)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client, test_user_data):
    """Test successful user login."""
    # Register user first
    client.post("/api/v1/auth/register", json=test_user_data)

    # Login
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = client.post("/api/v1/auth/login", json=login_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == test_user_data["email"]


def test_login_invalid_credentials(client, test_user_data):
    """Test login with invalid credentials."""
    # Register user first
    client.post("/api/v1/auth/register", json=test_user_data)

    # Login with wrong password
    login_data = {"email": test_user_data["email"], "password": "wrongpassword"}
    response = client.post("/api/v1/auth/login", json=login_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    login_data = {"email": "nonexistent@example.com", "password": "password123"}
    response = client.post("/api/v1/auth/login", json=login_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_success(client, test_user_data):
    """Test getting current user with valid token."""
    # Register and login user
    client.post("/api/v1/auth/register", json=test_user_data)
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    login_response = client.post("/api/v1/auth/login", json=login_data)
    access_token = login_response.json()["access_token"]

    # Get current user
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert data["email"] == test_user_data["email"]
    assert data["first_name"] == test_user_data["first_name"]
    assert data["last_name"] == test_user_data["last_name"]
    assert data["role"] == test_user_data["role"]


def test_get_current_user_invalid_token(client):
    """Test getting current user with invalid token."""
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Could not validate credentials" in response.json()["detail"]


def test_refresh_token_success(client, test_user_data):
    """Test successful token refresh."""
    # Register and login user
    client.post("/api/v1/auth/register", json=test_user_data)
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    login_response = client.post("/api/v1/auth/login", json=login_data)
    refresh_token = login_response.json()["refresh_token"]

    # Refresh token
    refresh_data = {"refresh_token": refresh_token}
    response = client.post("/api/v1/auth/refresh", json=refresh_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_token_invalid(client):
    """Test token refresh with invalid refresh token."""
    refresh_data = {"refresh_token": "invalid_refresh_token"}
    response = client.post("/api/v1/auth/refresh", json=refresh_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid refresh token" in response.json()["detail"]
