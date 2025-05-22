export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  created_at: string
}

export interface Chat {
  id: string
  name: string
  type: "individual" | "group"
  participants: string[]
  last_message?: string
  last_message_time?: string
  unread_count: number
  avatar?: string
  labels?: string[]
  assigned_to?: string
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: "text" | "image" | "video" | "file"
  attachment_url?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}
