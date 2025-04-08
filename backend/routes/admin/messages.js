import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../../middleware/verifyToken.js'

const prisma = new PrismaClient()
const router = express.Router()

// Protect all routes with verifyToken
router.use(verifyToken)

// GET all messages
router.get('/', async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany()
    res.json(messages)
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err)
    res.status(500).json({ error: 'Failed to load messages' })
  }
})

// DELETE message
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.contactMessage.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Message deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete message:', err)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

export default router
