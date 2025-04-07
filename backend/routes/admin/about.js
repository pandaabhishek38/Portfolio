// backend/routes/admin/about.js
import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../../middleware/verifyToken.js'

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

// UPDATE education
router.put('/education/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  const { university, degree, major, fromYear, toYear, courses } = req.body

  try {
    const updated = await prisma.education.update({
      where: { id: parseInt(id) },
      data: { university, degree, major, fromYear, toYear, courses },
    })
    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update education:', err)
    res.status(500).json({ error: 'Failed to update education' })
  }
})

// DELETE education
router.delete('/education/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  try {
    await prisma.education.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Education deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete education:', err)
    res.status(500).json({ error: 'Failed to delete education' })
  }
})

// CREATE education
router.post('/education', verifyToken, async (req, res) => {
  const { university, degree, major, fromYear, toYear, courses } = req.body

  try {
    const created = await prisma.education.create({
      data: {
        university,
        degree,
        major,
        fromYear: parseInt(fromYear),
        toYear: parseInt(toYear),
        courses,
      },
    })

    res.status(201).json(created)
  } catch (err) {
    console.error('❌ Failed to create education:', err)
    res.status(500).json({ error: err.message })
  }
})

// UPDATE skill
router.put('/skills/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  const { name, type } = req.body

  try {
    const updated = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: { name, type },
    })

    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update skill:', err)
    res.status(500).json({ error: 'Failed to update skill' })
  }
})

// DELETE skill
router.delete('/skills/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  try {
    await prisma.skill.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Skill deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete skill:', err)
    res.status(500).json({ error: 'Failed to delete skill' })
  }
})

// CREATE skill
router.post('/skills', verifyToken, async (req, res) => {
  const { name, type } = req.body

  try {
    const created = await prisma.skill.create({
      data: { name, type },
    })

    res.status(201).json(created)
  } catch (err) {
    console.error('❌ Failed to create skill:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
