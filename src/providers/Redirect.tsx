"use client"

import { useAuthContext } from "./AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Spinner from "@/components/ui/Spinner"

export default function AuthRedirect({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [timeoutOccurred, setTimeoutOccurred] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Auth loading timeout occurred, forcing continue")
        setTimeoutOccurred(true)
      }
    }, 3000) // Reduced to 3 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Handle redirection based on auth state
  useEffect(() => {
    // Skip if already redirecting to prevent loops
    if (isRedirecting) return
    
    // Only proceed if we have auth state or timeout occurred
    if (!loading || timeoutOccurred) {
      const isAuthPath = pathname === "/login" || pathname === "/signup"
      
      // User is not authenticated and trying to access protected route
      if (!user && !isAuthPath) {
        setIsRedirecting(true)
        console.log("Redirecting to login page")
        router.replace("/login")
      }
      // User is authenticated and trying to access auth routes
      else if (user && isAuthPath) {
        setIsRedirecting(true)
        console.log("Redirecting to home page")
        router.replace("/")
      }
    }
  }, [user, pathname, router, loading, timeoutOccurred, isRedirecting])

  // Show loading spinner only if still loading and timeout hasn't occurred
  if (loading && !timeoutOccurred) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner variant="green" size="lg" />
      </div>
    )
  }

  // Render children once auth state is determined
  return <>{children}</>
}
