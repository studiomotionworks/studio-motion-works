// lib/debug-init2.ts
// Run with: payload run lib/debug-init2.ts
//
// Same as debug-init.ts, but with every extra import seed.ts has, minus
// the actual payload.create() work. If this hangs/dies but debug-init.ts
// didn't, one of these imports is the problem. If this ALSO succeeds,
// the earlier seed.ts failure was Neon connection flakiness, not code.

import { getPayload } from 'payload'
import config from '@/payload.config'

import { events as sourceEvents } from '@/data/events'
import { posts as sourcePosts, type Post as SourcePost } from '@/data/posts'
import { projects as sourceProjects } from '@/data/projects'
import { postContent, defaultContent, type ContentBlock } from '@/data/postContent'
import type { Post as PayloadPost } from '@/payload-types'

console.log('imports loaded ok:', {
  events: sourceEvents.length,
  posts: sourcePosts.length,
  projects: sourceProjects.length,
})

console.log('before getPayload')
const payload = await getPayload({ config })
console.log('after getPayload, instance exists:', !!payload)
process.exit(0)
