"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [needsAccept, setNeedsAccept] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    let mounted = true

    // Try to prefill email from query params first
    const qEmail = searchParams?.get("email")
    if (qEmail && mounted) setEmail(qEmail)

    // If the reset link redirected here, Supabase may include tokens in the URL hash.
    // Parse the hash and set the session so updateUser() works reliably.
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash && hash.includes("access_token=")) {
        try {
          const params = new URLSearchParams(hash.replace("#", "?"))
          const access_token = params.get("access_token")
          const refresh_token = params.get("refresh_token")
          if (access_token) {
            ;(async () => {
              // Set the session in the client so supabase.auth.getSession() returns the user
              await supabase.auth.setSession({ access_token: access_token, refresh_token: refresh_token ?? "" })
              // clear the hash to avoid re-processing on reload
              try {
                window.location.hash = ""
              } catch (e) {
                // ignore
              }
            })()
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    ;(async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user?.email) {
          setEmail(session.user.email)
          // If the user landed here via the reset link, require them to "Accept" the reset
          // before allowing an in-place password update. This lets us show an explicit
          // "Accept Reset Password (email)" button that contains the email address.
          setNeedsAccept(true)
        }
      } catch (err) {
        // ignore
      }
    })()

    return () => {
      mounted = false
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email) {
      setError("Please provide your email.")
      return
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }

      if (password.length < 6) {
        setError("Password should be at least 6 characters.")
        return
      }
    }

    setLoading(true)
    try {
      // Check for active session - if the user reached this page via a password recovery
      // flow they might have an access token allowing direct password update.
      const {
        data: { session }
      } = await supabase.auth.getSession()

  if (session?.user) {
        // Authenticated user - update password directly
        if (!password) {
          setError("Enter a new password to update.")
          setLoading(false)
          return
        }

        const { error: updError } = await supabase.auth.updateUser({ password })
        if (updError) {
          setError(updError.message)
        } else {
          // After updating the password on a recovery session, sign out the temporary session
          // and prompt the user to sign in with their new password.
          try {
            await supabase.auth.signOut()
          } catch (e) {
            // ignore
          }
          setMessage("Password updated successfully. Please sign in with your new password.")
          setTimeout(() => router.push("/login"), 1200)
        }
      } else {
        // Not authenticated - start reset email flow
        if (!email) {
          setError("Please provide your email to receive a reset link.")
          setLoading(false)
          return
        }

        // Include a redirectTo so the user comes back to this page after clicking the email
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/forgot-password` : undefined
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)
        if (resetError) {
          setError(resetError.message)
        } else {
          // Include the requested email in the confirmation message so the user
          // knows which address we attempted to send the reset link to.
          setMessage(`If an account exists for ${email}, a password reset link has been sent. Check your inbox.`)
        }
      }
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-8 rounded-lg shadow signup-card bg-white/90 dark:bg-slate-900/80">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Reset your password</h2>
          <p className="text-sm text-gray-600 mt-2">Enter your email to receive a reset link, or update your password directly if you're already signed in.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="form-input w-full"
              autoComplete="email"
            />
          </div>

          {/* If the user arrived with a recovery session, show an explicit
              Accept button containing the email address. Only after the user
              clicks Accept will we reveal the password update inputs. */}
          {needsAccept && !accepted ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setAccepted(true)}
                className="btn-primary w-full"
              >
                {`Accept Reset Password (${email || 'your email'})`}
              </button>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="password" className="sr-only">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (leave blank to receive reset email)"
                  className="form-input w-full"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="form-input w-full"
                  autoComplete="new-password"
                />
              </div>
            </>
          )}

          {error && <div className="form-error">{error}</div>}
          {message && <div className="text-sm text-green-600">{message}</div>}

          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Processing..." : "Update / Send Reset"}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
