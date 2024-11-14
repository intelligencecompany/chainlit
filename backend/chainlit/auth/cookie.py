import os
from typing import Literal, Optional, cast

from fastapi import Request, Response
from fastapi.exceptions import HTTPException
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from starlette.status import HTTP_401_UNAUTHORIZED


class OAuth2PasswordBearerWithCookie(SecurityBase):
    """
    OAuth2 password flow with cookie support with fallback to bearer token.
    """

    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Optional[str] = None,
        auto_error: bool = True,
    ):
        self.tokenUrl = tokenUrl
        self.scheme_name = scheme_name or self.__class__.__name__
        self.auto_error = auto_error

    async def __call__(self, request: Request) -> Optional[str]:
        # First try to get the token from the cookie
        token = request.cookies.get("access_token")

        # If no cookie, try the Authorization header as fallback
        if not token:
            authorization = request.headers.get("Authorization")
            if authorization:
                scheme, token = get_authorization_scheme_param(authorization)
                if scheme.lower() != "bearer":
                    if self.auto_error:
                        raise HTTPException(
                            status_code=HTTP_401_UNAUTHORIZED,
                            detail="Invalid authentication credentials",
                            headers={"WWW-Authenticate": "Bearer"},
                        )
                    else:
                        return None
            else:
                if self.auto_error:
                    raise HTTPException(
                        status_code=HTTP_401_UNAUTHORIZED,
                        detail="Not authenticated",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    return None

        return token


def set_auth_cookie(response: Response, token: str):
    """
    Helper function to set the authentication cookie with secure parameters
    """
    samesite = cast(
        Literal["lax", "strict", "none"],
        os.environ.get("CHAINLIT_COOKIE_SAMESITE", "lax"),
    )

    assert samesite in ["lax", "strict", "none"]

    secure = samesite.lower() == "none"

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=3600,  # 1 hour
        path="/",
    )


def clear_auth_cookie(response: Response):
    """
    Helper function to clear the authentication cookie
    """
    response.delete_cookie(key="access_token", path="/")
