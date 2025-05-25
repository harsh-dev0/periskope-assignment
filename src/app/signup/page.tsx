"use client"

import { supabase } from "@/lib/supabase"
import { Icon } from "@iconify/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Spinner from "@/components/ui/Spinner"
import { useAuthContext } from "@/providers/AuthProvider"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { loading } = useAuthContext()

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone,
      });

      if (!error && data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, email, phone, name }]);

        if (!profileError) {
          router.push("/login?signup=success");
        } else {
          setError(profileError.message || "Profile creation failed");
        }
      } else {
        setError(error?.message || "Signup failed");
      }
    } catch (err) {
      setError("An error occurred during signup: " + err);
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
            Create Account
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Join Periskope Chat
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name *"
            className="w-full border border-gray-400 outline-none px-3 py-2 rounded-md text-sm"
            required
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            className="w-full border border-gray-400 outline-none px-3 py-2 rounded-md text-sm"
            required
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full border border-gray-400 outline-none px-3 py-2 rounded-md text-sm"
          />

          <div className="flex items-center space-x-3 border border-gray-400 rounded-md px-3">
            <input
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password *"
              className="outline-none w-full py-2 text-sm"
              required
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
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full bg-[#00a884] py-3 rounded-md text-white font-medium hover:bg-[#009977] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" variant="default" className="mr-2" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#00a884] hover:text-[#009977] font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
