"""
Validation utilities for TutorFlow backend.

This module contains validation functions used throughout
the application.
"""

import re
from datetime import datetime, timedelta
from typing import Optional


def validate_email(email: str) -> bool:
    """
    Validate email format.

    Args:
        email: Email address to validate

    Returns:
        bool: True if valid, False otherwise
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.

    Args:
        password: Password to validate

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"

    return True, "Password is valid"


def validate_booking_time(
    start_time: datetime,
    end_time: datetime,
    min_duration: timedelta = timedelta(minutes=30),
    max_duration: timedelta = timedelta(hours=4),
) -> tuple[bool, str]:
    """
    Validate booking time constraints.

    Args:
        start_time: Booking start time
        end_time: Booking end time
        min_duration: Minimum booking duration
        max_duration: Maximum booking duration

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    now = datetime.utcnow()

    # Check if booking is in the past
    if start_time < now:
        return False, "Cannot book sessions in the past"

    # Check if start time is before end time
    if start_time >= end_time:
        return False, "Start time must be before end time"

    # Check duration constraints
    duration = end_time - start_time
    if duration < min_duration:
        return False, f"Booking must be at least {min_duration} long"

    if duration > max_duration:
        return False, f"Booking cannot exceed {max_duration}"

    return True, "Booking time is valid"


def validate_hourly_rate(rate: float) -> tuple[bool, str]:
    """
    Validate tutor hourly rate.

    Args:
        rate: Hourly rate to validate

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if rate <= 0:
        return False, "Hourly rate must be positive"

    if rate > 1000:
        return False, "Hourly rate cannot exceed $1000"

    return True, "Hourly rate is valid"


def sanitize_string(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize user input string.

    Args:
        text: Text to sanitize
        max_length: Maximum allowed length

    Returns:
        str: Sanitized text
    """
    # Remove leading/trailing whitespace
    sanitized = text.strip()

    # Remove multiple spaces
    sanitized = re.sub(r"\s+", " ", sanitized)

    # Truncate if max_length is specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized
