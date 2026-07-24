import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConnectExtensionForm } from '@/components/forms/connect-extension-form'

export const dynamic = 'force-dynamic'

export default async function ConnectExtensionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hubungkan Ekstensi</h1>
        <p className="text-muted-foreground">Hubungkan browser extension dengan akunmu</p>
      </div>

      <div className="max-w-2xl">
        <ConnectExtensionForm />
      </div>
    </div>
  )
}
