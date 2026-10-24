ALTER TABLE "fabric_types" DROP CONSTRAINT "fabric_types_name_unique";--> statement-breakpoint
ALTER TABLE "fabric_types" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "fabric_types" ADD CONSTRAINT "fabric_types_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;