import * as migration_20261020_054315_add_media_fields from './20261020_054315_add_media_fields';
import * as migration_20261020_060000_sync_posts_block_schema from './20261020_060000_sync_posts_block_schema';

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
];
