"use client";

import { useAuthContext } from "./AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== "/login" && pathname !== "/signup") {
      console.log("Redirecting to login page");
      router.replace("/login");
    }
    else if (user && (pathname === "/login" || pathname === "/signup")) {
      console.log("Redirecting to home page");
      router.replace("/");
    }
  }, [user, pathname, router]);

  return <>{children}</>;
}