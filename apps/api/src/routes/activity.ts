import { Hono } from "hono";
import { db, users, likes, comments, follows, posts } from "@garona/db";
import { eq, desc, and, sql } from "drizzle-orm";

const app = new Hono();

type Activity = {
  id: string;
  type: "like" | "comment" | "follow";
  actor: { id: string; username: string; name: string; avatarUrl: string | null };
  text?: string;
  postId?: string;
  postImage?: string;
  createdAt: string;
};

// Get activity (likes, comments, follows on my content)
app.get("/", async (c) => {
  const userId = c.get("userId");
  if (!userId) return c.json([]);

  const limit = Number(c.req.query("limit") || 30);
  const results: Activity[] = [];

  // Likes on my posts
  const myLikes = await db
    .select({
      likeCreatedAt: likes.createdAt,
      actorId: users.id,
      actorUsername: users.username,
      actorName: users.name,
      actorAvatar: users.avatarUrl,
      postId: posts.id,
      postImage: posts.imageUrl,
    })
    .from(likes)
    .innerJoin(posts, eq(likes.postId, posts.id))
    .innerJoin(users, eq(likes.userId, users.id))
    .where(and(eq(posts.authorId, userId), sql`${likes.userId} != ${userId}`))
    .orderBy(desc(likes.createdAt))
    .limit(limit);

  for (const l of myLikes) {
    results.push({
      id: `like-${l.actorId}-${l.postId}`,
      type: "like",
      actor: { id: l.actorId, username: l.actorUsername, name: l.actorName, avatarUrl: l.actorAvatar },
      postId: l.postId,
      postImage: l.postImage,
      createdAt: l.likeCreatedAt?.toISOString() || new Date().toISOString(),
    });
  }

  // Comments on my posts
  const myComments = await db
    .select({
      commentId: comments.id,
      commentText: comments.text,
      commentCreatedAt: comments.createdAt,
      actorId: users.id,
      actorUsername: users.username,
      actorName: users.name,
      actorAvatar: users.avatarUrl,
      postId: posts.id,
      postImage: posts.imageUrl,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(posts.authorId, userId), sql`${comments.authorId} != ${userId}`))
    .orderBy(desc(comments.createdAt))
    .limit(limit);

  for (const cm of myComments) {
    results.push({
      id: `comment-${cm.commentId}`,
      type: "comment",
      actor: { id: cm.actorId, username: cm.actorUsername, name: cm.actorName, avatarUrl: cm.actorAvatar },
      text: cm.commentText,
      postId: cm.postId,
      postImage: cm.postImage,
      createdAt: cm.commentCreatedAt?.toISOString() || new Date().toISOString(),
    });
  }

  // New followers
  const myFollowers = await db
    .select({
      followCreatedAt: follows.createdAt,
      actorId: users.id,
      actorUsername: users.username,
      actorName: users.name,
      actorAvatar: users.avatarUrl,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId))
    .orderBy(desc(follows.createdAt))
    .limit(limit);

  for (const f of myFollowers) {
    results.push({
      id: `follow-${f.actorId}`,
      type: "follow",
      actor: { id: f.actorId, username: f.actorUsername, name: f.actorName, avatarUrl: f.actorAvatar },
      createdAt: f.followCreatedAt?.toISOString() || new Date().toISOString(),
    });
  }

  // Sort by date descending, cap at limit
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return c.json(results.slice(0, limit));
});

export default app;
