# Grand Horizon Palace — Roles, Modules, Workflow & UI/UX Design System Specification

---

## 📌 Document Overview & Purpose

This document provides a comprehensive, enterprise-grade specification of all **User Roles**, their corresponding **Operational Modules**, detailed **Functional Capabilities**, end-to-end **Workflow Lifecycles**, core **Business Aims**, and the complete **UI/UX Design Architecture** across the Grand Horizon Palace Hotel Management System.

---

## 👑 Part 1: Comprehensive Role Architecture & Permission Matrix

The application establishes a clear Separation of Concerns (SoC) across four distinct user personas:

| Role Identifier | Role Title | Authentication & Access | Target Users | Core Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| `admin` (`frontend`) | **Front Desk Admin** | Credentials: `admin` / `admin`<br>Portal: `/login` | Front Desk Receptionists, Concierge, Night Auditors | Check-in/out, live room booking, folio generation, guest search, daily occupancy tracking. |
| `manager` | **General Manager** | Credentials: `manager` / `manager`<br>Portal: `/login` | Hotel GM, Operations Director, Financial Controller | Executive operational supervision, revenue oversight, room matrix audit, VIP reservation overrides. |
| `kitchen` | **Kitchen & Room Service** | Credentials: `kitchen` / `kitchen`<br>Portal: `/login` | Executive Chef, Line Cooks, In-Room Dining Expeditors | Real-time dining order fulfillment ("On The Line" queue), meal package preparation, room delivery routing. |
| `guest` | **Self-Service Guest** | **No Login Required** (Public Web)<br>Portal: `/guest` & `/guest/dashboard` | Hotel Guests, Walk-in Customers, Corporate Travelers | Independent direct booking wizard, instant rate transparency, reservation verification, self-service cancellation. |

### Role Permissions & Module Access Matrix

```
┌──────────────────────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Module / Capability                  │ Front Desk  │ General     │ Kitchen     │ Self-Service│
│                                      │ Admin       │ Manager     │ Staff       │ Guest       │
├──────────────────────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Staff Authentication Screen          │      ✅     │      ✅     │      ✅     │     N/A     │
│ Executive Operations Dashboard       │      ✅     │      ✅     │      ❌     │      ❌     │
│ Live 50-Room Occupancy Matrix        │      ✅     │      ✅     │      ❌     │      ❌     │
│ Guest Reservations Hub (CRUD)        │      ✅     │      ✅     │      ❌     │      ❌     │
│ Check-In / Check-Out Toggle          │      ✅     │      ✅     │      ❌     │      ❌     │
│ Guest Folio & Invoice Generation     │      ✅     │      ✅     │      ❌     │      ❌     │
│ 33-Column Reservation Modal Form     │      ✅     │      ✅     │      ❌     │      ❌     │
│ Kitchen Order Queue ("On The Line")  │  Read/Alert │  Read/Alert │ Full Manage │      ❌     │
│ Kitchen Order Status Fulfillment     │      ❌     │      ❌     │      ✅     │      ❌     │
│ Public Direct Booking Wizard         │      ❌     │      ❌     │      ❌     │      ✅     │
│ Guest Self-Service Dashboard         │      ❌     │      ❌     │      ❌     │      ✅     │
│ 48-Hour Free Cancellation Rule       │  Manual Over│  Manual Over│      ❌     │ Automated   │
└──────────────────────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🏛️ Part 2: Module-by-Module Functional & Workflow Breakdown

---

### Module 1: Staff Authentication & Security Gateway

- **Role Access**: Front Desk Admin (`admin`), General Manager (`manager`), Kitchen Staff (`kitchen`)
- **Route / Component**: [`LoginPage.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/LoginPage.jsx)
- **Main Aim**: Provide zero-friction, bulletproof access control that separates staff operational domains while projecting a high-luxury, branded impression from the very first interaction.

#### Detailed Functionality:
1. **Interactive Credential Input**: Controlled username and password fields with instant validation, inline error handling, and visual focus states.
2. **One-Click Demo Roles**: Quick-switch role selector chips (`Front Desk` and `Kitchen Staff`) allowing rapid role-switching for evaluation, demonstration, and shift handovers without manual typing.
3. **Session Persistence**: Writes secure authentication payloads to `localStorage` (`hotel_auth_session`), retaining user identity, name, assigned role, and login timestamp across browser refreshes.
4. **Role Routing**: Directs `frontend` roles directly to the Executive Dashboard, and routes `kitchen` roles immediately to the dedicated Kitchen Queue.
5. **Form Validation & Anti-Brute Feedback**: Triggers energetic horizontal shake animation (`.shake`) and contextual focus-management when credentials fail, guiding user focus to the offending field.

