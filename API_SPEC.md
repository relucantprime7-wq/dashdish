# API_SPEC.md — DashDish

> Audience: AI coding agent. Defines every endpoint's contract. All monetary fields are integer cents. All endpoints except `/auth/*` and `GET /restaurants*` require `Authorization: Bearer <token>`. All mutating endpoints must validate input against the schemas implied here and return `400` with a field-level error map on validation failure.

**Base URL:** `/api/v1`

**Standard error shape (all endpoints):**
```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human-readable message",
    "fields": { "fieldName": "field-specific message" }   // optional, validation errors only
  }
}
```

---

## 1. Auth

### `POST /auth/signup`
Request: `{ name, email, phone, password }`
Response `201`: `{ user: { id, name, email, phone }, token }`
Errors: `409 EMAIL_TAKEN`

### `POST /auth/login`
Request: `{ email, password }`
Response `200`: `{ user: {...}, token }`
Errors: `401 INVALID_CREDENTIALS`

### `POST /auth/logout`
Response `204`

---

## 2. Catalog / Discovery

### `GET /restaurants?lat=&lng=&sort=eta|rating|distance`
Response `200`:
```json
{
  "restaurants": [
    {
      "id": "rest_123",
      "name": "Green Bowl",
      "imageUrl": "...",
      "rating": 4.6,
      "cuisineType": "Bowls",
      "isOpen": true,
      "etaRangeMinMinutes": 20,
      "etaRangeMaxMinutes": 30,
      "priceFromCents": 899,          // "from $X all-in" — includes estimated delivery+service fee for the cheapest item
      "deliveryFeeCents": 299
    }
  ]
}
```
*`priceFromCents` MUST already reflect fees per `PRODUCT_SPEC.md` rule `NEVER-HIDE-FEES` — it is not a bare item price.*

### `GET /restaurants/:id`
Response `200`: full restaurant object incl. hours, address, `isOpen`, `deliveryFeeCents`.

