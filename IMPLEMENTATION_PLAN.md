# IMPLEMENTATION_PLAN.md — DashDish

> Audience: AI coding agent. This is the execution order. Each phase lists concrete tasks, its dependencies on prior phases, exit criteria (how the agent knows the phase is actually done), and known risks to watch for. Follow phases in order — later phases assume earlier exit criteria are met. Reference `PRODUCT_SPEC.md`, `UX_SPEC.md`, `TECH_SPEC.md`, `API_SPEC.md`, and `DATABASE_SPEC.md` for full detail on any task below; this file sequences them, it does not restate them.

---

## Phase 0 — Foundation

**Tasks:**
1. Scaffold backend project structure per `TECH_SPEC.md §3` (module folders for Auth, Catalog, Pricing, Order, Tracking, Notification, User/Profile, Payment).
2. Create database and run all DDL from `DATABASE_SPEC.md §2`, in dependency order (users → addresses/payment_methods → restaurants → menu_* → carts → orders → order_items/order_status_events → couriers/courier_assignments → ratings/favorites).
3. Scaffold frontend project with routing structure per `TECH_SPEC.md §4.2`.
4. Implement design tokens (colors, typography, spacing) from `UX_SPEC.md §A.1–A.3` as the theme source every component will consume.
5. Build foundational components first: `Button`, `PriceTag`, `Badge`, `BottomSheet`, `Stepper`, `TextInput`, `SelectionRow`, `SkeletonBlock` (`TECH_SPEC.md §4.4`).
6. Seed database: 4–5 restaurants, each with a full menu including at least one item with a multi-group customization tree (required + optional groups) — thin seed data will make later phases visually empty during testing.

**Depends on:** nothing (starting point).

**Exit criteria:** Backend boots and connects to DB; frontend renders an empty shell using the theme tokens; seed data is queryable; foundational components render in isolation (e.g., a component playground/storybook page is acceptable for verification).

**Risks:** If `PriceTag` and design tokens aren't locked here, every later screen will need rework. Do not proceed to Phase 1 until these are stable.

---

## Phase 1 — Core Browse & Menu

**Tasks:**
1. Implement `GET /restaurants`, `GET /restaurants/:id`, `GET /restaurants/:id/menu`, `GET /search` per `API_SPEC.md §2`.
2. Build **Home** screen (`UX_SPEC.md §B.1`): restaurant list, `RestaurantCard`, filter bar, skeleton/error/empty states.
3. Build **Search** screen (`UX_SPEC.md §B.2`).
4. Build **Restaurant Detail (Menu)** screen (`UX_SPEC.md §B.3`): `RestaurantHeader`, `CategoryTabs`, `MenuItemCard` list.
5. Implement responsive breakpoint behavior for these three screens per `UX_SPEC.md §A.9`.

**Depends on:** Phase 0 (schema + seed data + foundational components).

**Exit criteria:** A user can open the app, see a realistic restaurant list with correct ETA and all-in price badges, search, and open a restaurant's full menu, on both mobile and desktop viewports, with working loading/error/empty states.

**Risks:** If seed data lacks price/customization complexity, this phase will look correct but fail to surface pricing-logic issues later. Verify at least one restaurant has items spanning multiple price points and fee bands.

---

## Phase 2 — Customization & Cart (Highest-Risk Phase)

**Tasks:**
1. Implement the **Pricing Service** (`TECH_SPEC.md §3.3`) as a pure, independently unit-tested function before wiring to any endpoint or UI.
2. Implement `POST /pricing/calculate` (`API_SPEC.md §3`) as a thin wrapper around the Pricing Service.
3. Implement client-side `calculateOrderTotal()` utility mirroring the same logic for optimistic live updates (`TECH_SPEC.md §2`).
4. Build **Item Customization** bottom sheet (`UX_SPEC.md §B.4`): `CustomizationOptionGroup`, live price updates via `PriceTag`, required-group validation gating "Add to Cart."
5. Implement `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id` (`API_SPEC.md §4`).
6. Build **Cart** screen (`UX_SPEC.md §B.5`): `CartLineItem` list, `PromoCodeInput`, and the shared `PriceBreakdownPanel` component — build `PriceBreakdownPanel` once here; it will be reused verbatim in Phases 3 and 4.
7. Implement the floating cart bar (mobile) / persistent cart panel (desktop) per `UX_SPEC.md §A.7`.

