// prisma/seed.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ContactItem and AboutSummary...')

  // Create ContactItem entries if not exist
  await prisma.contactItem.createMany({
    data: [
      { label: 'Phone', value: '' },
      { label: 'Email', value: '' },
      { label: 'Address', value: '' },
      { label: 'LinkedIn', value: '' },
      { label: 'GitHub', value: '' },
    ],
    skipDuplicates: true,
  })

  // Create default summary if none exists
  const existing = await prisma.aboutSummary.findFirst()
  if (!existing) {
    await prisma.aboutSummary.create({
      data: {
        content:
          'This is my default About summary. Edit me in the Admin panel!',
      },
    })
  }

  console.log('✅ Seeding complete.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
