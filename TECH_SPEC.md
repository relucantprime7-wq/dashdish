# TECH_SPEC.md — DashDish

> Audience: AI coding agent. This file defines *how* the system is built: stack, architecture, component structure, and the mechanisms that structurally enforce `PRODUCT_SPEC.md`'s non-negotiable rules (especially price consistency).

---

## 1. Stack

**Frontend:** React + TypeScript (React Native/Expo if targeting native mobile; React + Vite if targeting responsive web — component architecture below is framework-agnostic and applies to either).
- Styling: Tailwind CSS (or a themed styled-components setup) driven by the design tokens in `UX_SPEC.md §A.1–A.3`.
- Server state/caching: React Query (or equivalent) for all server-fetched data.
- Client state: lightweight global store (Context + reducer, or Zustand) for cart, session, active order.
- Forms: a schema-based validation library (e.g., Zod + React Hook Form) so validation rules are declarative and shared between client and server where possible.

**Backend:** Node.js + TypeScript (Express or Fastify), or equivalent typed backend framework.
- Database: PostgreSQL (relational integrity matters here — orders, pricing, and snapshots are relational by nature).
- Real-time: WebSocket (or SSE) for order tracking; polling fallback required.
- Payments: Stripe (or equivalent) — server never stores raw card data, only provider tokens.
- Auth: JWT-based session tokens, or provider-managed auth (e.g., Auth0/Firebase Auth) — either is acceptable; the requirement is that `Authorization` is required on all mutating endpoints.

**Infra assumptions (hackathon-appropriate, but structured to be production-extendable):**
- Single deployable backend service internally organized into modules per `§3 Backend Services`, not literally separate microservices, unless time allows.
- Environment-based config (never hard-coded secrets/URLs in source).

---

## 2. Guiding Architectural Principle: Single Source of Pricing Truth

This is the most important structural decision in the codebase and must be implemented before other features depend on it.

- **One function, one endpoint.** All order-total computation — on the Item Customization sheet, Cart, Checkout, Reorder Confirmation, and Receipt — must call the same underlying logic:
  - Client-side: a shared `calculateOrderTotal()` utility used for *live, optimistic* UI updates (e.g., price ticking as the user selects customization options).
  - Server-side: `POST /pricing/calculate` is the **authoritative** calculation, called again at order creation regardless of what the client displayed, and the server's number is what's actually charged.
- **No screen may hardcode or independently derive a total.** Every price-displaying component receives its numbers from either the shared client utility or the `/pricing/calculate` response — never from ad hoc arithmetic in a component.
- **Snapshot on order creation.** Once an order is placed, its line items, prices, and fee breakdown are copied (snapshotted) into `order_items` / `orders` tables (see `DATABASE_SPEC.md`) so that later menu/price changes at the restaurant never retroactively alter a placed order's receipt.

This principle is what makes `PRODUCT_SPEC.md`'s `PRICE-CONSISTENCY` rule enforceable in code rather than just a design intention.

---

## 3. Backend Services (Logical Modules)

Implement as separate modules/directories within one backend service; keep boundaries clean so they could be split into real microservices later without a rewrite.

### 3.1 Auth Service
- Signup, login, logout, session/token issuance and validation.

### 3.2 Catalog Service
- Restaurants, menu categories, menu items, customization groups/options, availability flags.
- Owns restaurant open/closed status and item-level availability.

### 3.3 Pricing Service
- `calculateOrderTotal(restaurantId, items[], addressId, tipCents)` → `{ subtotal, deliveryFee, serviceFee, tax, tip, total }`.
- Pure function of inputs — no side effects, no DB writes — so it can be called repeatedly (cart preview, checkout, reorder) without risk.
- Delivery fee logic: function of distance/time-of-day (see `§5 ETA & Fee Computation`).

### 3.4 Order Service
- Order creation (idempotent — see `§6`), order status state machine, order history queries.
- Emits status-change events consumed by Tracking and Notification services.

### 3.5 Tracking Service
- Ingests courier location updates (simulated feed acceptable for hackathon scope — see `§5`).
- Computes/recomputes ETA at defined transitions.
- Publishes live updates to subscribed clients (WebSocket/SSE).

### 3.6 Notification Service
- Push/SMS/in-app notification on order status changes, especially ETA-slip and cancellation (per `PRODUCT_SPEC.md §7` edge cases).

### 3.7 User/Profile Service
- Addresses (with delivery-range validation), favorites, profile fields.

### 3.8 Payment Service
- Wraps the payment provider SDK; handles auth/capture and refunds; never persists raw card data (tokens only, per `DATABASE_SPEC.md`).

**Internal communication:** REST between client and backend; internal event emission (in-process event emitter is sufficient at hackathon scale, structured so it could become a real message queue later) from Order Service → Tracking Service → Notification Service on status transitions.

---

## 4. Frontend Architecture

### 4.1 State Layers

| Layer | Scope | Example |
|---|---|---|
| Server state (React Query) | Anything fetched from the API | menu data, order status, addresses |
| Global client state | Cross-screen, session-lived | cart contents, active order id, auth session |
| Local component state | Single screen/component | form field values, sheet open/closed |

**Cart state** is local-first (instant optimistic updates on add/remove/edit) but always reconciled against `/pricing/calculate` before being trusted for checkout — never purely client-computed once the user reaches Checkout.

### 4.2 Routing