#### Step-by-Step Workflow:
```
[User Lands on Portal]
        │
        ▼
[Selects One-Click Demo Role OR Inputs Username & Password]
        │
        ├── Empty Inputs ──► [Input Border Highlights Crimson + Shake Effect]
        │
        └── Valid Format ──► [Submits Form]
                                    │
                                    ▼
                         [authService Authenticates]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          [Role === 'frontend' / 'admin']     [Role === 'kitchen']
                  │                                   │
                  ▼                                   ▼
       [Load Executive Dashboard]           [Load Kitchen Room Service Queue]
```

#### UI/UX Design System Implementation:
- **Atmospheric Visuals**: Deep Obsidian base background (`#060a12` with a subtle linear gradient to `#0b1424`) with dual fixed ambient glowing orbs (`.login-glow.g1` in emerald, `.login-glow.g2` in sky blue) with slow 16–20s CSS drift animation.
- **Glassmorphism & Lighting**: 2-column card enclosure with 26px rounded corners, micro-border (`rgba(255,255,255,0.02)`), and high-elevation drop shadow (`0 40px 80px -20px rgba(0,0,0,0.85)`).
- **Brand Storytelling**: Left hero panel featuring the golden/emerald crown-hotel vector badge with twinkling window lights (`twinkle` keyframe animation), and a luxury sweep light animation (`sweep` keyframe).
- **Button Micro-Interactions**: Primary sign-in button featuring 45° dynamic light shimmer on hover (`shine` animation), dynamic spinner during async resolution, and checkmark morph upon success.
- **Ergonomics & Motion**: Full support for `prefers-reduced-motion: reduce`, dropping animation durations to `.01ms` for accessibility compliance.

---

### Module 2: Executive Operations Dashboard

