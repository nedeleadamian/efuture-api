# Scaling, Performance, Fault Tolerance & Monitoring

This note describes how I would scale this NestJS + Postgres API to handle **thousands of read requests per second**, keep **low latency**, remain **fault tolerant**, and be **observable** in production.

## How I would scale it

### Horizontal scaling (stateless API)

- Run the API as **multiple instances** behind a load balancer (Kubernetes `Deployment` + `Service`, or ECS + ALB).
- Keep the API **stateless** (no in-memory session state). This app already lends itself to that because auth uses JWTs and cookies.
- Use autoscaling:
  - **HPA** based on CPU + request rate (or p95 latency) using custom metrics.

### Database scaling (read-heavy)

- Use **Postgres read replicas** and route read-only traffic (list endpoints) to replicas.
- Ensure indexes match query patterns (already present for `createdAt`, `authorId + createdAt`, `tagId + createdAt`).
- For very large datasets:
  - Consider **partitioning** (e.g., by time window) for the `message` table.
  - Consider **materialized views** or pre-aggregations if you add heavy analytics.

### Caching

- Introduce a shared cache (e.g., **Redis**) for hot reads:
  - Cache “first page” or common filter combinations for `GET /message`.
  - Cache tag lookups (by `tagName -> tagId`).
- Add HTTP caching semantics where safe (e.g., `ETag`, `Cache-Control`) and optionally place a CDN in front if responses become cacheable.

## How I would ensure minimal response time at scale

### Application-level latency

- Prefer **fast query paths**:
  - Keep explicit field selection (avoid selecting large columns or hidden fields).
  - Use cursor pagination (already implemented) to avoid large offset scans.
- Keep Node overhead low:
  - Use `pino`/structured logging with sampling to avoid log I/O becoming a bottleneck.
  - Avoid heavy synchronous work in request handlers.

### Database-level latency

- Profile and optimize the critical read query:
  - Ensure `ORDER BY createdAt DESC` + cursor filter uses an index.
  - Maintain appropriate compound indexes for frequent filters.
- Use **connection pooling** (e.g., PgBouncer or managed pooling) to avoid connection churn.

### Network & runtime

- Run multiple instances close to the DB (same region/VPC) to reduce RTT.
- Enable HTTP keep-alive and (optionally) response compression where appropriate.

## How I would ensure fault tolerance

### API layer

- Run multiple replicas across **multiple AZs**.
- Add **readiness/liveness** probes and graceful shutdown (stop accepting requests before terminating).
- Add **timeouts** to outbound calls (DB, Redis).

### Database layer

- Use managed Postgres with:
  - Automated backups + PITR
  - Multi-AZ HA
  - Replica promotion / failover

### Resilience patterns

- Apply **rate limiting** (already present via Nest Throttler) to protect the DB.
- Use **circuit breakers** / bulkheads for dependencies (especially cache/DB) so a failing dependency doesn’t collapse the whole service.
- Prefer serving slightly stale data (cache) over failing hard, where acceptable.

## How I would monitor performance and errors in production

### Metrics (SLIs/SLOs)

- Track:
  - RPS, error rate, p50/p95/p99 latency per endpoint
  - DB query latency, connection pool usage
  - Cache hit ratio, cache latency
  - Throttling rate (429s)
- Export via Prometheus metrics endpoint and visualize in Grafana.

### Tracing

- Add distributed tracing with OpenTelemetry:
  - Trace request -> controller -> command -> DB query
  - Helps pinpoint slow queries and N+1 patterns

### Logging

- Use structured JSON logs with:
  - request id / correlation id
  - user id (when authenticated)
  - endpoint + status code + latency
- Centralize logs (ELK/Loki/Cloud logging) and create alerts for error spikes.

### Alerting

- Alerts on:
  - 5xx rate > threshold
  - DB replica lag / DB CPU saturation
  - cache failures or hit ratio drop

### Operational dashboards

- A minimal production dashboard should show:
  - API: traffic, errors, latency
  - DB: load, slow queries, replica lag
  - Cache: hit ratio, evictions, latency
  - Infra: CPU/memory, pod restarts, network
