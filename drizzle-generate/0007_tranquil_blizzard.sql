ALTER TABLE "user" ADD COLUMN "refreshToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "refreshTokenExpires" timestamp;