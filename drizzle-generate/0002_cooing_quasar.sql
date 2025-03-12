CREATE TABLE "typography" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"mimeType" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"publicId" text,
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "typography" ADD CONSTRAINT "typography_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;