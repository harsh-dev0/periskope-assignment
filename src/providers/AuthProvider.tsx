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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: personalData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        return null
      }

      return personalData
    } catch (error) {
      console.error("Exception in profile fetch:", error)
      return null
    }
  }, [])

  const setUserFunc = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setUser(null)
        return false
      }

      if (!data.session) {
        console.log("No active session found")
        setUser(null)
        return false
      }

      const personalData = await fetchUserProfile(data.session.user.id)
      
      if (personalData) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
          phone: personalData.phone,
          name: personalData.name,
        })
        return true
      } else {
        setUser(null)
        return false
      }
    } catch (error) {
      console.error("Error in auth setup:", error)
      setUser(null)
      return false
    }
  }, [fetchUserProfile])

  useEffect(() => {
    let mounted = true;
    let authTimeout: NodeJS.Timeout;
    
    const initAuth = async () => {
      try {
        const success = await setUserFunc();
        
        // Set a safety timeout to prevent infinite loading
        authTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.warn("Auth initialization timed out, forcing completion")
            setLoading(false)
          }
        }, 3000)
        
        if (mounted) {
          setLoading(false)
        }
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
            const personalData = await fetchUserProfile(session.user.id)
            
            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                phone: personalData?.phone,
                name: personalData?.name,
              });
              setLoading(false);
            }
          } catch (error) {
            console.error("Error fetching profile on auth change:", error)
            if (mounted) {
              setUser(null);
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      authListener?.subscription.unsubscribe();
    }
  }, [setUserFunc, loading, fetchUserProfile])

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
