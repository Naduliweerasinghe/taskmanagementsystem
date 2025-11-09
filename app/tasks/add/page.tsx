"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import Toast from "../../../components/toast"

type ToastType = {
  message: string
  type: "success" | "error" | "info" | "warning"
}

export default function AddTaskPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [priority, setPriority] = useState<string>("Medium")
  const [lists, setLists] = useState<Array<{ id: string; name: string }>>([])
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any | null>(null)
  const [toast, setToast] = useState<ToastType | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session)
    })()

    // fetch lists for the current user
    ;(async () => {
      try {
        const { data, error } = await supabase.from("lists").select("id,name").order("created_at", { ascending: false })
        if (!mounted) return
        if (error) {
          console.warn("Failed to load lists:", error)
        } else {
          setLists(data ?? [])
          // default to first list if available
          if ((data ?? []).length > 0) setSelectedList((data as any)[0].id)
        }
      } catch (e) {
        console.error("Error fetching lists:", e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userId = session?.user?.id ?? null
      const payload: any = {
        name,
        description,
        start_date: startDate || null,
        due_date: dueDate || null,
        priority,
        user_id: userId,
        list_id: selectedList || null
      }

      // Attempt to insert into 'tasks' table. If your DB requires server-side
      // insertion, this may need to be moved to a secure API route.
      const { data, error } = await supabase.from("tasks").insert([payload])
      if (error) {
        throw error
      }

      // Show success notification
      setToast({ message: "Task added successfully!", type: "success" })
      
      // Navigate back to tasks list after a brief delay
      setTimeout(() => {
        router.push("/tasks")
      }, 1500)
    } catch (err: any) {
      console.error("Add task failed:", err)
      setToast({ message: err?.message ?? "Failed to add task", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onCloseAction={() => setToast(null)}
        />
      )}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Add Task</h1>

        <form className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Task Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="form-input mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-input mt-1">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">List</label>
              <select value={selectedList ?? ""} onChange={(e) => setSelectedList(e.target.value || null)} className="form-input mt-1">
                <option value="">-- No list --</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? "Adding..." : "Add Task"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
