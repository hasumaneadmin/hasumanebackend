# HasuMane Backend Testing Guide

## Commands

```bash
npm run lint
npm test
npm run test:cov
npm run test:e2e
npm run build
```

## Coverage Gate

CI enforces:

```text
Statements: 80%
Functions: 80%
Branches: 75%
Lines: 80%
```

The current production-logic coverage is:

```text
Statements: 98.44%
Functions: 98.76%
Branches: 80.75%
Lines: 99.69%
```

The gate covers executable production behavior for security guards, interceptors, pagination utilities, analytics, audit logs, inventory intelligence, structured logging, monitoring, notification management, and RBAC.

DTO classes, Nest module wrappers, Swagger-only controllers, and bootstrap code are intentionally excluded from the gate because they are validated through TypeScript, Nest integration, and e2e/API tests.

## Covered Areas

- Auth registration and login failure paths.
- RBAC permission enforcement and audit recording.
- CSRF and JWT guard behavior.
- Product creation and missing-product failure.
- Order creation, access control, and cancellation guardrails.
- Subscription create, pause, resume, and missing-subscription paths.
- Inventory low-stock, out-of-stock, movement history, stock adjustment, and missing-item paths.
- Notification status lists, retry behavior, and provider/no-provider branches.
- Audit listing, filtering, dashboard summaries, and system events.
- Structured logs, searchable logs, persistence failure tolerance, and date/category filters.
- Analytics overview, order, subscription, lead, inventory, notification, CSV, PDF, custom date, and zero-data paths.
- Prometheus metrics for request, error, latency, active user, database query, CPU, memory, and inventory signals.
