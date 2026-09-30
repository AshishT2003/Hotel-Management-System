# Grand Horizon — Modern Hotel Management Operating System

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-success)](docs/10-testing-strategy.md)
[![ASP.NET Core](https://img.shields.io/badge/.NET-8.0-blue)](src/server/)
[![React](https://img.shields.io/badge/React-18-61dafb)](src/client/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](src/client/tailwind.config.js)
[![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-success)](docs/06-ui-ux-design.md)

An enterprise-grade, full-stack hotel management platform engineered to modernize legacy WinForms software into a high-performance web application. Designed for a 50-room luxury property across 5 vertical tiers, featuring role-based authentication, sub-50ms universal search, real-time kitchen dispatch queues, and automated guest billing.

---

## 🏛️ System Architecture

```mermaid
graph TD
    User([Staff User]) -->|HTTPS / WSS| WebClient[React 18 + Vite + Tailwind Client]
    WebClient -->|REST API + Bearer JWT| WebAPI[ASP.NET Core 8 Web API]
    
    subgraph "Server Architecture"
        WebAPI --> AuthCtrl[AuthController]
        WebAPI --> ResCtrl[ReservationsController]
        WebAPI --> KitchCtrl[KitchenController]
        WebAPI --> RoomCtrl[RoomsController]
        
        AuthCtrl --> AuthService[AuthService]
        ResCtrl --> ResService[ReservationService]
        ResCtrl --> BillService[BillingService (Formula $1.07*(R+E+M))]
        KitchCtrl --> KitchenService[KitchenService]
        RoomCtrl --> RoomService[RoomService]
        
        ResService --> ResRepo[ReservationRepository (ADO.NET)]
        AuthService --> AuthRepo[AuthRepository]
    end
    
    subgraph "Persistence Tier"
        ResRepo -->|SQL LocalDB / Docker SQL| DB[(frontend_reservation.mdf)]
        AuthRepo -->|SQL LocalDB / Docker SQL| UserDB[(login_manager.mdf)]
    end
```

---

## ⚡ Quick Start

### Option A: 1-Click Launch (Windows LocalDB)
Double-click [**`run-app.bat`**](run-app.bat) at the project root, or execute in terminal:
```powershell
.\run-app.bat
```
*Attaches LocalDB (if needed), starts Web API on port 5000, starts React frontend on port 5174, and opens your default browser automatically.*

### Option B: Docker Compose (Linux, macOS, Windows)
```bash
docker compose up -d --build
```
* **Frontend Application**: [http://localhost:3000](http://localhost:3000)
* **Backend Web API & Swagger**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
* **SQL Server 2022**: `localhost:1433`

---

## 🔑 Role Credentials & Access Matrix

The system includes one-click demo login buttons on the login card, or credentials can be entered manually:

| Role | Username | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Front Desk Admin** | `admin` | `password123` | Executive Dashboard, Full 33-column Reservation CRUD, 50-Room Floor Matrix, Check-In/Out Transitions, Folio Billing |
| **Kitchen Staff** | `kitchen` | `password123` | "On The Line" Live Meal Dispatch, Housekeeping & Towel Checklists, One-Click "Mark Order Served" |
| **General Manager** | `manager` | `password123` | Property Revenue Metrics, RevPAR, In-House Occupancy Analytics, System Oversight |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Authenticate staff and return 15-min JWT token | No |
| `GET` | `/api/reservations` | Search and filter guest reservations (`?search=`, `?status=`) | Yes |
| `GET` | `/api/reservations/{id}` | Retrieve individual reservation record by ID | Yes |
| `POST` | `/api/reservations` | Create a new 33-column reservation | Yes |
| `PUT` | `/api/reservations/{id}` | Update existing reservation details | Yes |
| `DELETE` | `/api/reservations/{id}` | Cancel and delete reservation | Yes |
| `PATCH` | `/api/reservations/{id}/checkin` | Toggle guest check-in/out (`{ checkIn: boolean }`) | Yes |
| `GET` | `/api/reservations/{id}/invoice` | Generate transparent itemized folio invoice | Yes |
| `GET` | `/api/kitchen/orders` | Fetch active kitchen orders and service requests | Yes |
| `PUT` | `/api/kitchen/orders/{id}/status` | Update kitchen supply fulfillment status | Yes |
| `GET` | `/api/rooms/matrix` | Full 50-room matrix across all 5 floors with statuses | Yes |
| `GET` | `/api/rooms/occupied` | List of all currently occupied room units | Yes |

*Full OpenAPI/Swagger contract documented in [**`docs/05-api-contract.md`**](docs/05-api-contract.md).*

---

## 🧮 Guest Billing & Tax Formula

All calculations are enforced server-side and mirrored in client hooks:

$$\text{Final Total} = 1.07 \times (R + E + M)$$

* **Room Rate ($R$)**: Single ($149), Double ($299), Twin ($349), Duplex ($399), Suite ($499) multiplied by nights.
* **Extra Guest Surcharge ($E$)**: If guests $G \ge 3$, surcharge is $(G - 2) \times \$25$ per night.
* **Dining Total ($M$)**: Breakfast ($7.00), Lunch ($12.00), Dinner ($15.00) per portion.
* **Tax Line**: Exactly 7% on taxable subtotal $(R + E + M)$.

---

## 🧪 Automated Testing

### 1. Backend xUnit Test Suite (20 Tests)
```powershell
cd tests/server
dotnet test
```
*Validates billing formulas to the penny, model validation, controller status codes, and JWT claim issuance.*

### 2. Frontend Unit & Benchmark Suite (10 Tests)
```powershell
cd your-hotel-app
npx tsx tests/client/index.ts
```
*Validates pricing math, date clamping, multi-night scaling, and verifies <50ms instant search filter latency.*

### 3. End-to-End Test Scenarios
Refer to [**`tests/client/playwright-e2e.spec.ts`**](tests/client/playwright-e2e.spec.ts) for detailed automated and manual verification procedures for Check-In, Kitchen "On The Line", and Billing folios.

---

## 🛠️ Troubleshooting & Diagnostic Guide

| Symptom | Diagnostic Cause | Resolution |
| :--- | :--- | :--- |
| **LocalDB connection fails** | SQL instance stopped or detached | Run `sqllocaldb start MSSQLLocalDB` and execute `infra/database/attach-database.sql`. The server will automatically use in-memory fallback if LocalDB is offline. |
| **CORS errors in browser** | Mismatched client origin | The Web API allows `http://localhost:5174`, `http://localhost:5173`, and `http://localhost:3000` in `Program.cs`. |
| **Port 5000 in use** | Another web server process running | Modify `server` port in `appsettings.json` or terminate lingering processes using `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process`. |

*Detailed diagnostic matrix available in [**`docs/09-debugging-rules.md`**](docs/09-debugging-rules.md).*

---

## 📚 Complete Project Documentation Index

All 12 architectural and operational specifications are available in [`/docs`](docs/):

1. [**01-requirements.md**](docs/01-requirements.md) — Functional requirements (FR-01 to FR-08), NFRs, and user personas.
2. [**02-architecture.md**](docs/02-architecture.md) — System architecture diagram, technology justification, security perimeter.
3. [**03-system-design.md**](docs/03-system-design.md) — Sequence diagrams (check-in, billing, kitchen), error handling, and data contracts.
4. [**04-database-design.md**](docs/04-database-design.md) — Mermaid ERD, 33-column data dictionary, and indexing strategy.
5. [**05-api-contract.md**](docs/05-api-contract.md) — Complete REST endpoint specifications, request/response JSON schemas.
6. [**06-ui-ux-design.md**](docs/06-ui-ux-design.md) — Executive luxury design tokens, WCAG 2.1 AA checklist, and prop contracts.
7. [**07-folder-structure.md**](docs/07-folder-structure.md) — Directory topology and file conventions.
8. [**08-coding-rules.md**](docs/08-coding-rules.md) — Coding conventions, async/await standards, SQL parameterization rules.
9. [**09-debugging-rules.md**](docs/09-debugging-rules.md) — Diagnostic matrix, structured logging, and sample cURL requests.
10. [**10-testing-strategy.md**](docs/10-testing-strategy.md) — Test pyramid, TC-01 to TC-10 test cases, and GitHub Actions CI workflow.
11. [**11-deployment.md**](docs/11-deployment.md) — Docker Compose topology, disaster recovery, backups, and rollbacks.
12. [**12-changelog.md**](docs/12-changelog.md) — Semantic versioning release notes and roadmap for v1.1.0/v2.0.0.

---

## 🗺️ Product Roadmap

* **v1.0.0 (Current Release)**: Complete React 18 + ASP.NET Core 8 rewrite, LocalDB persistence, role-based auth, instant search (<50ms), 50-room matrix, kitchen dispatch, and folio billing.
* **v1.1.0**: WebSocket live push notifications via SignalR for kitchen tickets.
* **v2.0.0**: Integrated Stripe/Square hardware terminal SDK integration for physical chip card reading.
