"use client"
import { useState,  createContext, useContext } from 'react'
import styles from './custom-message.module.css'

interface Message {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  content: string
  duration?: number
}

interface MessageContextType {
  success: (content: string, duration?: number) => void
  error: (content: string, duration?: number) => void
  info: (content: string, duration?: number) => void
  warning: (content: string, duration?: number) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function useMessage() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (type: Message['type'], content: string, duration = 3000) => {
    const id = Date.now().toString()
    const newMessage: Message = { id, type, content, duration }
    
    setMessages(prev => [...prev, newMessage])

    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, duration)
  }

  const success = (content: string, duration?: number) => {
    addMessage('success', content, duration)
  }

  const error = (content: string, duration?: number) => {
    addMessage('error', content, duration)
  }

  const info = (content: string, duration?: number) => {
    addMessage('info', content, duration)
  }

  const warning = (content: string, duration?: number) => {
    addMessage('warning', content, duration)
  }

  return (
    <MessageContext.Provider value={{ success, error, info, warning }}>
      {children}
      <div className={styles.messageContainer}>
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`${styles.message} ${styles[message.type]}`}
          >
            {message.content}
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  )
}
