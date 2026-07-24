export default function SitesLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="border rounded-lg p-6">
          <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
