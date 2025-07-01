"""
User schemas for TutorFlow backend.

This module contains Pydantic models for user-related
requests and responses.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

from app.models.user import UserRole


class UserProfile(BaseModel):
    """User profile response model."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    role: UserRole = Field(..., description="User role")
    is_active: bool = Field(..., description="User active status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class UserProfileUpdate(BaseModel):
    """User profile update request model."""

    first_name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="User first name"
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="User last name"
    )


class UserList(BaseModel):
    """User list item model."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    role: UserRole = Field(..., description="User role")
    is_active: bool = Field(..., description="User active status")
    created_at: datetime = Field(..., description="Account creation timestamp")


class UserDetail(BaseModel):
    """Detailed user information model."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    role: UserRole = Field(..., description="User role")
    is_active: bool = Field(..., description="User active status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
