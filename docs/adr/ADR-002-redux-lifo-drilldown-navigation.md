# ADR-002: Redux Toolkit for LIFO Drilldown Navigation Stack

## Metadata

- **Status:** Accepted
- **Date:** 2026-10-06
- **Decision Makers:** Principal Software Architect
- **Consulted:** Frontend Engineering Team
- **Informed:** Product Stakeholders

---

## 1. Context and Problem Statement

- **Business Driver:** Inside each goal accordion, clicking a task drills into a sub-container revealing its child tasks, replacing the parent task list. The user must be able to drill down infinitely and click "Back" to pop the navigation stack back to the parent container.
- **Technical Problem:** Deciding whether to manage this navigation stack via URL query parameters, local React component state, or global Redux Toolkit state.

---

## 2. Decision Drivers

1. Independent navigation state per accordion item on the dashboard (multiple goals can be open simultaneously).
2. Clean separation between persisted server data and transient UI navigation frames.
3. Fast 60fps LIFO transitions without triggering full page re-renders or router navigation lags.

---

## 3. Considered Options

- **Option 1: Component Local State (`useState`)**
- **Option 2: URL Query Parameters (`?goal1_stack=taskA,taskB`)**
- **Option 3: Redux Toolkit Global State Slice (`navigationStackSlice`)**

---

## 4. Evaluation Matrix

| Evaluation Criteria | Weight (1-5) | Option 1: useState | Option 2: URL Params | Option 3: Redux Toolkit |
| :--- | :--- | :--- | :--- | :--- |
| Independent Multiple Stacks | 5 | 4/5 (Prop drilling / isolated) | 2/5 (URL clutter, sync complexity) | 5/5 (Dictionary keyed by `goalId`) |
| Action Reusability & Modals | 4 | 2/5 (Hard to trigger from global dialogs) | 3/5 | 5/5 (Dispatches from any modal/child component) |
| Performance (Zero router lag) | 4 | 5/5 | 2/5 (Next.js router re-renders) | 5/5 (Targeted selector subscriptions) |
| Developer Ergonomics & DevTools | 3 | 2/5 | 3/5 | 5/5 (Redux DevTools time-travel debugging) |
| **Weighted Total** | | **53** | **37** | **78** |

---

## 5. Decision Outcome & Rationale

We chose **Option 3: Redux Toolkit Global State Slice**.

### Core Rationale
1. Centralizes LIFO stack manipulation (`pushTaskContainer`, `popTaskContainer`, `resetTaskContainer`) with strict type safety.
2. Allows "Add Task" and "Edit Task" dialogs anywhere in the DOM tree to inspect the currently active task container directly from the Redux store without prop drilling.
3. Prevents URL parameter thrashing when interacting with nested tree containers.

---

## 6. Consequences & Trade-offs

### Positive Consequences
- Predictable state transitions and instantaneous UI updates.
- Easy to reset or persist stack states.

### Negative Consequences
- Slight boilerplate for Redux store setup in Next.js App Router (requires client-side Provider wrapper).

---

## 7. Mitigation Strategies
- Wrap dashboard in a lightweight `<Providers>` client component.
