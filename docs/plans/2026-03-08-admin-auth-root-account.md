# Admin Auth + Root Account Management

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add shared-secret auth to the admin dashboard and allow admins to create/view a root Garona user account.

**Architecture:** Next.js middleware protects all admin routes with a cookie-based session. Login checks against `ADMIN_PASSWORD` env var. Root account is a regular `users` row identified by username `root`, created/viewed from the dashboard.

**Tech Stack:** Next.js 16 (app router), Server Actions, @garona/db (Drizzle), HTTP-only cookies.

---

### Task 1: Admin login API route + cookie

Create `POST /api/admin/login` that compares password against `ADMIN_PASSWORD` env var, sets an HTTP-only cookie.

### Task 2: Admin login page

Create `/login` page with a password input form.

### Task 3: Next.js middleware

Protect all routes except `/login` — redirect if no valid cookie.

### Task 4: Logout

Add logout button to header, clears cookie.

### Task 5: Root account section on dashboard

Query `users` table for username `root`. If missing, show "Create Root Account" button. If exists, show account details (id, username, name, rang, vouches).

### Task 6: Create root account server action

Server action that inserts a new user with username `root`, name `Garona`, email `root@garona.local`.
