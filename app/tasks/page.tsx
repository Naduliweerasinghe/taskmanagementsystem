"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Toast from "../../components/toast"
import ConfirmDialog from "../../components/confirm-dialog"

type List = {
  id: string
  name: string
  created_at?: string
}

type Task = {
  id: string
  name: string
  list_id?: string | null
  description?: string | null
  completed?: boolean
  created_at?: string
  due_date?: string | null
}

type ToastType = {
  message: string
  type: "success" | "error" | "info" | "warning"
}

export default function TasksPage() {
  const router = useRouter()
  const [lists, setLists] = useState<List[]>([])
  const [tasksByList, setTasksByList] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState<ToastType | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchLists = async (userId: string | null) => {
    setLoading(true)
    try {
      let query = supabase.from("lists").select("id,name,created_at").order("created_at", { ascending: false })
      if (userId) query = query.eq("user_id", userId)
      const { data, error } = await query
      if (error) throw error
      setLists(data ?? [])
    } catch (e) {
      console.error("Failed to fetch lists:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async (userId: string | null) => {
    try {
      if (!userId) {
        setTasksByList({})
        return
      }

      // only fetch tasks that are not completed for the main tasks view
      const { data, error } = await supabase
        .from("tasks")
        .select("id,name,list_id,description,completed,created_at,user_id,due_date")
        .eq("user_id", userId)
        .eq("completed", false)
        .order("created_at", { ascending: true })
      if (error) throw error
      const tasks: Task[] = data ?? []
      const grouped: Record<string, Task[]> = {}
      tasks.forEach((t) => {
        const lid = t.list_id ?? "__nolst__"
        if (!grouped[lid]) grouped[lid] = []
        grouped[lid].push(t)
      })
      setTasksByList(grouped)
    } catch (e) {
      console.error("Failed to fetch tasks:", e)
    }
  }

  // mark a single task completed (keeps compatibility) — still used by realtime
  // handlers but checkboxes now only select tasks for bulk completion.
  const markTaskCompleted = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", taskId)
      if (error) throw error

      setTasksByList((prev) => {
        const next: Record<string, Task[]> = {}
        for (const k of Object.keys(prev)) {
          next[k] = prev[k].filter((t) => t.id !== taskId)
        }
        return next
      })
    } catch (e) {
      console.error("Failed to mark task completed:", e)
    }
  }

  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(taskId)) return prev.filter((id) => id !== taskId)
      return [...prev, taskId]
    })
  }

  const completeSelectedTasks = async () => {
    if (selectedTaskIds.length === 0) return
    setBulkLoading(true)
    try {
      // Call server-side API which uses the SUPABASE_SERVICE_ROLE_KEY to
      // perform the bulk update. This avoids client-side RLS/PostgREST 400 errors.
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedTaskIds })
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        console.error("Server bulk complete failed:", res.status, errBody)
        throw new Error(errBody?.error ?? `Server returned ${res.status}`)
      }

      const json = await res.json()
      const updatedIds: string[] = json.updated ?? []

      // remove completed tasks from local state
      setTasksByList((prev) => {
        const next: Record<string, Task[]> = {}
        for (const k of Object.keys(prev)) {
          next[k] = prev[k].filter((t) => !updatedIds.includes(t.id))
        }
        return next
      })

      // clear selection
      setSelectedTaskIds([])
      
      // Show success notification
      setToast({ 
        message: `${updatedIds.length} task(s) marked as completed!`, 
        type: "success" 
      })
    } catch (e) {
      console.error("Failed to complete selected tasks:", e)
      setToast({ message: "Failed to complete tasks. Please try again.", type: "error" })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleDeleteClick = () => {
    if (selectedTaskIds.length === 0) return
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    setDeleteLoading(true)
    
    const taskCount = selectedTaskIds.length
    
    try {
      const { error } = await supabase.from('tasks').delete().in('id', selectedTaskIds)
      if (error) throw error

      // remove deleted tasks from local state
      setTasksByList((prev) => {
        const next: Record<string, Task[]> = {}
        for (const k of Object.keys(prev)) {
          next[k] = prev[k].filter((t) => !selectedTaskIds.includes(t.id))
        }
        return next
      })

      // clear selection
      setSelectedTaskIds([])
      
      // Show success notification
      setToast({ 
        message: `${taskCount} task${taskCount > 1 ? 's' : ''} deleted successfully!`, 
        type: "success" 
      })
    } catch (e) {
      console.error('Failed to delete selected tasks:', e)
      setToast({ message: 'Failed to delete tasks. Please try again.', type: "error" })
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  useEffect(() => {
    ;(async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null
      setSessionUserId(userId ?? null)
      await fetchLists(userId)
      await fetchTasks(userId)
    })()
    // fetch tasks and subscribe to realtime INSERTs on lists/tasks so UI updates immediately
    const listChannel = supabase
      .channel("public:lists")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lists" },
        (payload: any) => {
          // only act on lists for this user
          const newList = payload.new as List & { user_id?: string }
          if (sessionUserId && newList.user_id !== sessionUserId) return
          setLists((prev) => [newList, ...prev])
          setTasksByList((prev) => ({ ...(prev ?? {}), [newList.id]: [] }))
        }
      )
      .subscribe()

    const taskChannel = supabase
      .channel("public:tasks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload: any) => {
          const t: Task & { user_id?: string } = payload.new
          // only add tasks for the signed-in user
          if (sessionUserId && t.user_id !== sessionUserId) return
          const lid = t.list_id ?? "__nolst__"
          setTasksByList((prev) => {
            const next = { ...(prev ?? {}) }
            if (!next[lid]) next[lid] = []
            next[lid] = [...next[lid], t]
            return next
          })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload: any) => {
          const t: Task & { user_id?: string } = payload.new
          // if a task was marked completed, remove it from this view
          if (t.completed) {
            setTasksByList((prev) => {
              const next: Record<string, Task[]> = {}
              for (const k of Object.keys(prev)) {
                next[k] = prev[k].filter((x) => x.id !== t.id)
              }
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      try {
        supabase.removeChannel(listChannel)
        supabase.removeChannel(taskChannel)
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // helper: remaining tasks count
  const remainingCount = Object.values(tasksByList).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)

  const isDueSoon = (due?: string | null) => {
    if (!due) return false
    const dueMs = new Date(due).getTime()
    const now = Date.now()
    // within 24 hours (including overdue)
    return dueMs - now <= 24 * 60 * 60 * 1000
  }

  // (debug helper removed)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onCloseAction={() => setToast(null)}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Tasks"
          message={`Are you sure you want to delete ${selectedTaskIds.length} selected task${selectedTaskIds.length > 1 ? 's' : ''}? This action is permanent and cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirmAction={confirmDelete}
          onCancelAction={cancelDelete}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your tasks and lists.</p>
            {/* Remaining tasks count */}
            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{remainingCount} remaining</div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/tasks/add" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Task</Link>
            <Link href="/tasks/create-list" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create List</Link>
            <Link href="/tasks/completed" className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600">Completed Task</Link>
            {/* debug helper removed */}
          </div>
        </div>

        <section className="space-y-6">
          <div>
            {loading ? (
              <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Lists</h2>
                <div className="text-gray-600">Loading lists…</div>
              </div>
            ) : lists.length === 0 ? (
              <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Lists</h2>
                <div className="text-gray-600">No lists yet. Create one to organize tasks.</div>
              </div>
            ) : lists.length === 1 ? (
              <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{lists[0].name}</h2>
                {tasksByList[lists[0].id] && tasksByList[lists[0].id].length > 0 ? (
                  <ul className="space-y-2">
                    {tasksByList[lists[0].id].map((t) => {
                          const dueSoon = isDueSoon(t.due_date)
                          const liBg = dueSoon ? "bg-red-50 border-red-200 dark:bg-red-900/20" : "bg-gray-50 dark:bg-slate-900"
                          return (
                          <li
                            key={t.id}
                            className={`p-2 rounded-md ${liBg} border flex items-start gap-3 cursor-pointer`}
                            onClick={() => router.push(`/tasks/${t.id}`)}
                          >
                            <input
                              type="checkbox"
                              aria-label={`Select ${t.name}`}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSelectTask(t.id)}
                              checked={selectedTaskIds.includes(t.id)}
                              className="mt-1 h-4 w-4"
                            />
                            <div>
                              <div className="font-medium text-gray-800 dark:text-gray-100">{t.name}</div>
                              {t.description ? <div className="text-sm text-gray-600 dark:text-gray-300">{t.description}</div> : null}
                              {t.due_date ? (
                                <div className={`text-xs mt-1 ${dueSoon ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'}`}>
                                  Due: {new Date(t.due_date).toLocaleString()}
                                </div>
                              ) : null}
                            </div>
                          </li>
                        )
                        })}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-300">(No tasks in this list yet)</div>
                )}
                <div className="text-xs text-gray-500 mt-2">{lists[0].created_at ? new Date(lists[0].created_at).toLocaleString() : ""}</div>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {lists.map((l) => (
                  <section key={l.id} className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{l.name}</h2>
                    {tasksByList[l.id] && tasksByList[l.id].length > 0 ? (
                      <ul className="space-y-2">
                        {tasksByList[l.id].map((t) => {
                          const dueSoon = isDueSoon(t.due_date)
                          const liBg = dueSoon ? "bg-red-50 border-red-200 dark:bg-red-900/20" : "bg-gray-50 dark:bg-slate-900"
                          return (
                          <li
                            key={t.id}
                            className={`p-2 rounded-md ${liBg} border flex items-start gap-3 cursor-pointer`}
                            onClick={() => router.push(`/tasks/${t.id}`)}
                          >
                            <input
                              type="checkbox"
                              aria-label={`Select ${t.name}`}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSelectTask(t.id)}
                              checked={selectedTaskIds.includes(t.id)}
                              className="mt-1 h-4 w-4"
                            />
                            <div>
                              <div className="font-medium text-gray-800 dark:text-gray-100">{t.name}</div>
                              {t.description ? <div className="text-sm text-gray-600 dark:text-gray-300">{t.description}</div> : null}
                              {t.due_date ? (
                                <div className={`text-xs mt-1 ${dueSoon ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'}`}>
                                  Due: {new Date(t.due_date).toLocaleString()}
                                </div>
                              ) : null}
                            </div>
                          </li>
                        )
                        })}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-600 dark:text-gray-300">(No tasks in this list yet)</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">{l.created_at ? new Date(l.created_at).toLocaleString() : ""}</div>
                  </section>
                ))}
              </div>
              {/* debug output removed */}
              </>
            )}
          </div>
        </section>
        {/* Unlisted tasks (no list_id) */}
        {tasksByList["__nolst__"] && tasksByList["__nolst__"].length > 0 ? (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Unlisted Tasks</h2>
              <ul className="space-y-2">
                {tasksByList["__nolst__"].map((t) => {
                  const dueSoon = isDueSoon(t.due_date)
                  const liBg = dueSoon ? "bg-red-50 border-red-200 dark:bg-red-900/20" : "bg-gray-50 dark:bg-slate-900"
                  return (
                  <li
                    key={t.id}
                    className={`p-2 rounded-md ${liBg} border flex items-start gap-3 cursor-pointer`}
                    onClick={() => router.push(`/tasks/${t.id}`)}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${t.name}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelectTask(t.id)}
                      checked={selectedTaskIds.includes(t.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{t.name}</div>
                      {t.description ? <div className="text-sm text-gray-600 dark:text-gray-300">{t.description}</div> : null}
                      {t.due_date ? (
                        <div className={`text-xs mt-1 ${dueSoon ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'}`}>
                          Due: {new Date(t.due_date).toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
                })}
              </ul>
            </div>
          </div>
        ) : null}
        {/* Bulk complete action button - appears when tasks are selected */}
        {selectedTaskIds.length > 0 ? (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
            <div className="inline-flex items-center gap-3">
              <button
                onClick={completeSelectedTasks}
                disabled={bulkLoading}
                className="inline-flex items-center px-5 py-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 disabled:opacity-60"
              >
                {bulkLoading ? "Completing..." : `Complete (${selectedTaskIds.length})`}
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                className="inline-flex items-center px-5 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : `Delete (${selectedTaskIds.length})`}
              </button>
            </div>
          </div>
        ) : null}
        {/* Back button (fixed bottom-left) */}
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="fixed bottom-6 left-4 md:left-8 lg:left-[calc(50%-36rem+2rem)] z-50 inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  )
}
