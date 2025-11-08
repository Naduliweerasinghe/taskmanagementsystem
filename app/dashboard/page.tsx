"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

type Task = {
  id: string
  name: string
  description?: string | null
  completed?: boolean
  created_at?: string
  due_date?: string | null
  completed_at?: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const {
          data: { session }
        } = await supabase.auth.getSession()
        const userId = session?.user?.id ?? null
        if (!userId) {
          setTasks([])
          return
        }

        const { data, error } = await supabase
          .from("tasks")
          .select("id,name,completed,created_at,due_date,completed_at,user_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error
        if (!mounted) return
        setTasks((data ?? []) as Task[])
      } catch (e: any) {
        console.error("Failed to load tasks for dashboard:", e)
        setError(String(e?.message ?? e))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // Basic analytics
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = total - completed

    // due-date buckets
    const now = Date.now()
    let overdue = 0
    let dueWithin24 = 0
    let dueWithin7 = 0
    let dueLater = 0
    let noDue = 0

    tasks.forEach((t) => {
      if (!t.due_date) return (noDue += 1)
      const dueMs = new Date(t.due_date).getTime()
      if (dueMs < now && !t.completed) overdue += 1
      else if (dueMs - now <= 24 * 60 * 60 * 1000) dueWithin24 += 1
      else if (dueMs - now <= 7 * 24 * 60 * 60 * 1000) dueWithin7 += 1
      else dueLater += 1
    })

    // daily completion trend for last 14 days
    const days = 14
    const dayBuckets: { label: string; date: Date; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      dayBuckets.push({ label: d.toLocaleDateString(), date: d, count: 0 })
    }

    tasks.forEach((t) => {
      if (!t.completed || !t.completed_at) return
      const c = new Date(t.completed_at)
      // find matching bucket by date
      const bucket = dayBuckets.find((b) => {
        return (
          b.date.getFullYear() === c.getFullYear() &&
          b.date.getMonth() === c.getMonth() &&
          b.date.getDate() === c.getDate()
        )
      })
      if (bucket) bucket.count += 1
    })

    return {
      total,
      completed,
      pending,
      overdue,
      dueWithin24,
      dueWithin7,
      dueLater,
      noDue,
      dayBuckets
    }
  }, [tasks])

  // Simple SVG donut helpers
  const Donut = ({ value, total }: { value: number; total: number }) => {
    const size = 120
    const stroke = 14
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    const pct = total === 0 ? 0 : Math.round((value / Math.max(1, total)) * 100)
    const dash = (pct / 100) * c
    return (
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`translate(${size / 2},${size / 2})`}>
            <circle r={r} fill="transparent" stroke="var(--tw-bg-opacity,0.12)" strokeWidth={stroke} className="text-gray-200 dark:text-slate-700" strokeOpacity={1} />
            <circle
              r={r}
              fill="transparent"
              strokeWidth={stroke}
              strokeLinecap="round"
              stroke="url(#grad)"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={c * 0.25}
              transform={`rotate(-90)`}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <text x="0" y="0" textAnchor="middle" dy="6" className="text-sm font-semibold text-gray-800 dark:text-gray-100">{pct}%</text>
          </g>
        </svg>
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Completed</div>
          <div className="text-xs text-gray-500">{value} of {total} tasks</div>
        </div>
      </div>
    )
  }

  // Simple line chart for daily completions
  const LineChart = ({ buckets }: { buckets: { label: string; count: number }[] }) => {
    const width = 560
    const height = 160
    const padding = 24
    const max = Math.max(1, ...buckets.map((b) => b.count))
    const points = buckets.map((b, i) => {
      const x = padding + (i * (width - padding * 2)) / Math.max(1, buckets.length - 1)
      const y = padding + (1 - b.count / max) * (height - padding * 2)
      return [x, y]
    })
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* area fill */}
        <path d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#area)" stroke="none" />
        {/* line */}
        <path d={path} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {/* points */}
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#7c3aed" />
        ))}
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Overview of your tasks and completion trends.</p>
            {/* Back button aligned under the Dashboard heading on the left side */}
            <div className="mt-4">
              <button
                onClick={() => router.push('/')}
                aria-label="Go to home"
                title="Back to home"
                className="inline-flex items-center px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-600"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* top-right actions removed (Tasks button) */}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Trends (last 14 days)</h2>
            {loading ? (
              <div className="text-gray-600">Loading…</div>
            ) : error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-600">No tasks to analyze yet.</div>
            ) : (
              <div>
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">Daily completed tasks</div>
                <LineChart buckets={stats.dayBuckets.map((b) => ({ label: b.label, count: b.count }))} />
              </div>
            )}
          </div>

          <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Completion</h2>
            {loading ? (
              <div className="text-gray-600">Loading…</div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <Donut value={stats.completed} total={stats.total} />
                <div className="w-full text-sm text-gray-600 dark:text-gray-300">
                  <div>Pending: <span className="font-medium text-gray-800 dark:text-gray-100">{stats.pending}</span></div>
                  <div>Overdue: <span className="font-medium text-red-600 dark:text-red-300">{stats.overdue}</span></div>
                  <div>Due within 24h: <span className="font-medium text-yellow-600 dark:text-yellow-300">{stats.dueWithin24}</span></div>
                  <div>Due within 7d: <span className="font-medium text-indigo-600 dark:text-indigo-300">{stats.dueWithin7}</span></div>
                  <div>Later: <span className="font-medium text-gray-700 dark:text-gray-200">{stats.dueLater}</span></div>
                  <div>No due date: <span className="font-medium text-gray-700 dark:text-gray-200">{stats.noDue}</span></div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions section removed */}
      </div>
    </div>
  )
}
