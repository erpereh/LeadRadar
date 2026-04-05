export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const client = getSupabase()

    const [leadStatusRes, notesRes, promptsRes] = await Promise.all([
      client.from('lead_status').select('id', { count: 'exact', head: true }),
      client.from('notes').select('id', { count: 'exact', head: true }),
      client.from('generated_prompts').select('id', { count: 'exact', head: true }),
    ])

    return NextResponse.json({
      leadStatus: leadStatusRes.count ?? 0,
      notes: notesRes.count ?? 0,
      prompts: promptsRes.count ?? 0,
    })
  } catch {
    return NextResponse.json({ leadStatus: 0, notes: 0, prompts: 0 }, { status: 503 })
  }
}
