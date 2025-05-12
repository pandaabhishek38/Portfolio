// src/components/Chatbot/Chatbot.js
'use client'

import React, { useState, useRef, useEffect } from 'react'
import './Chatbot.css'
import ChatIcon from './Chaticon'
import ReactMarkdown from 'react-markdown'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false) // Loading state
  const messageContainerRef = useRef()

  useEffect(() => {
    if (isOpen && messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleToggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    // Add the user message
    const userMessage = { role: 'user', content: userInput }
    setMessages((prev) => [...prev, userMessage])
    setUserInput('')

    try {
      // Show typing indicator
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chatbot/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput }),
        }
      )
      const data = await response.json()

      // Add the bot message
      const botMessage = { role: 'bot', content: data.response }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Sorry, something went wrong. Please try again later.',
        },
      ])
    } finally {
      // Hide typing indicator
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <>
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header" onClick={handleToggleChatbot}>
          Chat with Me
        </div>
        <div className="chatbot-body" ref={messageContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}

          {/* Show the typing indicator if loading */}
          {loading && <div className="message bot typing">Typing...</div>}
        </div>
        {isOpen && (
          <div className="chatbot-footer">
            <input
              type="text"
              placeholder="Say hi!"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSendMessage} disabled={loading}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        )}
      </div>
      <ChatIcon onClick={handleToggleChatbot} />
    </>
  )
}

export default Chatbot
