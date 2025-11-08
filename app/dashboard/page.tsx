"use client"

import React from "react"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Welcome to your dashboard — overview and quick actions.</p>
          </div>

          <div>
            <Link href="/tasks" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tasks</Link>
          </div>
        </div>

        <section className="bg-white/80 dark:bg-slate-800/60 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Quick Actions</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p>- Go to your <Link href="/tasks" className="text-indigo-600 hover:underline">Tasks</Link>.</p>
            <p>- Add a new task quickly by clicking Add Task on the tasks page.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
