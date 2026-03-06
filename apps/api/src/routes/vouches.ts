import { Hono } from "hono";
import { db, vouches, users, invites } from "@garona/db";
import { vouchWeight } from "@garona/db/src/palier";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requirePalier, getUserPalier } from "../middleware";

const app = new Hono();

// Get my palier + vouch info
app.get("/me", async (c) => {
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const palier = await getUserPalier(userId);

  // Count received vouches
  const received = await db
    .select({ count: sql<number>`count(*)` })
    .from(vouches)
    .where(and(eq(vouches.voucheeId, userId), eq(vouches.revoked, false)));

  // Count given vouches
  const given = await db
    .select({ count: sql<number>`count(*)` })
    .from(vouches)
    .where(and(eq(vouches.voucherId, userId), eq(vouches.revoked, false)));

  return c.json({
    palier,
    vouchesReceived: Number(received[0]?.count ?? 0),
    vouchesGiven: Number(given[0]?.count ?? 0),
  });
});

// Vouch for someone (palier >= 1)
app.post("/vouch/:userId", requirePalier(1), async (c) => {
  const voucherId = c.get("userId");
  const voucheeId = c.req.param("userId");
  const voucherPalier = c.get("palier");

  if (voucherId === voucheeId) {
    return c.json({ error: "Can't vouch yourself" }, 400);
  }

  // Check target exists
  const target = await db.select().from(users).where(eq(users.id, voucheeId));
  if (target.length === 0) return c.json({ error: "User not found" }, 404);

  // Check not already vouched
  const existing = await db
    .select()
    .from(vouches)
    .where(and(eq(vouches.voucherId, voucherId), eq(vouches.voucheeId, voucheeId)));

  if (existing.length > 0 && !existing[0].revoked) {
    return c.json({ error: "Already vouched" }, 409);
  }

  const weight = vouchWeight(voucherPalier);

  if (existing.length > 0) {
    // Re-vouch (was revoked)
    await db
      .update(vouches)
      .set({ revoked: false, weight })
      .where(eq(vouches.id, existing[0].id));
  } else {
    await db.insert(vouches).values({ voucherId, voucheeId, weight });
  }

  const newPalier = await getUserPalier(voucheeId);
  return c.json({ success: true, newPalier });
});

// Revoke vouch
app.delete("/vouch/:userId", requirePalier(1), async (c) => {
  const voucherId = c.get("userId");
  const voucheeId = c.req.param("userId");

  await db
    .update(vouches)
    .set({ revoked: true })
    .where(and(eq(vouches.voucherId, voucherId), eq(vouches.voucheeId, voucheeId)));

  const newPalier = await getUserPalier(voucheeId);
  return c.json({ success: true, newPalier });
});

// Generate invite (palier >= 4)
app.post("/invite", requirePalier(4), async (c) => {
  const creatorId = c.get("userId");
  const code = `GARONA-${nanoid(8).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(invites).values({ code, creatorId, expiresAt });

  return c.json({ code, expiresAt, link: `garona://invite/${code}` });
});

// Validate invite code (public, no auth needed)
app.get("/invite/:code", async (c) => {
  const code = c.req.param("code");
  const result = await db.select().from(invites).where(eq(invites.code, code));

  if (result.length === 0) return c.json({ valid: false, error: "Invalid code" }, 404);

  const invite = result[0];
  if (invite.usedById) return c.json({ valid: false, error: "Already used" }, 410);
  if (invite.expiresAt < new Date()) return c.json({ valid: false, error: "Expired" }, 410);

  // Get creator info
  const creator = await db.select().from(users).where(eq(users.id, invite.creatorId));

  return c.json({
    valid: true,
    creator: creator[0] ? { name: creator[0].name, username: creator[0].username, avatarUrl: creator[0].avatarUrl } : null,
    expiresAt: invite.expiresAt,
  });
});

export default app;
