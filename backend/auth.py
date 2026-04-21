"""
Supabase JWT validation for FastAPI.

Strategy (in order):
1. If SUPABASE_JWT_SECRET is set and correct → fast local HS256 verify.
2. If local verify fails (wrong secret, wrong alg) AND SUPABASE_URL +
   SUPABASE_SERVICE_KEY are set → fall back to Supabase Admin API
   (GET /auth/v1/user with the Bearer token).  This never needs the
   raw JWT secret and works for all OAuth providers.
3. If nothing is configured → dev-mode, skip signature check.
"""

import logging
import jwt
import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import text
from typing import Optional

from .config import settings
from .database import get_db

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


def _verify_via_supabase_api(token: str) -> dict:
    """Verify token by calling Supabase GET /auth/v1/user (no JWT secret needed)."""
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(401, "Auth not configured — SUPABASE_URL or SUPABASE_SERVICE_KEY missing")
    try:
        resp = httpx.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.supabase_service_key,
            },
            timeout=8.0,
        )
        if resp.status_code == 200:
            user_data = resp.json()
            # Normalise to same shape as a JWT payload (sub, email, etc.)
            return {
                "sub": user_data.get("id"),
                "email": user_data.get("email"),
                "role": "authenticated",
                **user_data,
            }
        elif resp.status_code == 401:
            raise HTTPException(401, "Token expired or invalid")
        else:
            raise HTTPException(401, f"Auth check failed: {resp.status_code}")
    except httpx.TimeoutException:
        raise HTTPException(503, "Auth service timeout")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Supabase auth API error: %s", e)
        raise HTTPException(401, "Auth verification failed")


def decode_supabase_jwt(token: str) -> dict:
    """Decode and validate a Supabase Auth JWT.

    Tries local HS256 verification first; falls back to Supabase Admin API
    if the local secret is missing or incorrect.
    """
    # --- Path 1: local JWT verification (fast) ---
    if settings.supabase_jwt_secret:
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token expired")
        except jwt.InvalidTokenError as e:
            # Secret may be wrong — fall through to Admin API
            logger.debug("Local JWT verify failed (%s), trying Supabase API", e)

    # --- Path 2: Supabase Admin API verification ---
    if settings.supabase_url and settings.supabase_service_key:
        return _verify_via_supabase_api(token)

    # --- Path 3: dev mode — no verification ---
    logger.warning("No auth config — skipping JWT signature check (dev mode)")
    try:
        return jwt.decode(token, options={"verify_signature": False}, algorithms=["HS256", "RS256"])
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """Extract user from JWT. Returns None if no auth header."""
    if not credentials:
        return None
    return decode_supabase_jwt(credentials.credentials)


async def require_user(
    user: Optional[dict] = Depends(get_current_user),
) -> dict:
    """Require authentication. Raises 401 if no valid JWT."""
    if not user:
        raise HTTPException(401, "Authentication required")
    return user


def get_db_with_rls(
    user: Optional[dict] = Depends(get_current_user),
    db: DBSession = Depends(get_db),
) -> DBSession:
    """Get a DB session with RLS user context set.

    Sets `app.user_id` as a PostgreSQL session variable
    so RLS policies can use current_setting('app.user_id').
    """
    if user and user.get("sub") and not settings.database_url.startswith("sqlite"):
        db.execute(text("SET LOCAL app.user_id = :user_id"), {"user_id": user["sub"]})
    return db
