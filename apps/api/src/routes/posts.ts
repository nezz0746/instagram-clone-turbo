import { Hono } from "hono";
import { db, posts, likes, comments } from "@garona/db";
import { eq, and } from "drizzle-orm";
import { requirePalier } from "../middleware";

const app = new Hono();

// Create post (palier >= 2)
app.post("/", requirePalier(2), async (c) => {
  const userId = c.get("userId");
  const { imageUrl, caption } = await c.req.json();

  if (!imageUrl) return c.json({ error: "Image required" }, 400);

  const [post] = await db
    .insert(posts)
    .values({ authorId: userId, imageUrl, caption })
    .returning();

  return c.json(post, 201);
});

// Like post (palier >= 2)
app.post("/:postId/like", requirePalier(2), async (c) => {
  const userId = c.get("userId");
  const postId = c.req.param("postId");

  try {
    await db.insert(likes).values({ postId, userId });
    return c.json({ liked: true });
  } catch {
    // Already liked — unlike
    await db
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    return c.json({ liked: false });
  }
});

// Comment on post (palier >= 2)
app.post("/:postId/comment", requirePalier(2), async (c) => {
  const userId = c.get("userId");
  const postId = c.req.param("postId");
  const { text } = await c.req.json();

  if (!text?.trim()) return c.json({ error: "Text required" }, 400);

  const [comment] = await db
    .insert(comments)
    .values({ postId, authorId: userId, text: text.trim() })
    .returning();

  return c.json(comment, 201);
});

// Get comments for a post
app.get("/:postId/comments", async (c) => {
  const postId = c.req.param("postId");

  const result = await db.query.comments.findMany({
    where: eq(comments.postId, postId),
    orderBy: (comments, { asc }) => [asc(comments.createdAt)],
  });

  return c.json(result);
});

// Delete post (author only)
app.delete("/:postId", async (c) => {
  const userId = c.get("userId");
  const postId = c.req.param("postId");

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) return c.json({ error: "Not found" }, 404);
  if (post.authorId !== userId) return c.json({ error: "Not yours" }, 403);

  await db.delete(posts).where(eq(posts.id, postId));
  return c.json({ deleted: true });
});

export default app;
