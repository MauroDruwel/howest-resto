# Howest Resto API & Cloudflare Forge Service

[![CI](https://github.com/MauroDruwel/howest-resto-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/MauroDruwel/howest-resto-forge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Quality Gate](https://img.shields.io/badge/Mauro%20Quality%20Gate-Passed-brightgreen)](https://github.com/MauroDruwel/quality-gate)

Structured JSON API, OpenAPI 3.0.3 specification, and Cloudflare Forge configuration for Howest University of Applied Sciences student restaurant menus.

---

## 🍽️ Features

- **OpenAPI 3.0.3 Specification**: Clean contract (`docs/openapi.yaml`) defining campuses, weekly menus, and daily dish representations.
- **Cloudflare Forge Integration**: Configured in `forge.config.ts` for automated TypeScript and Python client SDK generation.
- **ASP.NET Scraper**: Handles ASP.NET WebForms `__VIEWSTATE` lifecycle and dynamic campus switching against `resto.howest.be`.
- **Bilingual Menu Parsing**: Automatically separates Dutch dish descriptions from English translations (delimited by `***`).
- **Edge Deployment**: Standard Request/Response fetch handler suitable for Cloudflare Workers.

---

## 🏫 Supported Campuses

| Code | Campus / Restaurant | City | Address |
|---|---|---|---|
| `GKG` | **'t Obeetje** (Default) | Kortrijk | Graaf Karel de Goedelaan 5 |
| `PENTA` | **Plaza** | Kortrijk | Sint-Martens-Latemlaan 1B |
| `RSS` | **YUM** | Brugge | Rijselstraat 5 |
| `RSS1` | **DAD** | Brugge | Spoorwegstraat 4 |
| `SIC` | **BSI** | Brugge | Nijverheidsstraat 112 |
| `TS` | **The Square** | Kortrijk | Luipaardstraat 12A |

---

## 📦 Multi-Language Client SDKs

The repository provides native client libraries that read directly from Howest's system (no API server hosting required):

### Python (`packages/sdk-py`)
Zero external dependencies (uses standard library `urllib` & `html.parser`):
```python
from howest_resto import HowestRestoClient

client = HowestRestoClient()

# Get next week's menu for Kortrijk
menu = client.get_menu(campus="GKG", week="next")
for day in menu.days:
    print(day.day, day.date, day.dutch_dishes)

# Get today's menu for Brugge
today = client.get_today_menu(campus="RSS")
if today:
    print("Today in Brugge:", today.dutch_dishes)
```

### TypeScript / Node (`packages/sdk-ts`)
```typescript
import { HowestRestoClient } from '@maurodruwel/howest-resto';

const client = new HowestRestoClient();

// Get next week's menu
const menu = await client.getMenu({ campus: 'GKG', week: 'next' });
console.log(menu.campusName, menu.days);
```

---

## 🚀 Cloudflare Worker & API Endpoints

For REST / OpenAPI integration:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/campuses` | Returns list of all known Howest campuses with locations |
| `GET` | `/api/menu?campus=GKG&week=next` | Returns weekly menu (`week`: `current`, `next`, `previous`) |
| `GET` | `/api/menu/today?campus=GKG` | Returns today's specific dishes (Dutch + English) |
| `GET` | `/` | API status and available endpoints summary |

---

## 🛠️ Development & Testing

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Build TypeScript
pnpm run build
```

---

## 📜 License

MIT © [Mauro Druwel](https://maurodruwel.be)
