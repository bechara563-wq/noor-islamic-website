import { Compass } from "lucide-react";
import Button from "@/components/ui/button";
import { OrnamentDivider } from "@/components/ornament";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16">
      <div className="text-center">
        <span className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Compass className="size-10" aria-hidden />
        </span>
        <p className="mt-6 text-5xl font-bold text-navy dark:text-ink">٤٠٤</p>
        <h1 className="mt-3 text-xl font-bold text-ink">الصفحة غير موجودة</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-sub">
          يبدو أنك سلكت طريقًا لم يُفتح بعد — لا بأس، فكل الطرق عندنا تعود إلى نور.
        </p>
        <OrnamentDivider className="my-8 opacity-60" />
        <Button href="/" size="lg">
          العودة إلى الرئيسية
        </Button>
      </div>
    </div>
  );
}
