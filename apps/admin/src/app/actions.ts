"use server";

import { db, users } from "@garona/db";
import { eq } from "drizzle-orm";

export async function createRootAccount() {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, "root"));

  if (existing) {
    return { error: "Root account already exists" };
  }

  const [root] = await db
    .insert(users)
    .values({
      name: "Garona",
      username: "root",
      email: "root@garona.local",
      bio: "Compte officiel Garona",
    })
    .returning();

  return { success: true, user: root };
}
