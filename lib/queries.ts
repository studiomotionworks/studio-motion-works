import { getPayloadClient } from '@/lib/payload'
import type { Post, Event, Project } from '@/payload-types'

// These all run server-side only (Local API talks directly to Postgres,
// bypassing REST/HTTP). Call them from Server Components / route handlers,
// never from a "use client" file.

export async function getAllPosts(): Promise<Post[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    limit: 100,
  })
  return docs
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getAllEvents(): Promise<Event[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    sort: 'date',
    limit: 100,
  })
  return docs
}

export async function getAllProjects(): Promise<Project[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    sort: '-year',
    limit: 100,
  })
  return docs
}
