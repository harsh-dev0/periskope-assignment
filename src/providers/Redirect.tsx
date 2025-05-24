"use client"

import { useAuthContext } from "./AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Spinner from "@/components/ui/Spinner"

export default function AuthRedirect({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login" && pathname !== "/signup") {
        router.push("/login")
      }
      else if (user && (pathname === "/login" || pathname === "/signup")) {
        router.push("/")
      }
    }
  }, [user, pathname, router, loading])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner variant="green" size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
