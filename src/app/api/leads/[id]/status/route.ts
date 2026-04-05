export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import type { LeadStatus } from '@/lib/types'

const VALID_STATUSES: LeadStatus[] = [
  'pending',
  'contacted',
  'interested',
  'not_interested',
  'converted',
]

// PATCH /api/leads/[id]/status — upsert lead status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  let body: { status: LeadStatus }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  let data: unknown
  let error: { message: string } | null = null

  try {
    const res = await getSupabase()
      .from('lead_status')
      .upsert(
        { lead_id: leadId, status: body.status, updated_at: new Date().toISOString() },
        { onConflict: 'lead_id' }
      )
      .select()
      .single()
    data = res.data
    error = res.error
  } catch {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const { error } = await getSupabase().from('lead_status').delete().eq('lead_id', leadId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