**Depends on:** Phase 1 (menu data structure must exist to customize/cart against).

**Exit criteria:** A user can customize an item with live price feedback, add it to cart, see an accurate itemized breakdown in Cart that matches what `/pricing/calculate` returns, edit/remove line items, and apply a promo code (valid and invalid cases both handled per `UX_SPEC.md` error states).

**Risks — read before starting this phase:** This is the highest-risk phase in the entire project. Pricing bugs introduced here will silently propagate into Checkout, Order Confirmation, and Receipt because those all reuse the same `PriceBreakdownPanel`/pricing endpoint. Do not begin UI wiring until the Pricing Service has passing unit tests for: base price + option deltas, quantity multiplication, fee calculation, tax, discount/promo application, and rounding (integer cents only, per `DATABASE_SPEC.md §3.3`).

---

## Phase 3 — Checkout & Orders

**Tasks:**
1. Implement Address and Payment Method endpoints (`API_SPEC.md §7`), including delivery-range validation on address creation.
2. Implement `POST /orders` (`API_SPEC.md §5`) with mandatory `Idempotency-Key` handling and server-side price reconciliation against `clientDisplayedTotalCents` (returns `409 PRICE_CHANGED` on mismatch, per `TECH_SPEC.md §6`).
3. Implement order snapshotting into `order_items`/`orders` at creation time (`DATABASE_SPEC.md §3.1`) — verify snapshotted values are immutable to later menu changes.
4. Build **Checkout** screen (`UX_SPEC.md §B.6`): `AddressCard`, `PaymentMethodCard`, `TipSelector` (neutral default, no dark patterns), reused `PriceBreakdownPanel`, Place Order button with loading/error states.
5. Build **Order Confirmation** screen (`UX_SPEC.md §B.7`).
6. Wire the `PRICE_CHANGED` response to a required user-facing re-confirmation step before retrying order placement — never auto-retry silently.

**Depends on:** Phase 2's pricing engine must be stable and tested before starting Checkout UI — debugging pricing and checkout simultaneously is a known failure mode to avoid.

**Exit criteria:** A user can complete an order end-to-end, the total on Checkout matches the total on Cart exactly, duplicate submissions (simulate a double-tap) do not create duplicate orders, and a simulated mid-session price change surfaces the `PRICE_CHANGED` flow correctly instead of silently charging a different amount.

**Risks:** Payment integration can consume disproportionate time; per `PRODUCT_SPEC.md`, mocking/stubbing the payment provider is acceptable for this build unless real payment processing is an explicit requirement elsewhere.

---

## Phase 4 — Live Tracking

**Tasks:**
1. Implement the order status state machine transitions and `order_status_events` writes (`DATABASE_SPEC.md §2`, `PRODUCT_SPEC.md §5`) in the Order Service.
2. Implement ETA recomputation at each defined transition (`TECH_SPEC.md §5`).
3. Implement `GET /orders/:id/tracking` and the `WS /orders/:id/tracking/stream` endpoint (`API_SPEC.md §6`), including a polling fallback path.
4. Build a simulated courier location feed sufficient for demo purposes (per `TECH_SPEC.md §5` hackathon-scope note) — architect it behind the same interface a real GPS integration would use.
5. Build **Live Order Tracking** screen (`UX_SPEC.md §B.8`): `MapLiveView`, `OrderStatusStepper` (rendered from `statusEvents[]`), `ETABadge` with reason text, signal-lost state.
6. Wire the persistent active-order banner on Home (`UX_SPEC.md §A.7`) to jump into this screen.

