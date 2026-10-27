# EventPilot — Living Event Intelligence

> **Virtual Prompt Wars: Build with AI — Challenge 5 Submission**  
> *GenAI-Powered Living Event Planning Assistant*  
> **Target Stack:** Express.js, React, Node.js, Firebase Realtime Database, TypeScript, Tailwind CSS, Google Gemini 2.5

---

## 1. Executive Summary

Traditional event tools are either rigid spreadsheets or superficial AI chatbots that hallucinate numbers and lack context. **EventPilot** changes this paradigm with a living plan:

> **"Deterministic systems own facts. Gemini owns reasoning. Firebase Realtime Database owns persistence. The user owns decisions."**

Change something in the real event—such as increasing guest count from 180 to 220—and EventPilot immediately calculates the mathematical consequences across catering, venue capacity, and budget forecasts, then uses Gemini to recommend curated trade-offs to keep the plan balanced.

---

## 2. Key Capabilities & Core Workflows

1. **Deterministic Budgeting Engine:**
   - Accurate tracking of allocated, committed contracts, cash paid, and projected forecasts.
   - Real-time contingency buffer monitoring and category variance warnings.
2. **Hero What-If Ripple Simulator (Judging Flow):**
   - Live interactive slider for guest count and date changes.
   - Calculates exact catering delta ($\Delta \text{Guests} \times \text{Cost/Guest}$) and venue capacity overrun.
   - One-click Gemini trade-off reasoning with concrete proposals to offset costs.
3. **Topological Timeline & Critical Path:**
   - Detects circular task dependencies and schedule blockers using Kahn's algorithm.
   - Automatically computes the Critical Path determining the event date.
4. **AI Vendor Quote Extractor:**
   - Converts unstructured vendor proposals into structured line items, taxes, and payment terms.
   - Protected against prompt injection by treating quote content as strictly untrusted user data.
5. **Event Day Run-of-Show:**
   - Live ceremony execution mode with coordinator contacts and instant schedule delay replanning.
6. **Strict Multi-Tenant Isolation & Security:**
   - User-owned event hierarchy with path-level tenant scoping (`/users/{uid}/events/{eventId}`).
   - Explicit Sign-Up vs. Sign-In intent separation (never silently creates accounts).
   - Server-side Gemini API key protection.
   - Cascading account deletion.

---
