"""Custom exception hierarchy for the howest-resto client."""

from __future__ import annotations

__all__ = [
    "APIError",
    "CampusNotFoundError",
    "HowestRestoError",
]


class HowestRestoError(Exception):
    """Base exception for all howest-resto library errors."""


class CampusNotFoundError(HowestRestoError):
    """Raised when an unknown campus code is requested."""


class APIError(HowestRestoError):
    """Raised when fetching or parsing the Howest restaurant menu fails."""
