"""Client implementations for the Howest Resto API."""

from __future__ import annotations

import asyncio
import datetime
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from typing import Any

from .exceptions import APIError, CampusNotFoundError
from .models import Campus, DailyMenu, WeeklyMenuResponse

__all__ = [
    "CAMPUSES",
    "AsyncHowestRestoClient",
    "HowestRestoClient",
]

CAMPUSES: list[Campus] = [
    Campus("GKG", "'t Obeetje", "Graaf Karel de Goedelaan 5", "Kortrijk", "'t Obeetje (Graaf Karel de Goedelaan 5, Kortrijk)"),
    Campus("PENTA", "Plaza", "Sint-Martens-Latemlaan 1B", "Kortrijk", "Plaza (Sint-Martens-Latemlaan 1B, Kortrijk)"),
    Campus("RSS", "YUM", "Rijselstraat 5", "Brugge", "YUM (Rijselstraat 5, Brugge)"),
    Campus("RSS1", "DAD", "Spoorwegstraat 4", "Brugge", "DAD (Spoorwegstraat 4, Brugge)"),
    Campus("SIC", "BSI", "Nijverheidsstraat 112", "Brugge", "BSI (Nijverheidsstraat 112, Brugge)"),
    Campus("TS", "The Square", "Luipaardstraat 12A", "Kortrijk", "The Square (Luipaardstraat 12A, Kortrijk)"),
]

BASE_URL = "https://resto.howest.be/MenuWeekly.aspx"
DEFAULT_USER_AGENT = "HowestRestoClient/1.0 (+https://github.com/MauroDruwel/howest-resto-py)"


class _RestoHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.in_dow = False
        self.in_date = False
        self.in_li = False
        self.in_weekdag = False
        self.weekdag_depth = 0
        self.title = ""
        self.days: list[DailyMenu] = []
        self._current_raw_day: dict[str, Any] | None = None
        self.viewstate = ""
        self.eventvalidation = ""
        self.viewstategen = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_dict = dict(attrs)
        if tag == "input":
            if attr_dict.get("id") == "__VIEWSTATE":
                self.viewstate = attr_dict.get("value") or ""
            elif attr_dict.get("id") == "__EVENTVALIDATION":
                self.eventvalidation = attr_dict.get("value") or ""
            elif attr_dict.get("id") == "__VIEWSTATEGENERATOR":
                self.viewstategen = attr_dict.get("value") or ""
        elif tag == "h3" and attr_dict.get("id") == "titleWeekmenu":
            self.in_title = True
        elif tag == "div":
            cls = attr_dict.get("class", "")
            if "divWeekdag" in cls:
                self.in_weekdag = True
                self.weekdag_depth = 1
                self._current_raw_day = {"day": "", "date": "", "items": []}
                return
            if self.in_weekdag:
                self.weekdag_depth += 1
        elif tag == "span" and "spanDate" in attr_dict.get("class", ""):
            self.in_dow = True
        elif tag == "span" and "spanDag" in attr_dict.get("class", ""):
            self.in_date = True
        elif tag == "li" and self._current_raw_day is not None:
            self.in_li = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "h3":
            self.in_title = False
        elif tag == "span":
            self.in_dow = False
            self.in_date = False
        elif tag == "li":
            self.in_li = False
        elif tag == "div" and self.in_weekdag:
            self.weekdag_depth -= 1
            if self.weekdag_depth == 0 and self._current_raw_day is not None:
                self.in_weekdag = False
                items: list[str] = self._current_raw_day["items"]
                dutch, english = [], []
                if "***" in items:
                    idx = items.index("***")
                    dutch = items[:idx]
                    english = items[idx + 1 :]
                else:
                    dutch = items[:]

                self.days.append(
                    DailyMenu(
                        day=self._current_raw_day["day"].strip(),
                        date=self._current_raw_day["date"].strip(),
                        dutch_dishes=[x for x in dutch if x],
                        english_dishes=[x for x in english if x],
                        all_raw_items=[x for x in items if x],
                    )
                )
                self._current_raw_day = None

    def handle_data(self, data: str) -> None:
        text = data.strip()
        if not text:
            return
        if self.in_title:
            self.title += text
        elif self.in_dow and self._current_raw_day:
            self._current_raw_day["day"] += text
        elif self.in_date and self._current_raw_day:
            self._current_raw_day["date"] += text
        elif self.in_li and self._current_raw_day:
            self._current_raw_day["items"].append(text)


