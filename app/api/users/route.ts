import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This route performs a server-side upsert of the user's profile using the
// Supabase service role key. Using the service role key allows us to bypass
// RLS for trusted server operations and ensures profile records are created
// persistently when users sign up.

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email } = body
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server misconfigured: missing Supabase service role key" }, { status: 500 })
    }

    // Create an admin client using the service role key (never expose this key to clients)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Use upsert so repeated calls (e.g. retries) won't create duplicates
    const { data, error } = await supabaseAdmin.from("profiles").upsert(
      [{ id, email }],
      { onConflict: "id" }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
