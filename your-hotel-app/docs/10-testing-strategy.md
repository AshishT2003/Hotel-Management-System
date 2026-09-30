# 10 - Comprehensive Quality Assurance & Testing Strategy

## 1. Quality Assurance Test Pyramid

```text
         / \
        / E2E \       Playwright (End-to-end guest journey & order fulfillment)
       /-------\
      / Integr. \     ASP.NET Core WebApplicationFactory + xUnit (Controller/DB Integration)
     /-----------\
    /  Unit Tests \   Jest + RTL (Component rendering) & xUnit + Moq (Domain Calculations)
   /---------------\
```

---

## 2. Exhaustive Verification Test Cases (TC-01 to TC-10)

| ID | Test Case Title | Execution Procedure | Expected Outcome | Pass/Fail Criteria |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Role-Based Authentication & Guarding | 1. Enter invalid password.<br>2. Submit `admin`/`admin`.<br>3. Inspect role in JWT token. | 1. Displays "Invalid credentials".<br>2. Issues 15-minute token.<br>3. Grants Front Desk navigation. | Status = 200, JWT claims validated |
| **TC-02** | Instant Search Filter Latency | 1. Mount 50-room active reservation table.<br>2. Simulate typing "Nazim" or "205".<br>3. Measure time to DOM filter. | Instant filter execution completed in **<50ms**. Table displays only matched records. | Filter time $\le 50\text{ms}$ |
| **TC-03** | Reservation CRUD & Double-Booking Prevention | 1. Submit reservation for Room 101.<br>2. Attempt booking same room on overlapping dates.<br>3. Cancel booking. | 1. Booking created (201).<br>2. Conflict rejected (409 Conflict).<br>3. Room returns to Vacant (200). | State atomic & double-booking prevented |
| **TC-04** | Billing & Tax Formula Accuracy | Book Suite for 2 nights with 3 guests, 2 breakfasts, 1 dinner.<br>Formula: $1.07 \times (R + E + M)$. | Base: $499 \times 2 = \$998$. Extra: $(3-2) \times 25 = \$25$. Meals: $2 \times 7 + 15 = \$29$. Tax: $7\% \times \$1052 = \$73.64$. Total: **$1,125.64**. | Invoiced total matches to exact cent |
| **TC-05** | Real-Time State Synchronization | 1. Front Desk marks Room 101 as "Checked In".<br>2. Observe Floor Matrix & Kitchen Overview. | Room 101 tile changes immediately from Amber (Reserved) to Rose (Occupied) across all views. | Zero delay in context state propagation |
| **TC-06** | Kitchen Queue FIFO Ordering & Settlement | 1. Two guests submit dining requests.<br>2. Kitchen opens `/kitchen`.<br>3. Chef clicks "Mark as Served". | 1. Orders queued in chronological order.<br>2. Status updates to `Served` in real-time. | `supplyStatus = true`, order moved |
| **TC-07** | RBAC UI Guards & Route Protection | 1. Authenticate as `kitchen`.<br>2. Attempt navigating directly to `/billing` or `/reservations`. | ProtectedRoute redirects user immediately to `/kitchen` with an alert banner. | Unauthorized route access blocked |
| **TC-08** | Global Error Handling & Resilience | Disconnect database service; submit new reservation form. | Form surfaces localized non-destructive error toast: "Database unreachable, please retry". | No unhandled JS error or app crash |
| **TC-09** | Responsive Design Breakpoints | Test application at 375px (Mobile), 768px (Tablet), and 1440px (Desktop). | Layout reflows gracefully: Sidebar collapses to drawer, tables support touch scrolling. | No horizontal page overflow |
| **TC-10** | Production Compilation & Bundle Verification | Execute `npm run build` in client and `dotnet build -c Release` in server. | Client builds with 0 errors; Server compiles with 0 warnings. | Zero build errors, assets generated |

---

## 3. Automated Test Suite Frameworks

* **Client Unit & Component Tests**: Jest + `@testing-library/react`.
* **Server Unit & Mocking Tests**: xUnit + `Moq` + `FluentAssertions`.
* **End-to-End System Tests**: Microsoft Playwright (`@playwright/test`).

---

## 4. Continuous Integration (CI) Workflow (`.github/workflows/ci.yml`)

```yaml
name: Continuous Integration Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install Dependencies
        run: cd src/client && npm ci
      - name: Run Client Unit Tests
        run: cd src/client && npm test -- --coverage
      - name: Client Production Build Check
        run: cd src/client && npm run build

  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET Core 8
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - name: Restore Dependencies
        run: dotnet restore src/server/your-hotel-app.csproj
      - name: Run Server Unit & Integration Tests
        run: dotnet test tests/server/ --configuration Release --verbosity normal
```
