import type { Metadata } from "next";
import { BookOpen, Eye, Gem, HeartHandshake, MoonStar, ShieldCheck, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OrnamentDivider } from "@/components/ornament";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "عن نور",
  description: "تعرّف على رؤية موقع نور — منصة إسلامية مجانية تجمع القرآن والذكر والأدوات اليومية في مكان واحد هادئ.",
};

const values = [
  {
    icon: HeartHandshake,
    title: "مجاني بالكامل",
    desc: "نور خدمة لله ثم للمسلمين — لا اشتراكات، لا متجر، ولا محتوى مدفوع.",
  },
  {
    icon: Eye,
    title: "هدوء بلا تشتيت",
    desc: "تصميم نظيف مريح للعين يحترم قدسية المحتوى ولا يزاحم القراءة.",
  },
  {
    icon: Smartphone,
    title: "الهاتف أولًا",
    desc: "صُمم نور ليكون رفيق يومك في جيبك — سريع وسلس على كل الأجهزة.",
  },
  {
    icon: ShieldCheck,
    title: "موثوقية ومصادر",
    desc: "النص القرآني بالرسم العثماني المعتمد، والأذكار من مصادرها الموثوقة.",
  },
  {
    icon: Gem,
    title: "جودة في التفاصيل",
    desc: "من اللون إلى الحركة إلى الحرف — كل تفصيلة صُنعت بإتقان واحترام.",
  },
  {
    icon: MoonStar,
    title: "رفيق الليل والنهار",
    desc: "وضع ليلي مريح، وتجربة تحضر معك في كل أوقات يومك وليلك.",
  },
];

export default async function AboutPage() {
  const quranSource = await getSetting(
    "quran_source",
    "Tanzil Quran Text — Uthmani (tanzil.net)، عبر واجهة AlQuran Cloud."
  );

  return (
    <div className="wrap py-10 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold tracking-widest text-gold-deep dark:text-gold">عن نور</p>
        <h1 className="mt-3 text-3xl font-bold leading-snug text-navy dark:text-ink sm:text-4xl">
          نور… رفيقك اليومي إلى القرآن والذكر
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-sub sm:text-base sm:leading-9">
          بدأ نور من فكرة بسيطة: لماذا يتوزّع المسلم بين تطبيقات ومواقع كثيرة
          ليصل إلى مصحفه وأذكاره ومواقيت صلاته؟ نور يجمع أهم الأدوات الإسلامية
          اليومية في مكان واحد — منصة مجانية حديثة، هادئة، وسريعة، تليق بقدسية
          ما تقدّمه وبوقت مستخدمها.
        </p>
      </div>

      <OrnamentDivider className="my-12 opacity-60" />

      <h2 className="text-center text-xl font-bold text-navy dark:text-ink sm:text-2xl">
        قيمنا التي نبني عليها
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {values.map(({ icon: Icon, title, desc }) => (
          <li key={title}>
            <Card className="h-full p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5.5" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-sub">{desc}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="mx-auto mt-12 max-w-3xl p-6 text-center sm:p-8">
        <h2 className="text-lg font-bold text-ink">رؤيتنا للمستقبل</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-sub">
          يتطور نور على مراحل مدروسة: المصحف الشريف بخط عثماني معتمد أولًا،
          ثم الأذكار والمواقيت والقبلة والمسبحة ومكتبة التلاوات،
          وصولًا إلى مساعد «اسأل نور» الذكي — كل ذلك بمعايير الجودة نفسها،
          ومجانًا دائمًا.
        </p>
      </Card>

      <Card className="mx-auto mt-4 max-w-3xl p-6 sm:p-8" aria-label="المصادر والإسناد">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <BookOpen className="size-5 text-brand" aria-hidden />
          المصادر والإسناد
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-sub">
          <li className="flex items-start gap-2.5">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
            <span><strong className="text-ink">نص المصحف:</strong> {quranSource}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
            <span><strong className="text-ink">الأذكار:</strong> حصن المسلم من أذكار الكتاب والسنة — سعيد بن علي القحطاني.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
            <span><strong className="text-ink">مواقيت الصلاة:</strong> تُحسب عبر خدمة AlAdhan حسب موقعك وطريقة الحساب المختارة.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
