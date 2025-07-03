"""
Authentication API endpoints.

This module contains all authentication-related endpoints including
registration, login, logout, and token refresh.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.core.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.database import get_db
from app.models.user import User, UserProfile, UserRole
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenRefreshRequest,
    TokenRefreshResponse,
    CurrentUserResponse,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


@router.post("/register", response_model=LoginResponse)
async def register(
    request: RegisterRequest, db: Session = Depends(get_db)
) -> LoginResponse:
    """
    Register a new user.

    Args:
        request: Registration request data
        db: Database session

    Returns:
        RegisterResponse: Registration response with user info

    Raises:
        HTTPException: If email already exists or validation fails
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        password_hash=hashed_password,
        role=request.role,
    )

    db.add(user)
    db.flush()  # Get the user ID without committing

    # Create user profile
    user_profile = UserProfile(
        user_id=user.id,
        first_name=request.first_name,
        last_name=request.last_name,
    )

    db.add(user_profile)
    db.commit()
    db.refresh(user)
    db.refresh(user_profile)

    # Create tokens for the new user
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "role": user.role.value}
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=str(user.id),
        email=user.email,
        first_name=user_profile.first_name,
        last_name=user_profile.last_name,
        role=user.role,
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """
    Authenticate user and return access tokens.

    Args:
        request: Login request data
        db: Database session

    Returns:
        LoginResponse: Login response with tokens and user info

    Raises:
        HTTPException: If credentials are invalid
    """
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "role": user.role.value}
    )

    # Get user profile for first_name and last_name
    user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    first_name = user_profile.first_name if user_profile else ""
    last_name = user_profile.last_name if user_profile else ""

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=str(user.id),
        email=user.email,
        first_name=first_name,
        last_name=last_name,
        role=user.role,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    request: TokenRefreshRequest, db: Session = Depends(get_db)
) -> TokenRefreshResponse:
    """
    Refresh access token using refresh token.

    Args:
        request: Token refresh request data
        db: Database session

    Returns:
        TokenRefreshResponse: New access token

    Raises:
        HTTPException: If refresh token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            request.refresh_token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    access_token = create_access_token(data={"sub": email})
    return TokenRefreshResponse(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Logout user (invalidate tokens).

    Args:
        credentials: HTTP Bearer token credentials

    Returns:
        dict: Logout confirmation message
    """
    # In a real implementation, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> CurrentUserResponse:
    """
    Get current user information.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        CurrentUserResponse: Current user information
    """
    user_profile = (
        db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    )
    first_name = user_profile.first_name if user_profile else ""
    last_name = user_profile.last_name if user_profile else ""
    return CurrentUserResponse(
        id=str(current_user.id),
        email=current_user.email,
        first_name=first_name,
        last_name=last_name,
        role=current_user.role,
        is_active=current_user.is_active,
    )


@router.post("/create-admin")
async def create_admin(
    admin_data: dict,
    secret_key: str = Query(..., description="Secret key required to create admin"),
    db: Session = Depends(get_db),
) -> dict:
    """
    Create an admin user (protected by secret key).

    Args:
        admin_data: Admin user data
        secret_key: Secret key for admin creation
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If secret key is invalid or user already exists
    """
    import os
    import uuid
    from datetime import datetime

    # Check secret key (you should set this as an environment variable)
    expected_secret = os.getenv("ADMIN_CREATION_SECRET", "tutorflow-admin-2024")
    if secret_key != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid secret key"
        )

    # Validate required fields
    required_fields = ["email", "password", "first_name", "last_name"]
    for field in required_fields:
        if field not in admin_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}",
            )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == admin_data["email"]).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Create admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        email=admin_data["email"],
        password_hash=get_password_hash(admin_data["password"]),
        role=UserRole.ADMIN,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(admin_user)
    db.flush()  # Get the user ID

    # Create user profile
    admin_profile = UserProfile(
        user_id=admin_user.id,
        first_name=admin_data["first_name"],
        last_name=admin_data["last_name"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(admin_profile)

    db.commit()

    return {
        "message": "Admin user created successfully",
        "user_id": admin_user.id,
        "email": admin_user.email,
    }