**Depends on:** Phase 3 (Order Service must be creating orders with a working status field before tracking has anything to track).

**Exit criteria:** Placing an order and progressing it through simulated status transitions updates the tracking screen live (via WebSocket, with polling fallback verified by manually disabling the socket), the ETA narrows at each transition with a visible reason, and disconnecting the simulated courier feed shows the "signal lost/reconnecting" state rather than a frozen or fabricated map.

**Risks:** Real-time infrastructure can consume more time than budgeted. If WebSocket implementation risks the timeline, ship the polling path first (5s interval) as the primary mechanism — it satisfies all product requirements on its own; WebSocket is a polish layer, not a hard requirement of `PRODUCT_SPEC.md`.

---

## Phase 5 — Remaining Screens & Polish

**Tasks:**
1. Build **Order History** (`UX_SPEC.md §B.9`) and **Reorder Confirmation** (`UX_SPEC.md §B.10`) — reorder must re-run `/pricing/calculate` fresh, never reuse a stale cached total.
2. Build **Profile & Addresses** (`UX_SPEC.md §B.11`), **Payment Methods** (`§B.12`), **Favorites** (`§B.13`).
3. Build **Order Detail / Receipt** (`§B.14`) rendering from snapshotted `order_items`, not live menu data.
4. Build **Help/Support** (`§B.15`) and **Rate Order** (`§B.16`).
5. Sweep every screen against `UX_SPEC.md §Part C` (system-wide empty/loading/error states) — verify no screen has a bare spinner-only loading state or a dead-end error state without Retry.
6. Add skeleton loaders and optimistic UI polish per `TECH_SPEC.md §4.3` wherever still missing.
7. Implement remaining edge cases from `PRODUCT_SPEC.md §7` not already covered by earlier phases (item-unavailable-after-cart, restaurant-closes-mid-session, courier-signal-lost — cross-check this list explicitly, don't rely on memory of earlier phases).

**Depends on:** Phases 1–4 functionally complete.

**Exit criteria:** Every screen in `PRODUCT_SPEC.md §6` inventory exists and satisfies all ten behavioral aspects specified for it in `UX_SPEC.md`; every edge case in `PRODUCT_SPEC.md §7` has been manually verified, not just assumed handled by earlier generic error states.

**Risks:** This phase is compressible under time pressure but should not be skipped — see cut-line guidance below.

---

## Cut-Line Guidance (If Time-Constrained)

Protect, in priority order:
1. Phase 2 (Pricing Service correctness) — the entire product thesis depends on this being right.
2. Phase 3 (Checkout price-consistency guarantee).
3. Phase 1 (browsable, realistic menu).
4. Phase 4's polling-based tracking (skip WebSocket if needed; a correctly-updating polled tracker still satisfies `PRODUCT_SPEC.md`).
5. Phase 5 polish — compress scope here first (e.g., ship Favorites and Help/Support last or as stretch) rather than shipping a broken Checkout with more peripheral screens complete.

A working Phase 0–3 with a static-but-accurate ETA is a stronger deliverable than a fully-featured app with an inconsistent total between Cart and Checkout — price inconsistency is the single failure mode `PRODUCT_SPEC.md` treats as a hard bug, not a rough edge.

---

## Feature Priority Overlay (Reference)

If extra time remains after Phase 5's exit criteria are met, implement in this order (from `PRODUCT_SPEC.md §8`):
1. Price-Lock visual indicator
2. Real-time price delta animation polish
3. Explainable ETA reason text (if not already fully implemented in Phase 4)
4. One-tap reorder polish
5. Order status timeline visual polish
6. Explicit "no dark patterns" callouts in tip selector UI
7. Skeleton/optimistic UI sweep (if any screens still missed)
8. Inline allergen/dietary tagging polish in customization
