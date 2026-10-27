"use client";

import { useEffect } from "react";
import { RefreshCcw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl bg-gold/10 text-gold-deep dark:text-gold">
          <TriangleAlert className="size-8" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-navy dark:text-ink">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-3 text-sm leading-7 text-sub">
          نعتذر منك — حدث خلل مؤقت أثناء عرض هذه الصفحة.
          حاول مرة أخرى، وإن استمر الخلل فيسعدنا تواصلك معنا.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} size="lg">
            <RefreshCcw className="size-5" aria-hidden />
            إعادة المحاولة
          </Button>
          <Button href="/" variant="outline" size="lg">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
