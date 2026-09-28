// lib/debug-init.ts
// Run with: payload run lib/debug-init.ts
//
// Deliberately does nothing except call getPayload(). If this alone hangs
// or dies silently, the problem is inside Payload's own init/adapter code
// and has nothing to do with seed.ts's extra imports (data files,
// payload-types, etc). If this succeeds, the problem is something specific
// to what seed.ts additionally imports or does.

import { getPayload } from 'payload'
import config from '@/payload.config'

console.log('before getPayload')
const payload = await getPayload({ config })
console.log('after getPayload, instance exists:', !!payload)
process.exit(0)
