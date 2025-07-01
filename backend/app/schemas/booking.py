"""
Booking schemas for TutorFlow backend.

This module contains Pydantic models for booking-related
requests and responses.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.models.user import BookingStatus


class BookingCreate(BaseModel):
    """Booking creation request model."""

    tutor_id: int = Field(..., description="Tutor ID")
    subject: str = Field(
        ..., min_length=1, max_length=100, description="Subject being tutored"
    )
    start_time: datetime = Field(..., description="Booking start time")
    end_time: datetime = Field(..., description="Booking end time")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class BookingResponse(BaseModel):
    """Booking response model."""

    id: int = Field(..., description="Booking ID")
    student_id: int = Field(..., description="Student ID")
    tutor_id: int = Field(..., description="Tutor ID")
    subject: str = Field(..., description="Subject being tutored")
    start_time: datetime = Field(..., description="Booking start time")
    end_time: datetime = Field(..., description="Booking end time")
    notes: Optional[str] = Field(None, description="Additional notes")
    status: BookingStatus = Field(..., description="Booking status")
    created_at: datetime = Field(..., description="Booking creation timestamp")


class BookingUpdate(BaseModel):
    """Booking update request model."""

    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    status: Optional[BookingStatus] = Field(None, description="Booking status")


class BookingList(BaseModel):
    """Booking list item model."""

    id: int = Field(..., description="Booking ID")
    student_id: int = Field(..., description="Student ID")
    tutor_id: int = Field(..., description="Tutor ID")
    subject: str = Field(..., description="Subject being tutored")
    start_time: datetime = Field(..., description="Booking start time")
    end_time: datetime = Field(..., description="Booking end time")
    status: BookingStatus = Field(..., description="Booking status")
    created_at: datetime = Field(..., description="Booking creation timestamp")


class AvailabilityRequest(BaseModel):
    """Availability check request model."""

    start_time: datetime = Field(..., description="Start time to check")
    end_time: datetime = Field(..., description="End time to check")


class AvailabilityResponse(BaseModel):
    """Availability check response model."""

    tutor_id: int = Field(..., description="Tutor ID")
    start_time: datetime = Field(..., description="Requested start time")
    end_time: datetime = Field(..., description="Requested end time")
    is_available: bool = Field(..., description="Whether the time slot is available")
    conflicting_bookings: List[Dict[str, Any]] = Field(
        default_factory=list, description="List of conflicting bookings if any"
    )
