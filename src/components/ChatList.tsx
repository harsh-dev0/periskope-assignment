"use client"
import React, { useState } from "react"
import { Chat } from "../lib/types"
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiMoreVertical,
  FiTag,
  FiUser,
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
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <FiPlus className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <FiMoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
              onClick={() => onFilter("unread")}
            >
              Unread
            </button>
            <button
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              onClick={() => onFilter("assigned")}
            >
              Assigned
            </button>
            <button
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200"
              onClick={() => onFilter("important")}
            >
              Important
            </button>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id
                ? "bg-blue-50 border-r-2 border-r-blue-500"
                : ""
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {chat.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={chat.avatar}
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
                  {chat.last_message_time && (
                    <p className="text-xs text-gray-500">
                      {formatTime(chat.last_message_time)}
                    </p>
                  )}
                </div>

                {chat.last_message && (
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {chat.last_message}
                  </p>
                )}

                {/* Labels and badges */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    {chat.labels &&
                      chat.labels.map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <FiTag className="h-3 w-3 mr-1" />
                          {label}
                        </span>
                      ))}
                    {chat.assigned_to && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <FiUser className="h-3 w-3 mr-1" />
                        Assigned
                      </span>
                    )}
                  </div>

                  {chat.unread_count > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white min-w-[20px] h-5">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
