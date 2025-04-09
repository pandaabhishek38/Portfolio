import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (req, res) => {
  console.log('🚀 Running remote seed on deployed DB...')

  try {
    await prisma.contactItem.createMany({
      data: [
        { label: 'Phone', value: '123-456-7890' },
        { label: 'Email', value: 'me@mail.com' },
        { label: 'Address', value: 'My Street' },
        { label: 'LinkedIn', value: 'http:linkedin' },
        { label: 'GitHub', value: 'http:github' },
      ],
      skipDuplicates: true,
    })

    const existing = await prisma.aboutSummary.findFirst()
    if (!existing) {
      await prisma.aboutSummary.create({
        data: {
          content:
            'This is my default About summary. Edit me in the Admin panel!',
        },
      })
    }

    console.log('✅ Remote seed complete.')
    res.json({ success: true, message: 'Seeding complete.' })
  } catch (e) {
    console.error('❌ Remote seed error:', e)
    res.status(500).json({ error: 'Seeding failed', detail: e.message })
  }
})

export default router
