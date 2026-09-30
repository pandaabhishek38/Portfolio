// src/components/Chatbot/ChatIcon.js

import React from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import './Chatbot.css'

const ChatIcon = ({ onClick }) => {
  return (
    <button
      type="button"
      className="chat-icon"
      onClick={onClick}
      aria-label="Open chat"
    >
      <FiMessageSquare aria-hidden="true" />
    </button>
  )
}

export default ChatIcon