### `GET /restaurants/:id/menu`
Response `200`:
```json
{
  "categories": [
    {
      "id": "cat_1", "name": "Bowls", "sortOrder": 1,
      "items": [
        {
          "id": "item_1",
          "name": "Harvest Bowl",
          "description": "...",
          "basePriceCents": 1299,
          "imageUrl": "...",
          "isAvailable": true,
          "allergens": ["nuts"],
          "customizationGroups": [
            {
              "id": "grp_1", "name": "Size", "selectionType": "single",
              "isRequired": true, "minSelect": 1, "maxSelect": 1,
              "options": [
                { "id": "opt_1", "name": "Regular", "priceDeltaCents": 0, "isAvailable": true },
                { "id": "opt_2", "name": "Large", "priceDeltaCents": 250, "isAvailable": true }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### `GET /search?q=`
Response `200`: `{ restaurants: [...], items: [{ ...item, restaurantId, restaurantName }] }`

---

## 3. Pricing (Trust-Critical Shared Endpoint)

### `POST /pricing/calculate`
Request:
```json
{
  "restaurantId": "rest_123",
  "items": [
    { "menuItemId": "item_1", "quantity": 2, "selectedOptionIds": ["opt_1", "opt_5"] }
  ],
  "addressId": "addr_1",
  "tipCents": 300,
  "promoCode": "WELCOME10"
}
```
Response `200`:
```json
{
  "subtotalCents": 2798,
  "deliveryFeeCents": 299,
  "serviceFeeCents": 199,
  "taxCents": 224,
  "tipCents": 300,
  "discountCents": 0,
  "totalCents": 3820,
  "lineItems": [
    { "menuItemId": "item_1", "quantity": 2, "unitPriceCents": 1399, "lineTotalCents": 2798, "selectedOptions": [...] }
  ]
}
```
Errors: `400 INVALID_OPTIONS` (unavailable/incompatible selection), `404 ADDRESS_NOT_DELIVERABLE`, `422 PROMO_INVALID` (returns pricing anyway with `discountCents: 0` and a `promoError` field, so the total is still shown correctly).

*This exact response shape is what `PriceBreakdownPanel` (see `TECH_SPEC.md`) renders on Cart, Checkout, Reorder, and Receipt — do not create parallel/simplified pricing responses elsewhere.*

---

## 4. Cart

### `GET /cart`
Response `200`: `{ id, restaurantId, items: [CartItem], pricing: <same shape as /pricing/calculate> }`

### `POST /cart/items`
Request: `{ menuItemId, quantity, selectedOptionIds[], notes? }`
Response `201`: updated cart (same shape as `GET /cart`)
Errors: `409 DIFFERENT_RESTAURANT` (cart already has items from another restaurant — client must prompt to clear cart first, per single-restaurant-per-order rule in `PRODUCT_SPEC.md §9`)

### `PATCH /cart/items/:id`
Request: `{ quantity?, selectedOptionIds?, notes? }`
Response `200`: updated cart

### `DELETE /cart/items/:id`
Response `200`: updated cart

---

## 5. Checkout / Orders

### `POST /orders`
Headers: `Idempotency-Key: <client-generated-uuid>` (required)
Request:
```json
{
  "cartId": "cart_1",
  "addressId": "addr_1",
  "paymentMethodId": "pm_1",
  "tipCents": 300,
  "promoCode": "WELCOME10",
  "clientDisplayedTotalCents": 3820
}
```
Response `201`:
```json
{
  "order": {
    "id": "order_1",
    "status": "placed",
    "pricing": { ... same shape as /pricing/calculate ... },
    "etaRangeMinMinutes": 25,
    "etaRangeMaxMinutes": 32,
    "placedAt": "2026-08-11T12:00:00Z"
  }
}
```
Errors:
- `409 PRICE_CHANGED` — server-recomputed total differs from `clientDisplayedTotalCents`. Response includes the fresh pricing object; **client must show the diff to the user and require explicit re-confirmation before retrying** (never silently retry with the new price) — this is the API-level enforcement of the `PRICE-CONSISTENCY` rule.
- `422 RESTAURANT_CLOSED`
- `422 ADDRESS_NOT_DELIVERABLE`
- `402 PAYMENT_FAILED`
- Duplicate request with same `Idempotency-Key` → returns the original `201` order, not a new one.

### `GET /orders/:id`
Response `200`: full order incl. `pricing`, `statusEvents[]` (see below), `etaRangeMinMinutes/Max`.

### `GET /orders?status=active|past`
Response `200`: `{ orders: [OrderSummary] }`

### `POST /orders/:id/cancel`
Response `200`: updated order with `status: "cancelled"`.
Errors: `409 NOT_CANCELLABLE` (order has passed `picked_up`).

---

## 6. Tracking

### `GET /orders/:id/tracking`
Response `200`:
```json
{
  "status": "delivering",
  "statusEvents": [
    { "status": "placed", "occurredAt": "...", "note": null },
    { "status": "confirmed", "occurredAt": "...", "note": null },
    { "status": "preparing", "occurredAt": "...", "note": null },
    { "status": "ready_for_pickup", "occurredAt": "...", "note": null },
    { "status": "picked_up", "occurredAt": "...", "note": null }
  ],
  "etaRangeMinMinutes": 8,
  "etaRangeMaxMinutes": 12,
  "etaReason": "Courier is 1.2 miles away",
  "courier": { "name": "Alex", "lat": 40.71, "lng": -74.00, "signalStatus": "live" }
}
```
`courier.signalStatus` is `"live" | "stale" | "lost"` — client uses this to drive the "signal lost / reconnecting" UI state from `UX_SPEC.md §B.8`.

### `WS /orders/:id/tracking/stream`
Server pushes incremental events:
```json
{ "type": "status_change", "status": "picked_up", "occurredAt": "...", "etaRangeMinMinutes": 8, "etaRangeMaxMinutes": 12 }
{ "type": "courier_location", "lat": 40.71, "lng": -74.00, "signalStatus": "live" }
{ "type": "eta_update", "etaRangeMinMinutes": 6, "etaRangeMaxMinutes": 9, "reason": "Courier is close" }
```
Client falls back to polling `GET /orders/:id/tracking` every 5s if the socket disconnects, per `TECH_SPEC.md §5`.

---

## 7. Account

### Addresses
```
GET    /addresses
POST   /addresses           { label, street, city, lat, lng }  → validates deliverability, returns 422 ADDRESS_NOT_DELIVERABLE if out of range
PATCH  /addresses/:id
DELETE /addresses/:id
POST   /addresses/:id/default
```

### Payment Methods
```
GET    /payment-methods
POST   /payment-methods      { providerToken }   → server never receives raw card data, only the tokenized reference from the payment provider's client SDK
DELETE /payment-methods/:id
POST   /payment-methods/:id/default
```

### Favorites
```
GET    /favorites
POST   /favorites            { restaurantId? , menuItemId? }
DELETE /favorites/:id
```

### Ratings
```
POST   /orders/:id/rating    { restaurantRating: 1-5, courierRating: 1-5, comment? }
```

---

## 8. Response Conventions

- All list endpoints return `{ <resourceName>: [...] }`, never a bare array, to allow future pagination fields (`nextCursor`, `total`) without a breaking change.
- All monetary fields end in `Cents` and are integers.
- All timestamps are ISO 8601 UTC strings.
- All error codes are `SCREAMING_SNAKE_CASE` and stable (client may branch on `error.code`, never on `error.message`).
