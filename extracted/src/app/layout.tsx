import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic, Amiri_Quran } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BottomNav from "@/components/bottom-nav";
import ServiceWorkerRegistrar from "@/components/service-worker-registrar";
import { extractMetaContent, getAdSenseConfig } from "@/lib/adsense";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm",
  display: "swap",
});

/** Quranic script font — ONLY for Quran/adhkar content, never UI chrome */
const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri",
  display: "swap",
});

const themeInit = `
(function () {
  try {
    var t = localStorage.getItem("noor-theme");
    var dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
`;

export async function generateMetadata(): Promise<Metadata> {
  // AdSense verification meta — driven from PostgreSQL adsense_settings, not hardcoded
  const adsense = await getAdSenseConfig();
  const metaContent = adsense.enabled
    ? extractMetaContent(adsense.metaTag, adsense.clientId)
    : "";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://noor.app"),
    title: {
      default: "نور | Noor — رفيقك اليومي إلى القرآن والذكر",
      template: "%s | نور",
    },
    description:
      "منصة إسلامية حديثة مجانية تجمع القرآن الكريم بالرسم العثماني والأذكار ومواقيت الصلاة والقبلة والأدوات الإسلامية في مكان واحد.",
    keywords: [
      "القرآن الكريم",
      "الأذكار",
      "مواقيت الصلاة",
      "القبلة",
      "المسبحة الإلكترونية",
      "تلاوات",
      "نور",
      "Noor",
    ],
    openGraph: {
      type: "website",
      locale: "ar_AR",
      siteName: "نور | Noor",
      title: "نور | Noor — رفيقك اليومي إلى القرآن والذكر",
      description:
        "منصة إسلامية حديثة مجانية تجمع القرآن الكريم والأذكار ومواقيت الصلاة والقبلة والأدوات الإسلامية في مكان واحد.",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "نور | Noor" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "نور | Noor",
      description: "رفيقك اليومي إلى القرآن والذكر.",
      images: ["/og.jpg"],
    },
    robots: { index: true, follow: true },
    appleWebApp: {
      capable: true,
      title: "نور",
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
    // → <meta name="google-adsense-account" content="ca-pub-…"> when enabled
    ...(metaContent
      ? { other: { "google-adsense-account": metaContent } }
      : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1B29" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const adsense = await getAdSenseConfig();

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${ibmPlexArabic.variable} ${amiriQuran.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {adsense.enabled && adsense.clientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.clientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-brand-fg focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          تخطَّ إلى المحتوى الرئيسي
        </a>

        <SiteHeader />

        <main id="main-content" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        <SiteFooter />
        <BottomNav />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
