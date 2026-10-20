import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Add missing schema without deleting existing documents or hasMany text rows.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "media" (
      "id" serial PRIMARY KEY NOT NULL,
      "alt" varchar,
      "prefix" varchar DEFAULT 'media',
      "_objectkey" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric,
      "sizes_thumb_url" varchar,
      "sizes_thumb_width" numeric,
      "sizes_thumb_height" numeric,
      "sizes_thumb_mime_type" varchar,
      "sizes_thumb_filesize" numeric,
      "sizes_thumb_filename" varchar,
      "sizes_card_url" varchar,
      "sizes_card_width" numeric,
      "sizes_card_height" numeric,
      "sizes_card_mime_type" varchar,
      "sizes_card_filesize" numeric,
      "sizes_card_filename" varchar
    );



    ALTER TABLE "posts_blocks_image"
      ADD COLUMN IF NOT EXISTS "image_id" integer;

    ALTER TABLE "projects_images"
      ADD COLUMN IF NOT EXISTS "image_id" integer;

    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "cover_id" integer,
      ADD COLUMN IF NOT EXISTS "cover_image" varchar,
      ADD COLUMN IF NOT EXISTS "published_at" timestamp(3) with time zone;

    ALTER TABLE "projects"
      ADD COLUMN IF NOT EXISTS "cover_id" integer,
      ADD COLUMN IF NOT EXISTS "video_file_id" integer,
      ADD COLUMN IF NOT EXISTS "cover_image" varchar,
      ADD COLUMN IF NOT EXISTS "video" varchar,
      ADD COLUMN IF NOT EXISTS "model_url" varchar;

    ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "image_file_id" integer,
      ADD COLUMN IF NOT EXISTS "image" varchar;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_image_image_id_media_id_fk' AND conrelid = 'public.posts_blocks_image'::regclass) THEN
        ALTER TABLE "posts_blocks_image" ADD CONSTRAINT "posts_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_images_image_id_media_id_fk' AND conrelid = 'public.projects_images'::regclass) THEN
        ALTER TABLE "projects_images" ADD CONSTRAINT "projects_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_cover_id_media_id_fk' AND conrelid = 'public.posts'::regclass) THEN
        ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_cover_id_media_id_fk' AND conrelid = 'public.projects'::regclass) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_video_file_id_media_id_fk' AND conrelid = 'public.projects'::regclass) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_image_file_id_media_id_fk' AND conrelid = 'public.events'::regclass) THEN
        ALTER TABLE "events" ADD CONSTRAINT "events_image_file_id_media_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

DROP TABLE IF EXISTS "events_texts" CASCADE;

    CREATE TABLE IF NOT EXISTS "posts_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "posts_texts_order_parent" ON "posts_texts" ("order", "parent_id");

    CREATE TABLE IF NOT EXISTS "events_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "events_texts_order_parent" ON "events_texts" ("order", "parent_id");

    CREATE TABLE IF NOT EXISTS "projects_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "projects_texts_order_parent" ON "projects_texts" ("order", "parent_id");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_media_fk' AND conrelid = 'public.payload_locked_documents_rels'::regclass) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" ("media_id");

    -- Older manual repairs stored list items in an array; copy those into Payload's text rows.
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'posts_blocks_list' AND column_name = 'items') THEN
        INSERT INTO "posts_texts" ("order", "parent_id", "path", "text")
        SELECT item.ordinality::integer, block._parent_id, block._path || '.' || (block._order - 1)::text || '.items', item.value
        FROM "posts_blocks_list" block CROSS JOIN LATERAL unnest(block.items) WITH ORDINALITY item(value, ordinality)
        WHERE NOT EXISTS (SELECT 1 FROM "posts_texts" existing WHERE existing.parent_id = block._parent_id AND existing.path = block._path || '.' || (block._order - 1)::text || '.items');
      END IF;
    END $$;
  `)
}

export async function down(): Promise<void> {
  throw new Error('This additive repair cannot be automatically reversed without risking existing data.')
}
