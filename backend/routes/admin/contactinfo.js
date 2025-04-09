import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../../middleware/verifyToken.js'

const router = express.Router()
const prisma = new PrismaClient()

// Secure GET (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const info = await prisma.contactItem.findMany()
    res.json(info)
  } catch (err) {
    console.error('❌ Admin fetch error:', err)
    res.status(500).json({ error: 'Failed to load contact info' })
  }
})

// Update contact info
router.put('/', verifyToken, async (req, res) => {
  const { phone, email, address, linkedin, github } = req.body

  console.log('📥 Received update data:', {
    phone,
    email,
    address,
    linkedin,
    github,
  })

  try {
    const result = await Promise.all([
      prisma.contactItem.updateMany({
        where: { label: 'Phone' },
        data: { value: phone },
      }),
      prisma.contactItem.updateMany({
        where: { label: 'Email' },
        data: { value: email },
      }),
      prisma.contactItem.updateMany({
        where: { label: 'Address' },
        data: { value: address },
      }),
      prisma.contactItem.updateMany({
        where: { label: 'LinkedIn' },
        data: { value: linkedin },
      }),
      prisma.contactItem.updateMany({
        where: { label: 'GitHub' },
        data: { value: github },
      }),
    ])

    console.log('✅ UpdateMany results:', result)

    const updated = await prisma.contactItem.findMany()
    res.json(updated)
  } catch (err) {
    console.error('❌ Update failed:', err)
    res.status(500).json({ error: 'Failed to update contact info' })
  }
})

export default router
