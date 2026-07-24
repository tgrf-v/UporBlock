export default function HistoryLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="border rounded-lg p-6">
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        <div className="border rounded-lg p-6">
          <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
