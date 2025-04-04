import express from 'express'
import cors from 'cors'
import projectRoutes from './routes/projects.js'
import experienceRoutes from './routes/experience.js'
import contactRoutes from './routes/contact.js'
import contactInfoRoutes from './routes/contactinfo.js'

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
console.log('✅ Server initialized without crashing')
