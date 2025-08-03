// src/components/ui/skeletons.tsx

// Skeleton สำหรับ Product Card (สมมติ)
function ProductCardSkeleton() {
  return (
    <div className="bg-card text-card-foreground animate-pulse space-y-2 rounded-lg border p-4 shadow-sm">
      <div className="bg-muted h-40 rounded-md"></div>
      <div className="bg-muted h-6 w-3/4 rounded-md"></div>
      <div className="bg-muted h-4 w-1/2 rounded-md"></div>
    </div>
  );
}

// Skeleton สำหรับทั้งหน้า
export function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  );
}
