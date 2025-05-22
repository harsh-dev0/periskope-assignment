"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatList } from "@/components/ChatList"
import { ChatArea } from "@/components/ChatArea"
import { authHelpers, chatHelpers, supabase } from "@/lib/supabase"
import { Chat, Message, User } from "@/lib/types"

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Sample data for demo purposes
  const sampleChats: Chat[] = [
    {
      id: "1",
      name: "John Doe",
      type: "individual",
      participants: ["user1", "john"],
      last_message: "Hey, how are you doing?",
      last_message_time: new Date().toISOString(),
      unread_count: 2,
      labels: ["important"],
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Sarah Wilson",
      type: "individual",
      participants: ["user1", "sarah"],
      last_message: "Thanks for your help yesterday!",
      last_message_time: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 0,
      assigned_to: "user1",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Project Team",
      type: "group",
      participants: ["user1", "john", "sarah", "mike"],
      last_message: "Meeting at 3 PM today",
      last_message_time: new Date(Date.now() - 7200000).toISOString(),
      unread_count: 1,
      labels: ["work"],
      created_at: new Date().toISOString(),
    },
  ]

  const sampleMessages: { [key: string]: Message[] } = {
    "1": [
      {
        id: "m1",
        chat_id: "1",
        sender_id: "john",
        content: "Hey, how are you doing?",
        type: "text",
        created_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "m2",
        chat_id: "1",
        sender_id: "user1",
        content: "I am doing great, thanks for asking!",
        type: "text",
        created_at: new Date(Date.now() - 240000).toISOString(),
      },
    ],
    "2": [
      {
        id: "m3",
        chat_id: "2",
        sender_id: "sarah",
        content: "Thanks for your help yesterday!",
        type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    "3": [
      {
        id: "m4",
        chat_id: "3",
        sender_id: "mike",
        content: "Meeting at 3 PM today",
        type: "text",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push("/")
          return
        }

        const currentUserData: User = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split("@")[0],
          created_at: user.created_at,
        }

        setCurrentUser(currentUserData)
        setChats(sampleChats)
        setFilteredChats(sampleChats)
      } catch (error) {
        console.error("Failed to initialize app:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [router])

  useEffect(() => {
    if (!selectedChatId || !currentUser) return

    setMessages(sampleMessages[selectedChatId] || [])

    const channel = supabase
      .channel(`chat-${selectedChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChatId, currentUser])

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId || !currentUser) return

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_id: selectedChatId,
      sender_id: currentUser.id,
      content,
      type: "text",
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])

    try {
      // const { data, error } = await chatHelpers.sendMessage(selectedChatId, currentUser.id, content);
      // if (error) throw error;

      console.log("Message sent:", content)
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id))
    }
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredChats(chats)
      return
    }

    const filtered = chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(query.toLowerCase()) ||
        chat.last_message?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredChats(filtered)
  }

  const handleFilter = (filter: string) => {
    let filtered = chats

    switch (filter) {
      case "unread":
        filtered = chats.filter((chat) => chat.unread_count > 0)
        break
      case "assigned":
        filtered = chats.filter((chat) => chat.assigned_to)
        break
      case "important":
        filtered = chats.filter((chat) =>
          chat.labels?.includes("important")
        )
        break
      default:
        filtered = chats
    }

    setFilteredChats(filtered)
  }

  const handleSignOut = async () => {
    try {
      await authHelpers.signOut()
      router.push("/")
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  const selectedChat = chats.find((chat) => chat.id === selectedChatId)

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar with user info */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <nav className="flex-1 flex flex-col space-y-2">
          <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            💬
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            📞
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            👥
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            ⚙️
          </button>
        </nav>

        <button
          onClick={handleSignOut}
          className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg mt-auto"
          title="Sign Out"
        >
          🚪
        </button>
      </div>

      {/* Chat List */}
      <ChatList
        chats={filteredChats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />

      {/* Chat Area */}
      <ChatArea
        selectedChatId={selectedChatId}
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        chatName={selectedChat?.name || ""}
      />
    </div>
  )
}
