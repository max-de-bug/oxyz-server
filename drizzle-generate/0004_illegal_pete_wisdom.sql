ALTER TABLE "designs" ADD COLUMN "collection_id" uuid;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designs" DROP COLUMN "collectionId";