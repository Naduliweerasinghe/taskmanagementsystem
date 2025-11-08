"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { supabase } from "../../../lib/supabase"
import { cn } from "@/styles/lib/utils"
import { useRouter } from "next/navigation"

type FormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = async (values: FormData) => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

  // Successful login: redirect to home page
  router.push("/")
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
          <h2 className="signup-title">Sign in to your account</h2>
          <p className="signup-sub">Enter your email and password to access TaskMaster.</p>
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
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          </div>

          {errorMsg && <div className="form-error">{errorMsg}</div>}

          <div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            Don't have an account? <a href="/signup" className="font-medium text-blue-600 hover:underline">Sign up</a>
          </div>
          <div className="text-sm text-center mt-2">
            <Link href="/forgot-password" className="font-medium text-blue-600 hover:underline">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
