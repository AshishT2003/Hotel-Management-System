# 12 - System Release Changelog & Version History

All notable technical and architectural changes to the Grand Horizon Palace Hotel Management System are documented in this file in strict accordance with [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-29

### Added
* **React 18 & Vite SPA Client**: Modern web-based presentation tier with luxury hospitality design system built with Tailwind CSS.
* **ASP.NET Core 8 Web API**: High-throughput REST API with controller-service-repository layered architecture.
* **Role-Based Authentication (RBAC)**: Dual credentials supporting Front Desk Admin (`admin`/`admin`), Kitchen Staff (`kitchen`/`kitchen`), and Manager privileges.
* **Interactive 50-Room Floor Matrix**: Visual representation of Floors 1 through 5 with color-coded live statuses: Available (Emerald Green), Reserved (Amber), and Occupied (Rose Red).
* **Universal Instant Search**: High-performance debounced filtering across guest names, room numbers, IDs, emails, cities, and states with sub-50ms latency.
* **Automated Billing Engine**: Ported deterministic billing equations including room tier tariffs ($149–$499), extra guest surcharges ($25 for $\ge 3$ guests), meal pricing ($7, $12, $15), and exact 7% state tax.
* **Kitchen "On The Line" Queue**: Dedicated real-time FIFO ticket system for kitchen personnel with one-click order fulfillment.
* **Microsoft SQL Server LocalDB Integration**: Direct persistence binding to `frontend_reservation.mdf` (33-column table) and `login_manager.mdf`.
* **Multi-Container Infrastructure**: Docker Compose configuration bundling React SPA, ASP.NET Core API, and SQL Server 2022 Linux container.
* **Complete Technical Documentation**: 12 modular specification documents in `/docs/`.

---

## [1.1.0] - Planned Q4 2026

### Planned Enhancements
* **Live Merchant Payment Gateway**: Integration with Stripe and Apple Pay for real-time payment capture and 3D-Secure credit verification.
* **Automated SMS Notification Service**: Modernized Twilio / AWS SNS integration for automated reservation confirmations and checkout receipts.
* **Multi-Language Localization (i18n)**: Support for Spanish, French, and German guest itineraries and invoices.

---

## [2.0.0] - Planned Q2 2027

### Planned Architectural Overhaul
* **Multi-Property Franchise Management**: Centralized headquarters portal supporting multi-hotel chains and cross-property room swaps.
* **Guest Mobile Keyless Entry**: Progressive Web App (PWA) Bluetooth Low Energy (BLE) digital door lock integration.
* **Dynamic Pricing AI Engine**: Machine learning model forecasting occupancy demand and adjusting room tariffs dynamically.
