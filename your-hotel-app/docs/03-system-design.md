# 03 - System Design Document

## 1. Sequence Diagrams of Core Operational Workflows

### 1.1 Guest Check-In & State Transition Flow
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Front Desk Admin
    participant UI as ReservationsTable.tsx
    participant Context as HotelContext.tsx
    participant Service as reservationService.ts
    participant API as ReservationsController.cs
    participant Repo as ReservationRepository.cs
    participant DB as SQL Server LocalDB

    Admin->>UI: Click "Check In" button for Reservation #1011
    UI->>Context: toggleCheckIn(1011)
    Context->>Service: patchCheckIn(1011, true)
    Service->>API: PATCH /api/reservations/1011/checkin { checkIn: true }
    API->>Repo: UpdateCheckInStatusAsync(1011, true)
    Repo->>DB: UPDATE reservation SET check_in = 1 WHERE Id = 1011
    DB-->>Repo: 1 Row Affected
    Repo-->>API: Updated Entity
    API-->>Service: 200 OK (ReservationDto)
    Service-->>Context: Resolved State Update
    Context->>Context: Recalculate roomStatusMap (Room 205 -> Occupied)
    Context-->>UI: Re-render with Green "Checked In" badge & Rose room status
```

### 1.2 Deterministic Billing & Tax Calculation Flow
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Front Desk Admin
    participant Modal as ReservationForm.tsx
    participant Calc as billingCalculator.ts
    participant API as BillingService.cs

    Admin->>Modal: Selects Room (Suite: $499) + 3 Guests + 2 Breakfasts ($14)
    Modal->>Calc: calculateInvoice({ roomType, guests: 3, breakfast: 2, nights: 2 })
    Note over Calc: Base = $499 x 2 = $998<br/>Extra Guest = (3-2) x $25 = $25<br/>Meals = 2 x $7 = $14<br/>Tax = 7% on ($998 + $25 + $14) = $72.59<br/>Total = $1,109.59
    Calc-->>Modal: Return Itemized Breakdown
    Modal-->>Admin: Display Live Bill Preview before confirmation
    Admin->>Modal: Confirm Booking
    Modal->>API: POST /api/reservations (Payload includes calculated totals)
```

### 1.3 Kitchen Dining Order Fulfillment Flow
```mermaid
sequenceDiagram
    autonumber
    actor Chef as Kitchen Personnel
    participant KQueue as KitchenQueue.tsx
    participant KService as kitchenService.ts
    participant KAPI as KitchenController.cs
    participant DB as SQL Server LocalDB

    Chef->>KQueue: Reviews "On The Line" Tickets
    Note over KQueue: Displays Room 205: 2 Breakfast, 1 Lunch, Fresh Towels
    Chef->>KQueue: Clicks "Mark as Served"
    KQueue->>KService: updateOrderStatus(1011, true)
    KService->>KAPI: PATCH /api/kitchen/orders/1011 { status: true }
    KAPI->>DB: UPDATE reservation SET supply_status = 1 WHERE Id = 1011
    DB-->>KAPI: Commit Transaction
    KAPI-->>KService: 200 OK (OrderDto)
    KService-->>KQueue: Ticket moves from "On The Line" to "Recently Served"
```

---

## 2. State Management Architecture

### `AuthContext.tsx`
* **Responsibilities**: Holds active user session, decoded JWT claims, role classification (`Admin`, `Kitchen`, `Manager`), and expiration timer.
* **Storage Sync**: Persists token in secure `sessionStorage` with automated silent refresh / logout trigger on token expiry.

### `HotelContext.tsx`
* **Responsibilities**:
  * **`reservations`**: Master list of active and historic bookings.
  * **`roomStatusMap`**: Memoized hashmap keyed by Room Number (`101` through `510`) deriving room state (`Available`, `Reserved`, `Occupied`) with $O(1)$ lookup performance.
  * **`stats`**: Live aggregated metrics (Gross Revenue, Active Occupants, Pending Queue Tickets, Occupancy Percentage).
* **Concurrency Handling**: Employs optimistic UI updates with automatic rollback if the background API call rejects.

---

## 3. Global Exception & Error Handling Strategy

### Client-Side Error Boundary & Interceptor
* **React `ErrorBoundary`**: Wraps the route hierarchy to catch runtime UI rendering exceptions, presenting an executive error card with "Reload Session" action.
* **Axios Response Interceptor**: Intercepts HTTP 401 Unauthorized (triggers clean logout and redirects to `/login`), HTTP 403 Forbidden (renders permission alert), and HTTP 500 (surfaces localized toast error without application crash).

### Server-Side `ExceptionHandlingMiddleware.cs`
* Centralized ASP.NET Core middleware wrapping the HTTP pipeline in a `try-catch` block:
```csharp
public async Task InvokeAsync(HttpContext context, RequestDelegate next)
{
    try
    {
        await next(context);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception occurred. TraceId: {TraceId}", context.TraceIdentifier);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        var errorResponse = new ErrorResponseDto
        {
            Error = "An unexpected error occurred. Please contact front desk support.",
            Code = "INTERNAL_SERVER_ERROR",
            TraceId = context.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };
        await context.Response.WriteAsJsonAsync(errorResponse);
    }
}
```

---

## 4. Performance & Caching Strategy

1. **Universal Search Debounce**: Input search queries are debounced at **300ms** to prevent intermediate filter thrashing while preserving perception of immediate responsiveness.
2. **Client-Side Indexing**: Reservations list is indexed in memory with pre-computed lowercase search tokens for substring scanning, ensuring search filter times consistently stay **below 50ms**.
3. **Room Matrix Memoization**: `useMemo` recomputes the 50-room occupancy matrix only when the `reservations` reference identity changes.
