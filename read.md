# SPANDSONS Mini CRM — Project Overview & Architecture

Welcome to the **SPANDSONS Mini CRM** workspace documentation. This document outlines why this CRM exists, how its components interact under the hood, and who benefits most from its capabilities.

---

## 🌟 Why This CRM? (The Purpose)

Many modern CRMs are bloated, slow, and expensive. The SPANDSONS Mini CRM was engineered to serve as a **high-speed, clutter-free sales pipeline assistant** following the **"Kinetic Minimalist"** design system.

### Key Advantages:
*   **Instant Load & Zero Bloat:** Optimized SPA bundle (Vite + React) that runs at 60fps.
*   **State-of-the-Art Aesthetic:** Premium dark/light themes, sleek glassmorphic containers, elegant spacing, and smooth SVG transitions instead of bulky, slow, external charting libraries.
*   **Automatic Seed Data:** Eliminates the "empty slate" problem. New user registrations instantly seed a complete demo pipeline of 9 realistic prospects so they can evaluate the dashboard immediately.
*   **Flexible Deep-Linking:** All lead edits and pipeline creations are managed via clean, URL-driven overlays (`?modal=new` or `?modal=edit`), meaning views sync automatically on URL transitions.

---

## ⚙️ How It Works (The Mechanics)

The application follows a classic **decoupled Client-Server Architecture** utilizing a fully secure, stateless REST API:

*   **Authentication & Security:** 
    *   Passwords are encrypted on the backend using `bcryptjs` before DB insertion.
    *   On successful authentication, the server signs a secure **JSON Web Token (JWT)**.
    *   The client's Axios service utilizes a **request interceptor** to dynamically inject this token into every outgoing API request. If the token expires, the client intercepts the `401 Unauthorized` response to log the user out securely.
*   **Aggregation Pipelines:**
    *   The Dashboard stats are computed dynamically on MongoDB using aggregation pipelines. It groups leads by status (e.g., `Won`, `Lost`, `Qualified`) and filters them by months based on their `createdAt` timestamp to generate the trend chart.
*   **Client-Side CSV Downloader:**
    *   Instead of making a round-trip to the server, the frontend compiles active lead records dynamically.
    *   It prepends a UTF-8 BOM (`\ufeff`) so Excel opens it with correct styling, wraps fields with double quotes to escape commas, creates a temporary in-memory binary stream (`Blob` with `application/octet-stream` type), triggers an invisible anchor click, and immediately releases the memory reference after 1 second to clean up resources.

---

## 👥 Who Uses It? (The Audience)

The SPANDSONS Mini CRM is targeted towards professionals and teams requiring a fast, lightweight, and visual tool:

*   **Sales Representatives & Account Executives:** To track prospects, update qualification states, monitor their personal conversion rates, and export monthly leads to standard sheets.
*   **Growth Agencies & Consultants:** Who want a lightweight tracking dashboard to monitor inbound leads and export CSV summaries to clients without managing complex enterprise systems.
*   **Startup Founders & Small Businesses:** Looking for an intuitive pipeline management dashboard that is self-hostable, lightning-fast, and secure.
