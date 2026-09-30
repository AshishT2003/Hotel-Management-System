# 06 - UI/UX Design System & Human-Computer Interaction (HCI) Report

## 1. Design Philosophy: Executive Hospitality Aesthetic
The user interface combines modern high-density operational data management with an elegant, executive hospitality aesthetic. The visual hierarchy utilizes soft borders, glassmorphic header accents, and clear semantic status colors that convey operational state without cognitive overload.

---

## 2. Design Tokens & Palette Specifications

```css
:root {
  /* Primary Surface Shades */
  --color-hotel-50:  #f8fafc;
  --color-hotel-100: #f1f5f9;
  --color-hotel-200: #e2e8f0;
  --color-hotel-700: #334155;
  --color-hotel-800: #1e293b;
  --color-hotel-900: #0f172a;
  --color-hotel-950: #020617;

  /* Semantic State Tokens */
  --color-available: #10B981; /* Emerald-500: Available room unit, success states */
  --color-reserved:  #F59E0B; /* Amber-500: Reserved/Pending check-in, alert tickets */
  --color-occupied:  #F43F5E; /* Rose-500: Checked-in guest in room, critical action */
  --color-gold:      #FBBF24; /* Amber-400: VIP guest amenities & billing highlights */

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif; /* Hero titles, receipt headers */

  /* Base Spacing Grid: 4px Increments */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1.0rem;  /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2.0rem;  /* 32px */
}
```

---

## 3. End-to-End User Journey Maps

```text
[1. Guest Arrival]
   Front Desk searches guest by name / phone (<50ms filter)
   ↓
[2. Check-In Confirmation]
   Clicks "Check In" -> Room changes from Amber (Reserved) to Rose (Occupied)
   ↓
[3. Room Dining Request]
   Guest orders breakfast & clean towels -> Ticket posted immediately to Kitchen Desk
   ↓
[4. Kitchen Preparation]
   Kitchen staff prepares tray -> Clicks "Mark Order as Served" -> Supply status marked true
   ↓
[5. Guest Departure]
   Front Desk clicks "Check Out" -> System generates automated 7% tax itemized invoice
```

---

## 4. Component Library & Prop Contracts

### 4.1 `RoomCard.tsx`
Renders an individual room tile with live occupancy badge, rate tier, and quick-booking action.
```typescript
interface RoomCardProps {
  roomNumber: string;
  floor: number;
  type: 'Single' | 'Double' | 'Twin' | 'Duplex' | 'Suite';
  price: number;
  status: 'Available' | 'Reserved' | 'Occupied';
  occupantName?: string;
  checkoutDate?: string;
  onSelect: (roomNumber: string, type: string) => void;
}
```

### 4.2 `InvoiceModal.tsx`
Displays the finalized guest billing calculation with full transparent breakdown.
```typescript
interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    id: number;
    guestName: string;
    roomNumber: string;
    roomType: string;
    nights: number;
    roomSubtotal: number;
    guestSurcharge: number;
    foodBill: number;
    taxAmount: number;
    finalTotal: number;
    paymentType: string;
    cardLast4: string;
  };
  onPrint?: () => void;
}
```

### 4.3 `KitchenQueueCard.tsx`
Displays pending meal orders with checklist tokens for dining and amenities.
```typescript
interface KitchenQueueCardProps {
  orderId: number;
  roomNumber: string;
  floor: number;
  guestName: string;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  housekeepingRequested: boolean;
  freshTowelsRequested: boolean;
  sweetSurpriseRequested: boolean;
  isServed: boolean;
  onMarkServed: (orderId: number) => void;
}
```

---

## 5. Accessibility & Usability Checklist (WCAG 2.1 AA)

* [x] **Contrast Ratio Validation**: Text color `#0f172a` against background `#ffffff` produces a contrast ratio of **15.4:1** (exceeds WCAG 4.5:1 requirement).
* [x] **Keyboard Navigation**: Form inputs, action buttons, and modal dialogs support sequential `Tab` and `Shift+Tab` cycles.
* [x] **Focus Ring Visibility**: Every interactive element includes explicit focus styling: `focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`.
* [x] **Modal Accessibility**: Dialogs attach `aria-modal="true"`, capture `aria-labelledby`, and bind the `Escape` key listener.
* [x] **Non-Color Dependence**: Every room state and order status includes an explicit textual label in addition to its color-coded indicator dot.
