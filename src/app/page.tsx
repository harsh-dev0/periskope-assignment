"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "../components/LoginForm"
import { authHelpers } from "../lib/supabase"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authHelpers.getCurrentUser()
      if (user) {
        router.push("/chat")
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = (user: any) => {
    router.push("/chat")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return <LoginForm onLogin={handleLogin} />
}
