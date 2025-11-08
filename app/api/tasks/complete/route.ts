import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing task ids" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server misconfigured: missing Supabase service role key" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .in("id", ids)
      .select("id")

    if (error) {
      return NextResponse.json({ error: error.message, details: error.details ?? null }, { status: 500 })
    }

    return NextResponse.json({ updated: (data ?? []).map((r: any) => r.id) }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
