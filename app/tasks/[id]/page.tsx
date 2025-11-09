"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../../lib/supabase"
import Toast from "../../../components/toast"

type Task = {
  id: string
  name: string
  description?: string | null
  completed?: boolean
  created_at?: string
  due_date?: string | null
}

type ToastType = {
  message: string
  type: "success" | "error" | "info" | "warning"
}

export default function TaskDetailsPage() {
  const router = useRouter()
  // useParams from next/navigation isn't currently stable in all next versions; fallback to parsing path if unavailable
  // However in this environment useParams works in client components.
  const params: any = (typeof useParams === "function" ? useParams() : {})
  const id = params?.id ?? null

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase.from("tasks").select("id,name,description,completed,created_at,due_date").eq("id", id).maybeSingle()
        if (error) throw error
        if (mounted) setTask(data ?? null)
      } catch (e) {
        console.error("Failed to fetch task details:", e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  const markCompleted = async () => {
    if (!task) return
    try {
      const { error } = await supabase.from("tasks").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", task.id)
      if (error) throw error
      
      // Show success notification
      setToast({ message: "Task marked as completed!", type: "success" })
      
      // Navigate back after a brief delay
      setTimeout(() => {
        router.push("/tasks")
      }, 1500)
    } catch (e) {
      console.error("Failed to mark task completed:", e)
      setToast({ message: "Failed to mark task as completed", type: "error" })
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!task) return <div className="p-6">Task not found. <Link href="/tasks">Back to tasks</Link></div>

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
        <div className="mb-4 flex items-center gap-3">
          <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">← Back to tasks</Link>
          
        </div>

        <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Task Details</div>
          <h1 className="text-2xl font-bold mb-2">{task.name}</h1>
          {task.description ? <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{task.description}</p> : null}
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Created: {task.created_at ? new Date(task.created_at).toLocaleString() : "—"}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Due: {task.due_date ? new Date(task.due_date).toLocaleString() : "—"}</div>
          <div className="flex gap-3">
            {!task.completed ? (
              <>
                <button onClick={markCompleted} className="px-4 py-2 bg-emerald-500 text-white rounded-md">Mark completed</button>
                <button
                  onClick={() => router.push(`/tasks/${task.id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
                
              </>
            ) : (
              <>
                <div className="text-sm text-green-600">This task is completed.</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/tasks/${task.id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
