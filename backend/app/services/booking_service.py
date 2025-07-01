"""
Booking service for TutorFlow backend.

This module contains business logic for booking operations
including conflict detection and validation.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.user import Booking, BookingStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate, AvailabilityRequest


class BookingService:
    """Service class for booking operations."""

    def __init__(self, db: Session):
        """Initialize booking service with database session."""
        self.db = db

    def check_availability(
        self, tutor_id: int, start_time: datetime, end_time: datetime
    ) -> bool:
        """
        Check if a tutor is available for a given time period.

        Args:
            tutor_id: ID of the tutor to check
            start_time: Start time of the requested period
            end_time: End time of the requested period

        Returns:
            bool: True if available, False otherwise
        """
        conflicting_bookings = (
            self.db.query(Booking)
            .filter(
                Booking.tutor_id == tutor_id,
                Booking.start_time < end_time,
                Booking.end_time > start_time,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
            )
            .count()
        )

        return conflicting_bookings == 0

    def get_tutor_bookings(
        self,
        tutor_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Booking]:
        """
        Get all bookings for a tutor within an optional date range.

        Args:
            tutor_id: ID of the tutor
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            List[Booking]: List of tutor's bookings
        """
        query = self.db.query(Booking).filter(Booking.tutor_id == tutor_id)

        if start_date:
            query = query.filter(Booking.start_time >= start_date)

        if end_date:
            query = query.filter(Booking.end_time <= end_date)

        return query.order_by(Booking.start_time).all()

    def get_student_bookings(
        self,
        student_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Booking]:
        """
        Get all bookings for a student within an optional date range.

        Args:
            student_id: ID of the student
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            List[Booking]: List of student's bookings
        """
        query = self.db.query(Booking).filter(Booking.student_id == student_id)

        if start_date:
            query = query.filter(Booking.start_time >= start_date)

        if end_date:
            query = query.filter(Booking.end_time <= end_date)

        return query.order_by(Booking.start_time).all()

    def create_booking(self, booking_data: BookingCreate, student_id: int) -> Booking:
        """
        Create a new booking with validation.

        Args:
            booking_data: Booking creation data
            student_id: ID of the student making the booking

        Returns:
            Booking: Created booking

        Raises:
            ValueError: If validation fails
        """
        # Validate booking time
        if booking_data.start_time >= booking_data.end_time:
            raise ValueError("Start time must be before end time")

        if booking_data.start_time < datetime.utcnow():
            raise ValueError("Cannot book sessions in the past")

        # Check availability
        if not self.check_availability(
            booking_data.tutor_id, booking_data.start_time, booking_data.end_time
        ):
            raise ValueError("Tutor is not available for the requested time")

        # Create booking
        booking = Booking(
            student_id=student_id,
            tutor_id=booking_data.tutor_id,
            subject=booking_data.subject,
            start_time=booking_data.start_time,
            end_time=booking_data.end_time,
            notes=booking_data.notes,
            status=BookingStatus.PENDING,
        )

        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)

        return booking

    def cancel_booking(
        self, booking_id: int, user_id: int, user_role: UserRole
    ) -> Booking:
        """
        Cancel a booking with proper authorization.

        Args:
            booking_id: ID of the booking to cancel
            user_id: ID of the user requesting cancellation
            user_role: Role of the user requesting cancellation

        Returns:
            Booking: Updated booking

        Raises:
            ValueError: If cancellation is not allowed
        """
        booking = self.db.query(Booking).filter(Booking.id == booking_id).first()

        if not booking:
            raise ValueError("Booking not found")

        # Check authorization
        if (
            user_role != UserRole.ADMIN
            and booking.student_id != user_id
            and booking.tutor_id != user_id
        ):
            raise ValueError("Not authorized to cancel this booking")

        # Check if cancellation is allowed
        if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
            raise ValueError("Cannot cancel booking with current status")

        # Check cancellation window (e.g., 24 hours before session)
        if booking.start_time - datetime.utcnow() < timedelta(hours=24):
            raise ValueError("Cannot cancel booking within 24 hours of session")

        booking.status = BookingStatus.CANCELLED
        self.db.commit()
        self.db.refresh(booking)

        return booking
