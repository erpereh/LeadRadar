export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// GET /api/leads/[id]/prompts — fetch saved prompts for a lead
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  let data: unknown[] | null = null
  let error: { message: string } | null = null

  try {
    const res = await getSupabase()
      .from('generated_prompts')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(10)
    data = res.data
    error = res.error
  } catch {
    return NextResponse.json([])
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
