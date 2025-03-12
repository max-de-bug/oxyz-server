ALTER TABLE "designs" RENAME COLUMN "collection_id" TO "collectionId";--> statement-breakpoint
ALTER TABLE "designs" DROP CONSTRAINT "designs_collection_id_collections_id_fk";
