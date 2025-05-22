"use client"
import type React from "react"
import { useState } from "react"
import type { Chat } from "../lib/types"
import {
  FiSearch,
  FiFilter,
  FiTag,
  FiRefreshCw,
  FiHelpCircle,
} from "react-icons/fi"

interface ChatListProps {
  chats: Chat[]
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
  onSearch: (query: string) => void
  onFilter: (filter: string) => void
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  onSearch,
  onFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [customFilter, setCustomFilter] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch(e.target.value)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">
              <FiRefreshCw className="h-4 w-4" />
            </span>
            <h1 className="text-sm font-medium text-gray-900">chats</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-500 hover:text-gray-700">
              <FiRefreshCw className="h-4 w-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <FiHelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Custom Filter */}
        <div className="flex items-center mb-3">
          <div className="flex-1 mr-2 flex items-center border border-gray-200 rounded-md px-2 py-1">
            <span className="text-green-600 mr-1">
              <FiTag className="h-4 w-4" />
            </span>
            <span className="text-sm text-gray-700">Custom Filter</span>
          </div>
          <button className="px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50">
            Save
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm"
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="absolute right-3 top-2.5 flex items-center space-x-1">
            <span
              className={`text-${
                showFilters ? "green" : "gray"
              }-500 cursor-pointer`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="h-4 w-4" />
            </span>
            <span className="text-xs text-gray-400">2</span>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? "bg-gray-50" : ""
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {chat.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {chat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chat.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {chat.labels && chat.labels.includes("Demo") && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        Demo
                      </span>
                    )}
                    {chat.last_message_time && (
                      <p className="text-xs text-gray-500">
                        {formatTime(chat.last_message_time)}
                      </p>
                    )}
                  </div>
                </div>

                {chat.last_message && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {chat.last_message}
                  </p>
                )}

                {/* Additional info */}
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <span className="truncate">{">"} VERIFIED AGENT 0</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
