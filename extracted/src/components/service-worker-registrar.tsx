"use client";

import Script from "next/script";

export default function ServiceWorkerRegistrar() {
  return <Script src="/sw-register.js" strategy="lazyOnload" />;
}
