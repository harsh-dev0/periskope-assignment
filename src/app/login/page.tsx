"use client"

import { useAuthContext } from "@/providers/AuthProvider"
import { supabase } from "@/lib/supabase"
import { Icon } from "@iconify/react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Spinner from "@/components/ui/Spinner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const searchParams = useSearchParams()
  const { setUser, loading } = useAuthContext()

  useEffect(() => {
    if (searchParams?.get("signup") === "success") {
      setSuccessMessage("Account created successfully! Please log in.")
    }
  }, [searchParams])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
        });
        // Don't navigate here, let the AuthRedirect handle it
      } else {
        setError(error?.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login: " + err);
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#FAF3EB]">
        <Spinner variant="green" size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#FAF3EB]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            width={64}
            height={64}
            alt="Logo"
            className="mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Log in to your account
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-gray-400 outline-none px-3 py-2 rounded-md text-sm"
          />

          <div className="flex items-center space-x-3 border border-gray-400 rounded-md px-3">
            <input
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="outline-none w-full py-2 text-sm"
            />
            <Icon
              onClick={() => setIsVisible(!isVisible)}
              icon={isVisible ? "mdi-light:eye" : "mdi-light:eye-off"}
              width="20"
              height="20"
              className="cursor-pointer text-gray-500 hover:text-gray-700"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#00a884] py-3 rounded-md text-white font-medium hover:bg-[#009977] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" variant="default" className="mr-2" />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#00a884] hover:text-[#009977] font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
