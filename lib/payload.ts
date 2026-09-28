import { getPayload } from 'payload'
import config from '@/payload.config'
import { cache } from 'react'

// `cache()` dedupes this across a single request — if a layout and a page
// both call getPayloadClient(), Payload is only initialized/connected once
// per request instead of twice.
export const getPayloadClient = cache(async () => getPayload({ config }))
