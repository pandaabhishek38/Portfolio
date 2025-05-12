// chatbot_context_api.js

import express from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import axios from 'axios'
import OpenAI from 'openai' // Import the updated OpenAI SDK

dotenv.config()
const router = express.Router()
const prisma = new PrismaClient()

// Initialize the OpenAI client correctly
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Works with sk-proj-xxx keys
})

// Route to fetch consolidated chatbot context
router.get('/chatbot/context', async (req, res) => {
  try {
    // Fetching Summary
    const summary = await prisma.aboutSummary.findFirst()

    // Fetching Education (Render Schema)
    // Fetching Education (Highest Level First)
    const education = await prisma.education.findMany({
      orderBy: {
        toYear: 'desc',
      },
      select: {
        university: true,
        degree: true,
        fromYear: true,
        toYear: true,
        major: true,
      },
    })
    const highestEducation = education[0] || {
      degree: 'Computer Science',
      major: 'Computer Science',
      university: 'Rutgers University',
      toYear: '2024',
    }

    // Fetching Skills (Render Schema)
    const skills = await prisma.skill.findMany({
      select: {
        type: true,
        name: true,
      },
    })
    const formattedSkills = {}
    skills.forEach((skill) => {
      if (!formattedSkills[skill.type]) {
        formattedSkills[skill.type] = []
      }
      formattedSkills[skill.type].push(skill.name)
    })
    const polishedSkills = Object.entries(formattedSkills)
      .map(([type, names]) => `**${type}**: ${names.join(', ')}`)
      .join('\n\n')

    // Fetching Projects (Render Schema)
    // Fetching Projects (Polished Format)
    const projects = await prisma.project.findMany({
      select: {
        title: true,
        stack: true,
        github: true,
        description: true,
      },
    })
    const formattedProjects = projects
      .map((project) => {
        const titleLink = project.github
          ? `[${project.title}](${project.github})`
          : project.title

        return `**${titleLink}** (${project.stack})\n${project.description}`
      })
      .join('\n\n')

    // Fetching Experience (Render Schema)
    // Fetching Experience (Polished Format)
    const experience = await prisma.experience.findMany({
      select: {
        company: true,
        role: true,
        period: true,
        location: true,
        description: true,
      },
    })
    const formattedExperience = experience
      .map((exp) => {
        return `**${exp.company}** (${exp.role}, ${exp.period})\n${exp.description}\n*Location*: ${exp.location}`
      })
      .join('\n\n')

    // Fetching Contact Info (Render Schema)
    const contact = await prisma.contactItem.findMany({
      select: {
        label: true,
        value: true,
        url: true,
      },
    })
    const formattedContact = {}
    contact.forEach((item) => {
      formattedContact[item.label.toLowerCase()] = item.url || item.value
    })

    // Constructing the chatbot context JSON
    const context = {
      summary: summary ? summary.content : 'No summary available.',
      highestEducation,
      skills: formattedSkills,
      education,
      projects: formattedProjects,
      experience: formattedExperience,
      contact: formattedContact,
    }

    res.status(200).json(context)
  } catch (error) {
    console.error('Error fetching chatbot context:', error)
    res.status(500).json({ error: 'Failed to fetch chatbot context.' })
  }
})

// Route to handle chatbot conversations (OpenAI Integration)
router.post('/chatbot/message', async (req, res) => {
  try {
    const { message } = req.body

    // Fetch the chatbot context
    const response = await axios.get(
      'http://localhost:5001/api/chatbot/context'
    )
    const context = response.data

    // Prepare a polished system message
    // Prepare a polished system message
    // Prepare a polished system message
    // Prepare a polished system message
    // Prepare a polished system message
    const systemMessage = `
You are a professional AI assistant on Abhishek Panda's portfolio.
Provide concise, professional responses that highlight Abhishek's skills, projects, and experiences.

Abhishek holds an ${context.highestEducation.degree} in ${
      context.highestEducation.major
    } from ${context.highestEducation.university}, completed in ${
      context.highestEducation.toYear
    }.

He has a diverse portfolio of projects that showcase his skills in full-stack development, machine learning, AI, and data analysis. Here are some highlights:

Summary:
${context.summary}

Skills:
${Object.entries(context.skills)
  .map(
    ([category, skills]) => `- **${category}**:\n  - ${skills.join('\n  - ')}`
  )
  .join('\n\n')}

Projects:
${context.projects
  .split('\n\n')
  .map((proj) => `- ${proj.replace(/\n/g, '\n  ')}`)
  .join('\n')}

  Experience:
  ${context.experience
    .split('\n\n')
    .map((exp) => {
      const [title, ...details] = exp.split('\n')
      return `- **${title}**\n  ${details.join('\n  ')}`
    })
    .join('\n')}

Contact:
${Object.entries(context.contact)
  .map(([label, value]) => `- **${label}**: ${value}`)
  .join('\n')}
`

    // Call the OpenAI API using the SDK
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    // Send the response back to the frontend
    res.status(200).json({
      response: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error('Error generating chatbot response:', error)
    res.status(500).json({ error: 'Failed to generate chatbot response.' })
  }
})

export default router
