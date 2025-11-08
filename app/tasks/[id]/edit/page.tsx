"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../../../lib/supabase"

type Task = {
  id: string
  name: string
  description?: string | null
  completed?: boolean
  created_at?: string
  due_date?: string | null
}

export default function EditTaskPage() {
  const router = useRouter()
  const params: any = (typeof useParams === "function" ? useParams() : {})
  const id = params?.id ?? null

  const [task, setTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  // react-hook-form manages form state
  type FormValues = {
    name: string
    description?: string
    dueDate?: string
  }
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { name: "", description: "", dueDate: "" }
  })
  const { errors } = formState
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("id,name,description,completed,created_at,due_date")
          .eq("id", id)
          .maybeSingle()
        if (error) throw error
        if (!mounted) return
        setTask(data ?? null)
        if (data) {
          // prepare a datetime-local friendly value or empty string
          const dueLocal = data.due_date ? new Date(data.due_date).toISOString().slice(0, 16) : ""
          // populate react-hook-form values
          reset({ name: data.name ?? "", description: data.description ?? "", dueDate: dueLocal })
        }
      } catch (e) {
        console.error("Failed to load task for editing:", e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  const onSubmit = async (values: FormValues) => {
    if (!id) return
    if (!values.name || !values.name.trim()) {
      alert("Please provide a task name")
      return
    }
    setSaving(true)
    try {
      const updates: any = { name: values.name.trim(), description: values.description || null }
      // convert dueDate (datetime-local) back to ISO or null
      updates.due_date = values.dueDate ? new Date(values.dueDate).toISOString() : null

      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id)
      if (error) {
        console.error("Supabase update error:", error)
      }
      if (error) throw error
      router.push(`/tasks/${id}`)
    } catch (e) {
      console.error("Failed to update task:", e)
      alert("Failed to update task. See console for details.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!task) return <div className="p-6">Task not found. <Link href="/tasks">Back to tasks</Link></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href={`/tasks/${id}`} className="text-sm text-indigo-600 hover:underline">← Back to details</Link>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Update Task</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
              <input
                {...register("name", { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
              {errors?.name && <div className="text-sm text-red-600 mt-1">Name is required</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
              <textarea
                {...register("description")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Due date</label>
              <input
                type="datetime-local"
                {...register("dueDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Updating…" : "Update"}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/tasks/${id}`)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
