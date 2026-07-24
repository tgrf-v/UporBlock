import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmitVideoForm } from '@/components/forms/submit-video-form'

export default async function SubmitPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: submissions } = await supabase
    .from('video_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kirim Video</h1>
        <p className="text-muted-foreground">Upload video produktif untuk membuka akses</p>
      </div>

      <div className="max-w-2xl">
        <SubmitVideoForm submissions={submissions || []} />
      </div>
    </div>
  )
}
