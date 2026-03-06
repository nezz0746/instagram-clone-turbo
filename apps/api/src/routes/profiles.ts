import { Hono } from "hono";
import { db, users, follows, posts, vouches } from "@garona/db";
import { eq, and, sql, like } from "drizzle-orm";
import { requirePalier, getUserPalier } from "../middleware";

const app = new Hono();

// Get profile by username
app.get("/:username", async (c) => {
  const username = c.req.param("username");
  const currentUserId = c.get("userId");

  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) return c.json({ error: "Not found" }, 404);

  const palier = await getUserPalier(user.id);

  const [postCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.authorId, user.id));

  const [followerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followingId, user.id));

  const [followingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  // Am I following this user?
  let isFollowing = false;
  let hasVouched = false;
  if (currentUserId && currentUserId !== user.id) {
    const [f] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)));
    isFollowing = !!f;

    const [v] = await db
      .select()
      .from(vouches)
      .where(and(eq(vouches.voucherId, currentUserId), eq(vouches.voucheeId, user.id), eq(vouches.revoked, false)));
    hasVouched = !!v;
  }

  return c.json({
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    palier,
    posts: Number(postCount.count),
    followers: Number(followerCount.count),
    following: Number(followingCount.count),
    isFollowing,
    hasVouched,
    isMe: currentUserId === user.id,
  });
});

// Follow (palier >= 1)
app.post("/:username/follow", requirePalier(1), async (c) => {
  const followerId = c.get("userId");
  const username = c.req.param("username");

  const [target] = await db.select().from(users).where(eq(users.username, username));
  if (!target) return c.json({ error: "Not found" }, 404);
  if (target.id === followerId) return c.json({ error: "Can't follow yourself" }, 400);

  try {
    await db.insert(follows).values({ followerId, followingId: target.id });
    return c.json({ following: true });
  } catch {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, target.id)));
    return c.json({ following: false });
  }
});

// Search users
app.get("/", async (c) => {
  const q = c.req.query("q");
  if (!q || q.length < 2) return c.json([]);

  const results = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(users)
    .where(like(users.username, `%${q.toLowerCase()}%`))
    .limit(20);

  return c.json(results);
});

export default app;
