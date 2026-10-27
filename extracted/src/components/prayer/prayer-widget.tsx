"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, CloudOff, Crosshair, MapPin, RefreshCcw, Sunrise as SunriseIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPrayerCity, getPrayerMethod, setPrayerCity, setPrayerMethod, type SavedCity } from "@/lib/noor-storage";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";
import noorOffline from "@/lib/offline-store";

type Phase = "idle" | "choose" | "locating" | "loading" | "ready" | "error";

type Timings = Record<string, string>;
interface AladhanData {
  timings: Timings;
  date: {
    readable: string;
    hijri: { day: string; month: { en: string; ar: string }; year: string };
  };
}

const PRAYERS = [
  { key: "Fajr", label: "الفجر", prayer: true },
  { key: "Sunrise", label: "الشروق", prayer: false },
  { key: "Dhuhr", label: "الظهر", prayer: true },
  { key: "Asr", label: "العصر", prayer: true },
  { key: "Maghrib", label: "المغرب", prayer: true },
  { key: "Isha", label: "العشاء", prayer: true },
] as const;

const METHODS = [
  { id: 4, label: "أم القرى" },
  { id: 3, label: "رابطة العالم الإسلامي" },
  { id: 5, label: "الهيئة المصرية" },
  { id: 2, label: "الاتحاد الإسلامي (ISNA)" },
];

const CITIES: SavedCity[] = [
  { name: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
  { name: "المدينة المنورة", lat: 24.4672, lng: 39.6111 },
  { name: "الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", lat: 21.4858, lng: 39.1925 },
  { name: "القاهرة", lat: 30.0444, lng: 31.2357 },
  { name: "دبي", lat: 25.2048, lng: 55.2708 },
  { name: "الدوحة", lat: 25.2854, lng: 51.531 },
  { name: "الكويت", lat: 29.3759, lng: 47.9774 },
  { name: "عمّان", lat: 31.9539, lng: 35.9106 },
  { name: "بغداد", lat: 33.3152, lng: 44.3661 },
  { name: "اسطنبول", lat: 41.0082, lng: 28.9784 },
  { name: "جاكرتا", lat: -6.2088, lng: 106.8456 },
];

function to12h(hhmm: string): { time: string; suffix: string } {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { time: `${toArabicDigits(h12)}:${toArabicDigits(String(m).padStart(2, "0"))}`, suffix };
}

export default function PrayerWidget() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [city, setCity] = useState<SavedCity | null>(null);
  const [method, setMethod] = useState(4);
  const [data, setData] = useState<AladhanData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  /* Restore prefs */
  useEffect(() => {
    setMethod(getPrayerMethod());
    const saved = getPrayerCity();
    if (saved) {
      setCity(saved);
      load(saved, getPrayerMethod());
    } else {
      setPhase("choose");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async (target: SavedCity, methodId: number) => {
    setPhase("loading");
    setErrorMsg("");
    const todayStr = new Date().toISOString().split("T")[0];

    try {
      const ts = Math.floor(Date.now() / 1000);
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${ts}?latitude=${target.lat}&longitude=${target.lng}&method=${methodId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.code !== 200 || !json?.data?.timings) throw new Error("bad payload");
      setData(json.data as AladhanData);
      setCity(target);
      setPrayerCity(target);
      setPhase("ready");
      setNow(new Date());

      // Automatically save to offline store when online and successful
      noorOffline.savePrayerTimes({
        cityName: target.name,
        date: todayStr,
        timings: json.data.timings,
        hijriDate: `${toArabicDigits(json.data.date.hijri.day)} ${json.data.date.hijri.month.ar} ${toArabicDigits(json.data.date.hijri.year)} هـ`,
      }).catch(() => {});
    } catch {
      // Try loading from offline cache
      const offlineData = await noorOffline.getPrayerTimes(todayStr);
      if (offlineData) {
        setData({
          timings: offlineData.timings,
          date: {
            readable: "—",
            hijri: {
              day: offlineData.hijriDate.split(" ")[0],
              month: { en: "", ar: offlineData.hijriDate.split(" ")[1] },
              year: offlineData.hijriDate.split(" ")[2].replace(" هـ", ""),
            },
          },
        });
        setCity(target);
        setPrayerCity(target);
        setPhase("ready");
        setNow(new Date());
      } else {
        setErrorMsg(
          "تعذّر الاتصال بخدمة المواقيت الآن، ولا توجد بيانات محفوظة أوفلاين. جرّب لاحقًا أو قم بالاتصال بالإنترنت."
        );
        setPhase("error");
      }
    }
  }, []);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setErrorMsg("متصفحك لا يدعم تحديد الموقع — اختر مدينتك يدويًا من القائمة.");
      setPhase("error");
      return;
    }
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: SavedCity = {
          name: "موقعك الحالي",
          lat: Math.round(pos.coords.latitude * 1000) / 1000,
          lng: Math.round(pos.coords.longitude * 1000) / 1000,
        };
        load(c, method);
      },
      (err) => {
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "رُفض إذن الوصول للموقع. يمكنك السماح من إعدادات المتصفح، أو اختيار المدينة يدويًا."
            : "تعذّر تحديد موقعك — جرّب اختيار المدينة يدويًا."
        );
        setPhase("error");
      },
      { timeout: 12000, maximumAge: 600000 }
    );
  }, [load, method]);

  /* Countdown ticker */
  useEffect(() => {
    if (phase !== "ready") return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const nextPrayer = useMemo(() => {
    if (!data || !now) return null;
    const today = new Date(now);
    for (const p of PRAYERS.filter((p) => p.prayer)) {
      const [h, m] = data.timings[p.key].split(":").map(Number);
      const d = new Date(today);
      d.setHours(h, m, 0, 0);
      if (d.getTime() > now.getTime()) return { label: p.label, at: d, key: p.key };
    }
    const [h, m] = data.timings.Fajr.split(":").map(Number);
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(h, m, 0, 0);
    return { label: "الفجر", at: d, key: "Fajr" };
  }, [data, now]);

  const countdown = useMemo(() => {
    if (!nextPrayer || !now) return "--:--:--";
    const diff = Math.max(0, nextPrayer.at.getTime() - now.getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [nextPrayer, now]);

  /* ---------------------------------- UI ---------------------------------- */

  if (phase === "choose" || phase === "idle") {
    return (
      <div className="space-y-6">
        <div className="rounded-[1.6rem] border border-line bg-surface p-6 text-center sm:p-8">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Crosshair className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">كيف تريد حساب المواقيت؟</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-sub">
            عبر موقعك الحالي — بدقة تلقائية، أو باختيار مدينتك يدويًا.
          </p>
          <Button onClick={locate} size="lg" className="mt-6 w-full sm:w-auto">
            <Crosshair className="size-5" aria-hidden />
            استخدام موقعي الحالي
          </Button>
        </div>

        <div>
          <p className="text-center text-xs font-bold tracking-widest text-sub">أو اختر مدينتك</p>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {CITIES.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => load(c, method)}
                  className="flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm font-bold text-ink transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                  <MapPin className="size-4.5 shrink-0 text-brand" aria-hidden />
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (phase === "locating" || phase === "loading") {
    return (
      <div role="status" aria-label="جارٍ حساب المواقيت" className="space-y-4">
        <span className="sr-only">
          {phase === "locating" ? "جارٍ تحديد موقعك…" : "جارٍ جلب المواقيت الحقيقية…"}
        </span>
        <div className="rounded-[1.6rem] border border-line bg-surface p-6">
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto mt-4 h-16 w-full max-w-sm rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <p className="text-center text-xs font-semibold text-sub">
          {phase === "locating" ? "نطلب إذن الوصول إلى موقعك…" : "نحسب المواقيت من الخدمة الرسمية…"}
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-[1.6rem] border border-line bg-surface p-8 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold-deep dark:text-gold">
          <CloudOff className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">لم تكتمل العملية</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-sub">{errorMsg}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => (city ? load(city, method) : setPhase("choose"))} size="md">
            <RefreshCcw className="size-4.5" aria-hidden />
            إعادة المحاولة
          </Button>
          <Button onClick={() => setPhase("choose")} variant="outline" size="md">
            <MapPin className="size-4.5" aria-hidden />
            اختيار مدينة
          </Button>
        </div>
      </div>
    );
  }

  /* Ready */
  const hijri = data!.date.hijri;
  return (
    <div className="space-y-5" aria-live="polite">
      {/* Location + dates */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
        <div className="flex items-center gap-2.5">
          <MapPin className="size-5 text-brand" aria-hidden />
          <div>
            <p className="text-sm font-bold text-ink">{city?.name}</p>
            <p className="text-[0.7rem] font-semibold text-sub">
              {toArabicDigits(hijri.day)} {hijri.month.ar} {toArabicDigits(hijri.year)} هـ · {data!.date.readable}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="method" className="sr-only">طريقة الحساب</label>
          <select
            id="method"
            value={method}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMethod(m);
              setPrayerMethod(m);
              if (city) load(city, m);
            }}
            className="h-10 rounded-xl border border-line bg-canvas px-3 text-xs font-bold text-ink focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPhase("choose")}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
          >
            <MapPin className="size-4" aria-hidden />
            تغيير
          </button>
        </div>
      </div>

      {/* Next prayer countdown */}
      {nextPrayer && (
        <div className="relative overflow-hidden rounded-[1.6rem] border border-line bg-navy p-6 text-center text-ivory sm:p-8">
          <div className="pointer-events-none absolute inset-0 pattern-geo opacity-[0.07]" aria-hidden />
          <p className="text-xs font-bold tracking-widest text-gold">الصلاة القادمة</p>
          <p className="mt-2 text-3xl font-bold">{nextPrayer.label}</p>
          <p className="mt-1 text-sm font-semibold text-ivory/70">
            {to12h(data!.timings[nextPrayer.key]).time} {to12h(data!.timings[nextPrayer.key]).suffix}
          </p>
          <p className="mt-4 font-mono text-4xl font-bold tabular-nums tracking-wider text-teal-bright dark:text-teal-bright" dir="ltr" suppressHydrationWarning>
            {countdown}
          </p>
          <p className="mt-1 text-[0.7rem] font-semibold text-ivory/60">متبقٍ على الأذان</p>
        </div>
      )}

      {/* All times */}
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {PRAYERS.map((p) => {
          const t = to12h(data!.timings[p.key]);
          const isNext = nextPrayer?.key === p.key;
          return (
            <li
              key={p.key}
              className={cn(
                "rounded-2xl border p-4 text-center transition-colors",
                isNext
                  ? "border-gold/60 bg-gold/10"
                  : "border-line bg-surface"
              )}
            >
              <p className={cn("flex items-center justify-center gap-1.5 text-sm font-bold", isNext ? "text-gold-deep dark:text-gold" : "text-sub")}>
                {p.key === "Sunrise" && <SunriseIcon className="size-4" aria-hidden />}
                {p.label}
              </p>
              <p className={cn("mt-1.5 text-xl font-bold tabular-nums", isNext ? "text-ink" : "text-ink")}>
                {t.time}
                <span className="ms-1 text-xs font-semibold text-sub">{t.suffix}</span>
              </p>
              {isNext && (
                <span className="mt-1.5 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[0.62rem] font-bold text-gold-deep dark:text-gold">
                  القادمة
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="flex items-center justify-center gap-1.5 text-center text-[0.7rem] font-semibold text-sub">
        <Clock className="size-3.5" aria-hidden />
        المصدر: AlAdhan API — طريقة الحساب: {METHODS.find((m) => m.id === method)?.label}
      </p>
    </div>
  );
}
