import { Context, Next } from "hono";
import { db, vouches, computeRang, canPerform, PERMISSION } from "@garona/db";
import { eq, and, sql } from "drizzle-orm";
import type { RangLevel } from "@garona/db";

// Get user's current rang from vouch weights
export async function getUserRang(userId: string): Promise<RangLevel> {
  const result = await db
    .select({ total: sql<number>`coalesce(sum(${vouches.weight}), 0)` })
    .from(vouches)
    .where(and(eq(vouches.voucheeId, userId), eq(vouches.revoked, false)));

  const computed = computeRang(Number(result[0]?.total ?? 0));
  // Authenticated users are always at least Rang 1
  return Math.max(computed, 1) as RangLevel;
}

// Middleware factory: require a specific permission
export function requirePermission(permission: PERMISSION) {
  return async (c: Context, next: Next) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const rang = await getUserRang(userId);
    if (!canPerform(rang, permission)) {
      return c.json({
        error: "Insufficient permissions",
        currentRang: rang,
        requiredPermission: permission,
        message: `You need the "${permission}" permission to perform this action. Current rang: ${rang}`,
      }, 403);
    }

    c.set("rang", rang);
    return next();
  };
}
