"""
Authentication schemas for TutorFlow backend.

This module contains Pydantic models for authentication-related
requests and responses.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    """Request model for user registration."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, description="User password (min 8 characters)"
    )
    first_name: str = Field(
        ..., min_length=1, max_length=50, description="User first name"
    )
    last_name: str = Field(
        ..., min_length=1, max_length=50, description="User last name"
    )
    role: UserRole = Field(..., description="User role")


class RegisterResponse(BaseModel):
    """Response model for user registration (UUID as string for id)."""

    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    role: UserRole = Field(..., description="User role")
    message: str = Field(..., description="Success message")


class LoginRequest(BaseModel):
    """Request model for user login."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class LoginResponse(BaseModel):
    """Response model for user login (UUID as string for user_id)."""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(..., description="Token type (bearer)")
    user_id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    role: UserRole = Field(..., description="User role")


class TokenRefreshRequest(BaseModel):
    """Request model for token refresh."""

    refresh_token: str = Field(..., description="JWT refresh token")


class TokenRefreshResponse(BaseModel):
    """Response model for token refresh."""

    access_token: str = Field(..., description="New JWT access token")
    token_type: str = Field(..., description="Token type (bearer)")
