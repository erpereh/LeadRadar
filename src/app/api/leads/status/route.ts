export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// GET /api/leads/status — returns all lead statuses as a map { [lead_id]: status }
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('lead_status')
      .select('lead_id, status')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const map: Record<number, string> = {}
    for (const row of data ?? []) {
      map[row.lead_id] = row.status
    }

    return NextResponse.json(map)
  } catch {
    return NextResponse.json({}, { status: 503 })
  }
}
