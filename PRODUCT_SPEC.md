# PRODUCT_SPEC.md — DashDish

> Audience: AI coding agent implementing this product. This file defines *what* to build and *why*. It is the source of truth for product intent — if `UX_SPEC.md` or `TECH_SPEC.md` ever seem to conflict with this file's non-negotiables, this file wins.

---

## 1. Product Summary

DashDish is a mobile-first food delivery application. Its differentiator is **radical price and time honesty**: the price shown at any point in the flow must be the price the user pays, and delivery estimates must be realistic and explainable rather than optimistic marketing numbers.

**One-line description:** A food delivery app that never surprises you — every price and every minute is visible before you commit.

## 2. Non-Negotiable Product Rules

These rules are constraints on every screen and every API response. The agent must treat violations of these as bugs, not stylistic choices:

1. **NEVER-HIDE-FEES**: Any screen that displays a price for an item, cart, or order MUST display the full breakdown (base price, all fees, tax) or an explicit "+fees" indicator that expands to the same breakdown inline — never a bare number that hides cost components.
2. **PRICE-CONSISTENCY**: The total shown on the cart screen, checkout screen, order confirmation, and receipt MUST be computed from the same pricing function/endpoint (see `TECH_SPEC.md §Pricing Service`). No screen may independently compute or estimate a total.
3. **NO-DARK-PATTERNS**: No pre-selected upsells, no pre-highlighted "recommended" tip percentage, no countdown-timer urgency banners, no disproportionate visual weight on "skip" vs. "accept" actions. Every optional choice must have visually equal-weight options.
4. **REALISTIC-ETA**: ETAs are always displayed as a range (e.g., "25–32 min"), never a single false-precision number. ETAs recompute at defined order-status transitions (see `PRODUCT_SPEC.md §5`).
5. **FAST-CUSTOMIZATION**: Required-field validation for item customization happens at "Add to Cart" time, not at checkout — errors must be caught as early as possible in the flow.
6. **MOBILE-FIRST**: Every screen is designed and implemented for a 375–414px viewport first, then adapted upward. See `UX_SPEC.md §Responsive Breakpoints`.

## 3. User Personas

| Persona | Age | Primary need | Design implication |
|---|---|---|---|
| Impatient Ibrahim | 27 | Reorder known items in <30s | One-tap reorder flow, minimal taps to checkout |
| Careful Carla | 34 | Confident customization with allergy awareness | Visible allergen tags, clear required-vs-optional UI |
| Anxious Adrian | 45 | Trustworthy, non-shifting delivery ETA | Explainable ETA, live status timeline |
| Budget-conscious Beatriz | 22 | Compare true total cost before choosing a restaurant | "All-in" price badges visible at browse time, not just checkout |

## 4. Core User Journey (Happy Path)

1. Home → browse restaurants (each card shows ETA range + "from $X all-in" badge)
2. Restaurant menu → tap item → customization bottom sheet → live price updates → Add to Cart
3. Cart (persistent floating bar) → full price breakdown already visible
4. Checkout → address + payment + tip (neutral default) → total identical to cart total
5. Order confirmation → ETA range + reason if wide
6. Live tracking → status stepper + map, ETA narrows as real signals arrive
7. Delivered → rate + reorder shortcut

## 5. Order Status State Machine

```
placed → confirmed → preparing → ready_for_pickup → picked_up → delivering → delivered
                                                                              ↘ cancelled (from any state before picked_up)
```

- ETA MUST be recomputed at: `placed`, `confirmed`, `ready_for_pickup`, `picked_up` (see `TECH_SPEC.md §ETA Computation`).
- Every transition MUST be persisted as an immutable event (see `DATABASE_SPEC.md §order_status_events`) — the tracking UI is a read of this event log, never a single mutable status field re-rendered from memory.

## 6. Screens (Inventory)

Full per-screen behavioral spec lives in `UX_SPEC.md`. This is the authoritative list and grouping the agent should scaffold as routes/screens:

**Onboarding**
- Splash
- Location Permission / Manual Address Entry
- Sign Up / Log In

**Core**
- Home
- Search
- Restaurant Detail (Menu)
- Item Customization (sheet)
- Cart
- Checkout
- Order Confirmation
- Live Order Tracking
- Order History
- Reorder Confirmation

**Account**
- Profile & Saved Addresses
- Saved Payment Methods
- Favorites
- Order Detail / Receipt
- Help / Support
- Rate Order

**System states** (not separate routes — behaviors required on every applicable screen): Empty, Loading, Error, Restaurant Closed, Item Unavailable, No Delivery Coverage, Network Retry.

## 7. Edge Cases (Product-Level Requirements)

The agent must implement handling for all of the following — see `UX_SPEC.md` per-screen "error state" sections and `API_SPEC.md` for the corresponding response shapes:

- Item price changes between browse and checkout → show diff, never silently reprice.
- Promo code invalid/expired at checkout → explicit inline message, total recalculates visibly.
- Delivery fee varies by distance/time → shown on restaurant card before restaurant is opened.
- Customization combination unavailable → block at selection time.
- Required customization unselected → block "Add to Cart," not "Place Order."
- Item removed from cart due to unavailability after being added → explicit substitution/removal prompt with re-confirmed price.
- Restaurant closes mid-session → cart preserved, user notified, similar open restaurants suggested.
- Address outside delivery radius → caught before cart-building, not at final checkout step.
- Payment failure → retry without losing cart/order state.
- Duplicate order submission (double-tap) → idempotency key prevents double charge.
- Courier location signal lost → "last known location, reconnecting" state, never a frozen or fabricated-moving map.
- ETA slips significantly → proactive notification with plain-language reason.
- Order cancelled by restaurant → immediate notification + auto-refund explanation in-app.

## 8. Features That Differentiate the Product (Build Priority Within Scope)

Ranked — implement in this order if time-constrained:

1. Price-Lock indicator (persistent visual proof total hasn't changed cart→checkout→receipt)
2. Real-time price delta during customization
3. Explainable ETA ("12 min prep + 13 min delivery")
4. One-tap reorder with unchanged-price guarantee
5. Order status timeline backed by real event log
6. Explicit "no dark patterns" tip selector
7. Skeleton loading + optimistic UI throughout
8. Inline allergen/dietary tagging in customization

## 9. Out of Scope (Explicitly, to prevent scope creep by the agent)

- Multi-restaurant cart (single restaurant per order only)
- Loyalty/rewards points system
- Restaurant-side dashboard/admin app (backend must support it conceptually via the same Order/Catalog services, but no UI is required)
- In-app chat with courier (support chat only)
- Multi-language / i18n (structure text so it's not hard-coded inline in components, but translation is not required)
