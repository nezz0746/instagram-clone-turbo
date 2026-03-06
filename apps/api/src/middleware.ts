import { Context, Next } from "hono";
import { db, vouches, computePalier } from "@garona/db";
import { eq, and, sql } from "drizzle-orm";
import type { PalierLevel } from "@garona/db/src/palier";

// Get user's current palier from vouch weights
export async function getUserPalier(userId: string): Promise<PalierLevel> {
  const result = await db
    .select({ total: sql<number>`coalesce(sum(${vouches.weight}), 0)` })
    .from(vouches)
    .where(and(eq(vouches.voucheeId, userId), eq(vouches.revoked, false)));

  return computePalier(Number(result[0]?.total ?? 0));
}

// Middleware factory: require minimum palier level
export function requirePalier(minLevel: PalierLevel) {
  return async (c: Context, next: Next) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const palier = await getUserPalier(userId);
    if (palier < minLevel) {
      return c.json({
        error: "Insufficient trust level",
        currentPalier: palier,
        requiredPalier: minLevel,
        message: `You need palier ${minLevel} to perform this action. Current: ${palier}`,
      }, 403);
    }

    c.set("palier", palier);
    return next();
  };
}
