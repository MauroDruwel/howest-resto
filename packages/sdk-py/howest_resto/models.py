from dataclasses import dataclass, field
from typing import List


@dataclass
class Campus:
    code: str
    name: str
    address: str
    city: str
    full_name: str


@dataclass
class DailyMenu:
    day: str
    date: str
    dutch_dishes: List[str] = field(default_factory=list)
    english_dishes: List[str] = field(default_factory=list)
    all_raw_items: List[str] = field(default_factory=list)


@dataclass
class WeeklyMenuResponse:
    campus: str
    campus_name: str
    week: str
    days: List[DailyMenu] = field(default_factory=list)
    fetched_at: str = ""
