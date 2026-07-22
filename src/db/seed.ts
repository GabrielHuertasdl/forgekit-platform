import 'dotenv/config'
import { db } from './client'
import { users } from './schema'

async function seed() {
  console.log('Seeding database...')

  const [created] = await db
    .insert(users)
    .values({
      email: 'dev@forgekit.local',
      name: 'Dev Admin',
      creditsBalance: 500,
      isAdmin: true,
      emailVerified: new Date(),
    })
    .onConflictDoNothing()
    .returning({ id: users.id, email: users.email })

  if (created) {
    console.log(`Dev user created: ${created.email} (${created.id}) — 500 credits`)
  } else {
    console.log('Dev user already exists, skipping.')
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
