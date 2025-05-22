"use client"

import type React from "react"
import {
  FiHome,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiPieChart,
  FiFolder,
  FiCalendar,
  FiGrid,
} from "react-icons/fi"

interface SidebarProps {
  currentUser: {
    name: string
  }
  onSignOut: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onSignOut,
}) => {
  return (
    <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
      <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center mb-6">
        <span className="text-white font-bold text-sm">P</span>
      </div>

      <nav className="flex-1 flex flex-col space-y-4">
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiHome className="h-5 w-5" />
        </button>
        <button className="p-3 text-white bg-gray-700 rounded-lg">
          <FiMessageSquare className="h-5 w-5" />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiUsers className="h-5 w-5" />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiPieChart className="h-5 w-5" />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiFolder className="h-5 w-5" />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiCalendar className="h-5 w-5" />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiGrid className="h-5 w-5" />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
          <FiSettings className="h-5 w-5" />
        </button>
      </nav>

      <button
        onClick={onSignOut}
        className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg mt-auto"
        title="Sign Out"
      >
        <FiLogOut className="h-5 w-5" />
      </button>
    </div>
  )
}
