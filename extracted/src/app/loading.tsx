import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="wrap py-12" role="status" aria-label="جارٍ التحميل">
      <span className="sr-only">جارٍ تحميل المحتوى…</span>
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <Skeleton className="mx-auto h-7 w-40 rounded-full" />
        <Skeleton className="mx-auto h-12 w-full max-w-md rounded-2xl" />
        <Skeleton className="mx-auto h-4 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
        <div className="flex justify-center gap-3 pt-2">
          <Skeleton className="h-14 w-40 rounded-2xl" />
          <Skeleton className="h-14 w-40 rounded-2xl" />
        </div>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
