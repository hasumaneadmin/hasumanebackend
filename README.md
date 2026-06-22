# HasuMane

HasuMane is split into a TanStack Start frontend and an Express backend.

## Run Locally

```bash
npm run dev:frontend
npm run start --workspace=backend
```

Frontend: `http://localhost:5173`

Backend gateway: `http://localhost:5000`

The frontend reads `VITE_API_URL`. If it is not set, it defaults to `http://localhost:5000`.

## Backend Environment

Copy `backend/.env.example` to `backend/.env`.

Important values:

```bash
PORT=5000
ADMIN_API_TOKEN=hasumane-dev-admin
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=
WATI_API_KEY=
```

When `DATABASE_URL` is absent, the backend uses `backend/data/db.json` as a local Prisma-compatible mock database. When `DATABASE_URL` is present, it uses Prisma with Postgres.

## Main API

Public:

```text
GET  /api/health
GET  /api/products
POST /api/leads
POST /api/subscriptions/public
POST /api/webhooks/whatsapp
```

Admin-protected with `x-admin-token` or `Authorization: Bearer <token>`:

```text
GET   /api/admin/summary
GET   /api/users
POST  /api/users
GET   /api/subscriptions
POST  /api/subscriptions
PATCH /api/subscriptions/:id/status
PATCH /api/subscriptions/:id/pause
PATCH /api/subscriptions/:id/resume
POST  /api/dispatch/run
GET   /api/orders
PATCH /api/orders/:id/deliver
GET   /api/farmers
POST  /api/farmers
GET   /api/farmers/:id/payouts
GET   /api/procurement/logs
POST  /api/procurement/logs
GET   /api/notifications
POST  /api/notifications/enqueue
```

Example:

```bash
curl -H "x-admin-token: hasumane-dev-admin" http://localhost:5000/api/admin/summary
```
