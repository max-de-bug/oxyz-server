ALTER TABLE "images" RENAME COLUMN "mimeType" TO "mime_type";--> statement-breakpoint
ALTER TABLE "images" RENAME COLUMN "description" TO "created_at";--> statement-breakpoint
ALTER TABLE "images" RENAME COLUMN "tags" TO "updated_at";--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN "updatedAt";