import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const contactItems = await prisma.contactItem.findMany()
    res.json(contactItems)
  } catch (err) {
    console.error('❌ Failed to fetch contact info:', err)
    res.status(500).json({ error: 'Unable to load contact info' })
  }
})

export default router
