export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface VerifyBody {
  url?: string
  anonKey?: string
}

export async function POST(request: NextRequest) {
  let body: VerifyBody = {}

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const url = body.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = body.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.json({ connected: false, tables: [], configured: false })
  }

  try {
    const client = createClient(url, anonKey)

    const checks = await Promise.all([
      client.from('lead_status').select('id', { count: 'exact', head: true }),
      client.from('notes').select('id', { count: 'exact', head: true }),
      client.from('generated_prompts').select('id', { count: 'exact', head: true }),
      client.from('app_settings').select('id', { count: 'exact', head: true }),
    ])

    const tables = ['lead_status', 'notes', 'generated_prompts', 'app_settings'].filter((_, idx) => !checks[idx].error)
    const connected = tables.length > 0

    return NextResponse.json({ connected, tables, configured: true })
  } catch {
    return NextResponse.json({ connected: false, tables: [], configured: true })
  }
}
