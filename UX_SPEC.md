# UX_SPEC.md — DashDish

> Audience: AI coding agent. This file is the single source of truth for visual design tokens and per-screen behavior. Implement components against `§Design System` first, then build each screen in `§Screens` against those components — do not invent one-off styles per screen.

---

## PART A — DESIGN SYSTEM

### A.1 Colors

Define as design tokens (CSS variables / theme object), not hard-coded hex values in components.

```
--color-bg:              #FAFAF8   (off-white, not pure white — softer premium feel)
--color-surface:         #FFFFFF   (cards, sheets)
--color-text-primary:    #14151A   (near-black, not pure black)
--color-text-secondary:  #5C5F6B
--color-text-tertiary:   #9698A3
--color-border:          #E8E8E4

--color-accent:          #E4572E   (single saturated accent — reserved for primary actions + price emphasis ONLY)
--color-accent-pressed:  #C8471F

--color-honesty:         #1B8A5A   (reserved exclusively for "price confirmed / all fees shown" badges — must be visually consistent everywhere it appears so users learn to trust it)

--color-success:         #1B8A5A
--color-warning:         #C88A1B
--color-error:           #D23C3C

--color-overlay:         rgba(20, 21, 26, 0.5)   (bottom sheet / modal scrim)
```

**Rules:**
- `--color-accent` is used ONLY for: primary CTA buttons, active nav state, price totals. It must never appear in decorative contexts — this is what keeps it meaningful.
- `--color-honesty` badge/checkmark appears ONLY next to a fully-itemized, final price. Never repurpose this color for anything else in the app.
- Semantic colors (`success`/`warning`/`error`) are state-only, never decorative.

### A.2 Typography

Single type family, two weights.

```
--font-family: 'Inter', -apple-system, sans-serif   (or equivalent geometric sans)

--font-weight-regular: 400
--font-weight-semibold: 600

--text-display:   32px / 40px line-height / semibold   (order total on confirmation, big ETA numbers)
--text-h1:         24px / 32px / semibold               (screen titles)
--text-h2:         20px / 28px / semibold               (section headers, restaurant name)
--text-body-lg:     16px / 24px / regular                (primary body text, item names)
--text-body:        14px / 20px / regular                (secondary body text, descriptions)
--text-caption:     12px / 16px / regular                (metadata, timestamps, fine print)
--text-price:       inherits size from context, ALWAYS semibold, ALWAYS --color-text-primary or --color-accent for totals
```

**Rule:** price and ETA numbers are always rendered at minimum `--text-body-lg` and always semibold — these are the two numbers the product's trust proposition rests on, and they must be scannable in under one second.

### A.3 Spacing

