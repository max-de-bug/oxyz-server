ALTER TABLE "collections" RENAME COLUMN "isPublic" TO "isDefault";--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "userId" SET NOT NULL;