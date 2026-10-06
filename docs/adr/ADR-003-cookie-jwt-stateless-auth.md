# ADR-003: Cookie-Based Stateless Authentication

## Metadata

- **Status:** Accepted
- **Date:** 2026-10-06
- **Decision Makers:** Principal Software Architect
- **Consulted:** Security & Backend Engineering
- **Informed:** Product Stakeholders

---

## 1. Context and Problem Statement

- **Business Driver:** Progress Tracker requires secure user registration, login, logout, and protected routes (`/dashboard`, `/profile`).
- **Technical Problem:** Deciding between localStorage bearer tokens, stateful database sessions, and HTTP-only cookie-based signed JWT tokens.

---

## 2. Decision Drivers

1. Protection against Cross-Site Scripting (XSS) and token theft.
2. Low-latency edge route verification in Next.js Middleware without database roundtrips.
3. Native browser cookie handling for seamless Next.js App Router server and client transitions.

---

## 3. Considered Options

- **Option 1: localStorage Bearer Tokens**
- **Option 2: Stateful Database Sessions (Session Store in MongoDB)**
- **Option 3: Signed HTTP-only Cookie with Stateless JWT**

---

## 4. Evaluation Matrix

| Evaluation Criteria | Weight (1-5) | Option 1: localStorage | Option 2: Stateful DB Sessions | Option 3: HTTP-only Signed JWT |
| :--- | :--- | :--- | :--- | :--- |
| XSS Resilience | 5 | 1/5 (Vulnerable to script theft) | 5/5 (HTTP-only) | 5/5 (HTTP-only) |
| Next.js Edge Middleware Speed | 5 | 1/5 (Cannot read localStorage on server) | 3/5 (Requires DB hit per request) | 5/5 (Cryptographic verification in < 1ms) |
| Operational Simplicity | 4 | 4/5 | 2/5 (Session pruning, table bloat) | 5/5 (Stateless, self-contained claims) |
| CSRF Mitigation | 4 | 5/5 (Bearer header) | 4/5 (Requires SameSite=Lax/Strict) | 4/5 (SameSite=Lax + Secure flag) |
| **Weighted Total** | | **46** | **64** | **86** |

---

## 5. Decision Outcome & Rationale

We chose **Option 3: Signed HTTP-only Cookie with Stateless JWT**.

### Core Rationale
1. Setting `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'` prevents client-side JavaScript access, defending against XSS.
2. Next.js App Router Middleware can verify the JWT cryptographically using `jose` / HMAC-SHA256 at the edge before route rendering, with zero database latency overhead.

---

## 6. Consequences & Trade-offs

### Positive Consequences
- Zero database lookups for standard route protection.
- Works natively with Next.js Server Components, Server Actions, and Route Handlers.

### Negative Consequences
- Token revocation before expiration requires token versioning or a lightweight blocklist if immediate invalidation is needed.

---

## 7. Mitigation Strategies
- Keep JWT lifespan relatively short (e.g., 7 days) and refresh upon active use.
