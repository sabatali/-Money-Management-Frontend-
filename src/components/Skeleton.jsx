/**
 * Lightweight shimmer placeholder for loading states. Use `Skeleton` for a
 * single block, or `SkeletonCard` for a common "card full of lines" shape.
 */
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />
)

export const SkeletonCard = ({ lines = 3, className = '' }) => (
  <div className={`rounded-2xl border border-app-border bg-app-surface p-5 ${className}`}>
    <Skeleton className="h-4 w-1/3" />
    <div className="mt-4 space-y-2.5">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={`h-3 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  </div>
)

export default Skeleton
