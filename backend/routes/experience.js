import express from 'express'

const router = express.Router()

const experiences = [
  {
    company: 'Model Earth',
    role: 'Software Development Engineer',
    period: 'Sep 2024 – Present',
    location: 'Remote, USA',
    bullets: [
      'Designed and developed scalable web applications with secure backend architectures for AI-driven platforms.',
      'Integrated Large Language Models (LLMs) and AI APIs for intelligent automation and real-time decision-making.',
      'Engineered high-performance APIs and cloud microservices to ensure seamless data exchange and model deployment.',
    ],
  },
  {
    company: 'HDFC Bank',
    role: 'Risk Analytics Intern',
    period: 'May 2019 – Aug 2019',
    location: 'Mumbai, India',
    bullets: [
      'Enhanced TALEND workflows for customer credit data, streamlining transformation and utilization.',
      'Built a JAR-based solution that integrated with H2O.ai ML models to automate creditworthiness analysis.',
      'Applied ML insights to revolutionize personal loan qualification and improve risk management.',
    ],
  },
]

router.get('/', (req, res) => {
  res.json(experiences)
})

export default router
