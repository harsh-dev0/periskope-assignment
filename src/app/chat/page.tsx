"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatList } from "@/components/ChatList"
import { ChatArea } from "@/components/ChatArea"
import { Sidebar } from "@/components/Sidebar"
import { authHelpers, supabase } from "@/lib/supabase"
import type { Chat, Message, User } from "@/lib/types"

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
      name: "Test El Centro",
      type: "individual",
      participants: ["user1", "test-el-centro"],
      last_message: "CYFER",
      last_message_time: new Date().toISOString(),
      unread_count: 0,
      labels: [],
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Test Stage Final 5",
      type: "individual",
      participants: ["user1", "test-stage"],
      last_message: "Suspend! This doesn't go on Tuesday...",
      last_message_time: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Periskope Team Chat",
      type: "group",
      participants: ["user1", "john", "sarah", "mike"],
      last_message: "Test message",
      last_message_time: new Date(Date.now() - 7200000).toISOString(),
      unread_count: 0,
      labels: ["Demo", "Internal"],
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "+91 99999 99999",
      type: "individual",
      participants: ["user1", "phone-user"],
      last_message: "Hi there, I'm Samantha, Co-Founder of...",
      last_message_time: new Date(Date.now() - 86400000).toISOString(),
      unread_count: 0,
      labels: ["Demo", "Startup"],
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Test Demo15",
      type: "individual",
      participants: ["user1", "test-demo"],
      last_message: "Content: 123",
      last_message_time: new Date(Date.now() - 172800000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
    {
      id: "6",
      name: "Test El Centro",
      type: "individual",
      participants: ["user1", "test-el-centro-2"],
      last_message: "Resident Nidhi Ahmedabad!",
      last_message_time: new Date(Date.now() - 259200000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
    {
      id: "7",
      name: "Testing group",
      type: "group",
      participants: ["user1", "test1", "test2"],
      last_message: "Testing 123...",
      last_message_time: new Date(Date.now() - 345600000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
    {
      id: "8",
      name: "Team 3",
      type: "group",
      participants: ["user1", "team3-1", "team3-2"],
      last_message: "First Bulk Message",
      last_message_time: new Date(Date.now() - 432000000).toISOString(),
      unread_count: 0,
      labels: ["Demo", "Over Limit"],
      created_at: new Date().toISOString(),
    },
    {
      id: "9",
      name: "Test Stage Final 9473",
      type: "individual",
      participants: ["user1", "test-stage-9473"],
      last_message: "Happy",
      last_message_time: new Date(Date.now() - 518400000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
    {
      id: "10",
      name: "Stage Demo",
      type: "individual",
      participants: ["user1", "stage-demo"],
      last_message: "test 123",
      last_message_time: new Date(Date.now() - 604800000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
    {
      id: "11",
      name: "Test Demo10",
      type: "individual",
      participants: ["user1", "test-demo10"],
      last_message: "test 123",
      last_message_time: new Date(Date.now() - 691200000).toISOString(),
      unread_count: 0,
      labels: ["Demo"],
      created_at: new Date().toISOString(),
    },
  ]

  const sampleMessages: { [key: string]: Message[] } = {
    "1": [
      {
        id: "m1",
        chat_id: "1",
        sender_id: "test-el-centro",
        sender_name: "Roshan Arfin",
        phone: "+91 93456 71234",
        content: "CYFER",
        type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "m2",
        chat_id: "1",
        sender_id: "test-el-centro",
        sender_name: "Roshan Arfin",
        phone: "+91 93456 71234",
        content: "COEFT",
        type: "text",
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: "m3",
        chat_id: "1",
        sender_id: "user1",
        content: "Hello, South Luna!",
        type: "text",
        email: "test@periskope.com",
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: "m4",
        chat_id: "1",
        sender_id: "test-el-centro",
        sender_name: "Roshan Arfin",
        phone: "+91 93456 71234",
        content: "Hello, Lunar!",
        type: "text",
        created_at: new Date(Date.now() - 3300000).toISOString(),
      },
      {
        id: "m5",
        chat_id: "1",
        sender_id: "test-el-centro",
        sender_name: "Roshan Arfin",
        phone: "+91 93456 71234",
        content: "COEFT",
        type: "text",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "m6",
        chat_id: "1",
        sender_id: "user1",
        content: "testing",
        type: "text",
        email: "test@periskope.com",
        created_at: new Date(Date.now() - 1700000).toISOString(),
      },
    ],
    "2": [
      {
        id: "m7",
        chat_id: "2",
        sender_id: "test-stage",
        sender_name: "Test Stage",
        content: "Suspend! This doesn't go on Tuesday...",
        type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    "3": [
      {
        id: "m8",
        chat_id: "3",
        sender_id: "john",
        sender_name: "Periskope",
        content: "Test message",
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

        // Set the first chat as selected by default
        if (sampleChats.length > 0) {
          setSelectedChatId(sampleChats[0].id)
        }
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

    // Set up real-time subscription
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
      email: "periskope@mail.com",
      created_at: new Date().toISOString(),
    }

    // Optimistically add the message to the UI
    setMessages((prev) => [...prev, newMessage])

    try {
      // In a real app, you would call the API to save the message
      // const { data, error } = await chatHelpers.sendMessage(selectedChatId, currentUser.id, content);
      // if (error) throw error;

      // Update the last message in the chat list
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              last_message: content,
              last_message_time: new Date().toISOString(),
            }
          }
          return chat
        })
      )

      setFilteredChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              last_message: content,
              last_message_time: new Date().toISOString(),
            }
          }
          return chat
        })
      )

      console.log("Message sent:", content)
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove the optimistically added message if it fails
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
      {/* Sidebar */}
      <Sidebar currentUser={currentUser} onSignOut={handleSignOut} />

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
