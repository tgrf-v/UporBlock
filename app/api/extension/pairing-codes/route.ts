import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash, randomBytes } from 'crypto'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  // Generate random code
  const rawCode = randomBytes(4).toString('hex').toUpperCase().slice(0, 6)

  // Hash the code
  const codeHash = createHash('sha256').update(rawCode).digest('hex')

  // Set expiration (10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Delete any existing unused codes for this user
  const admin = createAdminClient()
  await admin
    .from('extension_pairing_codes')
    .delete()
    .eq('user_id', user.id)
    .is('used_at', null)

  // Insert new code
  const { error } = await admin
    .from('extension_pairing_codes')
    .insert({
      user_id: user.id,
      code_hash: codeHash,
      expires_at: expiresAt,
    })

  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    code: rawCode,
    expires_at: expiresAt,
  })
}