8px base unit.

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 32px
--space-7: 48px
--space-8: 64px
```

- Screen horizontal padding: `--space-4` (16px) mobile, `--space-6` (32px) desktop.
- Card internal padding: `--space-4`.
- Minimum touch target: 44x44px (accessibility + "hungry impatient users mis-tap on cramped UI").

### A.4 Buttons

| Variant | Use | Style |
|---|---|---|
| Primary | Single main action per screen (Add to Cart, Place Order, Continue) | Filled `--color-accent`, white text, `--text-body-lg` semibold, 12px corner radius, full-width on mobile |
| Secondary | Alternate action (Edit, View Details) | Outline `--color-border`, `--color-text-primary` text |
| Ghost | Low-emphasis action (Skip, Cancel) | No border/fill, `--color-text-secondary` text |
| Destructive | Remove item, Cancel order | Outline or text in `--color-error` |

- All buttons: disabled state = 40% opacity + no pointer events, never removed from layout (avoid layout shift).
- Loading state: spinner replaces label, button retains width (no layout shift), disabled during load.
- Minimum height: 48px mobile.

### A.5 Cards

- `RestaurantCard`: image (16:9), name (`h2`), rating, ETA badge, "from $X all-in" price badge. Corner radius 16px. Elevation via subtle border, not heavy shadow (premium = restrained, not skeuomorphic).
- `MenuItemCard`: image (1:1 or 4:3), name (`body-lg`), price (`body-lg` semibold), customizable indicator icon if applicable.
- `CartLineItem`: compact row — name, customization summary (`caption`), per-line price, edit/remove affordance.

All cards: `--color-surface` background, `--color-border` 1px border, 16px corner radius, `--space-4` internal padding.

### A.6 Inputs

- Text inputs: 48px height, `--color-border` border, `--color-accent` border on focus, `--space-3` internal padding, label above field (not placeholder-as-label — placeholders disappear and hurt usability).
- Validation: inline error message below field in `--color-error`, `--text-caption`, appears immediately on blur for required fields — never only on submit.
- Selection controls (radio/checkbox for customization): full-row tappable (not just the input itself), min 44px row height, selected state uses `--color-accent` outline/fill, unselected state visually equal-weight to all siblings (no dark-pattern bias toward one option).

### A.7 Navigation

**Mobile (< 768px):** Bottom tab bar, 4 items max: Home / Search / Orders / Account. Persistent floating cart bar above tab bar when cart is non-empty, showing live item count + running total.

**Desktop (≥ 1024px):** Left sidebar nav replaces bottom tabs. Cart becomes a persistent right-hand panel instead of a floating bar. Three-column layout: nav | content | cart (when applicable).

**Tablet (768–1023px):** Bottom tab bar retained, cart floating bar retained, but content area uses a 2-column grid where relevant (e.g., restaurant grid).

Active order banner: if the user has an in-progress order, a persistent condensed banner appears at the top of Home (and anywhere else reachable) showing status + ETA, tappable to jump directly into Live Tracking.

### A.8 Animations

- Duration: 150–200ms for all UI transitions. No animation exceeds 300ms except the live map (continuous, not a "transition").
- Easing: standard ease-out for entrances, ease-in for exits.
- Price change animation: when a price updates (customization delta, cart update), animate the digit change (subtle scale/fade), not an instant snap — this is a small touch that reinforces the "live, honest pricing" feel.
- Bottom sheets: slide up from bottom, scrim fades in concurrently.
- Skeleton loaders used instead of spinners for content-loading states (menu, cart, tracking) — spinners only for button-level in-progress actions.
- No animation may block user input for longer than its duration (no fake artificial delays).

### A.9 Responsive Breakpoints

```
--breakpoint-mobile:  0–767px    (default / mobile-first base styles)
--breakpoint-tablet:  768–1023px
--breakpoint-desktop: 1024px+
```

Layout rules:
- Mobile: single column, bottom nav, sheets for micro-decisions.
- Tablet: content may go 2-column (e.g., restaurant grid 2-up), nav stays bottom.
- Desktop: sidebar nav + persistent cart panel replaces floating bar + bottom nav; menu content can show in a 2-column layout (categories list + item grid).

---

## PART B — SCREENS

Each screen below must be implemented with all ten specified aspects. Components referenced are defined in `TECH_SPEC.md §Component Architecture`.

---

### B.1 Home

**Purpose:** Get the user from app-open to a chosen restaurant as fast as possible; reinforce price/time honesty immediately.

**User actions:**
- Scroll/browse restaurant list
- Filter/sort (e.g., by ETA, rating, cuisine)
- Tap a restaurant card → Restaurant Detail
- Tap active-order banner (if present) → Live Tracking
- Tap "Reorder" shortcut on a recent order card → Reorder Confirmation
- Pull to refresh

**Components:** `TopBar` (location selector), `ActiveOrderBanner` (conditional), `FilterBar`, `RestaurantCard` list, `ReorderCard` (recent orders), bottom `TabBar`.

**States:** default (list loaded), filtered, active-order-in-progress, no-results-for-filter.

**Validation:** N/A (no form inputs on this screen).

**Loading state:** Skeleton `RestaurantCard` list (5–6 placeholder cards) while restaurants fetch. Location resolving shows a skeleton `TopBar` location label.

**Error state:** If restaurant list fails to load: inline error block with message + "Retry" button, existing cached list (if any) remains visible above it rather than replacing the whole screen.

**Empty state:** "No restaurants deliver to this address yet" with an illustration and a "Change address" CTA — this is a defined product edge case, not a generic empty state.

**Responsive behavior:** Mobile: single-column card list. Tablet: 2-column grid. Desktop: sidebar nav + 3-column grid, `FilterBar` becomes a persistent left-side filter panel instead of a horizontal scroll bar.

---

### B.2 Search

**Purpose:** Fast lookup of a specific restaurant or dish when the user already knows what they want.

**User actions:** Type query, tap recent search, tap result → Restaurant Detail or Item (opens restaurant + scrolls to item).

**Components:** `SearchInput` (autofocus on screen entry), `RecentSearchList`, `SearchResultList` (mixed restaurants + dishes, clearly labeled by type).

**States:** empty (pre-query, shows recents), typing (debounced), results, no-results.

**Validation:** N/A (free text; no format validation, minimum 1 character to trigger search after debounce).

**Loading state:** Skeleton result rows appear below the input while debounced query is in flight (300ms debounce).

**Error state:** Inline "Search is temporarily unavailable" message with Retry; recent searches remain interactive even if live search fails.

**Empty state:** "No results for '{query}'" with a suggestion to check spelling or browse categories instead.

**Responsive behavior:** Mobile: full-screen search takes over on tab tap. Desktop: search can be a persistent top-bar input with a dropdown results panel instead of a full page.

---

### B.3 Restaurant Detail (Menu)

**Purpose:** Let the user understand the full menu and true pricing before committing time to customization.

**User actions:** Scroll categories, tap item → Item Customization sheet, tap "Info" for restaurant details (hours, address), favorite/unfavorite restaurant.

**Components:** `RestaurantHeader` (image, name, rating, ETA badge, hours/open-closed status), `CategoryTabs` (sticky), `MenuItemCard` list grouped by category.

**States:** open (orderable), closed (browsable, ordering disabled), item-unavailable (shown greyed with "Currently unavailable" tag rather than hidden — transparency over hiding).

**Validation:** N/A.

**Loading state:** Skeleton header + skeleton item card list.

**Error state:** Menu fails to load → error block with Retry; restaurant header (if already fetched) remains visible.

**Empty state:** Not generally applicable (a listed restaurant should have a menu), but if a category has zero available items, show "Nothing available in this category right now" rather than an empty visual gap.

**Responsive behavior:** Mobile: single column, `CategoryTabs` horizontally scrollable and sticky under header. Desktop: two-column layout — sticky category sidebar on the left, item grid on the right; cart panel persistent on far right.

---

### B.4 Item Customization (Bottom Sheet)

**Purpose:** Make customization fast and unambiguous; show live price impact of every choice — this is the screen most directly answering the "menus are hard to understand when customizing" pain point.

**User actions:** Select/deselect required and optional options, adjust quantity, add note, tap "Add to Cart."

**Components:** `BottomSheet`, `CustomizationOptionGroup` (per group: required groups visually distinguished from optional, e.g., a "Required" tag), `Stepper` (quantity), `PriceTag` (live running total, updates on every selection), `Button` (Add to Cart, shows live total in the button label, e.g., "Add to Cart · $14.50").

**States:** default, option-unavailable (disabled option row with "Unavailable" tag, not hidden), required-incomplete (Add to Cart disabled until satisfied), max-quantity-reached (for multi-select groups with a max).

**Validation:** Required groups must have a valid selection (respecting min/max) before "Add to Cart" is enabled. Validation errors surface inline next to the specific unmet group (e.g., "Choose 1 size") — never as a generic toast only.

**Loading state:** Sheet opens instantly with skeleton option rows if customization data isn't already cached from the menu fetch (should generally be pre-fetched with the menu to avoid this).

**Error state:** If "Add to Cart" submission fails (e.g., network), inline error above the button, cart state unchanged, user can retry without re-selecting options.

**Empty state:** N/A (an item with no customization groups skips straight to quantity + Add to Cart, no empty groups shown).

**Responsive behavior:** Mobile: bottom sheet, ~85% viewport height max, scrollable body with sticky header (item name/image) and sticky footer (price + Add to Cart button). Desktop: renders as a centered modal instead of a bottom sheet, same internal structure.

---

### B.5 Cart

**Purpose:** Show the complete, final price breakdown before the user proceeds — this is a core trust checkpoint, not just a summary list.

**User actions:** Edit line item (reopens customization sheet pre-filled), remove line item, adjust quantity, apply promo code, proceed to Checkout.

**Components:** `CartLineItem` list, `PromoCodeInput`, `PriceBreakdownPanel` (subtotal, delivery fee, service fee, tax, estimated tip placeholder, total — every line labeled, nothing bundled into an opaque "fees" catch-all without the option to expand and see each fee named), `Button` (Proceed to Checkout).

**States:** default, promo-applied, promo-invalid, item-price-changed-since-added (explicit diff shown), restaurant-closed-since-cart-started.

**Validation:** Promo code validated on submit (not on every keystroke); invalid codes show inline error without clearing the field.

**Loading state:** Skeleton `PriceBreakdownPanel` while pricing recalculates after any cart mutation (should feel instant — target <300ms perceived).

**Error state:** If pricing recalculation fails, keep the last-known-good breakdown visible with a small inline "Prices may be outdated — Retry" notice rather than blanking the screen.

**Empty state:** "Your cart is empty" illustration + CTA back to Home/last-viewed restaurant.

**Responsive behavior:** Mobile: full screen reached via floating cart bar tap. Desktop: persistent right-hand panel, always visible while browsing, no separate navigation needed to view it.

---

### B.6 Checkout

**Purpose:** Complete the order with zero surprises — the total shown here must be pixel-identical in structure to the Cart's `PriceBreakdownPanel`.

**User actions:** Select/add delivery address, select/add payment method, choose tip (neutral default, equal-weight options + custom amount), review final breakdown, place order.

**Components:** `AddressCard` (selected + "change" affordance), `PaymentMethodCard`, `TipSelector` (no option pre-highlighted as "recommended"), `PriceBreakdownPanel` (identical component instance/style to Cart), `Button` (Place Order, disabled until address + payment selected).

**States:** default, address-missing (must select before continuing), payment-missing, address-out-of-range (blocks order placement with explicit message), placing-order (in-flight), order-failed.

**Validation:** Address and payment method are required before "Place Order" is enabled. Address delivery-range validated server-side before allowing progression (see `API_SPEC.md`); out-of-range shows a blocking inline message with a "Choose a different address" CTA.

**Loading state:** "Place Order" button enters loading state (spinner, same width, disabled) on submit; screen is not navigated away from until server confirms order creation (avoids the double-submission edge case perceptually as well as via idempotency key server-side).

**Error state:** Payment failure → inline error message near the payment method, cart/order draft state preserved, user can retry or change payment method without re-entering address/tip.

**Empty state:** N/A (screen requires cart to be non-empty to reach; redirect to Cart if somehow empty).

**Responsive behavior:** Mobile: single-column vertical flow (Address → Payment → Tip → Breakdown → Place Order). Desktop: two-column — form fields left, `PriceBreakdownPanel` + Place Order sticky on the right.

---

### B.7 Order Confirmation

**Purpose:** Immediately reassure the user the order was placed correctly, with an honest ETA.

**User actions:** Tap "Track Order" → Live Tracking, tap "Back to Home."

**Components:** `ConfirmationHeader` (success state), `ETABadge` (range + optional reason text), `OrderSummaryCompact`.

**States:** default (success). No error state on this screen itself — a failed order never reaches this screen (see Checkout error state).

**Validation:** N/A.

**Loading state:** Brief (order already confirmed server-side before navigation); if any summary data is still resolving, use skeleton for the summary block only, never for the success confirmation itself.

**Error state:** N/A (see above).

**Empty state:** N/A.

**Responsive behavior:** Mobile: full-screen confirmation. Desktop: centered card, max-width ~480px, rest of viewport can show a dimmed background of Home.

---

### B.8 Live Order Tracking

**Purpose:** Provide a genuinely trustworthy, explainable view of order progress — directly answers the "poor maps and inaccurate delivery times create anxiety" pain point.

**User actions:** View map + status timeline, contact support, (post-pickup) view courier info, cancel order (only while cancellable per state machine).

**Components:** `MapLiveView`, `OrderStatusStepper` (rendered from the immutable event log, not a single mutable field), `ETABadge` (recomputed at each transition, with reason text on significant changes), `SupportButton`.

**States:** each state in the order status state machine (`placed`, `confirmed`, `preparing`, `ready_for_pickup`, `picked_up`, `delivering`, `delivered`, `cancelled`), plus `courier-signal-lost` (map shows last-known pin + "Reconnecting..." label, never freezes silently or fabricates movement).

**Validation:** N/A.

**Loading state:** Skeleton map container + skeleton stepper on initial load; subsequent updates arrive via live subscription and animate in without a full reload.

**Error state:** If live connection drops, fall back to polling automatically and show a small unobtrusive "Reconnecting" indicator — never show a hard error that blocks the whole screen for a transient connectivity issue.

**Empty state:** N/A (screen requires an active or recent order).

**Responsive behavior:** Mobile: map top half, stepper + details bottom half, scrollable. Desktop: two-column — map left (larger), stepper + order details right, both persistently visible without scrolling on typical viewport heights.

---

### B.9 Order History

**Purpose:** Let users find and reorder past meals quickly (serves the "Impatient Ibrahim" speed persona directly).

**User actions:** Scroll past orders, tap order → Order Detail/Receipt, tap "Reorder" shortcut on any past order.

**Components:** `OrderHistoryCard` (restaurant name/image, date, item summary, total, Reorder button), `TabBar` (Active / Past, if any active order exists).

**States:** default, has-active-order (Active tab shown first/highlighted).

**Validation:** N/A.

**Loading state:** Skeleton `OrderHistoryCard` list.

**Error state:** Inline error + Retry, no destructive effect on cached list if present.

**Empty state:** "No orders yet" with a CTA to browse restaurants — first-time-user-friendly copy, not a bare "No data."

**Responsive behavior:** Mobile: single column list. Desktop: can render as a denser table-like list given more horizontal space, same underlying data/component.

---

### B.10 Reorder Confirmation

**Purpose:** Ultra-fast repeat-order path — the entire point is minimizing taps and re-confirming the (possibly changed) price honestly.

**User actions:** Review pre-filled cart from a past order, confirm or edit before placing.

**Components:** `CartLineItem` list (pre-filled), `PriceBreakdownPanel` (recalculated fresh — never reuse a stale cached total, since prices/fees may have changed since the original order), `Button` (Confirm & Order).

**States:** default, price-changed-since-last-order (explicit "Prices have changed since your last order" banner with the diff visible), item-no-longer-available (explicit removal/substitution prompt, same pattern as Cart edge case).

**Validation:** Same as Checkout — address/payment must be valid (defaults to user's saved defaults, editable).

**Loading state:** Skeleton while the past order is re-fetched and re-priced.

**Error state:** Same pattern as Checkout error state.

**Empty state:** N/A.

**Responsive behavior:** Mobile: single-screen flow, condensed. Desktop: can render as a modal over Home/Order History rather than a full page, given how lightweight the flow is.

---

### B.11 Profile & Saved Addresses

**Purpose:** Manage account info and addresses without friction, since this reduces future checkout time.

**User actions:** Edit name/contact info, add/edit/delete address, set default address.

**Components:** `ProfileForm`, `AddressCard` list, `Button` (Add Address → address form/sheet).

**States:** default, editing, address-form-open.

**Validation:** Standard field validation (required fields, valid phone/email format) shown inline on blur. Address form validates deliverability via the same range-check used at Checkout, so a saved address can't silently be undeliverable later.

**Loading state:** Skeleton form/list on initial load.

**Error state:** Inline field-level or block-level error + Retry for save failures; unsaved edits preserved in local state so a failed save doesn't lose user input.

**Empty state:** "No saved addresses yet" with Add Address CTA.

**Responsive behavior:** Mobile: stacked full-width forms/cards. Desktop: two-column layout (profile form left, address list right) or tabbed sections.

---

### B.12 Saved Payment Methods

**Purpose:** Manage payment methods; never store or display raw card numbers (tokenized only).

**User actions:** Add payment method, delete, set default.

**Components:** `PaymentMethodCard` (brand icon + last 4 digits only), `Button` (Add Payment Method → provider-hosted form, e.g., Stripe Elements).

**States:** default, add-form-open, deleting-confirmation.

**Validation:** Delegated to payment provider's client-side validation (e.g., Stripe.js) — DashDish never handles raw card data directly.

**Loading state:** Skeleton list on initial load; add-flow shows provider's own loading state.

**Error state:** Inline error from provider (e.g., "Card declined") shown near the form; list unaffected.

**Empty state:** "No saved payment methods" with Add CTA. Guest/first-time checkout can still proceed without a saved method (payment entered fresh at Checkout).

**Responsive behavior:** Mobile: full-width stacked cards. Desktop: grid of cards, max 2–3 per row.

---

### B.13 Favorites

**Purpose:** Quick access to preferred restaurants/items for repeat behavior.

**User actions:** View favorited restaurants/items, unfavorite, tap through to Restaurant Detail.

**Components:** `RestaurantCard` / `MenuItemCard` (reused), `EmptyState`.

**States:** default.

**Validation:** N/A.

**Loading state:** Skeleton card grid.

**Error state:** Inline error + Retry.

**Empty state:** "No favorites yet — tap the heart icon on any restaurant or dish to save it here."

**Responsive behavior:** Same grid pattern as Home (1-col mobile, 2-col tablet, 3-col desktop).

---

### B.14 Order Detail / Receipt

**Purpose:** Show an itemized receipt that must match, line for line, what the user saw before placing the order — this is the final proof point of the price-honesty promise.

**User actions:** View itemized breakdown, tap "Reorder," tap "Get Help" for this order, tap "Rate Order" if delivered and unrated.

**Components:** `PriceBreakdownPanel` (rendered from the order's snapshotted line items, not live menu data), `OrderStatusStepper` (collapsed/summary form if delivered), `Button` (Reorder, Get Help).

**States:** default (any terminal or in-progress order state).

**Validation:** N/A.

**Loading state:** Skeleton receipt layout.

**Error state:** Inline error + Retry.

**Empty state:** N/A.

**Responsive behavior:** Mobile: single column. Desktop: centered, max-width ~600px (receipts don't benefit from wide layouts).

---

### B.15 Help / Support

**Purpose:** Let users resolve order issues without leaving the app, reinforcing overall trust.

**User actions:** Browse FAQ/topics, start support chat, view order-specific help (pre-filled context if entered from an order).

**Components:** `SupportTopicList`, `ChatThread` (if chat implemented), `OrderContextCard` (if entered from an order).

**States:** default, chat-active.

**Validation:** Message input non-empty before send.

**Loading state:** Skeleton topic list; chat shows typing/sending indicator.

**Error state:** "Message failed to send — Retry" inline, message text preserved in the input.

**Empty state:** N/A (topic list always populated).

**Responsive behavior:** Mobile: full-screen chat. Desktop: can render as a side panel/drawer over the current screen instead of full navigation.

---

### B.16 Rate Order

**Purpose:** Capture feedback quickly post-delivery without friction.

**User actions:** Select star rating (restaurant + courier, can be separate), optional comment, submit.

**Components:** `StarRating` input, `TextArea` (optional comment), `Button` (Submit).

**States:** default, submitted (confirmation).

**Validation:** At minimum one rating value required before submit is enabled; comment optional.

**Loading state:** Button loading state on submit.

**Error state:** Inline error + Retry, rating selections preserved.

**Empty state:** N/A.

**Responsive behavior:** Mobile: full-screen. Desktop: modal over Order Detail/Receipt.

---

## PART C — System-Wide States (apply across all screens)

- **Empty state:** always includes a next-action CTA, never a bare "No data" message.
- **Loading state:** skeleton loaders for content regions; spinners reserved for button-level in-progress actions only.
- **Error state:** always includes a Retry affordance and never discards already-successful data on screen (partial failure ≠ full-screen failure).
- **Offline/network-retry:** a global non-blocking banner ("You're offline — reconnecting...") rather than blocking modals, except for mutating actions in flight (e.g., Place Order), which must block resubmission until resolved.
