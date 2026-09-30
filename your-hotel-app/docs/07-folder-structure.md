# 07 - Folder Structure & Architecture Rules

## 1. Directory Tree & Partitioning Strategy

The repository follows a clean, decoupled monorepo layout separating documentation, client application, server Web API, automated test suites, and deployment infrastructure.

```text
your-hotel-app/
├── docs/                        # Exhaustive Architecture & Engineering Documentation
├── src/
│   ├── client/                  # React 18 + TypeScript + Vite + Tailwind CSS Single Page App
│   │   ├── public/              # Static assets, SVG favicons
│   │   ├── src/
│   │   │   ├── assets/          # Application-level vector graphics & luxury branding logos
│   │   │   ├── common/          # Atomic Design System: Button, Input, Modal, Select, Badge, Card
│   │   │   ├── components/      # Business Domain Components: RoomCard, ReservationForm, KitchenQueue
│   │   │   ├── constants/       # Immutable definitions: apiRoutes.ts, appRoutes.ts, roles.ts
│   │   │   ├── context/         # React Context Providers: AuthContext.tsx, HotelContext.tsx
│   │   │   ├── hooks/           # Custom reusable hooks: useSearch.ts, useReservations.ts, useKitchenQueue.ts
│   │   │   ├── layouts/         # Page templates: MainLayout.tsx, AuthLayout.tsx
│   │   │   ├── pages/           # View route controllers: Dashboard.tsx, Reservations.tsx, Kitchen.tsx, Login.tsx
│   │   │   ├── router/          # Routing config: routes.tsx, ProtectedRoute.tsx
│   │   │   ├── services/        # HTTP API integrations: authService.ts, reservationService.ts, roomService.ts
│   │   │   ├── types/           # TypeScript interfaces: reservation.ts, guest.ts, room.ts, order.ts
│   │   │   ├── utils/           # Pure functions: formatters.ts, validators.ts, billingCalculator.ts
│   │   │   ├── App.tsx          # Root application layout coordinator
│   │   │   ├── index.css        # Tailwind directives & CSS variable definitions
│   │   │   └── main.tsx         # React DOM initialization & Context Providers
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   └── vite.config.ts
│   └── server/                  # ASP.NET Core 8 Web API
│       ├── Controllers/         # API HTTP endpoints: AuthController.cs, ReservationsController.cs
│       ├── Services/            # Business & calculation logic: BillingService.cs, ReservationService.cs
│       ├── Repositories/        # Database access layer: ReservationRepository.cs, KitchenRepository.cs
│       ├── Models/              # Database domain entities: Reservation.cs, Guest.cs, Room.cs
│       ├── DTOs/                # Network data transfer objects: LoginRequest.cs, ReservationDto.cs
│       ├── Data/                # Entity Framework Core context: HotelDbContext.cs
│       ├── Middleware/          # HTTP interceptors: ExceptionHandlingMiddleware.cs, JwtMiddleware.cs
│       ├── appsettings.json     # Configuration, connection strings & JWT settings
│       ├── Program.cs           # Host bootstrapping, DI registrations & pipeline setup
│       └── your-hotel-app.csproj
├── tests/
│   ├── client/                  # Jest + React Testing Library suites
│   └── server/                  # xUnit + Moq API & service test suites
├── infra/
│   ├── docker-compose.yml       # Multi-container orchestration (Client, Server, SQL Server)
│   ├── Dockerfile.client        # Multi-stage Nginx production build
│   ├── Dockerfile.server        # ASP.NET Core 8 publish container
│   ├── database/                # LocalDB MDF/LDF database attachments & setup scripts
│   └── seed-data/               # SQL insertion scripts for demo records
├── .gitignore
└── README.md
```

---

## 2. Strict Naming Conventions

| Category | Convention | Examples |
| :--- | :--- | :--- |
| **React Components & Layouts** | `PascalCase.tsx` | `RoomCard.tsx`, `MainLayout.tsx`, `InvoiceModal.tsx` |
| **C# Classes & Interfaces** | `PascalCase.cs` | `ReservationService.cs`, `IReservationRepository.cs` |
| **Custom Hooks** | `camelCase.ts` prefixed with `use` | `useSearch.ts`, `useKitchenQueue.ts` |
| **Utilities & Pure Functions** | `camelCase.ts` | `formatters.ts`, `billingCalculator.ts` |
| **Constants & Route Definitions**| `camelCase.ts` | `apiRoutes.ts`, `appRoutes.ts`, `roles.ts` |
| **Data Transfer Objects (DTOs)** | `PascalCaseDto.cs` | `ReservationDto.cs`, `OrderDto.cs` |

---

## 3. "What Goes Where" Architectural Guide

* **All API Route Paths**: Must be defined in `src/client/src/constants/apiRoutes.ts`. Never hardcode raw URL strings in components or services.
* **All Business Calculations**: Reside exclusively in `src/client/src/utils/billingCalculator.ts` and `src/server/Services/BillingService.cs`.
* **State Mutation Rules**: Components never directly invoke `fetch` or `axios`. They consume hooks (`useReservations`), which invoke services (`reservationService.ts`), which update Context (`HotelContext.tsx`).
* **Database Queries**: Raw SQL or LINQ queries must live inside `src/server/Repositories/`. Controllers and Services must not execute direct database operations.
