# Howest Resto API & Specifications 🍽️

[![CI](https://github.com/MauroDruwel/howest-resto/actions/workflows/ci.yml/badge.svg)](https://github.com/MauroDruwel/howest-resto/actions/workflows/ci.yml)
[![OpenAPI 3.0.3](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](docs/openapi.yaml)
[![Quality Gate](https://img.shields.io/badge/Mauro%20Quality%20Gate-Passed-brightgreen)](https://github.com/MauroDruwel/quality-gate)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The canonical OpenAPI 3.0.3 specification and [Cloudflare Forge](https://github.com/MauroDruwel/quality-gate) configuration for **Howest University of Applied Sciences** student restaurant menus, scraped directly and reliably from `resto.howest.be`.

This repository serves as the single source of truth for the API contract, powering automated multi-language client SDKs and the upcoming **Home Assistant** integration.

---

## 📚 Interactive Documentation

- **Swagger UI**: View and test the OpenAPI specification in [`docs/index.html`](docs/index.html).
- **OpenAPI Schema**: Raw specification file located at [`docs/openapi.yaml`](docs/openapi.yaml).

---

## 📦 Official Multi-Language Client SDKs

Client libraries are generated and maintained in separate language repositories:

| Language | Repository | Package | Description |
| :--- | :--- | :--- | :--- |
| **Python** | [**`howest-resto-py`**](https://github.com/MauroDruwel/howest-resto-py) | `howest-resto` | Typed sync & async client with zero dependencies. Ready for Home Assistant. |
| **TypeScript** | [**`howest-resto-ts`**](https://github.com/MauroDruwel/howest-resto-ts) | `@maurodruwel/howest-resto` | Modern TypeScript/ESM client for Node.js and browser environments. |

---

## 🏫 Supported Campuses

| Code | Campus / Restaurant | City | Address |
| :---: | :--- | :--- | :--- |
| **`GKG`** | **'t Obeetje** *(Default)* | Kortrijk | Graaf Karel de Goedelaan 5 |
| **`PENTA`** | **Plaza** | Kortrijk | Sint-Martens-Latemlaan 1B |
| **`RSS`** | **YUM** | Brugge | Rijselstraat 5 |
| **`RSS1`** | **DAD** | Brugge | Spoorwegstraat 4 |
| **`SIC`** | **BSI** | Brugge | Nijverheidsstraat 112 |
| **`TS`** | **The Square** | Kortrijk | Luipaardstraat 12A |

---

## 🚀 API Endpoints

| Method | Endpoint | Query Parameters | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/campuses` | *None* | List all 6 known Howest campuses with code, name, city, and address. |
| `GET` | `/api/menu` | `campus=GKG`, `week=current` | Retrieve the full weekly menu (`week`: `current`, `next`, `previous`). |
| `GET` | `/api/menu/today` | `campus=GKG`, `week=current` | Retrieve today's specific lunch dishes (Dutch & English). |
| `GET` | `/` | *None* | Healthcheck and summary of available endpoints. |

---

## 🔄 Cloudflare Forge Integration

SDK generation targets and invariants are defined in [`forge.config.ts`](forge.config.ts):

```typescript
export default {
  spec: "./docs/openapi.yaml",
  targets: [
    {
      type: "sdk",
      language: "python",
      outDir: "./packages/howest-resto-py",
      options: { packageName: "howest_resto" },
    },
    {
      type: "sdk",
      language: "typescript",
      outDir: "./packages/howest-resto-ts",
      options: { packageName: "@maurodruwel/howest-resto" },
    },
  ],
};
```

Continuous integration runs via [`MauroDruwel/quality-gate/.github/workflows/forge-ci.yml`](https://github.com/MauroDruwel/quality-gate), enforcing structural OpenAPI 3.x schema validation on every push and pull request.

---

## 📜 License

MIT © [Mauro Druwel](https://maurodruwel.be)
