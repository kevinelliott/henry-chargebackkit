import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { outcome, amount_recovered, processor_response } = body

  // Update dispute status
  await supabase
    .from('disputes')
    .update({ status: outcome, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  // Record outcome
  const { data, error } = await supabase
    .from('dispute_outcomes')
    .insert({
      dispute_id: id,
      outcome,
      amount_recovered,
      processor_response,
      resolved_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire webhook
  const { data: settings } = await supabase
    .from('user_settings')
    .select('webhook_url')
    .eq('user_id', user.id)
    .single()

  if (settings?.webhook_url) {
    const { data: dispute } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .single()

    try {
      await fetch(settings.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'dispute.resolved',
          dispute_id: id,
          order_id: dispute?.order_id,
          amount: dispute?.transaction_amount,
          reason_code: dispute?.reason_code,
          outcome,
          amount_recovered,
          evidence_score: dispute?.evidence_score,
          resolved_at: new Date().toISOString()
        })
      })
    } catch {
      // webhook fire and forget
    }
  }

  return NextResponse.json(data)
}
