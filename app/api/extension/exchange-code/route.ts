import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash, randomBytes } from 'crypto'

export async function POST(request: Request) {
  const body = await request.json()
  const { code, device_name } = body

  if (!code) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Kode harus diisi' } },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Hash the provided code
  const codeHash = createHash('sha256').update(code.toUpperCase()).digest('hex')

  // Find the pairing code
  const { data: pairingCode, error: findError } = await admin
    .from('extension_pairing_codes')
    .select('*')
    .eq('code_hash', codeHash)
    .single()

  if (findError || !pairingCode) {
    return NextResponse.json(
      { error: { code: 'INVALID_CODE', message: 'Kode tidak valid' } },
      { status: 400 }
    )
  }

  // Check if code is expired
  if (new Date(pairingCode.expires_at) < new Date()) {
    return NextResponse.json(
      { error: { code: 'CODE_EXPIRED', message: 'Kode sudah expired' } },
      { status: 400 }
    )
  }

  // Check if code is already used
  if (pairingCode.used_at) {
    return NextResponse.json(
      { error: { code: 'CODE_USED', message: 'Kode sudah dipakai' } },
      { status: 400 }
    )
  }

  // Mark code as used
  await admin
    .from('extension_pairing_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', pairingCode.id)

  // Generate token
  const rawToken = `upb_${randomBytes(32).toString('hex')}`
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  // Save token
  const { error: tokenError } = await admin
    .from('extension_tokens')
    .insert({
      user_id: pairingCode.user_id,
      name: device_name || 'Desktop Extension',
      token_hash: tokenHash,
    })

  if (tokenError) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: tokenError.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    token: rawToken,
    user_id: pairingCode.user_id,
    expires_at: null,
  })
}
