# 05 - RESTful API Contract & Interface Specification

## 1. Global API Standards & Base Conventions
* **Base URI**: `https://localhost:5001/api/v1` (Production: `/api/v1`)
* **Data Format**: `Content-Type: application/json; charset=utf-8`
* **Authentication**: Bearer Token in HTTP Header: `Authorization: Bearer <jwt_token>`

### Standard Error Response Schema
```json
{
  "error": "The requested reservation ID 1099 could not be found.",
  "code": "RESOURCE_NOT_FOUND",
  "timestamp": "2026-09-29T11:45:00.000Z",
  "traceId": "00-848e02d6b3bb2-01"
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication: `POST /api/auth/login`
Authenticates credentials and grants a scoped JWT token.

* **Auth Required**: None (Public)
* **Request Body**:
```json
{
  "username": "admin",
  "password": "adminPassword123"
}
```
* **Success Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "role": "Admin",
  "user": {
    "username": "admin",
    "fullName": "Eleanor Vance",
    "email": "admin@grandhorizon.com"
  }
}
```
* **Error Response (401 Unauthorized)**:
```json
{
  "error": "Invalid username or password.",
  "code": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2026-09-29T11:45:00.000Z"
}
```

---

### 2.2 Reservations: `GET /api/reservations`
Retrieves filtered reservations matching optional query parameters.

* **Auth Required**: `Admin`, `Manager`
* **Query Parameters**:
  * `search` *(optional string)*: Query string matched against Name, Room, Phone, Email, City.
  * `status` *(optional string)*: `ALL` | `CHECKED_IN` | `RESERVED` | `WITH_DINING`
* **Success Response (200 OK)**:
```json
[
  {
    "id": 1011,
    "firstName": "Nazim",
    "lastName": "Amin",
    "phoneNumber": "(999) 999-9999",
    "emailAddress": "nazim@hotel.com",
    "numberGuest": 2,
    "roomType": "Double",
    "roomFloor": 2,
    "roomNumber": "205",
    "arrivalTime": "2026-09-28",
    "leavingTime": "2026-10-02",
    "checkIn": true,
    "breakfast": 2,
    "lunch": 1,
    "dinner": 2,
    "cleaning": true,
    "towel": true,
    "surprise": true,
    "supplyStatus": false,
    "foodBill": 59.00,
    "totalBill": 378.93
  }
]
```

---

### 2.3 Create Reservation: `POST /api/reservations`
Creates a new reservation record, assigns an available room, and calculates billing.

* **Auth Required**: `Admin`, `Manager`
* **Request Body**:
```json
{
  "firstName": "Sophia",
  "lastName": "Loren",
  "birthday": "1988-03-20",
  "gender": "Female",
  "phoneNumber": "(212) 555-0199",
  "emailAddress": "sophia.loren@luxury.com",
  "numberGuest": 3,
  "streetAddress": "789 5th Avenue",
  "aptSuite": "Penthouse 3",
  "city": "New York",
  "state": "NY",
  "zipCode": "10022",
  "roomType": "Suite",
  "roomNumber": "501",
  "arrivalTime": "2026-09-30",
  "leavingTime": "2026-10-04",
  "checkIn": false,
  "breakfast": 2,
  "lunch": 0,
  "dinner": 0,
  "cleaning": true,
  "towel": true,
  "surprise": true,
  "paymentType": "Credit Card",
  "cardType": "Visa",
  "cardNumber": "4242424242424242",
  "cardExp": "04/28",
  "cardCvc": "456"
}
```
* **Success Response (201 Created)**:
```json
{
  "id": 1017,
  "roomNumber": "501",
  "totalBill": 1139.55,
  "foodBill": 14.00,
  "status": "Reserved",
  "createdAt": "2026-09-29T11:46:00.000Z"
}
```

---

### 2.4 Kitchen Queue: `GET /api/kitchen/orders`
Retrieves all dining requests and room perks ordered by arrival/creation timestamp.

* **Auth Required**: `Admin`, `Kitchen`, `Manager`
* **Query Parameters**: `status` *(optional: `pending` | `served` | `all`)*
* **Success Response (200 OK)**:
```json
[
  {
    "orderId": 1011,
    "roomNumber": "205",
    "floor": 2,
    "guestName": "Nazim Amin",
    "phoneNumber": "(999) 999-9999",
    "breakfast": 2,
    "lunch": 1,
    "dinner": 2,
    "cleaning": true,
    "towel": true,
    "surprise": true,
    "supplyStatus": false,
    "orderedAt": "2026-09-28T10:00:00Z"
  }
]
```

---

### 2.5 Update Order Status: `PATCH /api/kitchen/orders/:id`
Marks an active kitchen ticket as served or pending.

* **Auth Required**: `Kitchen`, `Admin`, `Manager`
* **Request Body**:
```json
{
  "status": true
}
```
* **Success Response (200 OK)**:
```json
{
  "orderId": 1011,
  "roomNumber": "205",
  "supplyStatus": true,
  "updatedAt": "2026-09-29T11:47:00.000Z"
}
```

---

### 2.6 Room Matrix: `GET /api/rooms/matrix`
Returns the real-time status matrix of all 50 rooms across 5 floors.

* **Auth Required**: `Admin`, `Kitchen`, `Manager`
* **Success Response (200 OK)**:
```json
[
  {
    "floor": 1,
    "type": "Single",
    "price": 149.00,
    "rooms": [
      { "roomNumber": "101", "status": "Reserved", "guestName": "Ceaser Krit" },
      { "roomNumber": "102", "status": "Available", "guestName": null },
      { "roomNumber": "103", "status": "Occupied", "guestName": "George Zhang" }
    ]
  }
]
```
