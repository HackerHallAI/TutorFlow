"""
User models for the TutorFlow application.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Enum as SAEnum,
    Text,
    Float,
    Integer,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlmodel import SQLModel, Field
import uuid
from enum import Enum as PyEnum

from app.database import Base


class UserRole(PyEnum):
    """User roles enumeration."""

    STUDENT = "student"
    PARENT = "parent"
    TUTOR = "tutor"
    ADMIN = "admin"


class User(Base):
    """User model for authentication and basic user information."""

    __tablename__ = "users"

    id: str = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: str = Column(String(255), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(255), nullable=False)
    role: UserRole = Column(SAEnum(UserRole, name="user_role"), nullable=False)
    is_active: bool = Column(Boolean, default=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    tutor_profile = relationship("Tutor", back_populates="user", uselist=False)
    student_bookings = relationship(
        "Booking",
        foreign_keys=lambda: [Booking.student_id],
        back_populates="student",
    )
    tutor_bookings = relationship(
        "Booking",
        foreign_keys=lambda: [Booking.tutor_id],
        back_populates="tutor",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class UserProfile(Base):
    """Extended user profile information."""

    __tablename__ = "user_profiles"

    user_id: str = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    first_name: str = Column(String(100), nullable=False)
    last_name: str = Column(String(100), nullable=False)
    phone: Optional[str] = Column(String(20))
    address: Optional[str] = Column(Text)
    bio: Optional[str] = Column(Text)
    avatar_url: Optional[str] = Column(String(500))
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile(user_id={self.user_id}, name={self.first_name} {self.last_name})>"


class Tutor(Base):
    """Tutor-specific information and settings."""

    __tablename__ = "tutors"

    user_id: str = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    subjects: str = Column(Text, nullable=False)  # JSON string of subjects
    hourly_rate: float = Column(Float, nullable=False)
    availability_schedule: Optional[str] = Column(Text)  # JSON string of schedule
    stripe_account_id: Optional[str] = Column(String(255))
    is_verified: bool = Column(Boolean, default=False)
    rating: Optional[float] = Column(Float)
    total_sessions: int = Column(Integer, default=0)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="tutor_profile")

    def __repr__(self) -> str:
        return f"<Tutor(user_id={self.user_id}, hourly_rate={self.hourly_rate})>"


class StudentParent(Base):
    """Student-parent relationship mapping."""

    __tablename__ = "student_parents"

    student_id: str = Column(UUID(as_uuid=True), primary_key=True)
    parent_id: str = Column(UUID(as_uuid=True), primary_key=True)

    def __repr__(self) -> str:
        return (
            f"<StudentParent(student_id={self.student_id}, parent_id={self.parent_id})>"
        )


# Pydantic models for API schemas
class UserBase(SQLModel):
    """Base user schema."""

    email: str = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., min_length=8, description="User password")


class UserUpdate(SQLModel):
    """Schema for updating user information."""

    email: Optional[str] = Field(None, description="User email address")
    is_active: Optional[bool] = Field(None, description="User active status")


class UserResponse(UserBase):
    """Schema for user response."""

    id: str = Field(..., description="User ID")
    is_active: bool = Field(..., description="User active status")
    created_at: datetime = Field(..., description="User creation date")

    class Config:
        from_attributes = True


class UserProfileBase(SQLModel):
    """Base user profile schema."""

    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    phone: Optional[str] = Field(None, description="User phone number")
    address: Optional[str] = Field(None, description="User address")
    bio: Optional[str] = Field(None, description="User bio")
    avatar_url: Optional[str] = Field(None, description="User avatar URL")


class UserProfileCreate(UserProfileBase):
    """Schema for creating a user profile."""

    pass


class UserProfileUpdate(SQLModel):
    """Schema for updating user profile."""

    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")
    phone: Optional[str] = Field(None, description="User phone number")
    address: Optional[str] = Field(None, description="User address")
    bio: Optional[str] = Field(None, description="User bio")
    avatar_url: Optional[str] = Field(None, description="User avatar URL")


class UserProfileResponse(UserProfileBase):
    """Schema for user profile response."""

    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Profile creation date")
    updated_at: datetime = Field(..., description="Profile last update date")

    class Config:
        from_attributes = True


# BookingStatus enum and Booking model moved from booking.py
from enum import Enum as PyEnumBase
from sqlalchemy import Enum as SQLEnum


class BookingStatus(str, PyEnumBase):
    """Booking status enumeration."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class Booking(Base):
    """Booking model."""

    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tutor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(
        SQLEnum(BookingStatus), default=BookingStatus.PENDING, nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    student = relationship(
        "User", foreign_keys=[student_id], back_populates="student_bookings"
    )
    tutor = relationship(
        "User", foreign_keys=[tutor_id], back_populates="tutor_bookings"
    )
