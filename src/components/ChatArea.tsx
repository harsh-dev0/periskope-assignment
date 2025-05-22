"use client"
import React, { useState, useRef, useEffect } from "react"
import type { Message, User } from "../lib/types"
import {
  FiPaperclip,
  FiSmile,
  FiPhone,
  FiVideo,
  FiChevronRight,
  FiMaximize2,
  FiX,
  FiPlus,
  FiMessageSquare,
  FiClock,
  FiMail,
  FiUser,
} from "react-icons/fi"

interface ChatAreaProps {
  selectedChatId: string | null
  messages: Message[]
  currentUser: User
  onSendMessage: (content: string) => void
  chatName: string
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChatId,
  messages,
  currentUser,
  onSendMessage,
  chatName,
}) => {
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [messageType, setMessageType] = useState<
    "message" | "whatsapp" | "private"
  >("message")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChatId || sending) return

    setSending(true)
    try {
      await onSendMessage(newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatMessageDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-600 font-bold text-xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a chat to start messaging
          </h3>
          <p className="text-gray-500">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Chat Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-base font-medium text-gray-900">
            {chatName}
          </h2>
          <div className="ml-2 text-xs text-gray-500 flex items-center">
            <span>
              (Resident Arfin, Whatsapp Jm, Bharat Kumar Samsani,
              Periskope)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700">
            <FiMaximize2 className="h-4 w-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUser.id
          const showDate =
            index > 0 &&
            new Date(message.created_at).toDateString() !==
              new Date(messages[index - 1].created_at).toDateString()

          return (
            <React.Fragment key={message.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {formatMessageDate(message.created_at)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <div className="mr-2 flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-xs">
                        R
                      </span>
                    </div>
                  </div>
                )}

                <div className="max-w-[70%]">
                  {!isCurrentUser && message.sender_name && (
                    <div className="mb-1 flex items-center">
                      <span className="text-xs font-medium text-gray-500">
                        {message.sender_name}
                      </span>
                      {message.phone && (
                        <span className="ml-2 text-xs text-gray-400 flex items-center">
                          <FiPhone className="h-3 w-3 mr-1" />
                          {message.phone}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  <div
                    className={`mt-1 flex justify-${
                      isCurrentUser ? "end" : "start"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isCurrentUser ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(message.created_at)}
                    </span>
                    {isCurrentUser && (
                      <span className="ml-1 text-xs text-green-700">
                        ✓✓
                      </span>
                    )}
                  </div>

                  {isCurrentUser && message.email && (
                    <div className="mt-1 flex justify-end">
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiMail className="h-3 w-3 mr-1" />
                        {message.email}
                      </span>
                    </div>
                  )}
                </div>

                {isCurrentUser && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        P
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Type Selector */}
      <div className="px-6 py-2 border-t border-gray-200 bg-white flex items-center space-x-2">
        <button
          className={`px-3 py-1 text-xs rounded-md flex items-center ${
            messageType === "message"
              ? "bg-gray-200 text-gray-800"
              : "text-gray-500"
          }`}
          onClick={() => setMessageType("message")}
        >
          <FiMessageSquare className="h-3 w-3 mr-1" />
          Message
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-md flex items-center ${
            messageType === "whatsapp"
              ? "bg-green-100 text-green-800"
              : "text-gray-500"
          }`}
          onClick={() => setMessageType("whatsapp")}
        >
          <span className="mr-1">W</span>
          WhatsApp
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-md flex items-center ${
            messageType === "private"
              ? "bg-yellow-100 text-yellow-800"
              : "text-gray-500"
          }`}
          onClick={() => setMessageType("private")}
        >
          <FiClock className="h-3 w-3 mr-1" />
          Private Note
        </button>
      </div>

      {/* Message Input */}
      <div className="px-6 py-3 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Message..."
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <FiPaperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <FiSmile className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Right Sidebar */}
      <div className="absolute top-0 right-0 bottom-0 w-10 bg-white border-l border-gray-200 flex flex-col items-center py-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 mb-2">
          <FiChevronRight className="h-4 w-4" />
        </button>
        <div className="flex-1 flex flex-col items-center space-y-4 mt-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <FiUser className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <FiMessageSquare className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <FiPhone className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <FiVideo className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <FiPaperclip className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
