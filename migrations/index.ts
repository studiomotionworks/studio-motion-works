import * as migration_20261020_054315_add_media_fields from './20261020_054315_add_media_fields';
import * as migration_20261020_060000_sync_posts_block_schema from './20261020_060000_sync_posts_block_schema';
import * as migration_20261024_004500_allow_uploaded_images_without_legacy_urls from './20261024_004500_allow_uploaded_images_without_legacy_urls';

export const migrations = [
  {
    up: migration_20261020_054315_add_media_fields.up,
    down: migration_20261020_054315_add_media_fields.down,
    name: '20261020_054315_add_media_fields'
  },
  {
    up: migration_20261020_060000_sync_posts_block_schema.up,
    down: migration_20261020_060000_sync_posts_block_schema.down,
    name: '20261020_060000_sync_posts_block_schema'
  },
  {
    up: migration_20261024_004500_allow_uploaded_images_without_legacy_urls.up,
    down: migration_20261024_004500_allow_uploaded_images_without_legacy_urls.down,
    name: '20261024_004500_allow_uploaded_images_without_legacy_urls'
  },
];
