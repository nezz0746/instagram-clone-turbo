import { Hono } from "hono";
import { db, users, invites } from "@garona/db";
import { eq } from "drizzle-orm";

const app = new Hono();

// Sign up — creates account, becomes Rang 1 (Membre)
// Invite code is optional (used to mark invite as consumed)
app.post("/", async (c) => {
  const { name, username, inviteCode } = await c.req.json();

  if (!name?.trim()) return c.json({ error: "Nom requis" }, 400);
  if (!username?.trim()) return c.json({ error: "Nom d'utilisateur requis" }, 400);

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (cleanUsername.length < 3) return c.json({ error: "Nom d'utilisateur trop court (min 3)" }, 400);
  if (cleanUsername.length > 30) return c.json({ error: "Nom d'utilisateur trop long (max 30)" }, 400);

  // Check username availability
  const [existing] = await db.select().from(users).where(eq(users.username, cleanUsername));
  if (existing) return c.json({ error: "Ce nom d'utilisateur est déjà pris" }, 400);

  // Create user
  const [user] = await db.insert(users).values({
    name: name.trim(),
    username: cleanUsername,
    email: `${cleanUsername}@garona.local`,
    avatarUrl: `https://i.pravatar.cc/150?u=${cleanUsername}`,
  }).returning();

  // If invite code provided, mark it as used
  if (inviteCode) {
    const [invite] = await db.select().from(invites).where(eq(invites.code, inviteCode));
    if (invite && !invite.usedById) {
      await db.update(invites).set({ usedById: user.id }).where(eq(invites.id, invite.id));
    }
  }

  return c.json({
    id: user.id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    rang: 1,
  }, 201);
});

export default app;
