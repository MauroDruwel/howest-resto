# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-09

### Added
- Initial OpenAPI 3.0.3 specification for Howest student restaurant menus (`docs/openapi.yaml`).
- Cloudflare Forge configuration (`forge.config.ts`) targeting TypeScript and Python SDKs.
- TypeScript scraper and Cloudflare Worker API router (`src/scraper.ts`, `src/index.ts`).
- Campus metadata mapping for Kortrijk and Brugge campuses (`GKG`, `RSS`, `RSS1`, `PENTA`, `SIC`, `TS`).
- Endpoints for listing campuses, weekly menus, and today's dishes.
- Unit test suite for HTML parsing and Dutch/English dish separation.
- Mauro Quality Gate CI workflow (`.github/workflows/ci.yml`).
