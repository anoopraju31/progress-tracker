# Architecture Validation Checklist

Every design output must pass these criteria:

### Modularity & Boundaries

- [ ] No circular dependencies between domains or containers.
- [ ] Data ownership is strictly single-writer (no shared databases across independent microservices).
- [ ] Public contracts do not leak database or ORM-level internal entities.

### Scalability & Data

- [ ] Database queries on hot paths have defined indexing strategies.
- [ ] Heavy writes use asynchronous batching or event-driven queuing where immediate consistency is not mandated.
- [ ] Hot storage retention and cold archiving strategies are defined.

### Resiliency & Distributed Systems

- [ ] Distributed transactions avoid two-phase commits (2PC); Sagas with compensating actions are used instead.
- [ ] All message consumers and webhooks are strictly idempotent.
- [ ] Dead-letter queues (DLQ) are configured for unprocessable events.

### Security & Compliance

- [ ] Zero Trust principle applied: Services authenticate service-to-service (e.g., mTLS, signed JWTs).
- [ ] PII and sensitive data are encrypted at rest and in transit.
- [ ] Audit trails exist for sensitive state-mutation operations.
