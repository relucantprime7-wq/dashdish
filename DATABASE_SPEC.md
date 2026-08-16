# DATABASE_SPEC.md — DashDish

> Audience: AI coding agent. PostgreSQL DDL and rationale. All monetary columns are `integer` cents. All tables use `uuid` primary keys unless noted. Implement migrations in the order listed (dependency order).

---

## 1. Schema Overview

```
users ──< addresses
users ──< payment_methods
users ──< favorites
users ──< orders

restaurants ──< menu_categories ──< menu_items ──< customization_groups ──< customization_options
restaurants ──< orders

carts ──< cart_items
orders ──< order_items
orders ──< order_status_events
orders ──< courier_assignments >── couriers
orders ──< ratings
```

## 2. DDL

```sql
-- USERS ---------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ADDRESSES -------------------------------------------------------------
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT,                     -- "Home", "Work"
  street      TEXT NOT NULL,
  city        TEXT NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- PAYMENT METHODS (tokenized only — never raw card data) ----------------
CREATE TABLE payment_methods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_token   TEXT NOT NULL,       -- opaque token from payment provider
  brand            TEXT,                -- "visa", "mastercard"
  last4            TEXT,
  is_default       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);

-- RESTAURANTS -------------------------------------------------------------
CREATE TABLE restaurants (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  cuisine_type       TEXT,
  rating             NUMERIC(2,1) DEFAULT 0,
  prep_time_avg_min  INTEGER NOT NULL DEFAULT 15,
  is_open            BOOLEAN NOT NULL DEFAULT true,
  lat                DOUBLE PRECISION NOT NULL,
  lng                DOUBLE PRECISION NOT NULL,
  address            TEXT,
  image_url          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurants_geo ON restaurants(lat, lng);

-- MENU ---------------------------------------------------------------------
CREATE TABLE menu_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id    UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  base_price_cents INTEGER NOT NULL,
  image_url      TEXT,
  is_available   BOOLEAN NOT NULL DEFAULT true,
  allergens      TEXT[] NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);

CREATE TABLE customization_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,               -- "Size", "Toppings"
  selection_type  TEXT NOT NULL CHECK (selection_type IN ('single','multi')),
  is_required     BOOLEAN NOT NULL DEFAULT false,
  min_select      INTEGER NOT NULL DEFAULT 0,
  max_select      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE customization_options (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  price_delta_cents INTEGER NOT NULL DEFAULT 0,
  is_available     BOOLEAN NOT NULL DEFAULT true
);

-- CART -----------------------------------------------------------------
CREATE TABLE carts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id  UUID REFERENCES restaurants(id),
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','abandoned')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id               UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id          UUID NOT NULL REFERENCES menu_items(id),
  quantity              INTEGER NOT NULL DEFAULT 1,
  selected_option_ids   UUID[] NOT NULL DEFAULT '{}',
  line_item_price_cents INTEGER NOT NULL,   -- cached from last /pricing/calculate call, recomputed on any mutation
  notes                 TEXT
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ORDERS -----------------------------------------------------------------
CREATE TABLE orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id),
  restaurant_id        UUID NOT NULL REFERENCES restaurants(id),
  address_id           UUID NOT NULL REFERENCES addresses(id),
  idempotency_key      TEXT NOT NULL UNIQUE,   -- enforces no-double-charge on retry
  status               TEXT NOT NULL DEFAULT 'placed'
                         CHECK (status IN ('placed','confirmed','preparing','ready_for_pickup',
                                            'picked_up','delivering','delivered','cancelled')),
  subtotal_cents       INTEGER NOT NULL,
  delivery_fee_cents   INTEGER NOT NULL,
  service_fee_cents    INTEGER NOT NULL,
  tax_cents            INTEGER NOT NULL,
  tip_cents            INTEGER NOT NULL DEFAULT 0,
  discount_cents       INTEGER NOT NULL DEFAULT 0,
  total_cents          INTEGER NOT NULL,
  eta_min_minutes      INTEGER,
  eta_max_minutes      INTEGER,
  placed_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- order_items SNAPSHOTS name/price/options at time of order — deliberately
-- NOT a live join to menu_items, so later menu/price changes never alter
-- a placed order's receipt. See TECH_SPEC.md §2 and §6.
CREATE TABLE order_items (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id                UUID REFERENCES menu_items(id),   -- nullable: item may later be deleted from catalog
  name_snapshot                TEXT NOT NULL,
  selected_options_snapshot   JSONB NOT NULL DEFAULT '[]',       -- [{ name, priceDeltaCents }]
  quantity                    INTEGER NOT NULL,
  line_item_price_cents       INTEGER NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- order_status_events is an APPEND-ONLY log — the tracking UI's
-- OrderStatusStepper reads from this, never from a single mutable field
-- being re-rendered. See TECH_SPEC.md §4.4 and PRODUCT_SPEC.md §5.
CREATE TABLE order_status_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status       TEXT NOT NULL,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  note         TEXT
);
CREATE INDEX idx_order_status_events_order ON order_status_events(order_id, occurred_at);

-- COURIERS / ASSIGNMENT ----------------------------------------------------
CREATE TABLE couriers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  current_lat   DOUBLE PRECISION,
  current_lng   DOUBLE PRECISION,
  status        TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline','available','on_delivery'))
);

CREATE TABLE courier_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_id   UUID NOT NULL REFERENCES couriers(id),
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RATINGS ------------------------------------------------------------------
CREATE TABLE ratings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id),
  restaurant_rating   SMALLINT CHECK (restaurant_rating BETWEEN 1 AND 5),
  courier_rating      SMALLINT CHECK (courier_rating BETWEEN 1 AND 5),
  comment             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FAVORITES ------------------------------------------------------------------
CREATE TABLE favorites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id  UUID REFERENCES restaurants(id),
  menu_item_id   UUID REFERENCES menu_items(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (restaurant_id IS NOT NULL OR menu_item_id IS NOT NULL)
);
```

## 3. Key Design Decisions (Rationale for the Agent)

1. **`order_items` and `orders` are snapshots, not live references.** This is the single most important schema decision for the product's honesty guarantee: a receipt must always match what the user was shown, permanently, even if the restaurant later changes prices or deletes menu items.
2. **`order_status_events` is append-only.** This makes the tracking timeline auditable and explainable — the UI is a pure read of history, not a guess derived from a single current-state field. It also makes ETA-recompute-on-transition (`TECH_SPEC.md §5`) trivial to implement correctly.
3. **All money is `INTEGER` cents.** Never `NUMERIC`/`FLOAT` for currency — avoids floating-point rounding bugs that would directly undermine the price-honesty promise.
4. **`orders.idempotency_key` has a `UNIQUE` constraint.** This is the database-level backstop for the idempotent order creation requirement in `TECH_SPEC.md §6` — even if application-level idempotency logic has a bug, the DB will still reject a duplicate insert.
5. **`cart_items.line_item_price_cents` is a cache, not authoritative.** It exists so the Cart screen can render instantly without a network round trip, but it must be recomputed via `/pricing/calculate` before checkout is allowed to proceed — never trusted blindly at order-creation time.
