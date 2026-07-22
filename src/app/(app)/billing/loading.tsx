export default function BillingLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="h-8 w-24 bg-muted rounded animate-pulse mb-8" />
      <div className="rounded-lg border border-border p-6 mb-8">
        <div className="h-3 w-28 bg-muted rounded animate-pulse mb-3" />
        <div className="h-10 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-5 w-28 bg-muted rounded animate-pulse mb-4" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border p-5 h-36 bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
