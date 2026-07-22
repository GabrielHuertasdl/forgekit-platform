export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-8 w-40 bg-muted rounded animate-pulse mb-2" />
      <div className="h-4 w-56 bg-muted rounded animate-pulse mb-10" />
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="h-3 w-20 bg-muted rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4 h-20 bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
