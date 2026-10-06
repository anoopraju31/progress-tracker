# Phase 4: Data Flow, Storage & Interface Contracts
**Project:** Progress Tracker (Hierarchical Goal & Task Orchestration System)  
**Date:** 2026-10-06  
**Status:** Complete  

---

## 1. Datastore Schema (Prisma / MongoDB Atlas)

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  goals     Goal[]
}

model Goal {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  userId         String   @db.ObjectId
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  themeBgColor   String   @default("#1e293b") // Slate 800 default
  themeTextColor String   @default("#f8fafc") // Slate 50 default
  progress       Float    @default(0.0)      // Aggregated 0.0 - 100.0%
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tasks          Task[]

  @@index([userId])
}

model Task {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  goalId      String   @db.ObjectId
  goal        Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  parentId    String?  @db.ObjectId           // Null = Top-level task under Goal
  title       String
  description String?
  isCompleted Boolean  @default(false)
  progress    Float    @default(0.0)          // Calculated rollup 0.0 - 100.0%
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([goalId, parentId])
}
```

### 1.1 Indexing & Query Patterns
- `Goal [userId]`: Fast fetching of user dashboard goals.
- `Task [goalId, parentId]`: Enables single-query retrieval of the entire task set for a goal, indexed for rapid parent-child tree mapping.
- Cascading delete enforced via Prisma schema relations (`onDelete: Cascade`) ensuring orphan task cleanup.

---

## 2. Recursive Rollup Algorithm (TypeScript Domain Logic)

```typescript
export interface TaskNode {
  id: string;
  goalId: string;
  parentId: string | null;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  progress: number;
  subTasks: TaskNode[];
}

/**
 * Builds an in-memory recursive tree from flat database tasks and computes progress rollups.
 */
export function buildTreeAndRollup(flatTasks: any[]): { tree: TaskNode[]; goalProgress: number } {
  const map = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];

  // 1. Initialize nodes
  flatTasks.forEach(t => {
    map.set(t.id, { ...t, subTasks: [] });
  });

  // 2. Link parent to children
  flatTasks.forEach(t => {
    const node = map.get(t.id)!;
    if (t.parentId && map.has(t.parentId)) {
      map.get(t.parentId)!.subTasks.push(node);
    } else {
      roots.push(node);
    }
  });

  // 3. Post-order DFS calculation for progress
  function calculateProgress(node: TaskNode): number {
    if (node.subTasks.length === 0) {
      node.progress = node.isCompleted ? 100 : 0;
      return node.progress;
    }
    const sum = node.subTasks.reduce((acc, child) => acc + calculateProgress(child), 0);
    const avg = Math.round(sum / node.subTasks.length);
    node.progress = node.isCompleted ? 100 : avg;
    return node.progress;
  }

  roots.forEach(root => calculateProgress(root));

  const totalProgress = roots.length === 0 
    ? 0 
    : Math.round(roots.reduce((acc, r) => acc + r.progress, 0) / roots.length);

  return { tree: roots, goalProgress: totalProgress };
}
```

---

## 3. Synchronous API Interface Contracts

### 3.1 Standard Envelopes

**Success Envelope:**
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-10-06T16:40:00.000Z"
}
```

**Error Envelope:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED | UNAUTHORIZED | NOT_FOUND",
    "message": "Human-readable message",
    "details": []
  },
  "timestamp": "2026-10-06T16:40:00.000Z"
}
```

### 3.2 Endpoints Specification

| Method | Path | Auth Required | Purpose / Request Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | `{ name, email, password }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` (Sets HTTP-only cookie `auth_token`) |
| `POST` | `/api/auth/logout` | Yes | Clears session cookie |
| `GET` | `/api/auth/me` | Yes | Returns authenticated user profile |
| `GET` | `/api/goals` | Yes | Returns list of goals with task trees and calculated progress |
| `POST` | `/api/goals` | Yes | `{ title, description, themeBgColor, themeTextColor }` |
| `PUT` | `/api/goals/:id` | Yes | `{ title, description, themeBgColor, themeTextColor }` |
| `DELETE`| `/api/goals/:id` | Yes | Cascading delete of goal and all child tasks |
| `POST` | `/api/goals/:id/tasks` | Yes | `{ parentId?: string, title, description? }` |
| `PUT` | `/api/goals/:id/tasks/:taskId` | Yes | `{ title, description? }` |
| `PATCH`| `/api/goals/:id/tasks/:taskId/toggle`| Yes | Toggles `isCompleted` and triggers tree rollup |
| `DELETE`| `/api/goals/:id/tasks/:taskId` | Yes | Recursively deletes task and descendant subtasks |

---

## 4. Client State Model (Redux Toolkit)

### Slice: `navigationStackSlice`
```typescript
interface NavigationStackState {
  // Goal ID -> LIFO Array of parent Task IDs representing drilldown depth
  taskStacks: Record<string, string[]>;
  // Goal ID -> boolean open/close state of accordion
  expandedAccordions: Record<string, boolean>;
}

// Actions:
// - pushTaskContainer({ goalId, taskId })
// - popTaskContainer({ goalId })
// - resetTaskContainer({ goalId })
// - toggleAccordion({ goalId })
```
This isolates client-side accordion drilldown transitions strictly in memory without unnecessary database mutations or route redirects.
