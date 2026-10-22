# ShopSphere

A small online marketplace prototype where customers can register, browse products pulled from an external API, and pay online through PayMongo (test mode).

**Course:** Web Development, BSIT-3 · **Group 4**
**Members:** AGUIMAN, ANTIBO, RANAY, and RELAMPAGOS
**Repository:** https://github.com/PyroNaru/ShopSphere
**Live demo:** shop-sphere-two-sigma.vercel.app · **API:** https://shopsphere-8n7c.onrender.com/api/products

> Payments run in PayMongo **test mode**. No real money is charged.

## Features

- **Registration and login** with client- and server-side validation, hashed passwords, unique emails, and Sanctum token authentication
- **Protected pages:** Orders, Order detail, Account, and Checkout redirect to Login when logged out
- **External API:** product catalog from [DummyJSON](https://dummyjson.com/products), shown with categories, search, sorting, ratings, and discounts
- **Cart and checkout review page** with a delivery summary before payment
- **PayMongo Checkout** (card, GCash, Maya) in test mode, with payment status updated by webhook
- **Order history and delivery tracking** (simulated; see Limitations)

## Tech stack

| Part         | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| Frontend     | React 19, Vite, React Router, Axios                           |
| Backend      | Laravel 12 (PHP 8.2+; PHP 8.3 in Docker), Laravel Sanctum     |
| Database     | SQLite for local development, PostgreSQL in production        |
| Payments     | PayMongo Checkout Sessions API (TEST keys only)               |
| External API | DummyJSON products (no API key required)                      |
| Deployment   | Frontend on Vercel, backend as a Docker container (see below) |

## Deployment

ShopSphere runs as two separate deployments that talk to each other over HTTPS.

| Part     | Where             | How it is built                                                                                                                                     |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | Vercel            | `frontend/` built with Vite. `vercel.json` rewrites every path to `index.html` so React Router routes (like `/orders/5`) work on refresh.           |
| Backend  | Docker-based host | `backend/Dockerfile` (PHP 8.3 CLI + Composer, `pdo_pgsql`). On start it runs `php artisan migrate --force` and serves on `$PORT` (default `10000`). |
| Database | PostgreSQL        | Selected with `DB_CONNECTION=pgsql` and the `DB_*` variables below.                                                                                 |

### Backend environment variables (production)

| Variable                                                                        | Value                                                                                          |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `APP_ENV`                                                                       | `production`                                                                                   |
| `APP_DEBUG`                                                                     | `false`                                                                                        |
| `APP_KEY`                                                                       | Output of `php artisan key:generate --show`                                                    |
| `APP_URL`                                                                       | Your backend's public URL                                                                      |
| `DB_CONNECTION`                                                                 | `pgsql`                                                                                        |
| `DB_URL` (or `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) | Your PostgreSQL connection details                                                             |
| `FRONTEND_URL`                                                                  | Your deployed frontend URL, no trailing slash (used for PayMongo success and cancel redirects) |
| `PRODUCT_API`                                                                   | `https://dummyjson.com/products`                                                               |
| `PAYMONGO_SECRET_KEY`                                                           | PayMongo **test** secret key (`sk_test_...`)                                                   |
| `PAYMONGO_WEBHOOK_SECRET`                                                       | Signing secret of the PayMongo webhook                                                         |

### Frontend environment variable (Vercel)

| Variable       | Value                                                 |
| -------------- | ----------------------------------------------------- |
| `VITE_API_URL` | `https://<your-backend-url>/api` (must end in `/api`) |

Vite bakes this value in at build time, so **redeploy the frontend after changing it**.

### PayMongo webhook (production)

No ngrok is needed once the backend is public. In the PayMongo dashboard (test mode), create a webhook with:

- **URL:** `https://<your-backend-url>/api/paymongo/webhook`
- **Event:** `checkout_session.payment.paid`

Then copy the webhook's signing secret into `PAYMONGO_WEBHOOK_SECRET` on the backend and redeploy. Without it, payments succeed on PayMongo but orders never change from "Unpaid" to "Paid".

## Local setup

You need PHP 8.2+, Composer, and Node.js.

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate
```

Open `.env` and fill in:

| Variable                  | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `PAYMONGO_SECRET_KEY`     | Your PayMongo **test** secret key (`sk_test_...`)     |
| `PAYMONGO_WEBHOOK_SECRET` | Signing secret of your PayMongo webhook (see below)   |
| `FRONTEND_URL`            | Frontend address, default `http://localhost:5173`     |
| `PRODUCT_API`             | Product API, default `https://dummyjson.com/products` |

Locally the app uses SQLite (`DB_CONNECTION=sqlite`), so no database server is needed. Then run:

```bash
php artisan migrate
php artisan serve             # http://127.0.0.1:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://127.0.0.1:8000/api
npm run dev                   # http://localhost:5173
```

### 3. PayMongo webhook for local testing (needed so orders become "Paid")

1. Expose the backend publicly, for example with `ngrok http 8000`.
2. In the PayMongo dashboard (test mode), create a webhook with the URL `https://<your-ngrok-url>/api/paymongo/webhook` and the event `checkout_session.payment.paid`.
3. Copy the webhook's signing secret into `PAYMONGO_WEBHOOK_SECRET` in `backend/.env`.

## External API and why we chose it

We used **DummyJSON** (`/products`). It needs no API key, returns categories, ratings, discounts, and images, and suits a store prototype. The browser never calls it directly: the Laravel backend fetches it and converts the USD prices to PHP (rate set in `ProductController::USD_TO_PHP`). The frontend shows loading skeletons, an error message with a Retry button, and a "no results" state.

## How the PayMongo test flow works

1. On the **Checkout** page the browser sends only each product's `id` and `quantity`. It never sends prices.
2. The backend looks up the real price of each product from the product API, so a price can't be changed from the browser.
3. The backend creates a **PayMongo Checkout Session** (PHP, card/GCash/Maya) and saves an order with status `pending`, including the delivery name, contact, and address.
4. The user is redirected to PayMongo's hosted checkout page.
5. **On success**, PayMongo sends a `checkout_session.payment.paid` webhook. The backend verifies the signature (HMAC-SHA256 with the webhook secret), marks the order `paid`, and creates the shipment record.
6. The user returns to `/success`, which polls the order every 2 seconds (up to about 16 seconds) until the webhook has marked it paid, then shows the confirmation. The cart is cleared only at this point.
7. **On cancel or failure**, PayMongo redirects to `/failed`, which shows a message and keeps the cart so the user can try again. The order stays `pending` and appears under "Unpaid" in Orders.

**Test payment:** use PayMongo's official test cards (see PayMongo docs, "Testing"). For example, the successful test card is `4343 4343 4343 4345` with any future expiry date and any CVC. For a failed payment, use a declined test card from the same docs page, or cancel on the checkout page.

## Security

- All secrets live in environment variables (`.env` locally, the host's dashboard in production). `.env` is excluded by `.gitignore`, and `.env.example` has placeholders only.
- PayMongo secret and webhook keys exist only on the backend. TEST keys only.
- Passwords are hashed (Laravel `hashed` cast, bcrypt). Emails are unique.
- Inputs are validated on the server; Eloquent uses parameterized queries (protects against SQL injection) and React escapes output by default (protects against XSS).
- Prices are decided on the server, and webhooks must have a valid signature.
- Orders can only be viewed by the user who owns them.

## Limitations (prototype scope)

- **Delivery tracking is simulated.** The carrier and tracking number are generated automatically when payment is confirmed. The "Simulate next delivery step (demo)" button on the order page moves the shipment along so the timeline can be shown. No real courier API is connected.
- Delivery address comes from the profile entered at registration; there is no edit-profile page yet.
- Each time the user clicks "Place order", a `pending` order is created before PayMongo opens.
- Payments are **test mode only**. Going live would need PayMongo live keys, a live webhook, and a business verification with PayMongo.
- Product prices use a fixed USD to PHP rate, not a live exchange rate.
- If the backend host sleeps when idle (common on free tiers), the first request after a break can be slow.

## Project structure

```
backend/   Laravel API (controllers: Auth, Product, Payment, PayMongoWebhook, Order)
           Dockerfile for deployment, migrations for users, orders, shipments, tokens
frontend/  React app (src/pages: Home, Products, Cart, Checkout, Orders, OrderDetail, ...)
           vercel.json for single-page-app routing on Vercel
```
