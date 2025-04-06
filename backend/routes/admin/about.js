// backend/routes/admin/about.js
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../../middleware/authMiddleware.js'

const router = express.Router()
const prisma = new PrismaClient()

// UPDATE summary
// UPDATE summary
router.put('/summary/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  const { content } = req.body

  console.log('🔧 Incoming PUT /summary:', { id, content })

  try {
    const updated = await prisma.aboutSummary.update({
      where: { id: parseInt(id) },
      data: { content },
    })

    console.log('✅ Summary updated:', updated)
    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update summary:', err)
    res.status(500).json({ error: 'Failed to update summary' })
  }
})

export default router
