# Phase 5: Resiliency, FMEA & Observability Blueprint
**Project:** Progress Tracker (Hierarchical Goal & Task Orchestration System)  
**Date:** 2026-10-06  
**Status:** Complete  

---

## 1. Failure Mode and Effects Analysis (FMEA)

| Component / Path | Failure Mode | Severity (1-5) | Probability (1-5) | Detection (1-5) | RPN | Automated Mitigation | Recovery / Fallback Procedure |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | Primary node failover / connection drop | 5 | 2 | 1 | **10** | Prisma connection retry pool; client-side exponential backoff | Automatic replica election; alert on 500 error spikes |
| **Recursive Tree Engine**| Circular parent-child loop introduced via race condition | 4 | 2 | 2 | **16** | Cycle-detection in memory using visited Set during tree build | Reject cycle mutations with HTTP 400 `CIRCULAR_DEPENDENCY` |
| **Client LIFO Stack** | State corruption or orphan task ID in navigation stack | 2 | 2 | 1 | **4** | Redux fallback: if current stack task ID not in tree, auto-pop to parent root | Resets container stack cleanly to top-level tasks |
| **Session Cookie** | Stale or tampered cookie | 3 | 2 | 1 | **6** | Signed JWT verification in Next.js Middleware with expiry check | Immediate redirection to `/` login with clean cookie eviction |
| **Deep Tree Render** | Render thrashing / layout lag from large subtrees | 3 | 3 | 2 | **18** | Virtualized DOM / Accordion viewport lazy loading (only active level renders) | Accordion container hides inactive siblings; avoids rendering massive DOM trees |

*RPN Scale: Severity (1-5) x Probability (1-5) x Detection (1-5).*

---

## 2. Idempotency & Data Consistency Strategy

1. **Atomic Goal Subtree Mutations:** 
   - When a task status is toggled, its progress and parent progress recalculations are committed within an atomic update or synchronous post-order sequence.
2. **Cascading Node Deletion:**
   - Deleting a node recursively collects all descendant IDs before executing a batch `$in: [descendantIds]` deletion in MongoDB, preventing orphan nodes.
3. **Optimistic UI Updates:**
   - Redux store can optimistically toggle task completion while the API request is inflight; on network failure, Redux reverts to previous state and displays a toast error.

---

## 3. Observability Blueprint

- **Golden Signals:**
  - **Latency:** API route execution duration (Next.js server timing headers).
  - **Traffic:** Requests per minute on `/api/goals` and `/api/goals/:id/tasks`.
  - **Errors:** 4xx validation errors vs. 5xx server exceptions captured via structured console logs.
  - **Saturation:** Node.js memory footprint and MongoDB connection pool saturation.
