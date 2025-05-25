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

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Auth loading timeout occurred, forcing continue")
        setTimeoutOccurred(true)
      }
    }, 5000) // 5 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [loading])

  useEffect(() => {
    if (!loading || timeoutOccurred) {
      if (!user && pathname !== "/login" && pathname !== "/signup") {
        console.log("Redirecting to login page")
        router.push("/login")
      }
      else if (user && (pathname === "/login" || pathname === "/signup")) {
        console.log("Redirecting to home page")
        router.push("/")
      }
    }
  }, [user, pathname, router, loading, timeoutOccurred])

  if (loading && !timeoutOccurred) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner variant="green" size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
