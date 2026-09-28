import type { Post } from '@/payload-types'
import type { ContentBlock } from '@/data/postContent'

// Payload stores each block with a `blockType` discriminator (matching the
// block `slug`s defined in the Posts collection) instead of the `type` key
// your original ContentBlock union uses. This keeps Prose.tsx unchanged by
// translating back to the shape it already expects.
export function toContentBlocks(content: Post['content']): ContentBlock[] {
  if (!content) return []

  return content.map((block): ContentBlock => {
    switch (block.blockType) {
      case 'paragraph':
        return { type: 'paragraph', text: block.text }
      case 'heading':
        return {
          type: 'heading',
          level: Number(block.level) as 2 | 3,
          text: block.text,
          id: block.anchorId ?? '',
        }
      case 'quote':
        return {
          type: 'quote',
          text: block.text,
          attribution: block.attribution ?? undefined,
        }
      case 'image':
        return {
          type: 'image',
          src: block.src,
          alt: block.alt,
          caption: block.caption ?? undefined,
        }
      case 'list':
        return {
          type: 'list',
          ordered: !!block.ordered,
          items: block.items ?? [],
        }
      case 'divider':
        return { type: 'divider' }
      case 'code':
        return {
          type: 'code',
          language: block.language ?? '',
          code: block.code ?? '',
        }
      case 'callout':
        return { type: 'callout', title: block.title, text: block.text }
      default:
        // Exhaustiveness guard — if you add a new block to the Posts
        // collection, add a matching case above.
        throw new Error(`Unknown block type: ${(block as { blockType: string }).blockType}`)
    }
  })
}
