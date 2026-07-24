import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlockedSitesForm } from '@/components/forms/blocked-sites-form'
import { AllowlistsForm } from '@/components/forms/allowlists-form'

export const dynamic = 'force-dynamic'

export default async function SitesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sites } = await supabase
    .from('blocked_sites')
    .select('*')
    .eq('user_id', user.id)
    .order('priority', { ascending: true })

  const { data: allowlists } = await supabase
    .from('upload_allowlists')
    .select('*')
    .eq('user_id', user.id)
    .order('priority', { ascending: true })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Situs</h1>
        <p className="text-muted-foreground">Atur situs yang ingin diblokir dan allowlist</p>
      </div>

      <div className="max-w-2xl space-y-8">
        <BlockedSitesForm sites={sites || []} />
        <AllowlistsForm allowlists={allowlists || []} />
      </div>
    </div>
  )
}
