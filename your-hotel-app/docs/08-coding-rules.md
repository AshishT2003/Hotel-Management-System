# 08 - Engineering Coding Standards & Guidelines

## 1. React & TypeScript Guidelines

1. **Functional Components Exclusively**: Never use legacy class components. All stateful logic must leverage React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
2. **Explicit Props Contracts**: Every component must declare an explicit TypeScript interface for its props. Never use `any`.
   ```typescript
   // Recommended:
   interface RoomCardProps {
     roomNumber: string;
     status: 'Available' | 'Reserved' | 'Occupied';
     onSelect: (roomNumber: string) => void;
   }
   export const RoomCard: React.FC<RoomCardProps> = ({ roomNumber, status, onSelect }) => { ... };
   ```
3. **Immutability in State Mutations**: Never mutate state variables directly. Always return new array copies (`[...prev, newItem]`) or object spreads (`{ ...prev, checkIn: true }`).
4. **Custom Hook Encapsulation**: Extract repetitive data-fetching or event-handling routines into custom hooks under `src/client/src/hooks/`.

---

## 2. ASP.NET Core 8 & C# Guidelines

1. **Mandatory Asynchronous Execution (`async`/`await`)**: All controller actions, service invocations, and database repository calls must be fully asynchronous down to the hardware driver:
   ```csharp
   // Recommended:
   [HttpGet("{id:int}")]
   public async Task<ActionResult<ReservationDto>> GetByIdAsync(int id, CancellationToken cancellationToken)
   {
       var reservation = await _reservationService.GetByIdAsync(id, cancellationToken);
       if (reservation == null) return NotFound();
       return Ok(reservation);
   }
   ```
2. **Dependency Injection**: Never instantiate services or repositories via the `new` keyword. Inject them through constructor injection using configured interfaces (`IReservationRepository`, `IBillingService`).
3. **Repository Pattern Isolation**: Controllers must delegate business logic to Services, and Services must delegate data operations to Repositories.

---

## 3. Database & SQL Rules

1. **Mandatory Query Parameterization**: Never concatenate user-supplied input into SQL strings. Always use `SqlParameter` or Entity Framework Core parameter bindings to prevent SQL Injection.
2. **No `SELECT *`**: Queries must explicitly name each required column to prevent network overhead, maintain binary schema contract stability, and maximize index covering efficiency:
   ```sql
   -- Prohibited:
   SELECT * FROM reservation;

   -- Required:
   SELECT Id, first_name, last_name, room_number, room_type, total_bill, check_in
   FROM reservation;
   ```
3. **Transaction Scopes**: Multi-table updates (e.g. creating a reservation and queuing a kitchen ticket) must be wrapped inside a `using var transaction = await _context.Database.BeginTransactionAsync()` block.

---

## 4. Tailwind CSS Rules

1. **Utility-First Integrity**: Avoid writing bespoke `.css` selector classes. Compose user interfaces using inline Tailwind utility classes.
2. **Theme Token Centralization**: Define all customized palette extensions (such as `hotel-900`, `gold-500`) in `tailwind.config.ts`.
3. **Conditional Class Merging**: Use `clsx` or `twMerge` utility functions when toggling state-dependent classes dynamically:
   ```typescript
   className={clsx(
     'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
     isOccupied ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
   )}
   ```

---

## 5. Commenting & Documentation Standards

* **JSDoc on Public Utilities**: All functions in `utils/` and `services/` must carry clear JSDoc parameter documentation:
  ```typescript
  /**
   * Calculates deterministic guest room charges, extra occupant fees, dining, and 7% tax.
   * @param {BillingParams} params - Calculation attributes including room rate, guest count, and meals.
   * @returns {InvoiceBreakdown} Detailed financial itemization.
   */
  export function calculateInvoice(params: BillingParams): InvoiceBreakdown { ... }
  ```
* **Inline Justification for Business Edge Cases**: Explain the rationale behind business rules:
  ```typescript
  // Extra guest surcharge applies only when party size reaches 3 or more occupants: (G - 2) * $25
  const extraGuests = guests >= 3 ? (guests - 2) * 25 : 0;
  ```
