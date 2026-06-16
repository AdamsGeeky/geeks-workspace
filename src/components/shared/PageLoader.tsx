import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="size-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}
