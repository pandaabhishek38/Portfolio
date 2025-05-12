// src/components/Chatbot/ChatIcon.js

import React from 'react'
import './Chatbot.css'

const ChatIcon = ({ onClick }) => {
  return (
    <div className="chat-icon" onClick={onClick}>
      💬
    </div>
  )
}

export default ChatIcon
