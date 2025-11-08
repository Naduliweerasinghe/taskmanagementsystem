"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../lib/supabase"

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!mounted) return
        if (session?.user) {
          setUserEmail(session.user.email ?? null)
          // Redirect logged-in users to /tasks
          router.push("/tasks")
        }
      } catch (err) {
        console.error("Error checking auth session:", err)
      } finally {
        if (mounted) setChecking(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <header className="min-h-screen flex items-center">
        <div className="w-full text-center mx-auto px-4">
          <div className="w-full p-8 md:p-12 lg:p-16 rounded-2xl bg-white/95 dark:bg-slate-900/80 shadow-xl backdrop-blur-md flex items-center">
            <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
              <div className="flex-1 text-left">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-600">Welcome to TaskMaster!</h1>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 mb-6">Manage your tasks, stay productive, and get things done.</p>

                <p className="text-gray-700 dark:text-gray-200 mb-6">
                  <strong className="font-semibold">Welcome to TaskMaster, your personal productivity companion!</strong>
                  TaskMaster helps you stay organized by providing an intuitive platform to manage all your tasks. Whether for work, study, or personal projects, you can easily add, track, and prioritize your tasks in one place.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">✓</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Create Tasks</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Quickly add new tasks and keep track of what needs to be done.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">✓</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Mark as Completed</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Check off completed tasks to track your progress.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">✓</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Delete Tasks</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Remove tasks that are no longer needed.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">✓</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Sync Across Devices</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Secure authentication via Supabase keeps your tasks in sync.</div>
                    </div>
                  </li>
                </ul>

                {checking ? (
                  <p className="text-sm text-gray-500">Checking authentication…</p>
                ) : userEmail ? (
                  <div className="space-y-4">
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-100">Welcome back{userEmail ? `, ${userEmail}` : ""}!</p>
                    <p className="text-sm text-gray-600">Redirecting you to your tasks…</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mt-4">
                    <Link href="/login" className="inline-block px-6 py-3 rounded-md bg-blue-500 text-white text-lg font-medium hover:bg-blue-600 transition">Log In</Link>
                    <Link href="/login" className="inline-block px-6 py-3 rounded-md bg-yellow-500 text-white text-lg font-medium hover:bg-yellow-600 transition">Sign Up</Link>
                  </div>
                )}
              </div>

              <div className="flex-1 hidden lg:flex justify-center">
                <div className="w-full h-64 bg-gradient-to-br from-orange-50 to-orange-200 rounded-xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4">
                      <rect x="3" y="4" width="18" height="4" rx="1" fill="#FB923C" />
                      <rect x="3" y="10" width="18" height="4" rx="1" fill="#FDBA74" />
                      <rect x="3" y="16" width="12" height="4" rx="1" fill="#FB923C" />
                    </svg>
                    <div className="font-semibold text-orange-700">Organize. Prioritize. Complete.</div>
                    <div className="text-sm text-orange-600">Your tasks, made simple and beautiful.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content sections */}
      <main className="max-w-6xl mx-auto px-4 md:px-8">
        <section className="py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Why Task Management is Important</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Improve your productivity and reduce stress by organizing work and personal tasks.</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li><strong>Improves Productivity:</strong> Keeps you organized and focused on your most important tasks.</li>
                <li><strong>Reduces Stress:</strong> Helps you prioritize tasks and prevents overwhelm by managing deadlines.</li>
                <li><strong>Ensures Accountability:</strong> Makes you more accountable to yourself or your team by tracking progress.</li>
                <li><strong>Prevents Procrastination:</strong> Knowing what needs to be done motivates action and helps you avoid distractions.</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <Image src="/Image01.jpg" alt="Why task management" width={600} height={400} className="rounded-lg shadow-md object-cover" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-white/50 dark:bg-slate-800/60 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <Image src="/Image02.jpg" alt="Manage tasks effectively" width={600} height={400} className="rounded-lg shadow-md object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">How to Effectively Manage Your Tasks</h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li><strong>Break Down Large Tasks:</strong> Divide bigger projects into smaller, actionable steps.</li>
                <li><strong>Set Deadlines:</strong> Set realistic deadlines for each task to create a sense of urgency.</li>
                <li><strong>Prioritize:</strong> Focus on high-priority tasks first using lists like To-Do, In Progress, and Completed.</li>
                <li><strong>Review Regularly:</strong> Regularly assess your tasks and adjust as needed—stay flexible.</li>
                <li><strong>Use Reminders:</strong> Set reminders for important deadlines or recurring tasks.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">What You Can Do with TaskMaster</h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li><strong>Create and Organize Tasks:</strong> Add new tasks with descriptions, deadlines, and priority levels.</li>
                <li><strong>Track Progress:</strong> Mark tasks as completed to track your progress.</li>
                <li><strong>Set Task Deadlines:</strong> Never miss a due date by adding deadlines to tasks.</li>
                <li><strong>Prioritize Tasks:</strong> Decide which tasks need your attention first.</li>
                <li><strong>Stay On Top of Your Tasks:</strong> Easily delete or update tasks that are no longer relevant.</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <Image src="/Image03.jpg" alt="TaskMaster features" width={600} height={400} className="rounded-lg shadow-md object-cover" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-white/50 dark:bg-slate-800/60 rounded-lg p-6 mb-16">
          <div className="max-w-2xl mx-auto text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Consequences of Not Managing Tasks</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li><strong>Missed Deadlines:</strong> Without task management, it’s easy to forget or overlook deadlines.</li>
              <li><strong>Increased Stress:</strong> Unorganized tasks pile up, creating confusion and overwhelm.</li>
              <li><strong>Procrastination:</strong> Without structure, tasks can be ignored or delayed, causing last-minute rushes.</li>
              <li><strong>Lower Productivity:</strong> Juggling tasks without a plan reduces efficiency and timely completion.</li>
              <li><strong>Reduced Quality of Work:</strong> Rushing through tasks can lead to mistakes.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
