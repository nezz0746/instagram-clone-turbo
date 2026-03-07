ALTER TABLE "invites" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "invites" CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "image_url" DROP NOT NULL;