"""Data models for Howest campuses, menus, and dishes."""

from __future__ import annotations

from dataclasses import dataclass, field

__all__ = [
    "Campus",
    "DailyMenu",
    "WeeklyMenuResponse",
]


@dataclass(frozen=True)
class Campus:
    """Represents a Howest restaurant campus location."""

    code: str
    name: str
    address: str
    city: str
    full_name: str


@dataclass
class DailyMenu:
    """Represents menu offerings for a single weekday."""

    day: str
    date: str
    dutch_dishes: list[str] = field(default_factory=list)
    english_dishes: list[str] = field(default_factory=list)
    all_raw_items: list[str] = field(default_factory=list)


@dataclass
class WeeklyMenuResponse:
    """Represents a complete week of menu offerings for a campus."""

    campus: str
    campus_name: str
    week: str
    days: list[DailyMenu] = field(default_factory=list)
    fetched_at: str = ""