class HowestRestoClient:
    """Synchronous (with async helper methods) client for Howest student restaurant menus.

    Zero external dependencies, safe for both standalone scripts and
    asynchronous frameworks like Home Assistant via `async_get_*`.
    """

    def __init__(
        self,
        *,
        timeout: float = 15.0,
        user_agent: str = DEFAULT_USER_AGENT,
    ) -> None:
        self.timeout = timeout
        self.user_agent = user_agent

    def get_campuses(self) -> list[Campus]:
        """Return all known Howest campuses."""
        return list(CAMPUSES)

    def get_menu(self, campus: str = "GKG", week: str = "current") -> WeeklyMenuResponse:
        """Fetch weekly menu for a specific campus and week.

        Args:
            campus: Campus identifier code (e.g., "GKG", "RSS", "PENTA", "TS").
            week: "current", "next", or "previous".

        Raises:
            CampusNotFoundError: If campus code is unknown.
            APIError: If fetching or parsing fails.
        """
        norm_code = campus.upper().strip()
        matching = next((c for c in CAMPUSES if c.code == norm_code), None)
        if not matching:
            valid_codes = ", ".join(c.code for c in CAMPUSES)
            raise CampusNotFoundError(f"Unknown campus code: {campus}. Valid: {valid_codes}")

        headers = {"User-Agent": self.user_agent}
        try:
            req = urllib.request.Request(BASE_URL, headers=headers)
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                html = resp.read().decode("utf-8")

            parser = _RestoHtmlParser()
            parser.feed(html)

            # If requesting a different campus or week, POST the ASP.NET form
            if norm_code != "GKG" or week != "current":
                payload = {
                    "__EVENTTARGET": "ddlChooseCampus" if week == "current" else "",
                    "__EVENTARGUMENT": "",
                    "__VIEWSTATE": parser.viewstate,
                    "__VIEWSTATEGENERATOR": parser.viewstategen,
                    "__EVENTVALIDATION": parser.eventvalidation,
                    "ddlChooseCampus": norm_code,
                }
                if week == "next":
                    payload["btnNextWeeklyMenu"] = "Volgende week"
                elif week == "previous":
                    payload["btnPreviousWeeklyMenu"] = "Vorige week"

                post_data = urllib.parse.urlencode(payload).encode("utf-8")
                post_req = urllib.request.Request(BASE_URL, data=post_data, headers=headers)
                with urllib.request.urlopen(post_req, timeout=self.timeout) as post_resp:
                    html = post_resp.read().decode("utf-8")

                parser = _RestoHtmlParser()
                parser.feed(html)

            campus_name = parser.title.replace("Weekmenu", "").strip() or matching.full_name
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

            return WeeklyMenuResponse(
                campus=norm_code,
                campus_name=campus_name,
                week=week,
                days=parser.days,
                fetched_at=now_iso,
            )
        except CampusNotFoundError:
            raise
        except Exception as exc:
            raise APIError(f"Failed to fetch Howest menu: {exc}") from exc

    def get_today_menu(self, campus: str = "GKG", week: str = "current") -> DailyMenu | None:
        """Return today's menu for the specified campus, or None if closed or weekend."""
        menu = self.get_menu(campus=campus, week=week)
        day_map = {1: "Ma", 2: "Di", 3: "Wo", 4: "Do", 5: "Vr"}
        weekday = datetime.datetime.now().isoweekday()
        expected_abbr = day_map.get(weekday)
        if not expected_abbr:
            return None

        for d in menu.days:
            if d.day == expected_abbr:
                return d
        return None

    # Asynchronous non-blocking helpers for Home Assistant
    async def async_get_campuses(self) -> list[Campus]:
        """Asynchronously return all known campuses."""
        return await asyncio.to_thread(self.get_campuses)

    async def async_get_menu(self, campus: str = "GKG", week: str = "current") -> WeeklyMenuResponse:
        """Asynchronously fetch weekly menu on a background worker thread."""
        return await asyncio.to_thread(self.get_menu, campus, week)

    async def async_get_today_menu(self, campus: str = "GKG", week: str = "current") -> DailyMenu | None:
        """Asynchronously fetch today's menu on a background worker thread."""
        return await asyncio.to_thread(self.get_today_menu, campus, week)


class AsyncHowestRestoClient:
    """Pure asynchronous client wrapper for Howest Resto API."""

    def __init__(
        self,
        *,
        timeout: float = 15.0,
        user_agent: str = DEFAULT_USER_AGENT,
    ) -> None:
        self._sync_client = HowestRestoClient(timeout=timeout, user_agent=user_agent)

    async def get_campuses(self) -> list[Campus]:
        """Asynchronously return all known campuses."""
        return await self._sync_client.async_get_campuses()

    async def get_menu(self, campus: str = "GKG", week: str = "current") -> WeeklyMenuResponse:
        """Asynchronously fetch weekly menu."""
        return await self._sync_client.async_get_menu(campus, week)

    async def get_today_menu(self, campus: str = "GKG", week: str = "current") -> DailyMenu | None:
        """Asynchronously fetch today's menu."""
        return await self._sync_client.async_get_today_menu(campus, week)
