import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Uploaded Media relationships replace these optional legacy URL fields.
// Keep every existing URL and row; only remove obsolete NOT NULL constraints.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects_images" ALTER COLUMN "src" DROP NOT NULL;
    ALTER TABLE "posts_blocks_image" ALTER COLUMN "src" DROP NOT NULL;
  `)
}

// PostgreSQL rejects rollback if upload-only rows exist, preserving their data.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects_images" ALTER COLUMN "src" SET NOT NULL;
    ALTER TABLE "posts_blocks_image" ALTER COLUMN "src" SET NOT NULL;
  `)
}
