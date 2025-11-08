"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

export default function CreateListPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert("Please enter a list name")
    setLoading(true)
    try {
      // get current user session to attach user_id (important when RLS is enabled)
      const {
        data: { session }
      } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null

      // If there's no authenticated session, stop early to avoid RLS failures.
      // This commonly happens if the client's auth state is lost or the user switched accounts.
      if (!userId) {
        // Give actionable feedback and send user to the login page
        alert("You must be signed in to create a list. Please sign in and try again.")
        router.push("/login")
        return
      }

      const payload: any = { name, user_id: userId }

      const { data, error } = await supabase.from("lists").insert([payload])
      if (error) throw error

      // Navigate back to tasks so the new list is visible
      router.push("/tasks")
    } catch (err: any) {
      console.error("Create list failed:", err)
      alert(err?.message ?? "Failed to create list")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Create List</h1>

        <form className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm" onSubmit={onCreate}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">List Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input mt-1" />
            </div>

            <div>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create List"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
