import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { auth } from "./auth";
import vouchRoutes from "./routes/vouches";
import feedRoutes from "./routes/feed";
import postRoutes from "./routes/posts";
import profileRoutes from "./routes/profiles";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:8081", "http://localhost:19006", "http://localhost:3000"],
  credentials: true,
}));

// BetterAuth handler
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Auth middleware for protected routes
app.use("/api/*", async (c, next) => {
  // Skip auth check for public routes
  const path = c.req.path;
  if (path.startsWith("/api/auth")) return next();
  if (path.match(/^\/api\/vouches\/invite\/[^/]+$/) && c.req.method === "GET") return next();

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    // Allow read-only access (palier 0 behavior)
    c.set("userId", null);
    c.set("palier", 0);
    return next();
  }

  c.set("userId", session.user.id);
  return next();
});

// Routes
app.route("/api/vouches", vouchRoutes);
app.route("/api/feed", feedRoutes);
app.route("/api/posts", postRoutes);
app.route("/api/profiles", profileRoutes);

// Health
app.get("/", (c) => c.json({ name: "Garona API", status: "ok" }));

const port = Number(process.env.PORT || 3001);
console.log(`🏛  Garona API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
