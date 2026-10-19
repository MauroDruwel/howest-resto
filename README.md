# howest-resto 🍽️

[![CI](https://github.com/MauroDruwel/howest-resto/actions/workflows/ci.yml/badge.svg)](https://github.com/MauroDruwel/howest-resto/actions/workflows/ci.yml)
[![Python >=3.10](https://img.shields.io/badge/python->=3.10-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Quality Gate](https://img.shields.io/badge/Mauro%20Quality%20Gate-Passed-brightgreen)](https://github.com/MauroDruwel/quality-gate)

Official, typed Python client library for **Howest University of Applied Sciences** student restaurant menus.

Designed with **zero external dependencies** and built-in async support for modern Python applications and **Home Assistant** integrations.

---

## ⚡ Highlights

- **Zero External Dependencies**: Pure standard library (`urllib` & `html.parser`). No dependency bloat.
- **Async & Sync Support**: Use `HowestRestoClient` for synchronous scripting or `AsyncHowestRestoClient` / `async_get_*` for asyncio / Home Assistant event loops.
- **ASP.NET Session Handling**: Seamlessly executes the ASP.NET WebForms `__VIEWSTATE` lifecycle and dynamic campus switching.
- **Bilingual Dish Separation**: Automatically separates Dutch lunch menus from English translations.
- **All 6 Howest Campuses**: Kortrijk ('t Obeetje, Plaza, The Square) and Brugge (YUM, DAD, BSI).

---

## 📦 Installation

```bash
pip install howest-resto
```

---

## 🚀 Quickstart

### Asynchronous (Recommended for Home Assistant / FastAPI)

```python
import asyncio
from howest_resto import AsyncHowestRestoClient

async def main():
    client = AsyncHowestRestoClient()

    # Get today's menu for Kortrijk ('t Obeetje)
    today = await client.get_today_menu(campus="GKG")
    if today:
        print(f"Today ({today.date}):")
        for dish in today.dutch_dishes:
            print(f"  • {dish}")

    # Fetch next week's full menu for Brugge (YUM)
    menu = await client.get_menu(campus="RSS", week="next")
    print(f"\nNext week at {menu.campus_name}:")
    for day in menu.days:
        print(f"[{day.day} {day.date}] {', '.join(day.dutch_dishes)}")

asyncio.run(main())
```

### Synchronous

```python
from howest_resto import HowestRestoClient

client = HowestRestoClient()

# List all campuses
for campus in client.get_campuses():
    print(f"{campus.code}: {campus.name} ({campus.city})")

# Get current week's menu
menu = client.get_menu(campus="GKG")
for day in menu.days:
    print(f"{day.day} ({day.date}):")
    print("  NL:", day.dutch_dishes)
    print("  EN:", day.english_dishes)
```

---

## 🏠 Home Assistant Integration Usage

In a Home Assistant custom component coordinator:

```python
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from howest_resto import AsyncHowestRestoClient, HowestRestoError

class HowestRestoCoordinator(DataUpdateCoordinator):
    def __init__(self, hass, campus_code: str):
        super().__init__(hass, _LOGGER, name="Howest Resto", update_interval=timedelta(hours=2))
        self.client = AsyncHowestRestoClient()
        self.campus_code = campus_code

    async def _async_update_data(self):
        try:
            return await self.client.get_menu(campus=self.campus_code)
        except HowestRestoError as err:
            raise UpdateFailed(f"Error fetching Howest menu: {err}") from err
```

---

## 🏫 Supported Campuses

| Code | Campus Name | City | Restaurant Name |
| :--- | :--- | :--- | :--- |
| `GKG` | Graaf Karel de Goedelaan | Kortrijk | 't Obeetje |
| `RDR` | Renaat de Rudderlaan | Kortrijk | Plaza |
| `BWE` | Botenkopersstraat | Kortrijk | The Square |
| `RSS` | Rijselstraat | Brugge | YUM |
| `SJS` | Sint-Jorisstraat | Brugge | DAD |
| `SBR` | Spoorwegstraat | Brugge | BSI |

---

## 🛠️ Development & Testing

```bash
# Clone the repository
git clone https://github.com/MauroDruwel/howest-resto.git
cd howest-resto

# Install in editable mode with dev dependencies
pip install -e ".[dev]"

# Run linter
ruff check .

# Run test suite
pytest -v --cov=howest_resto
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
