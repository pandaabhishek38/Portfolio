import express from 'express'
import cors from 'cors'
import projectRoutes from './routes/projects.js'

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Backend is running!')
})

app.use('/api/projects', projectRoutes)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
console.log('✅ Server initialized without crashing')
