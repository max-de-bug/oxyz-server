ALTER TABLE "designs" DROP CONSTRAINT "designs_logoUrl_images_id_fk";
--> statement-breakpoint
ALTER TABLE "designs" DROP CONSTRAINT "designs_imageUrl_images_url_fk";
--> statement-breakpoint
ALTER TABLE "designs" ALTER COLUMN "logoUrl" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "designs" ALTER COLUMN "imageUrl" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "designs" ALTER COLUMN "collection_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;