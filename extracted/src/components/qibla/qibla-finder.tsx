"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CloudOff, Compass, Crosshair, MapPin, RefreshCcw, Smartphone } from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

/** Kaaba coordinates */
const KAABA = { lat: 21.422487, lng: 39.826206 };

type Phase =
  | "idle"
  | "locating"
  | "geo-error"
  | "no-geo"
  | "ready"; // ready = we have qibla angle (compass live OR static)

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/** Great-circle initial bearing from (lat1,lng1) to Kaaba */
function qiblaBearing(lat1: number, lng1: number): number {
  const f1 = toRad(lat1);
  const f2 = toRad(KAABA.lat);
  const dl = toRad(KAABA.lng - lng1);
  const y = Math.sin(dl);
  const x = Math.cos(f1) * Math.tan(f2) - Math.sin(f1) * Math.cos(dl);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Haversine distance in km */
function distanceKm(lat1: number, lng1: number): number {
  const R = 6371;
  const df = toRad(KAABA.lat - lat1);
  const dl = toRad(KAABA.lng - lng1);
  const a =
    Math.sin(df / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dl / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export default function QiblaFinder() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [angle, setAngle] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [compassLive, setCompassLive] = useState(false);
  const [needsIosPermission, setNeedsIosPermission] = useState(false);
  const gotOrientation = useRef(false);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let h: number | null = null;
    const anyEvent = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
    if (typeof anyEvent.webkitCompassHeading === "number") {
      h = anyEvent.webkitCompassHeading; // iOS — already clockwise from North
    } else if (e.absolute && e.alpha !== null) {
      h = (360 - e.alpha) % 360; // Android absolute alpha → compass heading
    } else if (e.alpha !== null) {
      h = (360 - e.alpha) % 360; // fallback
    }
    if (h === null || Number.isNaN(h)) return;
    gotOrientation.current = true;
    setHeading(h);
    setCompassLive(true);
  }, []);

  const startCompass = useCallback(async () => {
    try {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE?.requestPermission === "function") {
        setNeedsIosPermission(true);
        return; // wait for explicit user tap (iOS requires gesture)
      }
      window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
      window.addEventListener("deviceorientation", handleOrientation as EventListener, true);
      // If nothing arrives, stay in static mode silently
      setTimeout(() => {
        if (!gotOrientation.current) setCompassLive(false);
      }, 2500);
    } catch {
      setCompassLive(false);
    }
  }, [handleOrientation]);

  const requestIosCompass = async () => {
    try {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission: () => Promise<string>;
      };
      const res = await DOE.requestPermission();
      if (res === "granted") {
        setNeedsIosPermission(false);
        window.addEventListener("deviceorientation", handleOrientation as EventListener, true);
      } else {
        setNeedsIosPermission(false);
      }
    } catch {
      setNeedsIosPermission(false);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
      window.removeEventListener("deviceorientation", handleOrientation as EventListener, true);
    };
  }, [handleOrientation]);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPhase("no-geo");
      return;
    }
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAngle(qiblaBearing(pos.coords.latitude, pos.coords.longitude));
        setDistance(distanceKm(pos.coords.latitude, pos.coords.longitude));
        setPhase("ready");
        startCompass();
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "رُفض إذن الوصول إلى الموقع. فعّل الإذن من إعدادات المتصفح ثم أعد المحاولة."
            : "تعذّر تحديد موقعك الحالي — تأكد من تفعيل خدمات الموقع ثم حاول مجددًا."
        );
        setPhase("geo-error");
      },
      { timeout: 12000, maximumAge: 600000, enableHighAccuracy: true }
    );
  }, [startCompass]);

  const aligned =
    angle !== null && heading !== null
      ? Math.min(((angle - heading) % 360 + 360) % 360, 360 - (((angle - heading) % 360 + 360) % 360)) < 5
      : false;

  /* ------------------------------- UI states ------------------------------- */

  if (phase === "idle") {
    return (
      <div className="rounded-[1.6rem] border border-line bg-surface p-8 text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Crosshair className="size-8" aria-hidden />
        </span>
        <h2 className="mt-5 text-xl font-bold text-ink">حدّد اتجاه القبلة</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-sub">
          سنطلب موقعك مرة واحدة لحساب الزاوية الدقيقة نحو الكعبة المشرفة.
          الموقع يُستخدم على جهازك فقط ولا يُرسل لأي خادم.
        </p>
        <Button onClick={locate} size="lg" className="mt-6">
          <Crosshair className="size-5" aria-hidden />
          تحديد موقعي الآن
        </Button>
      </div>
    );
  }

  if (phase === "locating") {
    return (
      <div role="status" aria-label="جارٍ تحديد الموقع" className="space-y-4">
        <span className="sr-only">جارٍ تحديد موقعك…</span>
        <Skeleton className="mx-auto size-64 rounded-full" />
        <Skeleton className="mx-auto h-5 w-44" />
        <Skeleton className="mx-auto h-12 w-full max-w-xs rounded-2xl" />
      </div>
    );
  }

  if (phase === "geo-error" || phase === "no-geo") {
    return (
      <div className="rounded-[1.6rem] border border-line bg-surface p-8 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold-deep dark:text-gold">
          <CloudOff className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">تعذّر تحديد الموقع</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-sub">
          {phase === "no-geo"
            ? "متصفحك أو جهازك لا يدعم خدمة تحديد الموقع الجغرافي."
            : error}
        </p>
        {phase === "geo-error" && (
          <Button onClick={locate} size="md" className="mt-6">
            <RefreshCcw className="size-4.5" aria-hidden />
            إعادة المحاولة
          </Button>
        )}
      </div>
    );
  }

  /* Ready */
  const dialRotation = compassLive && heading !== null ? -heading : 0;

  return (
    <div className="space-y-5" aria-live="polite">
      {needsIosPermission && (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-bold text-ink">
            <Smartphone className="size-4.5 text-gold-deep dark:text-gold" aria-hidden />
            جهازك يتطلب إذنًا صريحًا لتفعيل البوصلة الحية
          </p>
          <Button onClick={requestIosCompass} size="sm" className="mt-3">
            تفعيل البوصلة
          </Button>
        </div>
      )}

      {/* Compass */}
      <div className="relative mx-auto size-72 sm:size-80">
        <div
          className={cn(
            "absolute inset-0 rounded-full border-4 bg-surface shadow-[0_24px_60px_-24px_rgb(16_42_67/0.4)] transition-[border-color] duration-300",
            aligned ? "border-gold" : "border-line"
          )}
        />
        {/* Rotating dial */}
        <div
          className="absolute inset-3 transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${dialRotation}deg)` }}
        >
          {/* North marker */}
          <span className="absolute start-1/2 top-1 -translate-x-1/2 text-sm font-bold text-brand">ش</span>
          <span className="absolute start-1/2 bottom-1 -translate-x-1/2 text-xs font-bold text-sub">ج</span>
          <span className="absolute top-1/2 start-1.5 -translate-y-1/2 text-xs font-bold text-sub">ق</span>
          <span className="absolute top-1/2 end-1.5 -translate-y-1/2 text-xs font-bold text-sub">غ</span>
          {/* Degree ticks */}
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "absolute start-1/2 top-1/2 h-3 w-px origin-center",
                i % 6 === 0 ? "bg-sub" : "bg-line"
              )}
              style={{ transform: `rotate(${i * 15}deg) translateY(-8.2rem)` , WebkitTransform: `rotate(${i * 15}deg) translateY(-8.2rem)` }}
              aria-hidden
            />
          ))}
          {/* Kaaba pointer at qibla angle */}
          <div
            className="absolute inset-0"
            style={{ transform: `rotate(${angle ?? 0}deg)` }}
          >
            <div className="absolute start-1/2 top-4 flex -translate-x-1/2 flex-col items-center">
              <span className="size-0 border-x-9 border-b-14 border-x-transparent border-b-gold" aria-hidden />
              <span className="mt-1 flex size-11 items-center justify-center rounded-xl bg-navy text-gold shadow-lg" aria-label="اتجاه الكعبة">
                <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                  <rect x="4" y="4" width="16" height="16" rx="1.5" />
                  <rect x="7.5" y="10.5" width="9" height="2.4" rx="0.6" fill="#102A43" opacity="0.25" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        {/* Center needle / status */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "flex size-24 flex-col items-center justify-center rounded-full border text-center transition-colors duration-300",
              aligned ? "border-gold bg-gold/15" : "border-line bg-canvas dark:bg-surface-2"
            )}
          >
            <span className={cn("text-2xl font-bold tabular-nums", aligned ? "text-gold-deep dark:text-gold" : "text-ink")} dir="ltr">
              {toArabicDigits(Math.round(angle ?? 0))}°
            </span>
            <span className="text-[0.6rem] font-bold text-sub">من الشمال</span>
          </div>
        </div>
      </div>

      {compassLive ? (
        <p className={cn("text-center text-sm font-bold", aligned ? "text-gold-deep dark:text-gold" : "text-sub")}>
          {aligned ? "أنت الآن باتجاه القبلة تقريبًا" : "أدر جهازك حتى يلتقي مؤشر الكعبة بأعلى البوصلة"}
        </p>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-4 text-center">
          <p className="text-sm font-bold text-ink">البوصلة الحية غير متاحة على هذا الجهاز/المتصفح</p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-6 text-sub">
            لا ندّعي قراءة غير موجودة — استخدم الزاوية أدناه مع بوصلة هاتفك:
            اتجه {toArabicDigits(Math.round(angle ?? 0))} درجة بعيدًا عن الشمال الجغرافي
            نحو {angle !== null && angle > 90 && angle < 270 ? "الجهة الجنوبية" : "شرق الشمال أو غربه"}.
          </p>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <Compass className="mx-auto size-5 text-brand" aria-hidden />
          <p className="mt-2 text-xl font-bold tabular-nums text-ink" dir="ltr">
            {toArabicDigits(Math.round(angle ?? 0))}°
          </p>
          <p className="mt-0.5 text-[0.7rem] font-bold text-sub">زاوية القبلة من الشمال</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <MapPin className="mx-auto size-5 text-brand" aria-hidden />
          <p className="mt-2 text-xl font-bold tabular-nums text-ink" dir="ltr">
            {distance !== null ? `${toArabicDigits(distance.toLocaleString("en-US"))}` : "—"}
          </p>
          <p className="mt-0.5 text-[0.7rem] font-bold text-sub">كم إلى الكعبة المشرفة</p>
        </div>
      </div>

      <Button onClick={locate} variant="outline" size="md" className="w-full">
        <RefreshCcw className="size-4.5" aria-hidden />
        إعادة تحديد الموقع
      </Button>
    </div>
  );
}
