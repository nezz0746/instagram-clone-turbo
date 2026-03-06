import { Hono } from "hono";
import { db, users } from "@garona/db";
import { eq } from "drizzle-orm";

const app = new Hono();

// Sign in by username (for passkey flow — device verified identity, server looks up user)
app.post("/", async (c) => {
  const { username, credentialId } = await c.req.json();

  // For now: simple username-based lookup
  // In production: verify the passkey assertion against stored public keys
  if (!username && !credentialId) {
    return c.json({ error: "Username or credential required" }, 400);
  }

  let user;
  if (username) {
    [user] = await db.select().from(users).where(eq(users.username, username));
  }

  if (!user) {
    return c.json({ error: "Compte introuvable" }, 404);
  }

  return c.json({
    id: user.id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    rang: 1,
  });
});

export default app;
