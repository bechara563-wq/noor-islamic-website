"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSenseSlot({
  clientId,
  slot,
  format = "auto",
  style,
  className,
  responsive = true,
}: {
  clientId: string;
  slot: string;
  format?: string;
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}) {
  useEffect(() => {
    if (clientId && slot && typeof window !== "undefined" && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (err) {
        // Cache error prevents page breakage
      }
    }
  }, [clientId, slot]);

  if (!clientId || !slot) return null;

  return (
    <ins
      className={cn("adsbygoogle", className)}
      style={{
        display: "block",
        overflow: "hidden",
        ...style,
      }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}
