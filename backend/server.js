import express from 'express'
import cors from 'cors'
import projectRoutes from './routes/projects.js'
import experienceRoutes from './routes/experience.js'
import contactRoutes from './routes/contact.js'
import contactInfoRoutes from './routes/contactinfo.js'
import authRoutes from './routes/auth.js'
import adminProjectRoutes from './routes/adminProjects.js'
import adminExperienceRoutes from './routes/adminExperience.js'
import adminContactInfoRoutes from './routes/admin/contactinfo.js'
import adminMessageRoutes from './routes/admin/messages.js'
import aboutRoutes from './routes/about.js'
import adminAboutRoutes from './routes/admin/about.js'

import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Backend is running!')
})

app.use('/api/projects', projectRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/contact-info', contactInfoRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin/projects', adminProjectRoutes)
app.use('/api/admin/experience', adminExperienceRoutes)
app.use('/api/admin/contactinfo', adminContactInfoRoutes)
app.use('/api/admin/messages', adminMessageRoutes)
app.use('/api/about', aboutRoutes)
app.use('/api/admin/about', adminAboutRoutes)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
console.log('✅ Server initialized without crashing')
