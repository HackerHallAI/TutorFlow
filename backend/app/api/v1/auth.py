"""
Authentication API endpoints.

This module contains all authentication-related endpoints including
registration, login, logout, and token refresh.
"""

from fastapi import APIRouter, Depends, HTTPException, status
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
from app.models.user import User, UserProfile
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenRefreshRequest,
    TokenRefreshResponse,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest, db: Session = Depends(get_db)
) -> RegisterResponse:
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

    return RegisterResponse(
        id=str(user.id),
        email=user.email,
        first_name=user_profile.first_name,
        last_name=user_profile.last_name,
        role=user.role,
        message="User registered successfully",
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

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

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


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    """
    Get current user information.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        dict: Current user information
    """
    user_profile = (
        db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    )
    first_name = user_profile.first_name if user_profile else ""
    last_name = user_profile.last_name if user_profile else ""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": first_name,
        "last_name": last_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }
