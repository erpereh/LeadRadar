export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// DELETE /api/notes/[noteId] — delete a note
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  let error: { message: string } | null = null
  try {
    const res = await getSupabase()
      .from('notes')
      .delete()
      .eq('id', params.noteId)
    error = res.error
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
