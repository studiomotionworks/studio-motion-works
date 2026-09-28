import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'year', 'featured'],
  },
  access: {
    read: () => true, // Public read access for frontend
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['Kinetic Luminaries', 'Kinetic Arts', 'Comissioned Works'],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'year',
      type: 'text',
    },
    {
      name: 'client',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'materials',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'dimensions',
      type: 'text',
    },
    {
      name: 'duration',
      type: 'text',
    },
    {
      name: 'accent',
      type: 'text',
      admin: {
        description: 'Hex color, e.g. #C5A065',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'story',
      type: 'textarea',
    },
    {
      name: 'specs',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      // Used for card/grid thumbnails. The `images` array below is the
      // full gallery shown on the project detail page.
      name: 'coverImage',
      type: 'text',
      admin: {
        description: 'Image URL, used for list/grid thumbnails',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'src',
          type: 'text',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'video',
      type: 'text',
      admin: {
        description: 'Video URL (e.g. .mp4 loop)',
      },
    },
    {
      name: 'modelUrl',
      type: 'text',
      admin: {
        description: '3D model URL (e.g. .glb)',
      },
    },
  ],
}
