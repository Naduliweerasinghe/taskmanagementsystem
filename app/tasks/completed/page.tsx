"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../../../lib/supabase"

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
}

export default function CompletedTasksPage() {
  const [lists, setLists] = useState<List[]>([])
  const [tasksByList, setTasksByList] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)

  const fetchLists = async (userId: string | null) => {
    try {
      setLoading(true)
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

  const fetchCompletedTasks = async (userId: string | null) => {
    try {
      if (!userId) {
        setTasksByList({})
        return
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("id,name,list_id,description,completed,created_at,user_id")
        .eq("user_id", userId)
        .eq("completed", true)
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
      console.error("Failed to fetch completed tasks:", e)
    }
  }

  useEffect(() => {
    ;(async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null
      setSessionUserId(userId ?? null)
      await fetchLists(userId)
      await fetchCompletedTasks(userId)
    })()

    // Subscribe to INSERT and UPDATE events on tasks so completed tasks view
    // stays up-to-date in realtime. On any change, refresh completed tasks for
    // the current user.
    const taskChannel = supabase
      .channel("public:tasks:completed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload: any) => {
          const t: Task & { user_id?: string } = payload.new
          if (sessionUserId && t.user_id !== sessionUserId) return
          fetchCompletedTasks(sessionUserId)
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload: any) => {
          const t: Task & { user_id?: string } = payload.new
          if (sessionUserId && t.user_id !== sessionUserId) return
          fetchCompletedTasks(sessionUserId)
        }
      )
      .subscribe()

    return () => {
      try {
        supabase.removeChannel(taskChannel)
      } catch (e) {
        // ignore
      }
    }
  }, [sessionUserId])

  // Ensure we show categories for completed tasks even if a list isn't present
  // in `lists` (for example: if lists are created/removed elsewhere). If
  // completed tasks reference a list id we don't have locally, fetch its
  // metadata so we can render the section with the proper name.
  useEffect(() => {
    const missingListIds = Object.keys(tasksByList).filter((lid) => lid !== "__nolst__" && !lists.find((l) => l.id === lid))
    if (missingListIds.length === 0) return

    ;(async () => {
      try {
        const { data, error } = await supabase.from("lists").select("id,name").in("id", missingListIds)
        if (error) throw error
        const fetched = data ?? []
        if (fetched.length > 0) {
          setLists((prev) => {
            // append fetched lists that aren't already present
            const existingIds = new Set(prev.map((p) => p.id))
            const merged = [...prev]
            for (const f of fetched) {
              if (!existingIds.has(f.id)) merged.push(f)
            }
            return merged
          })
        }
      } catch (e) {
        console.warn("Failed to fetch missing list names for completed tasks:", e)
      }
    })()
  }, [tasksByList])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Completed Tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tasks you've completed. Great job!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tasks" className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700">Back to Tasks</Link>
          </div>
        </div>

        <section className="space-y-6">
          {loading ? (
            <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">Loading completed tasks…</div>
          ) : (
            <>
              {lists.length === 0 ? (
                <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">No lists found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {lists.map((l) => (
                    <section key={l.id} className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{l.name}</h2>
                      {tasksByList[l.id] && tasksByList[l.id].length > 0 ? (
                        <ul className="space-y-2">
                          {tasksByList[l.id].map((t) => (
                            <li key={t.id} className="p-2 rounded-md border" style={{ backgroundColor: "#AFE1AF" }}>
                              <div className="font-medium text-gray-800 dark:text-gray-900">{t.name}</div>
                              {t.description ? <div className="text-sm text-gray-700 dark:text-gray-800">{t.description}</div> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-300">(No completed tasks in this list)</div>
                      )}
                    </section>
                  ))}
                </div>
              )}

              {tasksByList["__nolst__"] && tasksByList["__nolst__"].length > 0 ? (
                <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Unlisted Completed Tasks</h2>
                  <ul className="space-y-2">
                    {tasksByList["__nolst__"].map((t) => (
                      <li key={t.id} className="p-2 rounded-md border" style={{ backgroundColor: "#AFE1AF" }}>
                        <div className="font-medium text-gray-800 dark:text-gray-900">{t.name}</div>
                        {t.description ? <div className="text-sm text-gray-700 dark:text-gray-800">{t.description}</div> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
