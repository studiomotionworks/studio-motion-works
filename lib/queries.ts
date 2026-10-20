import { getPayloadClient } from '@/lib/payload'
import type { Post, Event, Project, Media } from '@/payload-types'

// These all run server-side only (Local API talks directly to Postgres,
// bypassing REST/HTTP). Call them from Server Components / route handlers,
// never from a "use client" file.

// An upload field is a Media object when populated (depth >= 1), or a bare
// ID when not. Return the file URL, or undefined if there isn't one.
const mediaUrl = (m: number | Media | null | undefined): string | undefined =>
  m && typeof m === 'object' ? (m.url ?? undefined) : undefined

// Events no longer have an `image` text field, so add it back to the type.
export type EventWithImage = Event & { image?: string }

function normalizePost(doc: Post): Post {
  return {
    ...doc,
    // Prefer the uploaded cover, fall back to the legacy URL
    coverImage: mediaUrl(doc.cover) ?? doc.coverImage,
    content: doc.content?.map((block) =>
      block.blockType === 'image'
        ? { ...block, src: mediaUrl(block.image) ?? block.src }
        : block,
    ),
  }
}

function normalizeProject(doc: Project): Project {
  return {
    ...doc,
    coverImage: mediaUrl(doc.cover) ?? doc.coverImage,
    video: mediaUrl(doc.videoFile) ?? doc.video,
    images: doc.images?.map((img) => ({
      ...img,
      src: mediaUrl(img.image) ?? img.src ?? '',
    })),
  }
}

function normalizeEvent(doc: Event): EventWithImage {
  return {
    ...doc,
    image: mediaUrl(doc.imageFile),
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    limit: 100,
    depth: 2,
  })
  return docs.map(normalizePost)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ? normalizePost(docs[0]) : null
}

export async function getAllEvents(): Promise<EventWithImage[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    sort: 'date',
    limit: 100,
    depth: 2,
  })
  return docs.map(normalizeEvent)
}

export async function getAllProjects(): Promise<Project[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    sort: '-year',
    limit: 100,
    depth: 2,
  })
  return docs.map(normalizeProject)
}