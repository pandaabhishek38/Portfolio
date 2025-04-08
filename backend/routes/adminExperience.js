import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../middleware/verifyToken.js'

const prisma = new PrismaClient()
const router = express.Router()

router.use(verifyToken)

// CREATE Experience
router.post('/', async (req, res) => {
  const { company, role, period, location, description } = req.body
  try {
    const created = await prisma.experience.create({
      data: {
        company,
        role,
        period,
        location,
        description,
      },
    })
    res.status(201).json(created)
  } catch (err) {
    console.error('❌ Failed to add experience:', err)
    res.status(500).json({ error: 'Failed to add experience' })
  }
})

// UPDATE Experience
router.put('/:id', async (req, res) => {
  const { company, role, period, location, description } = req.body
  const { id } = req.params
  try {
    const updated = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: {
        company,
        role,
        period,
        location,
        description,
      },
    })
    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update experience:', err)
    res.status(500).json({ error: 'Failed to update experience' })
  }
})

// DELETE Experience
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.experience.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Experience deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete experience:', err)
    res.status(500).json({ error: 'Failed to delete experience' })
  }
})

// Optional Test Route (can keep or remove)
router.get('/', async (req, res) => {
  res.json({ message: 'Admin experience route is working!' })
})

export default router
