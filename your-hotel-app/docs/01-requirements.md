# 01 - Requirements Specification Document (SRS)

## 1. Project Vision & Business Objectives
The **Grand Horizon Palace Hotel Management System** is an enterprise-grade hospitality operations platform designed to eliminate operational friction across front-office bookings, housekeeping synchronization, dining service fulfillment, and automated guest auditing.

### Primary Business Goals:
* **Streamline Front-Office Operations**: Reduce guest check-in/out registration duration to under 45 seconds through automated room allocation and instant occupancy visualization.
* **Eliminate Invoicing Discrepancies**: Replace manual calculation of room tariffs, extra guest tiers, and meal orders with a deterministic billing calculator applying an exact 7% municipal hotel tax.
* **Real-Time Kitchen & Dining Visibility**: Provide a live FIFO (First-In, First-Out) "On The Line" queue bridging guest service requests with kitchen preparation staff.
* **Zero Operational Latency**: Deliver instantaneous search and filtering capabilities (<50ms filter time) over all active and historic guest records.

---

## 2. Stakeholder User Personas

| Persona | Role | Primary Responsibilities & Pain Points | System Permissions |
| :--- | :--- | :--- | :--- |
| **Eleanor Vance** | Front Desk Admin | Manages daily walk-in guests, reservations, phone inquiries, room changes, and checkout settlement. Needs immediate feedback on room cleanliness and vacant units. | Full CRUD on reservations, check-in/out transitions, room matrix view, guest invoice generation. |
| **Chef Marco Silva** | Kitchen Staff | Oversees kitchen banquet preparation, breakfast batches, and room service deliveries. Needs live order tickets grouped by room number without administrative clutter. | Read-only access to room occupancy; full write access to order fulfillment state ("Mark as Served"). |
| **Arthur Pendelton** | General Manager | Audits revenue totals, occupancy yields, staff activity, and handles rate overrides or booking cancellations. | Global administrative oversight; rate overrides; audit logs; user management. |

---

## 3. Functional Requirements (FR-01 to FR-08)

### FR-01: Role-Based Authentication & Session Management
* **Description**: Secure credential authentication distinguishing Front Desk, Kitchen Staff, and General Manager.
* **Acceptance Criteria**:
  * Users authenticate via username and password over HTTPS/WSS.
  * System issues a signed JWT token with a 15-minute expiration and role claim (`Role: Admin | Kitchen | Manager`).
  * Unauthorized route access redirects immediately to `/login` with an informative error toast.

### FR-02: 50-Room Interactive Inventory & Matrix
* **Description**: Complete visual mapping of 50 physical hotel rooms distributed across 5 floors.
* **Acceptance Criteria**:
  * Floors 1–5 mapped to Standard ($149), Deluxe ($299), and Suite ($499) tiers.
  * Color-coded statuses: Available (Emerald Green), Reserved/Pending (Amber), Occupied (Rose Red).
  * Room state updates reactively within <100ms across all connected client interfaces upon state mutation.

### FR-03: Complete Guest Reservation CRUD Lifecycle
* **Description**: End-to-end booking lifecycle including creation, modification, cancellation, and retrieval.
* **Acceptance Criteria**:
  * Captures guest personal data (First, Last, Phone, Email, DOB, Gender), address, stay dates, and room selection.
  * Prevents double-booking: A room marked Reserved or Occupied cannot be assigned to overlapping date ranges.
  * Soft-deletion/cancellation supported with confirmation prompt.

### FR-04: Universal Instant Search
* **Description**: High-performance debounced client-side and server-side filtering across the entire reservation dataset.
* **Acceptance Criteria**:
  * Search responds in **<50ms** for active dataset queries.
  * Multi-attribute query parsing across Guest Name, Booking ID, Room Number, Phone, City, State, and Email.
  * Case-insensitive matching with highlighted query tokens.

### FR-05: Check-In & Check-Out State Transitions
* **Description**: Discrete state transitions changing guest occupancy status.
* **Acceptance Criteria**:
  * Check-in transition sets `checkIn = true`, transitioning room state from Reserved to Occupied.
  * Check-out transition closes the booking, marks room for housekeeping, and generates finalized invoice.

### FR-06: Dining Perks & Hospitality Add-Ons
* **Description**: Itemized room dining packages and housekeeping preferences.
* **Acceptance Criteria**:
  * Captures quantities for Breakfast ($7), Lunch ($12), and Dinner ($15).
  * Records special requests: Housekeeping Cleaning, Fresh Towels, and Sweet Surprise Gift Basket.
  * Calculates food bill subtotal dynamically upon selection.

### FR-07: Kitchen "On The Line" FIFO Queue
* **Description**: Real-time kitchen display system (KDS) displaying pending meal preparation and delivery tickets.
* **Acceptance Criteria**:
  * Tickets ordered in FIFO queue by submission timestamp.
  * Displays Room Number, Guest Name, itemized meal counters, and hospitality flags.
  * Single-click action "Mark Order as Served" updates `supplyStatus = true` and removes ticket from active queue.

### FR-08: Automated Guest Billing & Tax Invoicing
* **Description**: Deterministic invoice generation enforcing verified pricing and tax equations.
* **Acceptance Criteria**:
  * Surcharge applied: $(G - 2) \times \$25$ for $G \ge 3$ guests.
  * Tax calculated: Fixed 7% on $(Room + ExtraGuests + Meals)$.
  * Produces itemized bill modal with printable receipt breakdown.

---

## 4. Non-Functional Requirements (NFR)

* **NFR-01: Performance**: Client-side filtering executes in <50ms. API response time for CRUD operations < 120ms at $p95$. Initial web bundle size < 350KB gzipped.
* **NFR-02: Security**: Passwords hashed using ASP.NET Core Identity password hasher (PBKDF2 with HMAC-SHA256). JWT tokens signed with HMAC-SHA512. CORS strictly restricted to authorized client origins.
* **NFR-03: Data Consistency & ACID Guarantees**: Database transactions executed under `READ COMMITTED` isolation level in SQL Server LocalDB to prevent dirty reads.
* **NFR-04: Accessibility**: 100% compliance with WCAG 2.1 Level AA standards. Contrast ratios $\ge 4.5:1$ for normal text and $\ge 3:1$ for large text and UI components. Full keyboard tab navigation with visible focus rings (`focus:ring-2 focus:ring-emerald-500`).
* **NFR-05: Reliability & Error Recovery**: Client gracefully handles transient network drops using offline cache fallbacks and clear non-blocking notification banners.

---

## 5. Scope Boundaries

### In Scope:
* 50-room on-premise hotel management for single property.
* Dual React 18 SPA client and ASP.NET Core 8 REST Web API.
* SQL Server LocalDB database with attached `.mdf` storage.
* Role-based front desk, kitchen queue, and billing workflows.

### Out of Scope:
* External third-party payment gateway merchant processing (Stripe/PayPal live processing).
* Multi-tenant hotel chain franchise management.
* Native mobile applications (iOS/Android store builds).
* Integrated PBX telephone hardware switching.
