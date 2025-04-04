import express from 'express'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const router = express.Router()

router.post('/', async (req, res) => {
  const { name, email, message } = req.body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  if (message.trim().length < 10) {
    return res
      .status(400)
      .json({ error: 'Message must be at least 10 characters long.' })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_TO,
      subject: '📬 New Portfolio Contact Message',
      text: message,
      html: `
        <h3>New Message from ${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    })

    await prisma.contactMessage.create({
      data: { name, email, message },
    })

    console.log('📩 Email sent and 💾 message saved to DB:', { name, email })

    res
      .status(200)
      .json({ success: true, message: 'Message received and email sent!' })
  } catch (err) {
    console.error('❌ Email send or DB save failed:', err)
    res.status(500).json({ error: 'Failed to send email or save message.' })
  }
})

export default router
