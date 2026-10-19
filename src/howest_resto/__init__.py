"""Official Python client for Howest University student restaurant menus."""

from __future__ import annotations

__version__ = "1.0.0"

from .client import CAMPUSES, AsyncHowestRestoClient, HowestRestoClient
from .exceptions import APIError, CampusNotFoundError, HowestRestoError
from .models import Campus, DailyMenu, WeeklyMenuResponse

__all__ = [
    "CAMPUSES",
    "APIError",
    "AsyncHowestRestoClient",
    "Campus",
    "CampusNotFoundError",
    "DailyMenu",
    "HowestRestoClient",
    "HowestRestoError",
    "WeeklyMenuResponse",
]
