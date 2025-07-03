"""
Bookings API endpoints.

This module contains all booking-related endpoints including
booking creation, management, and availability checking.
"""

from typing import List, Optional
from datetime import datetime, date, time, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import json

from app.core.auth import get_current_user, require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.models.user import Booking, BookingStatus
from app.models.user import Tutor
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingUpdate,
    BookingList,
    AvailabilityRequest,
    AvailabilityResponse,
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingResponse)
@router.post("", response_model=BookingResponse)
@require_roles([UserRole.STUDENT])
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingResponse:
    """
    Create a new booking.

    Args:
        booking_data: Booking creation data
        current_user: Current authenticated user
        db: Database session

    Returns:
        BookingResponse: Created booking information

    Raises:
        HTTPException: If validation fails or conflicts exist
    """
    # Verify tutor exists and is active
    tutor = db.query(Tutor).filter(Tutor.user_id == booking_data.tutor_id).first()

    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found or inactive"
        )

    # Check for booking conflicts
    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.tutor_id == booking_data.tutor_id,
            Booking.start_time < booking_data.end_time,
            Booking.end_time > booking_data.start_time,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booking time conflicts with existing booking",
        )

    # Create booking
    booking = Booking(
        student_id=current_user.id,
        tutor_id=booking_data.tutor_id,
        subject=booking_data.subject,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        notes=booking_data.notes,
        status=BookingStatus.PENDING,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return BookingResponse(
        id=booking.id,
        student_id=str(booking.student_id),
        tutor_id=str(booking.tutor_id),
        subject=booking.subject,
        start_time=booking.start_time,
        end_time=booking.end_time,
        notes=booking.notes,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.get("/", response_model=List[BookingList])
@router.get("", response_model=List[BookingList])
async def list_bookings(
    status: Optional[BookingStatus] = Query(
        None, description="Filter by booking status"
    ),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[BookingList]:
    """
    List user's bookings.

    Args:
        status: Filter by booking status
        start_date: Filter by start date
        end_date: Filter by end date
        current_user: Current authenticated user
        db: Database session

    Returns:
        List[BookingList]: List of user's bookings
    """
    query = db.query(Booking)

    # Filter by user role
    if current_user.role == UserRole.TUTOR:
        query = query.filter(Booking.tutor_id == current_user.id)
    elif current_user.role == UserRole.STUDENT:
        query = query.filter(Booking.student_id == current_user.id)
    elif current_user.role == UserRole.ADMIN:
        # Admins can see all bookings
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
        )

    # Apply filters
    if status:
        query = query.filter(Booking.status == status)

    if start_date:
        query = query.filter(Booking.start_time >= start_date)

    if end_date:
        query = query.filter(Booking.end_time <= end_date)

    bookings = query.order_by(Booking.start_time.desc()).all()

    return [
        BookingList(
            id=booking.id,
            student_id=booking.student_id,
            tutor_id=booking.tutor_id,
            subject=booking.subject,
            start_time=booking.start_time,
            end_time=booking.end_time,
            status=booking.status,
            created_at=booking.created_at,
        )
        for booking in bookings
    ]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingResponse:
    """
    Get booking details.

    Args:
        booking_id: ID of the booking to retrieve
        current_user: Current authenticated user
        db: Database session

    Returns:
        BookingResponse: Booking details

    Raises:
        HTTPException: If booking not found or access denied
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    # Check access permissions
    if (
        current_user.role != UserRole.ADMIN
        and booking.student_id != current_user.id
        and booking.tutor_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    return BookingResponse(
        id=booking.id,
        student_id=str(booking.student_id),
        tutor_id=str(booking.tutor_id),
        subject=booking.subject,
        start_time=booking.start_time,
        end_time=booking.end_time,
        notes=booking.notes,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingResponse:
    """
    Update booking details.

    Args:
        booking_id: ID of the booking to update
        booking_update: Booking update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        BookingResponse: Updated booking details

    Raises:
        HTTPException: If booking not found or access denied
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    # Check access permissions
    if (
        current_user.role != UserRole.ADMIN
        and booking.student_id != current_user.id
        and booking.tutor_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    # Update booking fields
    if booking_update.notes is not None:
        booking.notes = booking_update.notes

    if booking_update.status is not None:
        # Only tutors and admins can change status
        if current_user.role not in [UserRole.TUTOR, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only tutors and admins can change booking status",
            )
        booking.status = booking_update.status

    db.commit()
    db.refresh(booking)

    return BookingResponse(
        id=booking.id,
        student_id=str(booking.student_id),
        tutor_id=str(booking.tutor_id),
        subject=booking.subject,
        start_time=booking.start_time,
        end_time=booking.end_time,
        notes=booking.notes,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Cancel a booking.

    Args:
        booking_id: ID of the booking to cancel
        current_user: Current authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If booking not found or access denied
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    # Check access permissions
    if (
        current_user.role != UserRole.ADMIN
        and booking.student_id != current_user.id
        and booking.tutor_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    # Only allow cancellation of pending or confirmed bookings
    if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel booking with current status",
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()

    return {"message": "Booking cancelled successfully"}


@router.post("/availability/{tutor_id}", response_model=AvailabilityResponse)
async def check_availability(
    tutor_id: int,
    availability_request: AvailabilityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AvailabilityResponse:
    """
    Check tutor availability for a specific time period.

    Args:
        tutor_id: ID of the tutor to check
        availability_request: Time period to check
        current_user: Current authenticated user
        db: Database session

    Returns:
        AvailabilityResponse: Availability information

    Raises:
        HTTPException: If tutor not found
    """
    # Verify tutor exists
    tutor = db.query(Tutor).filter(Tutor.user_id == tutor_id).first()

    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found"
        )

    # Check for conflicting bookings
    conflicting_bookings = (
        db.query(Booking)
        .filter(
            Booking.tutor_id == tutor_id,
            Booking.start_time < availability_request.end_time,
            Booking.end_time > availability_request.start_time,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        )
        .all()
    )

    is_available = len(conflicting_bookings) == 0

    return AvailabilityResponse(
        tutor_id=tutor_id,
        start_time=availability_request.start_time,
        end_time=availability_request.end_time,
        is_available=is_available,
        conflicting_bookings=[
            {
                "id": booking.id,
                "start_time": booking.start_time,
                "end_time": booking.end_time,
                "status": booking.status,
            }
            for booking in conflicting_bookings
        ],
    )


@router.get("/slots/{tutor_id}")
async def get_available_slots(
    tutor_id: str,
    date_str: str = Query(..., description="Date in YYYY-MM-DD format"),
    duration: int = Query(30, description="Session duration in minutes (30 or 60)"),
    db: Session = Depends(get_db),
):
    """
    Get available 15-min start slots for a tutor on a given day.
    Considers tutor's weekly schedule, existing bookings, and 15-min buffer after each session.

    Args:
        tutor_id: Tutor's user ID
        date_str: Date in YYYY-MM-DD format
        duration: Session duration in minutes (30 or 60)
        db: Database session

    Returns:
        dict: { slots: ["09:00", "09:15", ...] }
    """
    # Validate duration
    if duration not in [30, 60]:
        raise HTTPException(status_code=400, detail="Duration must be 30 or 60 minutes")

    # Parse date
    try:
        day_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Get tutor and schedule
    tutor = db.query(Tutor).filter(Tutor.user_id == tutor_id).first()
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    if not tutor.availability_schedule:
        return {"slots": []}
    try:
        schedule = json.loads(tutor.availability_schedule)
    except Exception:
        return {"slots": []}

    # Get weekday name (e.g., 'monday')
    weekday = day_date.strftime("%A").lower()
    day_blocks = schedule.get(weekday, [])
    if not day_blocks:
        return {"slots": []}

    # Get all bookings for that day
    day_start = datetime.combine(day_date, time(0, 0))
    day_end = datetime.combine(day_date, time(23, 59, 59))
    bookings = (
        db.query(Booking)
        .filter(
            Booking.tutor_id == tutor_id,
            Booking.start_time < day_end,
            Booking.end_time > day_start,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        )
        .all()
    )
    # Build list of (start, end) for each booking, including 15-min buffer after
    booking_blocks = []
    for b in bookings:
        booking_blocks.append((b.start_time, b.end_time + timedelta(minutes=15)))

    # Generate all possible 15-min start slots within available blocks
    slots = []
    for block in day_blocks:
        block_start = datetime.combine(
            day_date, datetime.strptime(block[0], "%H:%M").time()
        )
        block_end = datetime.combine(
            day_date, datetime.strptime(block[1], "%H:%M").time()
        )
        slot = block_start
        while slot + timedelta(minutes=duration) <= block_end:
            slot_end = slot + timedelta(minutes=duration)
            # Check for conflicts with bookings (including buffer)
            conflict = False
            for b_start, b_end in booking_blocks:
                # Block if slot overlaps with any booking+buffer
                if slot < b_end and slot_end > b_start:
                    conflict = True
                    break
            if not conflict:
                slots.append(slot.strftime("%H:%M"))
            slot += timedelta(minutes=15)
    return {"slots": slots}
