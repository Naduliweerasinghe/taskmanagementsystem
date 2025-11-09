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

  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById("how-to")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

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
          // Keep logged-in users on the home page (do not auto-redirect)
          // The login page already redirects to `/` after sign-in, so we
          // should not send users away from the home page here.
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
  <header className="pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="w-full text-center mx-auto px-3 sm:px-4">
          <div className="w-full p-4 sm:p-8 md:p-12 lg:p-16 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-slate-900/80 shadow-xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 w-full">
              <div className="flex-1 text-left w-full">
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-orange-600 leading-tight">Welcome to TaskMaster!</h1>

                  <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">Welcome to TaskMaster, your personal productivity companion!</p>

                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 sm:mb-6">TaskMaster helps you stay organized by providing an intuitive platform to manage all your tasks. Whether for work, study, or personal projects, you can easily add, track, and prioritize your tasks in one place.</p>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Key Features</h3>
                    <ul className="space-y-2 sm:space-y-3 text-gray-700">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Create Tasks</div>
                          <div className="text-xs sm:text-sm">Quickly add new tasks and keep track of what needs to be done.</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Mark as Completed</div>
                          <div className="text-xs sm:text-sm">Check off completed tasks to stay on top of your progress.</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Delete Tasks</div>
                          <div className="text-xs sm:text-sm">Remove tasks that are no longer needed.</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Stay Organized</div>
                          <div className="text-xs sm:text-sm">Use simple filters to view all tasks, completed tasks, or pending ones.</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Sync Across Devices</div>
                          <div className="text-xs sm:text-sm">With secure authentication via Supabase, your tasks are available across all your devices.</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {!userEmail && (
                      <Link href="/login" className="text-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-md bg-orange-600 text-white text-base sm:text-lg font-medium hover:bg-orange-700 transition">Get Started</Link>
                    )}
                    <button onClick={handleLearnMore} className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-md border border-orange-600 text-orange-600 text-base sm:text-lg font-medium hover:bg-orange-50 transition">Learn More</button>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full lg:flex justify-center hidden lg:block">
                {/* Decorative image for large screens. You can add Image04.jpg to /public to show a picture here. */}
                <div className="w-full h-48 sm:h-64 rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
                  <Image src="/Image04.jpg" alt="Task screenshots" width={680} height={420} className="object-cover w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content sections */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-8">
        <section className="py-6 sm:py-8 md:py-12 relative overflow-hidden">
          {/* decorative orange blob */}
          <div className="absolute -top-8 -right-16 w-56 h-56 bg-orange-200/40 dark:bg-orange-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent mb-3 sm:mb-4">Why Task Management is Important</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">Improve your productivity and reduce stress by organizing work and personal tasks.</p>
              <ul className="grid gap-3 sm:gap-4">
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Improves Productivity</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Keeps you organized and focused on your most important tasks.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Reduces Stress</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Helps you prioritize tasks and prevents overwhelm by managing deadlines.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Ensures Accountability</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Makes you more accountable to yourself or your team by tracking progress.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Prevents Procrastination</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Knowing what needs to be done motivates action and helps you avoid distractions.</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center mt-6 lg:mt-0">
              <div className="rounded-lg overflow-hidden shadow-lg transform transition hover:scale-105 w-full max-w-md lg:max-w-none">
                <Image src="/Image01.jpg" alt="Why task management" width={600} height={400} className="rounded-lg object-cover w-full" />
              </div>
            </div>
          </div>
        </section>

  <section id="how-to" className="py-8 sm:py-12 md:py-20 relative rounded-lg p-3 sm:p-6 overflow-hidden">
          <div className="absolute -left-10 -bottom-8 w-48 h-48 bg-orange-100/60 dark:bg-orange-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center bg-gradient-to-r from-white/60 to-orange-50/40 dark:from-slate-800/60 dark:to-orange-900/10 p-3 sm:p-6 rounded-xl shadow-inner">
            <div className="order-2 lg:order-1 mt-6 lg:mt-0">
              <div className="rounded-lg overflow-hidden shadow-md transform transition hover:scale-102 w-full max-w-md lg:max-w-none mx-auto">
                <Image src="/Image02.jpg" alt="Manage tasks effectively" width={600} height={400} className="rounded-lg object-cover w-full" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent mb-3 sm:mb-4">How to Effectively Manage Your Tasks</h2>
              <ul className="grid gap-3 sm:gap-4">
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">1</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Break Down Large Tasks</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Divide bigger projects into smaller, actionable steps.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">2</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Set Deadlines</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Set realistic deadlines for each task to create a sense of urgency.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">3</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Prioritize</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Focus on high-priority tasks first using lists like To-Do, In Progress, and Completed.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">4</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Review Regularly</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Regularly assess your tasks and adjust as needed—stay flexible.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">5</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Use Reminders</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Set reminders for important deadlines or recurring tasks.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-20 relative">
          <div className="absolute -top-6 -left-10 w-44 h-44 bg-orange-100/50 dark:bg-orange-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent mb-3 sm:mb-4">What You Can Do with TaskMaster</h2>
              <ul className="grid gap-3 sm:gap-4">
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Create and Organize Tasks</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Add new tasks with descriptions, deadlines, and priority levels.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Track Progress</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Mark tasks as completed to track your progress.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Set Task Deadlines</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Never miss a due date by adding deadlines to tasks.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Prioritize Tasks</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Decide which tasks need your attention first.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 bg-white/70 dark:bg-slate-900/60 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs sm:text-base">✓</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">Stay On Top of Your Tasks</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Easily delete or update tasks that are no longer relevant.</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center mt-6 lg:mt-0">
              <div className="rounded-lg overflow-hidden shadow-lg transform transition hover:scale-105 w-full max-w-md lg:max-w-none">
                <Image src="/Image03.jpg" alt="TaskMaster features" width={600} height={400} className="rounded-lg object-cover w-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-white/50 dark:bg-slate-800/60 rounded-lg p-6 mb-16 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-36 h-36 bg-orange-200/40 dark:bg-orange-700/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="max-w-2xl mx-auto text-left">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent mb-4">Consequences of Not Managing Tasks</h2>
            <ul className="grid gap-4 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3 bg-white/70 dark:bg-slate-900/60 p-4 rounded-lg shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white">!</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Missed Deadlines</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Without task management, it’s easy to forget or overlook deadlines.</div>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/70 dark:bg-slate-900/60 p-4 rounded-lg shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white">!</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Increased Stress</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Unorganized tasks pile up, creating confusion and overwhelm.</div>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/70 dark:bg-slate-900/60 p-4 rounded-lg shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white">!</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Procrastination</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Without structure, tasks can be ignored or delayed, causing last-minute rushes.</div>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/70 dark:bg-slate-900/60 p-4 rounded-lg shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white">!</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Lower Productivity</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Juggling tasks without a plan reduces efficiency and timely completion.</div>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/70 dark:bg-slate-900/60 p-4 rounded-lg shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white">!</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Reduced Quality of Work</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Rushing through tasks can lead to mistakes.</div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer - Home page only (black & white theme) */}
      <footer className="bg-black text-white mt-8 sm:mt-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">TaskMaster</h3>
              <p className="text-xs sm:text-sm text-gray-200/90">Your personal productivity companion. Organize tasks, track progress, and stay focused—now in a clean, minimal black & white layout.</p>
              <p className="mt-3 sm:mt-4 text-xs text-gray-300">Made with ❤️ — built to help you ship more.</p>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-2">Quick Links</h4>
              <ul className="text-xs sm:text-sm text-gray-200/90 space-y-2">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/tasks" className="hover:underline">All Tasks</a></li>
                <li><a href="/tasks/completed" className="hover:underline">Completed</a></li>
                <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-2">Contact</h4>
              <p className="text-xs sm:text-sm text-gray-200/90">Have questions or feedback?</p>
              <p className="mt-2 text-xs sm:text-sm">Email: <a href="mailto:hello@taskmaster.app" className="underline">hello@taskmaster.app</a></p>
              <p className="mt-1 text-xs sm:text-sm">Support: <a href="/auth/login" className="underline">Sign in</a></p>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-2">Newsletter</h4>
              <p className="text-xs sm:text-sm text-gray-200/90 mb-3">Get short tips and product updates. No spam—unsubscribe anytime.</p>
              <form className="flex flex-col gap-2 sm:gap-3" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input id="footer-email" type="email" placeholder="you@domain.com" className="w-full px-3 py-2 text-sm rounded-md bg-white/5 placeholder:text-gray-300 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" />
                <button className="px-4 py-2 text-sm rounded-md bg-white text-black font-medium hover:opacity-95" aria-label="Subscribe">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 border-t border-white/10 pt-4 sm:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-300 text-center md:text-left">© {new Date().getFullYear()} TaskMaster. All rights reserved.</div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Social icons (monochrome) */}
              <a href="#" aria-label="Twitter" className="text-gray-200 hover:text-white">
                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.15 9.15 0 0 1-2.9 1.1A4.52 4.52 0 0 0 11.07 5.03 12.83 12.83 0 0 1 1.64 2.15a4.5 4.5 0 0 0 1.4 6 4.43 4.43 0 0 1-2-.55v.06a4.51 4.51 0 0 0 3.63 4.42 4.52 4.52 0 0 1-2 .08 4.51 4.51 0 0 0 4.22 3.14A9.05 9.05 0 0 1 1 19.54 12.8 12.8 0 0 0 6.92 21c8.28 0 12.81-6.86 12.81-12.81 0-.2 0-.39-.02-.58A9.2 9.2 0 0 0 23 3z" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub" className="text-gray-200 hover:text-white">
                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.64.24 2.86.12 3.16.77.84 1.24 1.9 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.82.58A12 12 0 0 0 12 .5z" fill="currentColor" />
                </svg>
              </a>

              {/* Back to top */}
              <button onClick={handleScrollTop} className="ml-1 sm:ml-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs sm:text-sm text-gray-200" aria-label="Back to top">Back to top</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
