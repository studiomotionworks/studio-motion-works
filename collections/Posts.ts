import type { CollectionConfig, Block } from 'payload'
import { contentRevalidationHooks } from '../lib/revalidate-content'

// Each block below maps 1:1 to a variant of the `ContentBlock` union in
// postContent.ts (paragraph / heading / quote / image / list / divider /
// code / callout). Keeping them here, on the Posts collection, means an
// editor builds a post's body as an ordered stack of these blocks directly
// in the admin UI — no separate "postContent" collection required, since
// this content only ever belongs to exactly one post.

const ParagraphBlock: Block = {
  slug: 'paragraph',
  labels: { singular: 'Paragraph', plural: 'Paragraphs' },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
  ],
}

const HeadingBlock: Block = {
  slug: "heading",
  labels: {
    singular: "Heading",
    plural: "Headings",
  },
  fields: [
    {
      name: "level",
      type: "radio",
      required: true,
      defaultValue: "2",
      options: [
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
      ],
    },
    {
      name: "text",
      type: "text",
      required: true,
    },
    {
      name: "anchorId",
      type: "text",
      admin: {
        description:
          "Used for in-page anchor links. Leave blank to auto-generate from the heading text.",
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            // Keep manually entered anchorId
            if (value) {
              return value;
            }

            const text = siblingData?.text;

            if (!text) {
              return value;
            }

            return text
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
          },
        ],
      },
    },
  ],
};
const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
    },
  ],
}

const ImageBlock: Block = {
  slug: "image",
  labels: { singular: "Image", plural: "Images" },
  fields: [
    {
      name: "image",
      type: "upload", admin: { components: { Field: "/components/admin/MediaUploadField#MediaUploadField" } },
      relationTo: "media",
    },
    {
      name: "src",
      type: "text",
      admin: { description: "Image URL" },
    },
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
  ],
};

const ListBlock: Block = {
  slug: 'list',
  labels: { singular: 'List', plural: 'Lists' },
  fields: [
    {
      name: 'ordered',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'items',
      type: 'text',
      hasMany: true,
      required: true,
    },
  ],
}

const DividerBlock: Block = {
  slug: 'divider',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [],
}

const CodeBlock: Block = {
  slug: 'code',
  labels: { singular: 'Code', plural: 'Code Blocks' },
  fields: [
    {
      name: 'language',
      type: 'text',
      defaultValue: 'ts',
    },
    {
      name: 'code',
      type: 'code',
      admin: {
        language: 'typescript',
      },
    },
  ],
}

const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
  ],
}

export const Posts: CollectionConfig = {
  slug: "posts",
  hooks: { afterChange: [contentRevalidationHooks.afterChange], afterDelete: [contentRevalidationHooks.afterDelete] },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "author", "publishedAt", "featured"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        "Sculpture",
        "Typography",
        "Installations",
        "Process",
        "Theory",
      ],
    },
    {
      name: "accent",
      type: "text",
      admin: {
        description: "Hex color, e.g. #C5A065",
      },
    },
    {
      name: "readTime",
      type: "text",
      admin: {
        description: 'Display string, e.g. "8 min"',
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "cover",
      type: "upload", admin: { components: { Field: "/components/admin/MediaUploadField#MediaUploadField" } },
      relationTo: "media",
    },
    {
      name: "coverImage",
      type: "text", // URL string (Next Blob / External)
    },
    // --- Author ---
    // Kept as plain fields on the post rather than a separate Authors
    // collection/relationship. This studio site has a small, static roster
    // of writers, so a relationship would add a join for little benefit.
    // If the author roster grows or bios need to be edited in one place,
    // pull these three fields out into their own "authors" collection and
    // swap this for a `relationship` field.
    {
      name: "author",
      type: "text",
      required: true,
    },
    {
      name: "authorRole",
      type: "text",
    },
    {
      name: "authorBio",
      type: "textarea",
    },
    // --- Body content ---
    {
      name: "content",
      type: "blocks",
      blocks: [
        ParagraphBlock,
        HeadingBlock,
        QuoteBlock,
        ImageBlock,
        ListBlock,
        DividerBlock,
        CodeBlock,
        CalloutBlock,
      ],
    },
  ],
};
