"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, Megaphone } from "lucide-react";
import type { PublicAd } from "@/db/queries";

/**
 * Ad card — fires ONE impression per mount (deduped per session),
 * and routes clicks through /api/ad-click for tracked CTR.
 */
export default function AdCard({ ad }: { ad: PublicAd }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    try {
      const key = `noor:ad:imp:${ad.id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      // sendBeacon when available — survives page unload
      const payload = JSON.stringify({ adId: ad.id, type: "impression" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/ad-events", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/ad-events", { method: "POST", body: payload, headers: { "content-type": "application/json" } }).catch(() => {});
      }
    } catch {
      /* silent */
    }
  }, [ad.id]);

  const href = ad.linkUrl
    ? `/api/ad-click?id=${ad.id}`
    : undefined;

  const inner = (
    <>
      {ad.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.imageUrl}
          alt=""
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-xl border border-line object-cover sm:h-28 sm:w-28"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[0.62rem] font-bold text-gold-deep dark:text-gold">
            <Megaphone className="size-3" aria-hidden />
            إعلان
          </span>
          <span className="truncate text-base font-bold text-ink">{ad.title}</span>
        </span>
        {ad.body && <span className="mt-1 line-clamp-2 block text-sm leading-6.5 text-sub">{ad.body}</span>}
        {ad.linkUrl && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand">
            اضغط للمزيد
            <ExternalLink className="size-3.5" aria-hidden />
          </span>
        )}
      </span>
    </>
  );

  const classes =
    "flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgb(16_42_67/0.05)] transition-[border-color] duration-200";

  if (href) {
    return (
      <a href={href} className={`${classes} hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2`}>
        {inner}
      </a>
    );
  }
  return <div className={classes}>{inner}</div>;
}
