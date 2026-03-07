"use server";

import { db, users, posts, postImages } from "@garona/db";
import { eq } from "drizzle-orm";

export async function createRootAccount() {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, "garona"));

  if (existing) {
    return { error: "Root account already exists" };
  }

  const [root] = await db
    .insert(users)
    .values({
      name: "Garona",
      username: "garona",
      email: "garona@garona.local",
      bio: "Compte officiel Garona",
    })
    .returning();

  return { success: true, user: root };
}

export async function createPostAsRoot(imageUrl: string, caption?: string) {
  const [rootUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, "garona"));

  if (!rootUser) {
    return { error: "Root account does not exist. Create it first." };
  }

  const [post] = await db
    .insert(posts)
    .values({
      authorId: rootUser.id,
      imageUrl,
      caption: caption || null,
      imageCount: 1,
    })
    .returning();

  await db.insert(postImages).values({
    postId: post.id,
    imageUrl,
    position: 0,
  });

  return { success: true, postId: post.id };
}
