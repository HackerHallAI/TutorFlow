"""
Users API endpoints.

This module contains all user management endpoints including
profile management, user listing, and role management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.core.auth import get_current_user, require_roles
from app.database import get_db
from app.models.user import User, UserRole, Tutor, UserProfile as UserProfileModel
from app.schemas.user import UserProfile, UserProfileUpdate, UserList, UserDetail

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserProfile:
    """
    Get current user's profile.

    Args:
        current_user: Current authenticated user

    Returns:
        UserProfile: User profile information
    """
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    """
    Update current user's profile.

    Args:
        profile_update: Profile update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        UserProfile: Updated user profile

    Raises:
        HTTPException: If validation fails
    """
    # Update user fields
    if profile_update.first_name is not None:
        current_user.first_name = profile_update.first_name
    if profile_update.last_name is not None:
        current_user.last_name = profile_update.last_name

    db.commit()
    db.refresh(current_user)

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.get("/tutor/profile")
async def get_tutor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get current tutor's profile information.

    Args:
        current_user: Current authenticated user (must be tutor)
        db: Database session

    Returns:
        dict: Tutor profile information

    Raises:
        HTTPException: If user is not a tutor
    """
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tutors can access tutor profile",
        )

    # Get tutor profile
    tutor = db.query(Tutor).filter(Tutor.user_id == current_user.id).first()
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tutor profile not found"
        )

    # Get user profile
    profile = (
        db.query(UserProfileModel)
        .filter(UserProfileModel.user_id == current_user.id)
        .first()
    )

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "first_name": profile.first_name if profile else "",
        "last_name": profile.last_name if profile else "",
        "bio": profile.bio if profile else "",
        "phone": profile.phone if profile else "",
        "avatar_url": profile.avatar_url if profile else "",
        "subjects": json.loads(tutor.subjects) if tutor.subjects else [],
        "hourly_rate": tutor.hourly_rate,
        "availability_schedule": (
            json.loads(tutor.availability_schedule)
            if tutor.availability_schedule
            else {}
        ),
        "is_verified": tutor.is_verified,
        "rating": tutor.rating,
        "total_sessions": tutor.total_sessions,
        "created_at": tutor.created_at,
        "updated_at": tutor.updated_at,
    }


