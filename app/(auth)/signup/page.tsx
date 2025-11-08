"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "../../../lib/supabase"
import { cn } from "@/styles/lib/utils"
import { useRouter } from "next/navigation"

type FormData = {
  email: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = async (values: FormData) => {
    setErrorMsg(null)
    if (values.password !== values.confirmPassword) {
      setErrorMsg("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password
      })
      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      // If a user object is returned, create a profile record server-side
      if (data?.user) {
        // Call server-side API to create/upsert the profile using the
        // Supabase service role key. This avoids client-side RLS issues and
        // ensures profiles are stored persistently.
        try {
          await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: data.user.id, email: data.user.email })
          })
        } catch (e) {
          // Non-fatal: profile creation can be retried later
          console.warn("Profile creation (server) failed:", e)
        }
      }

      // If signUp did not create a session (common when email confirmation is required),
      // attempt to sign in immediately so the user can use the app without an extra step.
      // If sign-in fails because confirmation is required, surface a helpful message.
      let finalSession = data?.session ?? null
      if (!finalSession) {
        try {
          const signInRes = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
          })
          if (signInRes.error) {
            // If the provider requires email confirmation, tell the user.
            if (signInRes.error.message?.toLowerCase().includes("confirm") || signInRes.error.status === 400) {
              setErrorMsg("Please confirm your email address before signing in. Check your inbox for a confirmation link.")
              setLoading(false)
              return
            }
            setErrorMsg(signInRes.error.message)
            setLoading(false)
            return
          }
          finalSession = signInRes.data?.session ?? null
        } catch (e) {
          console.warn("Auto sign-in after signup failed:", e)
        }
      }

      // If we have a session now, navigate to dashboard. Otherwise route to login with a notice.
      if (finalSession) {
        router.push("/dashboard")
      } else {
        // No session: likely email confirmation required. Go to login and show notice.
        setErrorMsg("Account created. Please confirm your email or sign in to continue.")
        router.push("/login")
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 signup-bg")}>
      <div className="w-full max-w-md space-y-8 signup-card p-8">
        <div className="signup-hero">
          <h2 className="signup-title">Create a new account</h2>
          <p className="signup-sub">
            Register with your email and a password.
          </p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className={cn("form-input")}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className={cn("form-input")}
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                className={cn("form-input")}
                {...register("confirmPassword", { required: "Please confirm your password" })}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {errorMsg && <div className="form-error">{errorMsg}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Creating..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
