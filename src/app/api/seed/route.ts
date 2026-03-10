import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SEED_DISPUTES } from '@/lib/seed-data'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if already seeded
  const { data: settings } = await supabase
    .from('user_settings')
    .select('seeded')
    .eq('user_id', user.id)
    .single()

  if (settings?.seeded) return NextResponse.json({ message: 'Already seeded' })

  // Insert seed disputes
  const disputesWithUser = SEED_DISPUTES.map(d => ({ ...d, user_id: user.id }))
  await supabase.from('disputes').insert(disputesWithUser)

  // Mark as seeded
  await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, seeded: true, updated_at: new Date().toISOString() })

  return NextResponse.json({ message: 'Seeded successfully' })
}
