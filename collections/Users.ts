import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Security & Rate Limiting Settings
    maxLoginAttempts: 5, // Locks account after 5 failed attempts
    lockTime: 600000, // Lockout duration in ms (10 minutes)
    tokenExpiration: 7200, // Active session length in seconds (2 hours)
    verify: false, // Set to true if you want email verification
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}