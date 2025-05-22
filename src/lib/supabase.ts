import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authHelpers = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },
}

export const chatHelpers = {
  getUserChats: async (userId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        *,
        messages (
          content,
          created_at
        )
      `
      )
      .contains("participants", [userId])
      .order("created_at", { ascending: false })

    return { data, error }
  },

  getChatMessages: async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users(name, avatar)
      `
      )
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    return { data, error }
  },

  sendMessage: async (
    chatId: string,
    senderId: string,
    content: string
  ) => {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        type: "text",
      })
      .select()
      .single()

    return { data, error }
  },
}
