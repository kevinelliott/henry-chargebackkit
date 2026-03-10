import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data: dispute, error: disputeError } = await supabase
    .from('disputes')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (disputeError) return NextResponse.json({ error: disputeError.message }, { status: 500 })

  // Create evidence items if provided
  if (body.evidence_items?.length) {
    await supabase.from('evidence_items').insert(
      body.evidence_items.map((item: { type: string; description?: string; content_text?: string; is_provided?: boolean }) => ({
        dispute_id: dispute.id,
        evidence_type: item.type,
        description: item.description,
        content_text: item.content_text,
        is_provided: item.is_provided || false,
      }))
    )
  }

  return NextResponse.json(dispute, { status: 201 })
}
