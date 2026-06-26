# HasuMane Monitoring Guide

## Endpoints

```text
GET /api/v1/health/live
GET /api/v1/health/ready
GET /api/v1/metrics
```

`/metrics` exposes Prometheus text metrics for API uptime, request count, error count, average response time, active users, observed database query count, low inventory count, heap memory, RSS memory, and process CPU usage.

## Grafana

Import:

```text
backend/monitoring/grafana-dashboard.json
```

Dashboard panels cover API performance, error rates, active users, database query count, CPU, memory, low inventory, and uptime.

## Alerts

Load:

```text
backend/monitoring/prometheus-alerts.yml
```

Configured alerts:

- Critical: API down, database telemetry unavailable.
- Warning: high error rate, high latency, low inventory.
- Resource: CPU over 80%, memory over 80%.

## Logging

Set `LOG_LEVEL` in the backend environment. Logs are emitted through Pino and persisted to `system_logs` for the admin log API:

```text
GET /api/v1/logs
```

Supported filters: `search`, `from`, `to`, `severity`, `module`, `category`, `page`, and `limit`.
