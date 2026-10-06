# Phase 1: Ingestion & NFR Discovery (Verified & Baselined)
**Project:** Progress Tracker (Hierarchical Goal & Task Orchestration System)  
**Date:** 2026-10-06  
**Status:** Accepted & Verified  

---

## 1. Scope Parsing & Functional Profile

### 1.1 Business Drivers
- Empower users to track multi-tiered, arbitrarily deep hierarchical goals and nested subtasks with real-time recursive progress aggregation.
- Deliver an interactive, drilldown navigation stack (LIFO accordion container navigation) without client-side state thrashing.
- Support custom visual styling per goal (background color, text color tokens) with instant responsive UI updates.

### 1.2 Primary Actors
- **Authenticated User:** Manages goals, drills down nested task trees, performs CRUD on tasks, marks tasks complete, customizes goal themes, manages user profile.
- **Anonymous Visitor:** Restricted to authentication entry points (`/` login, `/register`).

### 1.3 Core Functional Capabilities
1. **Goal Management:** CRUD operations on root goal entities, theme configuration (`bgColor`, `textColor`).
2. **Hierarchical Task Trees (Arbitrary Depth):** Infinite recursive parent-child relations; adding, editing, deleting, and completing tasks at any level.
3. **Recursive Progress Computation:** Parent progress percentage dynamically computed based on state of direct children and nested descendants.
4. **Drilldown Task Container Navigation Stack:** Accordion level contains LIFO task navigation stack. Selecting a task pushes it onto the stack and displays its direct subtasks; clicking "Back" pops the stack.
5. **Modal Workflows:** Accessible dialog modals for Add Task and Edit Task with validation.
6. **Authentication & Identity:** Secure HTTP-only cookie-based authentication with session verification.

---

## 2. Quantified Non-Functional Requirements (NFRs) Matrix

| Category | Metric / Constraint | Baseline Target | Peak Target | Unit / Standard | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Throughput** | Read RPS (Dashboard & Task Trees) | 300 RPS | 3,000 RPS | Requests / sec | Verified |
| **Throughput** | Write RPS (Task CRUD, Status toggles) | 60 RPS | 600 RPS | Requests / sec | Verified |
| **Latency** | Tree Fetch (Root to Depth $N$) | p50 < 30ms | p99 < 100ms | Milliseconds | Verified |
| **Latency** | Task Mutation & Recursive Rollup | p50 < 40ms | p99 < 120ms | Milliseconds | Verified |
| **Latency** | Client Stack Drilldown (LIFO Transition)| < 16ms | < 32ms | 60 fps smooth frame | Verified |
| **Availability** | Web App & API Availability | 99.95% | 99.95% | Uptime SLA | Verified |
| **Durability** | Target RPO / RTO | RPO $\le 1$ min | RTO $\le 15$ min | Backup/Restore window | Verified |
| **Data Scale** | Active User Growth (Year 1) | ~50,000 users | ~5,000,000 task nodes | Storage: ~10 GB | Verified |

---

## 3. Technology Stack & Environmental Constraints

- **Frontend:** Next.js App Router (React 19), TypeScript, Tailwind CSS v4, Redux Toolkit (`@reduxjs/toolkit`, `react-redux`).
- **Persistence Layer:** MongoDB Atlas (Cloud), Prisma ORM (`@prisma/client`).
- **Connection Management:** `DATABASE_URL` via environment variable (`.env.local`).
- **Auth Strategy:** HTTP-only Secure Cookie session tokens (stateless signed JWT or session store).
- **Page Topography:**
  - `/` (Login)
  - `/register` (Sign Up)
  - `/dashboard` (Welcome banner, Goal creation trigger, Goals Accordion list)
  - `/profile` (User details and preferences)