@router.post("/tutor/profile")
async def create_tutor_profile(
    tutor_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update tutor profile.

    Args:
        tutor_data: Tutor profile data
        current_user: Current authenticated user (must be tutor)
        db: Database session

    Returns:
        dict: Created/updated tutor profile

    Raises:
        HTTPException: If user is not a tutor or validation fails
    """
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tutors can create tutor profiles",
        )

    # Validate required fields
    required_fields = ["subjects", "hourly_rate"]
    for field in required_fields:
        if field not in tutor_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}",
            )

    # Validate hourly rate
    if tutor_data["hourly_rate"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hourly rate must be greater than 0",
        )

    # Check if tutor profile already exists
    existing_tutor = db.query(Tutor).filter(Tutor.user_id == current_user.id).first()

    if existing_tutor:
        # Update existing profile
        existing_tutor.subjects = json.dumps(tutor_data["subjects"])
        existing_tutor.hourly_rate = tutor_data["hourly_rate"]
        if "availability_schedule" in tutor_data:
            existing_tutor.availability_schedule = json.dumps(
                tutor_data["availability_schedule"]
            )
        db.commit()
        db.refresh(existing_tutor)
        tutor = existing_tutor
    else:
        # Create new profile
        tutor = Tutor(
            user_id=current_user.id,
            subjects=json.dumps(tutor_data["subjects"]),
            hourly_rate=tutor_data["hourly_rate"],
            availability_schedule=json.dumps(
                tutor_data.get("availability_schedule", {})
            ),
        )
        db.add(tutor)
        db.commit()
        db.refresh(tutor)

    # Update user profile if provided
    if (
        "first_name" in tutor_data
        or "last_name" in tutor_data
        or "bio" in tutor_data
        or "phone" in tutor_data
    ):
        profile = (
            db.query(UserProfileModel)
            .filter(UserProfileModel.user_id == current_user.id)
            .first()
        )

        if not profile:
            profile = UserProfileModel(
                user_id=current_user.id,
                first_name=tutor_data.get("first_name", ""),
                last_name=tutor_data.get("last_name", ""),
                bio=tutor_data.get("bio", ""),
                phone=tutor_data.get("phone", ""),
            )
            db.add(profile)
        else:
            if "first_name" in tutor_data:
                profile.first_name = tutor_data["first_name"]
            if "last_name" in tutor_data:
                profile.last_name = tutor_data["last_name"]
            if "bio" in tutor_data:
                profile.bio = tutor_data["bio"]
            if "phone" in tutor_data:
                profile.phone = tutor_data["phone"]

        db.commit()
        db.refresh(profile)

    return {
        "user_id": current_user.id,
        "subjects": json.loads(tutor.subjects),
        "hourly_rate": tutor.hourly_rate,
        "availability_schedule": (
            json.loads(tutor.availability_schedule)
            if tutor.availability_schedule
            else {}
        ),
        "is_verified": tutor.is_verified,
        "rating": tutor.rating,
        "total_sessions": tutor.total_sessions,
        "created_at": tutor.created_at,
        "updated_at": tutor.updated_at,
    }


@router.get("/", response_model=List[UserList])
@require_roles([UserRole.ADMIN])
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[UserList]:
    """
    List all users (admin only).

    Args:
        skip: Number of users to skip for pagination
        limit: Maximum number of users to return
        role: Filter by user role
        search: Search term for name or email
        current_user: Current authenticated user (must be admin)
        db: Database session

    Returns:
        List[UserList]: List of users

    Raises:
        HTTPException: If user is not admin
    """
    query = db.query(User)

    # Apply filters
    if role:
        query = query.filter(User.role == role)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.first_name.ilike(search_term))
            | (User.last_name.ilike(search_term))
            | (User.email.ilike(search_term))
        )

    users = query.offset(skip).limit(limit).all()

    return [
        UserList(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )
        for user in users
    ]


@router.get("/tutors")
async def list_tutors(
    skip: int = Query(0, ge=0, description="Number of tutors to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tutors to return"),
    subject: str = Query(None, description="Filter by subject"),
    min_rate: float = Query(None, ge=0, description="Minimum hourly rate"),
    max_rate: float = Query(None, ge=0, description="Maximum hourly rate"),
    verified_only: bool = Query(True, description="Show only verified tutors"),
    db: Session = Depends(get_db),
):
    from sqlalchemy import func

    query = (
        db.query(Tutor, User, UserProfileModel)
        .join(User, Tutor.user_id == User.id)
        .join(UserProfileModel, User.id == UserProfileModel.user_id)
        .filter(User.is_active == True)
    )

    # Filter by verification status if requested
    if verified_only:
        query = query.filter(Tutor.is_verified == True)

    if subject:
        query = query.filter(func.lower(Tutor.subjects).like(f"%{subject.lower()}%"))
    if min_rate is not None:
        query = query.filter(Tutor.hourly_rate >= min_rate)
    if max_rate is not None:
        query = query.filter(Tutor.hourly_rate <= max_rate)

    results = query.offset(skip).limit(limit).all()
    tutors = []
    for tutor, user, profile in results:
        tutors.append(
            {
                "id": tutor.user_id,
                "email": user.email,
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "bio": profile.bio,
                "avatar_url": profile.avatar_url,
                "subjects": tutor.subjects,
                "hourly_rate": tutor.hourly_rate,
                "rating": tutor.rating,
                "total_sessions": tutor.total_sessions,
                "is_verified": tutor.is_verified,
                "created_at": tutor.created_at,
            }
        )
    return tutors


@router.get("/tutors/{tutor_id}", response_model=dict)
async def get_tutor_detail(
    tutor_id: str,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get detailed tutor information.

    Args:
        tutor_id: ID of the tutor to retrieve
        db: Database session

    Returns:
        dict: Detailed tutor information

    Raises:
        HTTPException: If tutor not found
    """
    result = (
        db.query(Tutor, User, UserProfileModel)
        .join(User, Tutor.user_id == User.id)
        .join(UserProfileModel, User.id == UserProfileModel.user_id)
        .filter(Tutor.user_id == tutor_id, User.is_active == True)
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found"
        )

    tutor, user, profile = result

    return {
        "id": tutor.user_id,
        "email": user.email,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "bio": profile.bio,
        "avatar_url": profile.avatar_url,
        "phone": profile.phone,
        "subjects": tutor.subjects,
        "hourly_rate": tutor.hourly_rate,
        "availability_schedule": tutor.availability_schedule,
        "rating": tutor.rating,
        "total_sessions": tutor.total_sessions,
        "is_verified": tutor.is_verified,
        "created_at": tutor.created_at,
        "updated_at": tutor.updated_at,
    }


@router.get("/{user_id}", response_model=UserDetail)
@require_roles([UserRole.ADMIN])
async def get_user_detail(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserDetail:
    """
    Get detailed user information (admin only).

    Args:
        user_id: ID of the user to retrieve
        current_user: Current authenticated user (must be admin)
        db: Database session

    Returns:
        UserDetail: Detailed user information

    Raises:
        HTTPException: If user not found or current user is not admin
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return UserDetail(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.put("/{user_id}/role")
@require_roles([UserRole.ADMIN])
async def update_user_role(
    user_id: str,
    role: UserRole,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Update user role (admin only).

    Args:
        user_id: ID of the user to update
        role: New role for the user
        current_user: Current authenticated user (must be admin)
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If user not found or current user is not admin
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Prevent admin from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )

    user.role = role
    db.commit()

    return {"message": f"User role updated to {role.value}"}


@router.put("/{user_id}/status")
@require_roles([UserRole.ADMIN])
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Update user active status (admin only).

    Args:
        user_id: ID of the user to update
        is_active: New active status
        current_user: Current authenticated user (must be admin)
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If user not found or current user is not admin
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Prevent admin from deactivating themselves
    if user.id == current_user.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    user.is_active = is_active
    db.commit()

    return {
        "message": f"User status updated to {'active' if is_active else 'inactive'}"
    }


@router.put("/tutors/{tutor_id}/verify")
@require_roles([UserRole.ADMIN])
async def verify_tutor(
    tutor_id: str,
    is_verified: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Verify or unverify a tutor (admin only).

    Args:
        tutor_id: ID of the tutor to verify
        is_verified: Verification status
        current_user: Current authenticated user (must be admin)
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If tutor not found or current user is not admin
    """
    tutor = db.query(Tutor).filter(Tutor.user_id == tutor_id).first()
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found"
        )

    tutor.is_verified = is_verified
    db.commit()

    return {
        "message": f"Tutor verification status updated to {'verified' if is_verified else 'unverified'}"
    }
