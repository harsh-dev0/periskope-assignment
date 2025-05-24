"use client"
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

interface AuthContextType {
  user: {
    id: string
    email: string | undefined
    phone?: string | undefined
    name?: string | undefined
  } | null
  setUser: (
    user: {
      id: string
      email: string | undefined
      phone?: string | undefined
      name?: string | undefined
    } | null
  ) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{
    id: string
    email: string | undefined
    phone?: string | undefined
    name?: string | undefined
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const setUserFunc = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: personalData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session?.user.id)
        .maybeSingle()

      if (!personalData) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser({
        id: data.session.user.id,
        email: data.session.user.email,
        phone: personalData.phone,
        name: personalData.name,
      })
    } catch (error) {
      console.error("Error in auth setup:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setUserFunc()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const { data: personalData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle()

            setUser({
              id: session.user.id,
              email: session.user.email,
              phone: personalData?.phone,
              name: personalData?.name,
            })
          } catch (error) {
            console.error("Error fetching profile on auth change:", error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [setUserFunc])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider")
  return context
}
