# Permission-Based API Gating + palier→rang Rename

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace numeric palier-level gating with semantic permission-based gating using the PERMISSION enum, and rename all `palier` references to `rang`.

**Architecture:** The PERMISSION enum becomes the contract between routes and the trust system. Routes declare which permission they need via `requirePermission(PERMISSION.POST)`. The middleware resolves the user's rang and delegates to `canPerform(rang, permission)` from the shared db package. No route ever references a rang number directly.

**Tech Stack:** Hono middleware, Drizzle ORM, TypeScript, @garona/db shared package.

---

### Task 1: Rename palier.ts → rang.ts and update exports

**Files:**
- Rename: `packages/db/src/palier.ts` → `packages/db/src/rang.ts`
- Modify: `packages/db/src/index.ts`

**Step 1: Create rang.ts with renamed exports and new permissions**

Create `packages/db/src/rang.ts` with:
- Add `FOLLOW = "follow"` and `VOUCH = "vouch"` to PERMISSION enum
- Update `RANG_THRESHOLDS` level 1 permissions to include FOLLOW and VOUCH
- Rename `PalierLevel` → `RangLevel`
- Rename `computePalier()` → `computeRang()`
- Rename `vouchWeight(voucherPalier)` → `vouchWeight(voucherRang)`
- Rename `canPerform(palier, action)` → `canPerform(rang, action)`
- Remove `PALIER_THRESHOLDS` alias

```typescript
export enum PERMISSION {
  MAIN_FEED = "main_feed",
  CREATE_PROFILE = "create_profile",
  LIKE = "like",
  FOLLOW = "follow",
  VOUCH = "vouch",
  POST = "post",
  COMMENT = "comment",
}

export const RANG_THRESHOLDS = [
  {
    level: 0,
    vouches: -1,
    permissions: [PERMISSION.MAIN_FEED, PERMISSION.CREATE_PROFILE],
  },
  {
    level: 1,
    vouches: 2,
    permissions: [PERMISSION.LIKE, PERMISSION.FOLLOW, PERMISSION.VOUCH],
  },
  {
    level: 2,
    vouches: 5,
    permissions: [PERMISSION.COMMENT, PERMISSION.POST],
  },
] as const;

export type RangLevel = 0 | 1 | 2 | 3;

export function computeRang(totalWeight: number): RangLevel {
  for (let i = RANG_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalWeight >= RANG_THRESHOLDS[i].vouches) {
      return RANG_THRESHOLDS[i].level as RangLevel;
    }
  }
  return 0;
}

export function vouchWeight(voucherRang: RangLevel): number {
  switch (voucherRang) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 1;
    case 3:
      return 5;
  }
}

export function canPerform(rang: RangLevel, action: PERMISSION): boolean {
  for (let i = 0; i <= rang; i++) {
    if (
      (RANG_THRESHOLDS[i].permissions as readonly PERMISSION[]).includes(action)
    )
      return true;
  }
  return false;
}
```

**Step 2: Delete palier.ts**

Remove `packages/db/src/palier.ts`.

**Step 3: Update packages/db/src/index.ts**

Change `export * from "./palier"` to `export * from "./rang"`.

**Step 4: Verify build**

Run: `cd packages/db && npx tsc --noEmit`
Expected: May fail (downstream consumers still import old names). That's fine — we fix them next.

**Step 5: Commit**

```bash
git add packages/db/src/rang.ts packages/db/src/index.ts
git rm packages/db/src/palier.ts
git commit -m "refactor(db): rename palier→rang, add FOLLOW/VOUCH permissions"
```

---

### Task 2: Rewrite middleware — requirePermission replaces requirePalier

**Files:**
- Modify: `apps/api/src/middleware.ts`

**Step 1: Rewrite middleware.ts**

```typescript
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
```

**Step 2: Commit**

```bash
git add apps/api/src/middleware.ts
git commit -m "refactor(api): replace requirePalier with requirePermission"
```

---

### Task 3: Update index.ts auth middleware (palier→rang)

**Files:**
- Modify: `apps/api/src/index.ts`

**Step 1: Replace palier references in the auth middleware**

Line 51-53: Change `c.set("palier", 0)` to `c.set("rang", 0)`.

