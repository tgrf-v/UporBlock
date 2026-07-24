export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
