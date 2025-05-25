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

      if (error) {
        console.error("Error getting session:", error)
        setUser(null)
        setLoading(false)
        return
      }

      if (!data.session) {
        console.log("No active session found")
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const { data: personalData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setUser(null)
          setLoading(false)
          return
        }

        if (!personalData) {
          console.log("No profile data found for user")
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
      } catch (profileFetchError) {
        console.error("Exception in profile fetch:", profileFetchError)
        setUser(null)
      }
    } catch (error) {
      console.error("Error in auth setup:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        await setUserFunc();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const { data: personalData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle()

            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                phone: personalData?.phone,
                name: personalData?.name,
              });
            }
          } catch (error) {
            console.error("Error fetching profile on auth change:", error)
            if (mounted) {
              setUser(null);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    }
  }, [setUserFunc])

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
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
