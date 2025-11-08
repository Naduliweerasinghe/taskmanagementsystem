"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function NavBar() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const [session, setSession] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(session)
      } catch (e) {
        console.error("Error getting session:", e)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((event: any, s: any) => {
      if (mounted) setSession(s)
    })

    return () => {
      mounted = false
      // unsubscribe if provided
      try {
        listener?.subscription?.unsubscribe?.()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error("Sign out error:", e)
    } finally {
      router.push("/")
    }
  }

  const getPageMeta = () => {
    if (pathname.startsWith("/dashboard")) {
      return { name: "Dashboard", icon: (
        <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM3 21h8v-6H3v6z" fill="currentColor"/></svg>
      ) }
    }
    if (pathname.startsWith("/tasks")) {
      return { name: "Tasks", icon: (
        <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 6h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) }
    }

    if (pathname.startsWith("/login") || pathname.startsWith("/signin")) {
      return { name: "Sign In", icon: (
        <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) }
    }

    if (pathname.startsWith("/signup") || pathname.startsWith("/register")) {
      return { name: "Sign Up", icon: (
        <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) }
    }

    return { name: "Home", icon: (
      <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) }
  }

  const meta = getPageMeta()
  const isActive = (p: string) => pathname.startsWith(p)

  return (
    <header className="w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              {/* logo - user will add logo.png to public */}
              <Image src="/Logo.png" alt="logo" width={40} height={40} className="rounded-md object-contain" />
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Task Management System</span>
            </Link>
            <div className="hidden sm:flex items-center ml-4 text-sm text-gray-600 dark:text-gray-300 absolute left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
              <span className="inline-flex items-center text-gray-700 dark:text-gray-200 pointer-events-auto">{meta.icon}<span className="align-middle">{meta.name}</span></span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {/* Primary links */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard") ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                Dashboard
              </Link>
              <Link href="/tasks" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/tasks") ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                Tasks
              </Link>
            </div>
            {!session ? (
              // logged out: on home show sign in/up, else show sign in
              pathname === "/" ? (
                <>
                  <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">Sign In</Link>
                  <Link href="/signup" className="px-3 py-2 rounded-md text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600">Sign Up</Link>
                </>
              ) : (
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">Sign In</Link>
              )
            ) : (
              <>
                <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600">Logout</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