- Screen-level routes for: Home, Search, Restaurant Detail, Cart, Checkout, Order Confirmation, Live Tracking, Order History, Profile, Addresses, Payment Methods, Favorites, Order Detail, Help, Rate Order.
- Item Customization, Tip Selector, Address Picker render as overlays (sheet/modal) on the current route, not separate route entries — preserves the "no full navigation cost for micro-decisions" principle from `UX_SPEC.md`.

### 4.3 Performance Requirements (Structural, Not Optional Polish)

- Skeleton loaders for all content-loading states (see `UX_SPEC.md §Part C`); no bare spinners for full-screen content loads.
- Optimistic UI for "Add to Cart" — cart updates instantly in the UI, reconciles with server pricing in the background; on reconciliation failure, revert with a visible inline notice (never a silent revert).
- Image lazy-loading + caching for menu photos.
- Search input debounced 300ms.
- Real-time tracking updates apply via incremental state patches, not full screen re-fetch/re-render.

### 4.4 Component Architecture

**Foundational (design-token-driven, no business logic):**
- `Button` (primary/secondary/ghost/destructive — see `UX_SPEC.md §A.4`)
- `PriceTag` — single component for rendering any price value; handles cent-to-currency formatting, strikethrough (for price changes), and the live-update animation. All price rendering in the app goes through this component — never a raw `${price}` string interpolation elsewhere.
- `Badge` (honesty checkmark, allergen tag, dietary tag, promo tag)
- `BottomSheet` (base primitive for customization, tip selector, address picker)
- `Stepper` (quantity control, and reused visually for `OrderStatusStepper`'s step indicators)
- `TextInput`, `SelectionRow` (radio/checkbox row per `UX_SPEC.md §A.6`)
- `SkeletonBlock` (generic skeleton primitive, composed into per-screen skeleton layouts)

**Composite (business-aware, built from foundational components):**
- `RestaurantCard`, `MenuItemCard`
- `CustomizationOptionGroup` (renders required/optional groups, wraps `SelectionRow`, emits live delta to parent for `PriceTag` updates)
- `CartLineItem`
- `PriceBreakdownPanel` — **the single shared component rendered identically on Cart, Checkout, Reorder Confirmation, and Receipt**, driven by the same pricing response shape every time. This is the UI-layer enforcement of the pricing single-source-of-truth principle in `§2`.
- `ETABadge` — reused on `RestaurantCard`, Order Confirmation, and Live Tracking; accepts a range + optional reason string.
- `OrderStatusStepper` — renders from an ordered array of status events (see `DATABASE_SPEC.md §order_status_events`), not from a single mutable status field.
- `MapLiveView` — renders courier/restaurant/destination pins + route; must have an explicit "signal lost" visual state (see `UX_SPEC.md §B.8`).
- `AddressCard`, `PaymentMethodCard`

**State-driven (used inside any screen per `UX_SPEC.md §Part C`):**
- `EmptyState`, `ErrorState` (always includes Retry), `SkeletonLoader` variants per screen.

---

## 5. ETA & Fee Computation

**ETA** = `restaurant.prepTimeAvgMinutes` (adjusted for current order-queue load) + estimated route/delivery time (distance + courier availability). Always returned as a `{ min, max, reason? }` range, never a single number, per `PRODUCT_SPEC.md` non-negotiable rule `REALISTIC-ETA`.

**Recompute at these transitions only** (not continuously polled/recomputed arbitrarily — this keeps the number stable and trustworthy between meaningful events):
- `placed` (initial estimate)
- `confirmed` (restaurant has accepted, prep time confidence increases)
- `ready_for_pickup` (prep is done, only delivery-leg uncertainty remains)
- `picked_up` (courier is en route, highest-confidence estimate, route-based)

**Delivery fee** = function of distance band + time-of-day demand multiplier. Must be resolvable and displayed at the restaurant-browse level (Home screen `RestaurantCard`), not only after entering the menu — this directly satisfies the Beatriz persona's need and the `NEVER-HIDE-FEES` rule.

**Hackathon-scope note:** courier location may be a simulated/scripted feed rather than a real GPS integration — the architecture (event log, WebSocket push, "signal lost" state) should be built exactly as if it were real, so swapping in a real location provider later requires no structural change.

---

## 6. Idempotency & Trust-Critical Mechanics

- **Order creation** (`POST /orders`) requires a client-generated idempotency key; duplicate submissions with the same key return the original order rather than creating a second one (protects against the double-tap edge case in `PRODUCT_SPEC.md §7`).
- **All monetary values** are stored and transmitted as integer cents, never floating-point currency — client formats for display only, via `PriceTag`.
- **Server is the final pricing authority.** Even though the client shows a live total throughout the flow, `POST /orders` always recomputes via the Pricing Service server-side before charging; if the server total differs from what the client displayed (e.g., a price changed mid-session), the order is not silently placed — the API returns a price-changed response the client must show to the user before retrying (see `API_SPEC.md`).

---

## 7. Testing Expectations (for an AI agent implementing this)

- Pricing Service: unit tests are mandatory before wiring to any UI — this is the highest-risk shared logic in the app (per `PRODUCT_SPEC.md` roadmap risk notes).
- Order state machine: unit tests covering every valid transition and rejecting invalid ones (e.g., cannot go from `delivered` back to `preparing`).
- Idempotency: test that duplicate `POST /orders` with the same key does not create duplicate orders or duplicate charges.
