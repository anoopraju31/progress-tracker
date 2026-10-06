# Phase 3: Structural Topologies & C4 Modeling
**Project:** Progress Tracker (Hierarchical Goal & Task Orchestration System)  
**Date:** 2026-10-06  
**Status:** Complete  

---

## 1. Architectural Topology Evaluation

### Selected Topology: Modular Monolith (Next.js Full-Stack Runtime)

**Rationale & Complexity Budget:**
- **Distribution Overhead:** Zero network hops between UI orchestration and API services.
- **Transactional Simplicity:** Single deployment unit simplifies atomic tree updates and eliminates distributed saga coordination.
- **Scalability Profile:** Stateless Next.js instances scale horizontally behind an L7 load balancer; database operations scale independently on MongoDB Atlas.

---

## 2. C4 Architecture Models

### 2.1 Level 1: System Context Diagram

```mermaid
C4Context
    title System Context Diagram - Progress Tracker

    Person(user, "Authenticated User", "Creates goals, decomposes tasks into infinite subtrees, tracks visual progress.")
    System(progress_tracker, "Progress Tracker Application", "Next.js App Router delivering SSR/Client UI, Tree Processing Engine, and REST Route Handlers.")
    SystemDb(mongodb, "MongoDB Atlas", "Managed document datastore storing Users, Goals, and Hierarchical Task nodes.")

    Rel(user, progress_tracker, "Interacts with UI / Submits mutations", "HTTPS / HTTP-only Cookies")
    Rel(progress_tracker, mongodb, "Reads & Writes documents via Prisma ORM", "MongoDB Wire Protocol / TLS")
```

---

### 2.2 Level 2: Container Diagram

```mermaid
C4Container
    title Container Diagram - Progress Tracker Deployable Units

    Person(user, "User Client", "Modern Web Browser")

    Container_Boundary(next_app, "Next.js 16 Runtime (Node.js / Edge)") {
        Container(client_spa, "Client SPA & State Engine", "React 19, Redux Toolkit, Tailwind v4", "Renders Accordion UI, manages local LIFO container navigation stack, optimistic mutations.")
        Container(edge_middleware, "Edge Auth Middleware", "Next.js Middleware", "Validates HTTP-only session cookies and guards protected routes (/dashboard, /profile).")
        Container(api_routes, "Domain API Route Handlers", "Next.js App Router API Routes", "Executes business validation, recursive tree rollups, and user profile operations.")
    }

    ContainerDb(db, "Cloud Database", "MongoDB Atlas", "Houses user collections, goals, and embedded/referenced hierarchical task graphs.")

    Rel(user, client_spa, "Navigates and triggers actions", "HTTPS")
    Rel(client_spa, edge_middleware, "Issues API mutations & fetches", "Fetch API / JSON")
    Rel(edge_middleware, api_routes, "Forwards authenticated request with session claims", "Internal")
    Rel(api_routes, db, "Executes queries and updates via Prisma", "Prisma Client (TLS)")
```

---

### 2.3 Level 3: Component Diagram (API & Business Logic)

```mermaid
C4Component
    title Component Diagram - Next.js Domain Layer

    Container_Boundary(api_boundary, "API & Application Layer") {
        Component(auth_controller, "Auth Controller", "App Route: /api/auth/*", "Handles /register, /login, /logout, password hashing (bcrypt), and cookie issuance.")
        Component(goal_controller, "Goal Controller", "App Route: /api/goals/*", "Manages goal creation, updates, deletions, and theme metadata.")
        Component(task_controller, "Task Controller", "App Route: /api/goals/[id]/tasks/*", "Dispatches task CRUD, parent reassignment, and status toggle requests.")
        Component(tree_engine, "Hierarchical Task Engine", "TypeScript Domain Service", "Recursively traverses nodes, prevents circular ancestry, and recalculates parent completion %.")
        Component(prisma_service, "Prisma DB Client", "Prisma Singleton", "Brokers connections and query pooling to MongoDB Atlas.")
    }

    ContainerDb(db_instance, "MongoDB Atlas", "Replica Set")

    Rel(auth_controller, prisma_service, "Queries / persists user records")
    Rel(goal_controller, prisma_service, "CRUD on goal root documents")
    Rel(task_controller, tree_engine, "Delegates tree mutation & rollup calculation")
    Rel(tree_engine, prisma_service, "Persists updated tree state and progress percentages")
    Rel(prisma_service, db_instance, "Executes MongoDB queries")
```

---

## 3. Container-Level Infrastructure Mapping

| Container | Runtime / Compute | Memory / CPU Target | Scaling Strategy |
| :--- | :--- | :--- | :--- |
| **Next.js Web / API** | Node.js 20 LTS (Vercel / Container) | 512MB - 1GB RAM, 1 vCPU | Auto-scaling horizontal stateless replicas |
| **Edge Middleware** | Edge Runtime (V8 isolates) | 128MB RAM, ultra-low latency | Global edge network point of presence |
| **Client Redux Store** | Browser Client Memory | < 50MB browser footprint | Client-side memory execution |
| **MongoDB Atlas** | Managed M10+ Replica Set | 2GB - 4GB RAM, Multi-AZ | Cloud replica set auto-failover with daily snapshots |