**Step 2: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "refactor(api): rename palier→rang in auth middleware"
```

---

### Task 4: Update routes/posts.ts

**Files:**
- Modify: `apps/api/src/routes/posts.ts`

**Step 1: Replace imports and middleware calls**

- Import `requirePermission` instead of `requirePalier`
- Import `PERMISSION` from `@garona/db`
- `requirePalier(2)` on POST `/` → `requirePermission(PERMISSION.POST)`
- `requirePalier(2)` on POST `/:postId/like` → `requirePermission(PERMISSION.LIKE)`
- `requirePalier(2)` on POST `/:postId/comment` → `requirePermission(PERMISSION.COMMENT)`
- Update comments to remove palier references

**Step 2: Commit**

```bash
git add apps/api/src/routes/posts.ts
git commit -m "refactor(posts): use permission-based gating"
```

---

### Task 5: Update routes/vouches.ts

**Files:**
- Modify: `apps/api/src/routes/vouches.ts`

**Step 1: Replace imports and middleware calls**

- Import `requirePermission` instead of `requirePalier`, `getUserRang` instead of `getUserPalier`
- Import `PERMISSION` from `@garona/db`
- Import `vouchWeight` from `@garona/db` (not `@garona/db/src/palier`)
- `requirePalier(1)` on POST `/vouch/:userId` → `requirePermission(PERMISSION.VOUCH)`
- `requirePalier(1)` on DELETE `/vouch/:userId` → `requirePermission(PERMISSION.VOUCH)`
- Rename all `palier` variables to `rang` (e.g., `voucherPalier` → `voucherRang`, `newPalier` → `newRang`)
- Rename `getUserPalier` calls to `getUserRang`
- Update `c.get("palier")` to `c.get("rang")`
- Rename JSON response fields: `palier` → `rang`, `newPalier` → `newRang`

**Step 2: Commit**

```bash
git add apps/api/src/routes/vouches.ts
git commit -m "refactor(vouches): use permission-based gating, rename palier→rang"
```

---

### Task 6: Update routes/profiles.ts

**Files:**
- Modify: `apps/api/src/routes/profiles.ts`

**Step 1: Replace imports and middleware calls**

- Import `requirePermission` instead of `requirePalier`, `getUserRang` instead of `getUserPalier`
- Import `PERMISSION` from `@garona/db`
- `requirePalier(1)` on POST `/:username/follow` → `requirePermission(PERMISSION.FOLLOW)`
- `getUserPalier(user.id)` → `getUserRang(user.id)`
- Rename `palier` variable on line 19 to `rang`
- Rename JSON response field `palier` → `rang` on line 70

**Step 2: Commit**

```bash
git add apps/api/src/routes/profiles.ts
git commit -m "refactor(profiles): use permission-based gating, rename palier→rang"
```

---

### Task 7: Update routes/upload.ts

**Files:**
- Modify: `apps/api/src/routes/upload.ts`

**Step 1: Replace imports and middleware calls**

- Import `requirePermission` instead of `requirePalier`
- Import `PERMISSION` from `@garona/db`
- `requirePalier(2)` on POST `/presign` → `requirePermission(PERMISSION.POST)`
- `requirePalier(2)` on POST `/` → `requirePermission(PERMISSION.POST)`
- Update comments

**Step 2: Commit**

```bash
git add apps/api/src/routes/upload.ts
git commit -m "refactor(upload): use permission-based gating"
```

---

### Task 8: Update routes/me.ts

**Files:**
- Modify: `apps/api/src/routes/me.ts`

**Step 1: Replace computePalier import**

- Import `computeRang` instead of `computePalier` from `@garona/db`
- Note: `me.ts` currently hardcodes `rang: 1`. This may need getUserRang, but keep current behavior for now — just fix the import.

**Step 2: Commit**

```bash
git add apps/api/src/routes/me.ts
git commit -m "refactor(me): update import from computePalier to computeRang"
```

---

### Task 9: Update seed.ts and schema.ts comments

**Files:**
- Modify: `packages/db/src/seed.ts` (rename palier references in comments/logs)
- Modify: `packages/db/src/schema.ts` (rename comment on line 95)

**Step 1: Update seed.ts**

- Change `import { computePalier }` to `import { computeRang }`
- Rename function calls and log messages from palier to rang

**Step 2: Update schema.ts comment**

Line 95: Change `// higher palier voucher = more weight` to `// higher rang voucher = more weight`

**Step 3: Commit**

```bash
git add packages/db/src/seed.ts packages/db/src/schema.ts
git commit -m "refactor(db): rename palier→rang in seed and schema comments"
```

---

### Task 10: Update admin app

**Files:**
- Modify: `apps/admin/src/app/page.tsx`

**Step 1: Update imports**

- Change `import { ..., type PalierLevel } from "@garona/db"` to `import { ..., type RangLevel } from "@garona/db"`
- Rename `PalierLevel` usage to `RangLevel`

**Step 2: Commit**

```bash
git add apps/admin/src/app/page.tsx
git commit -m "refactor(admin): rename PalierLevel→RangLevel"
```

---

### Task 11: Update mobile app references

**Files:**
- Modify: `apps/mobile/lib/auth.ts` (rename `palier` field)
- Modify: `apps/mobile/lib/api.ts` (rename `palier` field, `newPalier` → `newRang`)
- Modify: `apps/mobile/components/PalierBadge.tsx` (rename file and props)
- Modify: `apps/mobile/components/VouchButton.tsx` (rename `newPalier` → `newRang`)
- Modify: `apps/mobile/app/_layout.tsx` (rename `palier` references)
- Modify: `apps/mobile/app/(tabs)/create.tsx` (rename `palier` references)
- Modify: `apps/mobile/app/(tabs)/profile.tsx` (rename references)
- Modify: `apps/mobile/app/(tabs)/guide.tsx` (rename reference)
- Modify: `apps/mobile/app/user/[username].tsx` (rename import/usage)

**Step 1: Update all mobile files**

Rename all `palier` → `rang` in types, variables, props. Rename `PalierBadge` → `RangBadge`. Rename `newPalier` → `newRang` in API types and callbacks.

**Step 2: Commit**

```bash
git add apps/mobile/
git commit -m "refactor(mobile): rename palier→rang across all components"
```

---

### Task 12: Final verification

**Step 1: Run TypeScript check across the monorepo**

Run: `npx turbo run build --filter=@garona/db --filter=api --filter=admin`
Expected: PASS — no type errors referencing old palier names.

**Step 2: Grep for any remaining palier references**

Run: `grep -ri "palier" --include="*.ts" --include="*.tsx" .`
Expected: No results (or only in this plan doc / CHANGELOG).

**Step 3: Commit any remaining fixes**

```bash
git add -A
git commit -m "refactor: final cleanup of palier→rang rename"
```
