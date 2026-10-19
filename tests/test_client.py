"""Tests for howest-resto client and parser."""

from __future__ import annotations

import asyncio
from unittest.mock import MagicMock, patch

import pytest

from howest_resto import (
    AsyncHowestRestoClient,
    CampusNotFoundError,
    HowestRestoClient,
)
from howest_resto.client import _RestoHtmlParser

SAMPLE_HTML = """
<!DOCTYPE html>
<html>
<body>
<h3 id="titleWeekmenu">Weekmenu 't Obeetje (Graaf Karel de Goedelaan 5, Kortrijk)</h3>
<div class="divWeekdag">
    <span class="spanDate">Ma</span>
    <span class="spanDag">19 oktober</span>
    <ul>
        <li>Tomatensoep met balletjes</li>
        <li>Spaghetti Bolognese</li>
        <li>***</li>
        <li>Tomato soup with meatballs</li>
        <li>Spaghetti Bolognese</li>
    </ul>
</div>
<div class="divWeekdag">
    <span class="spanDate">Di</span>
    <span class="spanDag">20 oktober</span>
    <ul>
        <li>Wortelsoep</li>
        <li>Vol-au-vent met frietjes</li>
    </ul>
</div>
</body>
</html>
"""


def test_campuses_list() -> None:
    client = HowestRestoClient()
    campuses = client.get_campuses()
    assert len(campuses) == 6
    codes = [c.code for c in campuses]
    assert "GKG" in codes
    assert "RSS" in codes
    assert "PENTA" in codes
    assert "SIC" in codes
    assert "TS" in codes
    assert "RSS1" in codes


def test_invalid_campus_raises() -> None:
    client = HowestRestoClient()
    with pytest.raises(CampusNotFoundError):
        client.get_menu(campus="INVALID_CAMPUS")


def test_html_parser_bilingual() -> None:
    parser = _RestoHtmlParser()
    parser.feed(SAMPLE_HTML)

    assert len(parser.days) == 2

    monday = parser.days[0]
    assert monday.day == "Ma"
    assert monday.date == "19 oktober"
    assert "Spaghetti Bolognese" in monday.dutch_dishes
    assert "Spaghetti Bolognese" in monday.english_dishes
    assert "Tomato soup with meatballs" in monday.english_dishes

    tuesday = parser.days[1]
    assert tuesday.day == "Di"
    assert tuesday.date == "20 oktober"
    assert "Vol-au-vent met frietjes" in tuesday.dutch_dishes
    assert len(tuesday.english_dishes) == 0


def test_client_get_menu_mocked() -> None:
    client = HowestRestoClient()

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_resp = MagicMock()
        mock_resp.read.return_value = SAMPLE_HTML.encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        menu = client.get_menu("GKG")
        assert menu.campus == "GKG"
        assert len(menu.days) == 2
        assert menu.days[0].day == "Ma"


def test_async_client_methods() -> None:
    async def _run() -> None:
        client = HowestRestoClient()
        async_client = AsyncHowestRestoClient()

        campuses = await client.async_get_campuses()
        assert len(campuses) == 6

        campuses_async = await async_client.get_campuses()
        assert len(campuses_async) == 6

        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_resp = MagicMock()
            mock_resp.read.return_value = SAMPLE_HTML.encode("utf-8")
            mock_urlopen.return_value.__enter__.return_value = mock_resp

            menu = await client.async_get_menu("GKG")
            assert menu.campus == "GKG"

            menu2 = await async_client.get_menu("GKG")
            assert menu2.campus == "GKG"

    asyncio.run(_run())
