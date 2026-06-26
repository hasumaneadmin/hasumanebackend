# HasuMane Backend Deployment

## Production Migration Strategy

1. Provision PostgreSQL and Redis.
2. Set `DATABASE_URL`, `REDIS_URL`, JWT secrets, cookie secret, and `CORS_ORIGIN`.
3. Run `npm ci`.
4. Run `npm run prisma:generate`.
5. Run `npm run prisma:migrate`.
6. Run `npm run build`.
7. Run `npm run seed` once for the first super admin and RBAC rows.
8. Start with `npm start`.

## Security Checklist

- Use 64+ character JWT secrets.
- Set `CORS_ORIGIN` to trusted domains only.
- Run behind HTTPS.
- Keep HttpOnly token cookies enabled.
- Send `x-csrf-token` on mutating requests.
- Rotate refresh sessions after every refresh.
- Keep Prisma migrations reviewed before deployment.

## Observability

- `/api/v1/health`, `/api/v1/health/live`, and `/api/v1/health/ready` expose health checks.
- `/api/v1/metrics` exposes Prometheus metrics for request count, errors, latency, active users, database query count, low inventory, CPU, and memory.
- Every request receives an `x-request-id`.
- Pino structured logs include request ID, user ID, method, endpoint, status code, duration, and error stacks.
- Audit logs are written for auth, RBAC, user, product, order, subscription, settings, notification, and inventory events.
- Import `monitoring/grafana-dashboard.json` into Grafana and load `monitoring/prometheus-alerts.yml` into Prometheus or Alertmanager-compatible tooling.

## Production Verification

Run the same backend checks used by CI:

```bash
npm run lint
npm run test:cov
npm run build
```

The coverage gate is enforced at:

```text
Statements: 80%
Functions: 80%
Branches: 75%
Lines: 80%
```

## API Documentation

Swagger is available at `/api/docs` after the app starts.
