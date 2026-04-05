export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// GET /api/leads/[id]/notes — fetch all notes for a lead
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
      .from('notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
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

// POST /api/leads/[id]/notes — create a note
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  let body: { content: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const content = body.content?.trim()
  if (!content) {
    return NextResponse.json({ error: 'El contenido es obligatorio' }, { status: 400 })
  }

  let data: unknown
  let error: { message: string } | null = null

  try {
    const res = await getSupabase()
      .from('notes')
      .insert({ lead_id: leadId, content })
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

  return NextResponse.json(data, { status: 201 })
}
