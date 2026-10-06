# ADR-001: Hierarchical Task Storage Strategy with MongoDB & Prisma

## Metadata

- **Status:** Accepted
- **Date:** 2026-10-06
- **Decision Makers:** Principal Software Architect
- **Consulted:** Engineering Team
- **Informed:** Product Stakeholders

---

## 1. Context and Problem Statement

- **Business Driver:** Users build arbitrary-depth task trees under goals with real-time recursive progress percentage calculation.
- **Technical Problem:** Choosing between a deeply embedded document schema vs. a referenced adjacency-list document model in MongoDB.
- **Constraints:** MongoDB 16MB document limit, Prisma ORM schema compatibility, rapid tree traversal for UI rendering.

---

## 2. Decision Drivers

1. Support arbitrary nesting depth without hitting hard document schema recursion limits.
2. Fast CRUD operations on single tasks without rewriting the entire parent goal document.
3. Clean cascading deletion of child subtrees.
4. Simplicity in querying goals and their task sets.

---

## 3. Considered Options

- **Option 1: Deeply Nested Embedded Documents** (Goal document contains nested array of tasks, which contain arrays of tasks).
- **Option 2: Referenced Adjacency List Model** (Separate `Task` collection with `goalId` and nullable `parentId`).
- **Option 3: Materialized Path String** (`path: "/rootId/parentId/taskId"`).

---

## 4. Evaluation Matrix

| Evaluation Criteria | Weight (1-5) | Option 1: Embedded | Option 2: Referenced Adjacency List | Option 3: Materialized Path |
| :--- | :--- | :--- | :--- | :--- |
| Arbitrary Recursion Support | 5 | 2/5 (Prisma embedded types struggle with self-referential nesting) | 5/5 (Native self-reference via `parentId`) | 4/5 (Requires string parsing) |
| Granular Task Mutations | 4 | 2/5 (Complex positional operators in Mongo) | 5/5 (Direct indexed update by ID) | 4/5 (Update cascades on move) |
| Cascade Deletions | 4 | 5/5 (Atomic with goal) | 4/5 (Prisma relation cascade or single DFS pass) | 4/5 (Prefix regex match) |
| Query Simplicity | 3 | 4/5 (Single doc load) | 4/5 (`findMany({ where: { goalId } })` + in-memory tree builder) | 3/5 (Regex queries slower) |
| **Weighted Total** | | **38** | **74** | **61** |

---

## 5. Decision Outcome & Rationale

We chose **Option 2: Referenced Adjacency List Model** with in-memory tree hydration.

### Core Rationale
1. Prisma ORM in MongoDB supports self-referential model relations cleanest via adjacency lists (`parentId`).
2. When loading a goal on the dashboard, a single query `prisma.task.findMany({ where: { goalId } })` retrieves all tasks for that goal in milliseconds.
3. Building the tree in-memory via a single $O(N)$ hashmap pass avoids database recursion limits and provides total flexibility for calculating recursive progress rollups.

---

## 6. Consequences & Trade-offs

### Positive Consequences
- Individual tasks can be edited, toggled, or deleted with direct indexed queries.
- Zero risk of hitting MongoDB's 16MB document cap.

### Negative Consequences
- Deleting a node requires collecting descendant IDs to clean up orphaned subtrees.

---

## 7. Mitigation Strategies
- Implement a centralized `treeService.getDescendantIds(taskId)` helper to execute atomic batch deletions (`deleteMany({ where: { id: { in: ids } } })`).
