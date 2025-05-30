import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') }) // 👈 force load correct path

const router = express.Router()

// Hardcoded admin login
const ADMIN_USER = {
  username: 'admin',
  password: 'secret123', // you can change this
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    return res.status(200).json({ token })
  }

  return res.status(401).json({ error: 'Invalid credentials' })
})

export default router
