ALTER TABLE "designs" DROP CONSTRAINT "designs_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "designs" ALTER COLUMN "collection_id" SET DATA TYPE text;