- **Role Access**: Front Desk Admin (`admin`), General Manager (`manager`)
- **Route / Component**: [`DashboardPage.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/DashboardPage.jsx)
- **Main Aim**: Give management and front-desk personnel immediate, high-level operational situational awareness over hotel occupancy, gross revenue, dining bottlenecks, and real-time walk-ins.

#### Detailed Functionality:
1. **Executive KPI Ribbon (4 Metric Cards)**:
   - **Total Gross Revenue**: Formatted currency figure calculating accumulated room charges, meals, amenities, and deterministic 7% tax.
   - **In-House Occupancy**: Real-time room count (e.g., `18 Rooms`) and occupancy percentage calculated against total 50-room capacity.
   - **Reserved Units**: Upcoming arrivals awaiting physical check-in and count of vacant walk-in units.
   - **Active Kitchen Orders**: Live tally of dining meals currently pending preparation in the kitchen.
2. **Floor-by-Floor Occupancy Matrix Bar**:
   - Visual breakdown across Floors 1 to 5 (Single, Double, Twin, Duplex, Suite).
   - Bi-color horizontal progress meters showing occupied (Rose `#f43f5e`) versus reserved (Amber `#f59e0b`) capacity per floor.
3. **Recent Bookings Activity Feed**:
   - Live chronological list of the last 5 reservations with reservation ID, guest full name, assigned room number, dates, formatted total bill, and check-in status pill.
4. **Quick Action Triggers**:
   - Primary "New Reservation" trigger opening the full reservation creation modal.
   - "View Room Matrix" deep-link jumping directly to the graphical floor grid.

#### Step-by-Step Workflow:
```
[Staff Logs In] ──► [Dashboard Initialized with HotelContext Data]
                           │
         ┌─────────────────┼─────────────────────────┐
         ▼                 ▼                         ▼
[Review KPI Cards]   [Inspect Floor Bars]   [Click 'New Reservation']
         │                 │                         │
         ▼                 ▼                         ▼
 [Detect Low Vacancy] [Jump to Floor Grid]     [Open 33-Column Modal]
```

#### UI/UX Design System Implementation:
- **Card Hierarchy**: Distinct elevation surfaces with `#0d1527` card containers, fine `#1e2a40` separators, and subtle 12px border radius.
- **Color Coding**: Semantic color mapping: Emerald for financial metrics, Indigo for occupancy, Amber for pending arrivals, and Rose for kitchen alerts.
- **Tabular Figures**: All currency figures and room statistics render with CSS `tabular-nums` to eliminate jitter when real-time numbers recalculate.
- **Responsive Stacking**: Automatically reflows from 4-column desktop grid to 2-column tablet and 1-column mobile layouts without horizontal scrollbars.

---

### Module 3: Room Availability Matrix & Floor Map (50 Units)

- **Role Access**: Front Desk Admin (`admin`), General Manager (`manager`)
- **Route / Component**: [`RoomsPage.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/RoomsPage.jsx), [`FloorGrid.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/components/rooms/FloorGrid.jsx)
- **Main Aim**: Eliminate room allocation friction and double-booking errors by visualizing the entire physical property across 5 tiers and 50 discrete rooms on an interactive floor map.

#### Detailed Functionality:
1. **Interactive 50-Room Grid**:
   - **Floor 1 (Rooms 101–110)**: Single Bed Tier ($149/night).
   - **Floor 2 (Rooms 201–210)**: Double Bed Tier ($299/night).
   - **Floor 3 (Rooms 301–310)**: Twin Bed Tier ($349/night).
   - **Floor 4 (Rooms 401–410)**: Duplex Suite Tier ($399/night).
   - **Floor 5 (Rooms 501–510)**: Presidential Suite Tier ($499/night).
2. **Three-State Real-Time Visual Coding**:
   - **Vacant (Available)**: Crisp emerald badge, soft emerald glow on hover, click-to-book action enabled.
   - **Reserved (Booked)**: Amber border and badge indicating guest has booked but not yet arrived.
   - **Occupied (In Room)**: High-contrast rose/crimson card indicating guest is currently residing in the room.
3. **One-Click Room Assignment**: Clicking any vacant room card instantly opens the Reservation Modal with the specific Room Number, Floor Number, and Room Type pre-populated and locked into the form.
4. **Live Summary Badges**: Top ribbon calculating dynamic tallies of Vacant, In-House, and Reserved rooms.

#### Step-by-Step Workflow:
```
[Staff Opens 'Room Matrix & Floors' Tab]
                  │
                  ▼
   [Scans 5-Tier Visual Floor Grid]
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
[Room Occupied/Reserved]  [Room Vacant]
     │                         │
     ▼                         ▼
[Hover Displays Guest Info] [Click on Room Card]
                               │
                               ▼
            [Reservation Modal Opens Pre-filled with Room & Tier]
```

#### UI/UX Design System Implementation:
- **Spatial Ergonomics**: Replicates the physical hotel layout. Floor 5 (Penthouse/Suites) at top down to Floor 1 at bottom.
- **Card Micro-Interactions**: Individual room tiles elevate with `transform: translateY(-2px)` on hover, with interactive cursor indicators (`cursor-pointer`).
- **Status Legends**: Persistent legend pill at top-right providing instant cognitive recognition of room statuses without ambiguity.

---

### Module 4: Guest Reservations Hub & Universal Record Table

- **Role Access**: Front Desk Admin (`admin`), General Manager (`manager`)
- **Route / Component**: [`ReservationsPage.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/ReservationsPage.jsx), [`ReservationTable.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/components/reservation/ReservationTable.jsx)
- **Main Aim**: Act as the single source of truth for hotel guest management, providing high-speed search, check-in status toggling, folio review, editing, and record maintenance.

#### Detailed Functionality:
1. **Universal Fast Search Engine (`useSearch` <50ms)**:
   - Instant search across Guest First Name, Last Name, Phone Number, Room Number, Gender, and Payment Method.
   - Zero UI lag with debounced internal filtering.
2. **Comprehensive Table Architecture**:
   - Displays ID, Guest Identity (name, contact, gender, address), Assigned Room & Tier, Arrival & Departure Dates, Meal & Service Perks chips, Total Bill with payment type, and Check-In Status.
3. **Operational Actions**:
   - **Check-In / Check-Out Toggle**: Instant 1-click status flip with optimistic UI update and toast confirmation.
   - **Edit Reservation**: Launches modal pre-loaded with current guest parameters for adjustments (extending stay, adding meals, changing card).
   - **Delete Reservation**: Protected deletion with confirm dialog, automatically releasing the room back to Vacant status.
4. **Interactive Sorting**: Column-header clicking to sort alphabetically or numerically by guest name, check-in date, room number, or total bill.

#### Step-by-Step Workflow:
```
[Guest Arrives at Reception Desk]
               │
               ▼
[Receptionist Types Guest Name/Phone in Universal Search]
               │
               ▼
[Matching Record Found in <50ms]
               │
      ┌────────┴──────────────────────────┐
      ▼                                   ▼
[Clicks 'Check In']            [Clicks 'Edit' to Modify]
      │                                   │
      ▼                                   ▼
[Status Changes to Checked-In]    [Extend Dates / Add Meals]
[Room Tile Turns Red/Occupied]    [Invoice Recomputed + Saved]
```

#### UI/UX Design System Implementation:
- **Contrast & Legibility**: Dark table body (`#0a1120`) with alternating row hover states (`#131e36`) and 1px border lines (`#1e2a40`).
- **Meal & Perk Badges**: Micro-tags with distinct colorways:
  - Breakfast: Amber pill (`bg-amber-950/40 text-amber-300`)
  - Lunch: Sky Blue pill (`bg-sky-950/40 text-sky-300`)
  - Dinner: Violet pill (`bg-violet-950/40 text-violet-300`)
  - Cleaning / Towels: Emerald / Indigo pills
  - Sweet Surprise: Rose pill with sparkle icon
- **Status Indicators**: Pulsing green dot for `Checked-In`, static amber dot for `Reserved`.

---

### Module 5: 33-Column Reservation & Folio Modal

- **Role Access**: Front Desk Admin (`admin`), General Manager (`manager`)
- **Route / Component**: [`ReservationModal.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/components/reservation/ReservationModal.jsx), [`pricing.js`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/utils/pricing.js)
- **Main Aim**: Guarantee 100% data integrity for hotel guest registrations while executing the exact enterprise deterministic billing formula.

#### Detailed Functionality:
1. **Guest Demographic & Contact Data**: First name, last name, phone, email, gender, birthday date picker, street address, city, state, zip code.
2. **Room Allocation & Scheduling**: Room type selection, room number picker (filtered to vacant rooms for chosen tier), check-in date, check-out date, total night calculation.
3. **Dining & Service Options**:
   - Breakfast ($7/person/day), Lunch ($15/person/day), Dinner ($15/person/day).
   - Housekeeping cleaning checkbox, fresh towels checkbox, Sweet Surprise welcome gift ($25).
4. **Deterministic Billing Engine**:
   - Base Room Rate $\times$ Nights
   - Extra Guest Surcharge: $(\text{Guests} - 2) \times \$25 \times \text{Nights}$
   - Dining Charges: Total Meal Packages $\times$ Guests $\times$ Nights
   - Amenities: Fixed amenity package rates
   - Deterministic 7% Tax: $\text{Round}(\text{Subtotal} \times 0.07, 2)$
   - Total Gross Due
5. **Payment Method & Card Processing**: Credit card, Debit card, Cash on arrival; credit card number and expiration fields with client-side masking.

#### Step-by-Step Workflow:
```
[Modal Triggered via 'New Reservation' or Grid Click]
                         │
                         ▼
[Step 1: Input Guest Identity & Contact Details]
                         │
                         ▼
[Step 2: Select Dates & Room Tier -> Auto-calculates Nights]
                         │
                         ▼
[Step 3: Toggle Dining Packages & Luxury Amenities]
                         │
                         ▼
[Live Billing Breakdown Auto-updates Line-by-Line with 7% Tax]
                         │
                         ▼
[Step 4: Select Payment Method & Submit]
                         │
                         ▼
[Record Saved in Database -> Toast Notification -> Room Status Locked]
```

#### UI/UX Design System Implementation:
- **Modal Viewport Handling**: Centered modal overlay with blurred backdrop (`backdrop-blur-md bg-black/60`), constrained height (`max-h-[90vh]`), and smooth scrollable form body.
- **Sticky Financial Summary**: Sticky bottom bar displaying Live Total Due so staff never loses sight of the financial impact while adjusting options.
- **Real-Time Input Scrubbing**: Phone numbers auto-formatted; currency fields rendered with prefix labels and tabular figures.

---

### Module 6: Kitchen & Room Service Fulfillment Queue ("On The Line")

- **Role Access**: Kitchen Staff (`kitchen`), Front Desk (Read / Alerts only)
- **Route / Component**: [`KitchenPage.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/KitchenPage.jsx), [`OrderQueue.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/components/kitchen/OrderQueue.jsx)
- **Main Aim**: Enable kitchen expeditors and culinary staff to manage in-room meal orders in real-time, eliminating lost dining slips and accelerating meal delivery.

#### Detailed Functionality:
1. **Real-Time Order Ingestion**: Aggregates all dining selections (Breakfast, Lunch, Dinner) tied to in-house occupied and reserved rooms.
2. **Three-Tier Kitchen State Pipeline**:
   - **Pending ("Order Placed")**: Newly booked meals awaiting chef acknowledgment.
   - **In Preparation ("On The Line")**: Actively being cooked by line chefs.
   - **Delivered / Completed**: Handed off to room service runners and served to guest.
3. **Room & Guest Identification**: Highlights target Room Number in prominent large typography (e.g., `Room 405`), guest name, order timestamp, and any special dietary flags.
4. **Header Alert Integration**: Emits real-time order badge counters in the top Navbar so front desk is continuously aware of kitchen backlogs.

#### Step-by-Step Workflow:
```
[Front Desk Books Reservation with Dining / Guest Checks In]
                          │
                          ▼
[Order Lands in Kitchen Queue as 'Pending' with Amber Alert]
                          │
                          ▼
[Chef Clicks 'Start Cooking' -> Status Moves to 'In Prep' (Blue/Cyan)]
                          │
                          ▼
[Meal Prepared & Plated -> Runner Assigned]
                          │
                          ▼
[Chef Clicks 'Mark Delivered' -> Status Moves to 'Completed' (Emerald)]
```

#### UI/UX Design System Implementation:
- **Kitchen Ergonomics**: High-contrast dark cards optimized for wall-mounted kitchen monitors or tablets.
- **Card-Level Color Hierarchy**:
  - Pending: Amber borders with pulsing dot
  - Cooking: Electric Cyan accents
  - Delivered: Soft emerald checkmarks
- **Large Action Buttons**: Generously padded buttons (`py-3 px-4`) to accommodate touchscreen kitchen tablets.

---

### Module 7: Public Guest Self-Service Booking Wizard (Direct Portal)

- **Role Access**: Self-Service Guest (`guest`) — **No Login Required**
- **Route / Component**: [`GuestPortal.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/GuestPortal.jsx), [`GuestBookingWizard.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/components/guest/GuestBookingWizard.jsx)
- **Main Aim**: Empower prospective hotel guests to browse room availability, select dining upsells, review itemized pricing with 7% tax, and book directly without front-desk mediation, driving direct bookings and eliminating 15–25% OTA commissions.

#### Detailed Functionality:
1. **Step 1: Stay Dates & Occupancy**:
   - Dual-date range selector with automated nights calculator and past-date blocking.
   - Adult and children counters with automatic extra-guest surcharge calculations ($25/night/guest above 2).
2. **Step 2: 5-Tier Room Selection**:
   - Visual room showcase cards with high-definition imagery, room dimensions (sq ft), bed configurations, and amenity tags.
   - Filter tabs across all 5 tiers (Single $149, Double $299, Twin $349, Duplex $399, Suite $499).
   - Real-time urgency chips (e.g., *"Only 2 rooms left for your dates!"*).
3. **Step 3: Guest Identity & Dining Upsells**:
   - Guest contact form (first/last name, email, phone, special requests).
   - Culinary package selectors: Artisan Breakfast ($7), Executive Lunch ($12), Chef's Dinner ($15).
   - Luxury amenity perks: Egyptian Cotton Towels, Housekeeping, Sweet Surprise Gift Basket ($25).
4. **Step 4: Transparent Invoice Review & Payment**:
   - Itemized transparent invoice showing base stay, dining total, amenity addons, and explicit deterministic 7% tax line.
   - Payment method toggle: "Pay at Front Desk upon Arrival" vs "Credit/Debit Card".
   - 48-Hour Free Cancellation policy agreement checkbox.
5. **Step 5: Confirmation Voucher**:
   - Generates unique hotel confirmation code in format `GH-{RESERVATION_ID}-{YEAR}`.
   - 1-click clipboard copy button.
   - Print invoice/voucher button (`window.print()`).
   - Deep links to Guest Self-Service Dashboard.

#### Step-by-Step Workflow:
```
[Guest Visits /guest]
         │
         ▼
[Step 1: Pick Dates & Guest Count] ──► [Validates > 0 nights & Valid Dates]
         │
         ▼
[Step 2: Choose Room Tier from Available Units] ──► [Selects Room 304 (Twin $349)]
         │
         ▼
[Step 3: Fills Name, Email, Phone + Toggles Dining] ──► [Live Sticky Folio Updates]
         │
         ▼
[Step 4: Agrees to Cancellation Policy & Confirms] ──► [Calls /api/guest/book]
         │
         ▼
[Step 5: Voucher Generated (GH-1042-2026) + Option to Print Receipt]
```

#### UI/UX Design System Implementation:
- **Progress Stepper Bar**: 5-step horizontal tracker with animated progress fill and active pulse rings.
- **Trust Badges**: Integrated "Best Rate Guarantee", "Flexible 48h Cancellation", and "SSL Encrypted Checkout" trust indicators.
- **Mobile-First Responsive Layout**: Floating bottom summary tray on mobile viewports so guests can always see room selection and proceed without scrolling back up.

---

### Module 8: Guest Self-Service Dashboard (Look-Up & Cancellation)

- **Role Access**: Self-Service Guest (`guest`) — **No Login Required**
- **Route / Component**: [`GuestDashboard.jsx`](file:///c:/Users/ashut/Downloads/HotelManagement-master/frontend/src/pages/GuestDashboard.jsx)
- **Main Aim**: Give guests self-service autonomy to view their bookings and execute cancellations under the 48-hour free cancellation policy without placing phone calls to the front desk.

#### Detailed Functionality:
1. **Email-Based Booking Lookup**: Guest inputs their reservation email address to retrieve all active and past bookings associated with their account.
2. **Interactive Reservation Folios**: Displays room number, tier, check-in and check-out dates, nights, payment status, and confirmation code.
3. **Automated 48-Hour Cancellation Rule Engine**:
   - Calculates time delta between current timestamp and scheduled Check-In time.
   - If $\Delta t \ge 48\text{ hours}$: Displays green "Eligible for 100% Free Cancellation" badge and active "Cancel Reservation" button.
   - If $\Delta t < 48\text{ hours}$: Displays amber warning notice stating booking is inside the non-refundable window and directs guest to contact the front desk concierge.
4. **Safety Confirmation Modal**: Requires explicit confirmation prior to cancelling, preventing accidental cancellations.

#### Step-by-Step Workflow:
```
[Guest Enters Booking Email Address]
                 │
                 ▼
[Fetches Active Bookings via /api/guest/bookings/{email}]
                 │
                 ▼
[Displays Reservation Card with Cancellation Window Status]
                 │
       ┌─────────┴────────────────────────┐
       ▼                                  ▼
[Check-In > 48h Away]            [Check-In < 48h Away]
       │                                  │
       ▼                                  ▼
[Eligible for Full Refund]       [Inside Non-Refundable Window]
       │                         [Shows Concierge Contact Prompt]
       ▼
[Clicks 'Cancel Reservation']
       │
       ▼
[Modal Asks for Confirmation]
       │
       ▼
[Status Updated to 'Cancelled' -> Room Released to Matrix Inventory]
```

---

## 🎨 Part 3: Design System, Tokens, Typography & UX Philosophy

### 1. Executive Color Token Palette

```
Semantic Token          Hex Code       RGB / HSL Equivalent        Application
─────────────────────────────────────────────────────────────────────────────────────────────
Surface Canvas          #060a12        rgba(6, 10, 18, 1)          Page background, outer frame
Surface Elevated (Card) #0d1527        rgba(13, 21, 39, 1)         Content cards, tables, modals
Surface Inset / Input   #0a1120        rgba(10, 17, 32, 1)         Form inputs, code chips
Border Subtle           #1e2a40        rgba(30, 42, 64, 1)         Card borders, dividers
Brand Primary (Emerald) #10b981        rgb(16, 185, 129)           Primary CTAs, success, badges
Brand Accent (Teal)     #14b8a6        rgb(20, 184, 166)           Gradient blends, active tabs
Warning / Reserved      #f59e0b        rgb(245, 158, 11)           Reserved rooms, kitchen pending
Critical / Occupied     #f43f5e        rgb(244, 63, 94)            Occupied rooms, cancellations
Text High-Contrast      #ffffff        rgb(255, 255, 255)          Headings, primary values
Text Muted Secondary    #94a3b8        rgb(148, 163, 184)          Subtitles, labels, metadata
Text Dimmed Tertiary    #64748b        rgb(100, 116, 139)          Captions, disabled states
```

### 2. Typography Hierarchy

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Monospace Family** (for Codes, Folios, Timestamps): "SF Mono", Menlo, Monaco, Consolas, monospace.
- **Display Scale**:
  - `Hero / Title`: 32px–42px, Font-Weight 800/900, Letter-Spacing `-0.03em`.
  - `Section Heading`: 20px–24px, Font-Weight 700/800, Letter-Spacing `-0.02em`.
  - `Card Header`: 14px–16px, Font-Weight 700.
  - `Body Standard`: 13px–14px, Font-Weight 400/500, Line-Height `1.6`.
  - `Micro Tag / Pill`: 9px–11px, Font-Weight 700, Letter-Spacing `+0.05em`, Uppercase.
  - `Financial & Statistical Figures`: Rendered with CSS `tabular-nums` ensuring fixed character widths.

### 3. Micro-Interactions & Kinetic Design
- **Entrance Choreography**: Staggered upward translation using the `.rise` utility class (`animation: rise .7s cubic-bezier(.16,1,.3,1) var(--d) forwards`).
- **Interactive Hover Affordance**: Buttons and room tiles shift upward by `-2px` to `-3px` with elevation shadow expansion (`box-shadow: 0 10px 24px -10px rgba(0,0,0,.7)`).
- **Physical Feedback**: Input failures trigger an instantaneous spring shake (`.shake`) modeled after physical inertia.
- **Real-Time Heartbeat**: Status indicators feature subtle pulsing rings (`animate-pulse` and `animate-ping`) providing live assurance that the system is operating in real-time.

### 4. Accessibility (WCAG 2.1 AA) Compliance
- **Color Contrast**: All primary text against `#0d1527` surfaces achieves a contrast ratio $> 7.2:1$ (exceeding WCAG AAA standards). Muted secondary text achieves $> 4.8:1$ (exceeding WCAG AA).
- **Focus Rings**: All interactive buttons, cards, and inputs feature high-visibility emerald focus rings (`focus-visible:outline-2 focus-visible:outline-emerald-500 outline-offset-2`).
- **ARIA Semantics**: Form inputs utilize explicit `<label htmlFor="...">`, errors utilize `role="alert"`, and status updates utilize `aria-live="polite"`.
- **Motion Reduction**: Comprehensive `@media (prefers-reduced-motion: reduce)` style block neutralizing all transitions and keyframe animations for vestibular disorder safety.

---

## 📐 Part 4: Mathematical Formulations & Billing Engine

The system executes a strictly deterministic calculation for all folios, walk-ins, and online guest reservations:

$$\text{Nights} = \max\left(1, \left\lceil \frac{\text{CheckOut} - \text{CheckIn}}{86400000} \right\rceil\right)$$

$$\text{RoomSubtotal} = \text{BaseRate}(\text{RoomType}) \times \text{Nights}$$

$$\text{ExtraGuestFee} = \max(0, \text{Guests} - 2) \times \$25 \times \text{Nights}$$

$$\text{DiningSubtotal} = (\text{BreakfastCount} \times \$7 + \text{LunchCount} \times \$12 + \text{DinnerCount} \times \$15) \times \text{Guests} \times \text{Nights}$$

$$\text{AmenitiesSubtotal} = \sum \text{SelectedAmenityFees}$$

$$\text{NetSubtotal} = \text{RoomSubtotal} + \text{ExtraGuestFee} + \text{DiningSubtotal} + \text{AmenitiesSubtotal}$$

$$\text{TaxAmount} = \text{Round}(\text{NetSubtotal} \times 0.07, 2)$$

$$\mathbf{\text{GrandTotal}} = \text{NetSubtotal} + \text{TaxAmount}$$

---

## 🏁 Summary: System Value Proposition

1. **For Hotel Management**: Complete, uncompromised real-time visibility over room inventory and cash flow.
2. **For Front Desk Staff**: Sub-second guest lookups, 1-click check-in/out, and error-free room assignments.
3. **For Kitchen Expeditors**: Zero misplaced dining slips with a dedicated real-time prep queue.
4. **For Hotel Guests**: Beautiful, transparent, mobile-responsive self-service booking with instant confirmation and automated 48-hour free cancellation rights.
