"""Howest Resto Python SDK"""

from .client import HowestRestoClient, CAMPUSES
from .models import Campus, DailyMenu, WeeklyMenuResponse

__all__ = ["HowestRestoClient", "CAMPUSES", "Campus", "DailyMenu", "WeeklyMenuResponse"]
