# HasuMane

HasuMane is split into a TanStack Start frontend and a NestJS backend.

## Run Locally

```bash
npm run dev
```

Frontend: Vite prints the selected local URL. In this environment it used `http://localhost:8080`.

Backend API: `http://localhost:5000/api/v1`

Admin panel: `/admin`

The browser admin panel reads `VITE_API_URL`. If it is not set, it defaults to `http://localhost:5000` and appends `/api/v1`.
The server-side lead route reads `BACKEND_API_URL`. If it is not set, it forwards to the NestJS backend at `http://localhost:5000/api/v1`.

### Local API 404 Troubleshooting

Directly opening lead submission endpoints such as `http://localhost:5000/api/v1/leads` or `http://localhost:5000/api/v1/subscriptions/public` in a browser sends a `GET` request. Those endpoints accept `POST` lead submissions, so use the homepage form or a `POST` request when testing them.

For frontend and admin-panel development, run the root workflow:

```bash
npm run dev
```

Keep `frontend/.env` pointed at the NestJS backend origin:

```bash
BACKEND_API_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

## Backend Environment

Copy `backend/.env.example` to `backend/.env`.

Important values:

```bash
PORT=5000
ADMIN_API_TOKEN=
ADMIN_PHONE=
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=
WATI_API_KEY=
```

The NestJS backend uses Prisma with PostgreSQL. Set `DATABASE_URL` before starting the API.

## Data Capture And Admin

Public lead capture stores structured subscription intent:

```text
name, phone, area, product, quantity, plan, notes, source, user agent, referrer
```

The backend creates or updates the customer, stores an active address, creates a pending subscription, persists a lead record in PostgreSQL, and queues a notification record.

Open `/admin`, enter `ADMIN_API_TOKEN`, and use the dashboard to review leads, activate or reject subscriptions, generate dispatch orders, mark deliveries, add farmers, log procurement, and inspect notifications.

## Main API

Public:

```text
GET  /api/v1/health
GET  /api/v1/products
POST /api/v1/leads
POST /api/v1/subscriptions/public
```

Admin-protected after `POST /api/v1/admin/session`. Mutating requests must send the `x-csrf-token` header from the session response:

```text
POST   /api/v1/admin/session
GET    /api/v1/admin/session
DELETE /api/v1/admin/session
GET    /api/v1/admin/summary
GET    /api/v1/admin/leads
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/subscriptions
POST   /api/v1/subscriptions
PATCH  /api/v1/subscriptions/:id/status
PATCH  /api/v1/subscriptions/:id/pause
PATCH  /api/v1/subscriptions/:id/resume
POST   /api/v1/dispatch/run
GET    /api/v1/dispatch/orders
PATCH  /api/v1/dispatch/orders/:id/deliver
GET    /api/v1/farmers
POST   /api/v1/farmers
GET    /api/v1/farmers/:id/payouts
GET    /api/v1/procurement/logs
POST   /api/v1/procurement/logs
GET    /api/v1/notifications
POST   /api/v1/notifications/enqueue
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/dashboard
GET    /api/v1/logs
GET    /api/v1/analytics/overview
GET    /api/v1/analytics/orders
GET    /api/v1/analytics/subscriptions
GET    /api/v1/analytics/leads
GET    /api/v1/analytics/inventory
GET    /api/v1/analytics/notifications
GET    /api/v1/inventory
GET    /api/v1/inventory/low-stock
GET    /api/v1/inventory/out-of-stock
GET    /api/v1/inventory/movements
PATCH  /api/v1/inventory/:id/adjust
GET    /api/v1/notification-center/pending
GET    /api/v1/notification-center/sent
GET    /api/v1/notification-center/failed
POST   /api/v1/notification-center/:id/retry
GET    /api/v1/metrics
```

Example:

```bash
curl http://localhost:5000/api/v1/health
```

## Production Backend Quality

The backend now includes audit logging, structured Pino logs, analytics APIs, inventory alerts, notification retry management, Prometheus metrics, Grafana dashboard JSON, Prometheus alert rules, and a Jest coverage gate for executable production logic.

Payment gateway, refund processing, live GPS tracking, route optimization, driver apps, coupons, and loyalty points remain deferred.
