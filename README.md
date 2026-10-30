# EventPilot — Living Event Intelligence

> **GenAI-Powered Living Event Planning Assistant**  
> *Deterministic calculations own the facts. Google Gemini owns the reasoning. Firebase Realtime Database owns persistence. The user owns decisions.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-black.svg)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FFA611.svg)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini-8E75B2.svg)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0_Passing-729B1B.svg)](https://vitest.dev/)

---

## 1. Executive Summary & Core Philosophy

Traditional event management software suffers from a fundamental divide:

- **Spreadsheets & Rigid Software:** Accurate with numbers, but static, fragile, and unable to reason about trade-offs or contextual decisions.
- **Generic AI Chatbots:** Unreliable with arithmetic, prone to financial hallucinations, unconnected to relational dependencies, and blind to real-world logistics.

**EventPilot** bridges this divide with an architectural paradigm:

$$\text{Deterministic Facts (Pure Code)} \longleftrightarrow \text{Semantic Reasoning (Google Gemini)} \longleftrightarrow \text{Isolated Persistence (Firebase RTDB)}$$

When circumstances change in the real world—such as increasing guest count from 150 to 190—EventPilot does **not** ask an LLM to guess the new budget. Instead:

1. **Deterministic Engines** calculate the exact mathematical consequences across catering costs, venue capacities, contingency margins, and critical path schedules.
2. **Google Gemini** evaluates the verified numerical state to propose concrete, actionable trade-offs (e.g., reallocating floral decor budget or consolidating catering courses to offset expenses).
3. **The User** retains full control to inspect, modify, and approve recommendations before anything is committed to the database.

---

## 2. Key Capabilities & System Features

### 🎯 Dynamic "New Event" Configurator

- Tailored onboarding and configuration for distinct event categories:
  - **Weddings & Receptions:** Mandap, catering styles, rituals, photography shot lists, and hospitality.
  - **Milestone Birthdays:** Lounge configurations, custom cake, DJ sound, photobooth, and party favors.
  - **Corporate Summits:** Stage AV, LED walls, executive dining, badging, and breakout logistics.
  - **Community Festivals:** Ground layout, stage sound, exhibitor stalls, security permits, and municipal NOCs.
  - **Custom Celebrations:** Fully flexible budget allocations and task workflows.

### 🔄 Multi-Event Workspace & Safe Navigation

- **Workspace Switching:** Switch between multiple living event plans with real-time reactive UI updates.
- **Empty State Protection:** When no events exist, non-applicable tabs (**Overview, Budget, Timeline, Vendors, Guests, Tasks, Ideas, Event Day**) are locked with lock indicators, automatically redirecting users to the Events hub.
- **Accessible Deletion:** Delete events cleanly from event cards, inside the Edit Details drawer, or from the Settings management panel.

### 💰 Deterministic Budgeting & "What-If" Ripple Simulator

- Pure TypeScript financial engine tracking **Allocated**, **Committed Contracts**, **Paid Cash**, and **Projected Forecasts**.
- Automatic contingency reserve depletion detection.
- **Interactive Simulation Slider:** Live experimentation with guest count variations, calculating immediate catering deltas ($\Delta \text{Budget} = \Delta \text{Guests} \times \text{Catering Cost Per Guest}$).
- Instant venue capacity overrun alerts when guest count exceeds registered hall limits.
- One-click Gemini trade-off reasoning that suggests verified budget offsets without hallucinated totals.

### ⏱️ Topological Timeline & Critical Path Engine

- Directed Acyclic Graph (DAG) analysis of milestone dependencies using **Kahn's Algorithm**.
- Detection of circular task dependencies and schedule bottlenecks.
- Identification of the **Critical Path**—the exact sequence of dependent tasks dictating the event completion date.

### 📄 AI Vendor Quote Extractor & Injection Defense

- Converts unstructured vendor emails, messages, and quote texts into structured line items, taxes, payment terms, and deadline constraints.
- Built-in prompt-injection defense isolating untrusted text inside strict XML boundary delimiters (`<QUOTE_DATA>`).

### 🎪 Event Day Execution (Run-of-Show Mode)

- Live ceremony tracking with run-of-show timeline schedules.
- Real-time delay propagation engine: delaying one ceremony automatically recalculates downstream schedules for dining and entertainment.

### 🛡️ Multi-Model Gemini Cascading Fallback

- Production-hardened multi-model execution preventing downtime or rate-limit failures:
  1. **Primary Model:** `gemini-2.5-flash` (Flagship speed & structured JSON mode)
  2. **Secondary Fallback:** `gemini-2.0-flash` (Next-gen fast model)
  3. **Tertiary Fallback:** `gemini-1.5-flash` (High availability & quota ceiling)
  4. **Quaternary Fallback:** `gemini-2.5-pro` (Deep reasoning fallback)
  5. **Deterministic Floor:** If all Gemini API calls fail or offline, pure deterministic engines deliver valid structured plans, ensuring **zero 500 crashes**.

### 🔒 Enterprise Multi-Tenant Security

- Explicit separation between Sign-In and Sign-Up flows (no silent unintended account creation).
- Path-level tenant data isolation in Firebase Realtime Database: `/users/{userId}/events/{eventId}/`.
- Password hashing using **bcrypt** (salt factor 10) and stateless **JWT authentication**.
- Server-side Gemini API key isolation (keys are never exposed to browser clients).
- Cascading user account deletion removing all associated plans, budgets, and quotes.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4, Lucide Icons, React Router v7 |
| **Backend** | Node.js, Express.js 4.21, TypeScript 5.7, Zod 3.24 |
| **Database** | Firebase Realtime Database (via `firebase-admin` SDK) |
| **AI / GenAI** | Google Gen AI SDK (`@google/genai` v2.31), Google Gemini |
| **Testing** | Vitest 3.0, Supertest |
| **Security** | Helmet, CORS, Bcrypt.js, JSON Web Tokens (JWT) |

---

## 4. Repository Structure

```text
EventPilot/
├── client/                         # Vite + React Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components & modals
│   │   │   ├── AppLayout.tsx       # Sidebar, switcher, navigation locking
│   │   │   ├── NewEventModal.tsx   # Dynamic event configurator
│   │   │   └── NoEventsOnboarding.tsx
│   │   ├── context/                # React contexts (AuthContext, EventContext)
│   │   ├── engines/                # Deterministic client calculation engines
│   │   │   ├── budgetEngine.ts
│   │   │   ├── timelineEngine.ts
│   │   │   ├── impactEngine.ts
│   │   │   └── eventTemplateEngine.ts
│   │   ├── pages/
│   │   │   ├── public/             # Landing, Sign In, Sign Up pages
│   │   │   └── app/                # Overview, Events, Budget, Timeline, Vendors, etc.
│   │   └── services/               # Client API and Firebase bindings
│   └── package.json
│
├── server/                         # Express.js Backend
│   ├── src/
│   │   ├── controllers/            # Route controllers (AuthController, EventController)
│   │   ├── engines/                # Deterministic business logic engines
│   │   ├── middleware/             # Auth & tenant security middleware
│   │   ├── repositories/           # Firebase Realtime Database repository
│   │   ├── services/
│   │   │   ├── aiService.ts        # Gemini AI service with multi-model fallback
│   │   │   ├── geminiRegistry.ts   # Supported model catalog & cascade resolver
│   │   │   └── contextBuilder.ts   # Deterministic context assembler
│   │   └── types/                  # Shared TypeScript interfaces & types
│   ├── tests/                      # Automated Vitest test suite
│   │   ├── ai/                     # Multi-model fallback & schema tests
│   │   ├── auth/                   # Password hashing & tenant security tests
│   │   └── engines/                # Deterministic calculation engine tests
│   └── package.json
│
├── package.json                    # Workspace root configuration
└── README.md
```

---
