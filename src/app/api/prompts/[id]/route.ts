export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { deletePrompt } from '@/lib/supabase'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deletePrompt(params.id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
