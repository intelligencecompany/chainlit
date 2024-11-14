import os
from datetime import datetime, timedelta
from typing import Any, Dict

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from chainlit.config import config
from chainlit.data import get_data_layer
from chainlit.logger import logger
from chainlit.oauth_providers import get_configured_oauth_providers
from chainlit.user import User

from .jwt import create_jwt, decode_jwt, get_jwt_secret

reuseable_oauth = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)


def ensure_jwt_secret():
    if require_login() and get_jwt_secret() is None:
        raise ValueError(
            "You must provide a JWT secret in the environment to use authentication. Run `chainlit create-secret` to generate one."
        )


def is_oauth_enabled():
    return config.code.oauth_callback and len(get_configured_oauth_providers()) > 0


def require_login():
    return (
        bool(os.environ.get("CHAINLIT_CUSTOM_AUTH"))
        or config.code.password_auth_callback is not None
        or config.code.header_auth_callback is not None
        or is_oauth_enabled()
    )


def get_configuration():
    return {
        "requireLogin": require_login(),
        "passwordAuth": config.code.password_auth_callback is not None,
        "headerAuth": config.code.header_auth_callback is not None,
        "oauthProviders": (
            get_configured_oauth_providers() if is_oauth_enabled() else []
        ),
    }


async def authenticate_user(token: str = Depends(reuseable_oauth)):
    try:
        user = decode_jwt(token)

    except Exception as e:
        raise HTTPException(
            status_code=401, detail="Invalid authentication token"
        ) from e
    if data_layer := get_data_layer():
        try:
            persisted_user = await data_layer.get_user(user.identifier)
            if persisted_user is None:
                persisted_user = await data_layer.create_user(user)
                assert persisted_user
        except Exception as e:
            logger.exception(e)
            return user

        if user and user.display_name:
            persisted_user.display_name = user.display_name
        return persisted_user
    else:
        return user


async def get_current_user(token: str = Depends(reuseable_oauth)):
    if not require_login():
        return None

    return await authenticate_user(token)