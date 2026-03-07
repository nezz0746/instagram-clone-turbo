"use server";

import { db, users, posts, postImages } from "@garona/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { url: "", error: "No file provided" };

  const ext = file.type === "image/png" ? "png" : "jpg";
  const key = `posts/admin/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

  const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000";
  const S3_BUCKET = process.env.S3_BUCKET || "garona";

  const arrayBuffer = await file.arrayBuffer();
  const res = await fetch(`${S3_ENDPOINT}/${S3_BUCKET}/${key}`, {
    method: "PUT",
    body: arrayBuffer,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) return { url: "", error: "Upload failed" };

  const PUBLIC_API_URL =
    process.env.PUBLIC_API_URL || "http://localhost:3001";
  return { url: `${PUBLIC_API_URL}/api/upload/images/${key}` };
}

export async function createPostAsRoot(
  imageUrls: string[],
  caption?: string,
) {
  const [rootUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, "garona"));

  if (!rootUser) {
    return { error: "Root account does not exist. Create it first." };
  }

  if (imageUrls.length === 0 && !caption?.trim()) {
    return { error: "Provide at least a caption or images." };
  }

  const [post] = await db
    .insert(posts)
    .values({
      authorId: rootUser.id,
      imageUrl: imageUrls[0] || null,
      caption: caption || null,
      imageCount: imageUrls.length,
    })
    .returning();

  if (imageUrls.length > 0) {
    await db.insert(postImages).values(
      imageUrls.map((url, i) => ({
        postId: post.id,
        imageUrl: url,
        position: i,
      })),
    );
  }

  return { success: true, postId: post.id };
}
