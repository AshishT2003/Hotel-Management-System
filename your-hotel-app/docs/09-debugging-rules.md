# 09 - Troubleshooting & Debugging Field Guide

## 1. Local Development Setup & Diagnostic Checklist

Before initiating local debugging sessions, verify environment readiness against this checklist:

* [ ] **LocalDB Service Running**:
  ```powershell
  sqllocaldb info MSSQLLocalDB
  # If stopped, execute:
  sqllocaldb start MSSQLLocalDB
  ```
* [ ] **Database File Attachment**: Verify that `frontend_reservation.mdf` and `login_manager.mdf` are present in `infra/database/` and attached without permission locks.
* [ ] **Node.js Environment**: Verify `node -v` $\ge$ v18.0.0 and `npm -v` $\ge$ v9.0.0.
* [ ] **.NET SDK**: Verify `dotnet --version` $\ge$ 8.0.0.

---

## 2. Common Errors & Resolution Matrix

| Error Signature | Underlying Cause | Verified Remediation Procedure |
| :--- | :--- | :--- |
| **HTTP 401 Unauthorized** on API calls | JWT token expired (15 min lifespan) or missing `Bearer` prefix in header. | Inspect `sessionStorage.getItem('hotel_token')`. Re-authenticate at `/login` or check system clock synchronization. |
| **SqlException: Cannot open database requested by login** | LocalDB instance not started or MDF file locked by another process. | Run `sqllocaldb stop MSSQLLocalDB` followed by `sqllocaldb start MSSQLLocalDB`. Verify MDF file paths in `appsettings.json`. |
| **CORS Policy Error: No Access-Control-Allow-Origin** | Web API rejected client origin during preflight `OPTIONS` request. | Check `Program.cs` CORS policy: Ensure `http://localhost:5173` and `http://localhost:3000` are explicitly registered in `WithOrigins()`. |
| **Vite HMR Disconnected / WebSocket Refused** | Port collision or firewall blocking local WebSocket port. | Restart Vite using an alternate port: `npx vite --port 5174 --force`. |
| **Mark of the Web (.resx compilation failure)** | Windows blocked downloaded binaries. | Execute `Get-ChildItem -Recurse | Unblock-File` in PowerShell. |

---

## 3. Structured Logging Strategy & Correlation IDs

* **Server Logging (Serilog / Microsoft.Extensions.Logging)**:
  * Every incoming request receives an automatic `X-Correlation-ID` header.
  * Structured JSON logs written to `/logs/hotel-server-YYYY-MM-DD.log`:
  ```json
  {
    "Timestamp": "2026-09-29T11:55:00.123Z",
    "Level": "Information",
    "TraceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00",
    "SourceContext": "HotelApp.Server.Controllers.ReservationsController",
    "Message": "Reservation {ReservationId} successfully created for guest {GuestName}",
    "ReservationId": 1017,
    "GuestName": "Sophia Loren"
  }
  ```

---

## 4. Browser DevTools Diagnostic Protocol

1. **React Developer Tools**:
   * Inspect the `HotelContext.Provider` node in the component tree to observe real-time `roomStatusMap` mutations when toggling check-in.
   * Profile re-renders in `ReservationTable.tsx` to ensure search query inputs do not trigger full DOM redraws outside the table body.
2. **Network Tab**:
   * Filter requests by `Fetch/XHR`.
   * Verify response headers contain `Content-Type: application/json; charset=utf-8`.
   * Confirm sub-50ms timing on `GET /api/reservations`.

---

## 5. Embedded Postman Test Payloads

### Sample Login Request (cURL)
```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "adminPassword123"}'
```

### Sample Create Reservation Request (cURL)
```bash
curl -X POST https://localhost:5001/api/reservations \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alexander",
    "lastName": "Vance",
    "phoneNumber": "(312) 555-8821",
    "emailAddress": "avance@example.com",
    "roomType": "Suite",
    "roomNumber": "501",
    "numberGuest": 2,
    "arrivalTime": "2026-10-01",
    "leavingTime": "2026-10-05",
    "breakfast": 2,
    "lunch": 1,
    "dinner": 0,
    "paymentType": "Credit Card"
  }'
```
