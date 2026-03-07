import { Hono } from "hono";
import { db, posts, postImages, likes, comments, users } from "@garona/db";
import { eq, and } from "drizzle-orm";
import { requirePermission } from "../middleware";
import { PERMISSION } from "@garona/db";

const app = new Hono();

// Create post (requires POST permission)
// Accepts { imageUrl, caption } or { imageUrls: string[], caption }
app.post("/", requirePermission(PERMISSION.POST), async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const { caption } = body;

  // Support both single and multi-image, and text-only posts
  const imageUrls: string[] = body.imageUrls || (body.imageUrl ? [body.imageUrl] : []);
  if (imageUrls.length === 0 && !caption?.trim()) {
    return c.json({ error: "Caption or image required" }, 400);
  }

  const [post] = await db
    .insert(posts)
    .values({
      authorId: userId,
      imageUrl: imageUrls[0] || null, // cover image, null for text-only
      caption,
      imageCount: imageUrls.length,
    })
    .returning();

  // Insert all images into postImages
  if (imageUrls.length > 0) {
    await db.insert(postImages).values(
      imageUrls.map((url, i) => ({ postId: post.id, imageUrl: url, position: i }))
    );
  }

  return c.json(post, 201);
});

// Like post (requires LIKE permission)
app.post("/:postId/like", requirePermission(PERMISSION.LIKE), async (c) => {
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

// Comment on post (requires COMMENT permission)
app.post("/:postId/comment", requirePermission(PERMISSION.COMMENT), async (c) => {
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

  const result = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorId: comments.authorId,
      text: comments.text,
      createdAt: comments.createdAt,
      authorUsername: users.username,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt);

  return c.json(
    result.map((r) => ({
      id: r.id,
      postId: r.postId,
      authorId: r.authorId,
      text: r.text,
      createdAt: r.createdAt,
      author: { username: r.authorUsername, name: r.authorName, avatarUrl: r.authorAvatar },
    }))
  );
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
