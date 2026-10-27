import type { Metadata } from "next";
import { Database, EyeOff, ShieldCheck, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "خصوصيتك أمانة في نور — مبادئ واضحة: لا إعلانات تتبعية، ولا بيع بيانات، وحفظ محلي قدر الإمكان.",
};

const principles = [
  {
    icon: EyeOff,
    title: "لا تتبّع",
    desc: "لا نستخدم إعلانات تتبعية ولا أدوات مراقبة تجارية لسلوكك.",
  },
  {
    icon: Database,
    title: "حفظ محلي",
    desc: "تفضيلاتك كموضع القراءة وعدّاد التسبيح تُحفظ على جهازك قدر الإمكان.",
  },
  {
    icon: UserX,
    title: "لا حسابات إجبارية",
    desc: "يمكنك استخدام أقسام نور الأساسية دون تسجيل أو بيانات شخصية.",
  },
  {
    icon: ShieldCheck,
    title: "لا بيع للبيانات",
    desc: "لن نبيع بياناتك أو نشاركها مع أي طرف ثالث لأغراض تجارية — أبدًا.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="wrap py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand ring-1 ring-brand/15">
            <ShieldCheck className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 text-3xl font-bold text-navy dark:text-ink">سياسة الخصوصية</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-sub">
            خصوصيتك أمانة. هذه المبادئ تحكم طريقة بناء نور منذ يومه الأول،
            وستُنشر الصياغة القانونية الكاملة مع الإطلاق الرسمي للخدمات.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, desc }) => (
            <li key={title}>
              <Card className="h-full p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5.5" aria-hidden />
                </span>
                <h2 className="mt-4 font-bold text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-sub">{desc}</p>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-4 text-center text-xs leading-6 text-sub">
          عند تفعيل خدمات تحتاج بيانات (كالموقع لمواقيت الصلاة والقبلة)،
          سيُطلب إذنك صراحةً أولًا، وتُستخدم البيانات للغرض المطلوب فقط.
        </p>
      </div>
    </div>
  );
}
