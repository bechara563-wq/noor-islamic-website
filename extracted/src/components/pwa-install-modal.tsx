"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  Download,
  Laptop,
  PlusSquare,
  Share,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    // Capture Chrome/Android install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const triggerInstall = async (onSuccess?: () => void) => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        onSuccess?.();
      }
    }
  };

  return { deferredPrompt, isInstalled, isIos, triggerInstall };
}

export default function PwaInstallModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { deferredPrompt, isInstalled, isIos, triggerInstall } =
    usePwaInstall();
  const [activeTab, setActiveTab] = useState<"ios" | "android" | "desktop">(
    isIos ? "ios" : "android"
  );
  const [installedNotice, setInstalledNotice] = useState(false);

  useEffect(() => {
    if (isIos) setActiveTab("ios");
  }, [isIos]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="خطوات تثبيت تطبيق نور على الهاتف"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-deep/65 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog Body */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-gold/30 bg-surface p-6 shadow-2xl animate-scale-in sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <div>
              <h2 className="text-lg font-bold text-navy dark:text-ink sm:text-xl">
                تثبيت تطبيق نور | Noor
              </h2>
              <p className="text-xs font-semibold text-gold-deep dark:text-gold">
                تجربة كاملة وتصفح بدون إنترنت
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-10 items-center justify-center rounded-xl text-sub hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Benefits Badges */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.7rem] font-bold">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-brand-soft p-2.5 text-brand">
            <WifiOff className="size-4" />
            <span>يعمل بدون إنترنت</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-gold/10 p-2.5 text-gold-deep dark:text-gold">
            <Zap className="size-4" />
            <span>سريع وبدون إعلانات</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-navy/5 p-2.5 text-navy dark:bg-surface-2 dark:text-ink">
            <ShieldCheck className="size-4" />
            <span>آمن وخفيف جدًا</span>
          </div>
        </div>

        {/* One-click Install Button (Android / Chromium) */}
        {deferredPrompt && !isInstalled && (
          <div className="mt-5 rounded-2xl border border-gold/40 bg-gradient-to-l from-gold/15 to-transparent p-4 text-center">
            <p className="text-xs font-bold text-navy dark:text-ink">
              متصفحك يدعم التثبيت الفوري بضغطة واحدة!
            </p>
            <button
              type="button"
              onClick={() =>
                triggerInstall(() => {
                  setInstalledNotice(true);
                  setTimeout(() => onClose(), 2000);
                })
              }
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-brand-fg shadow-lg transition-transform hover:bg-brand-deep active:scale-98"
            >
              <Download className="size-4.5" />
              تثبيت التطبيق الآن
            </button>
          </div>
        )}

        {installedNotice && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-soft p-3 text-xs font-bold text-brand">
            <Check className="size-4" />
            تم تثبيت التطبيق بنجاح! ستجده على شاشتك الرئيسية.
          </div>
        )}

        {/* Operating System Selector Tabs */}
        <div className="mt-6 flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-canvas p-1.5 dark:bg-surface-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ios"}
            onClick={() => setActiveTab("ios")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all",
              activeTab === "ios"
                ? "bg-surface text-navy shadow-sm dark:bg-canvas dark:text-ink"
                : "text-sub hover:text-brand"
            )}
          >
            <Smartphone className="size-4" />
            آيفون / آيباد (iOS)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "android"}
            onClick={() => setActiveTab("android")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all",
              activeTab === "android"
                ? "bg-surface text-navy shadow-sm dark:bg-canvas dark:text-ink"
                : "text-sub hover:text-brand"
            )}
          >
            <Smartphone className="size-4" />
            أندرويد (Android)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "desktop"}
            onClick={() => setActiveTab("desktop")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all",
              activeTab === "desktop"
                ? "bg-surface text-navy shadow-sm dark:bg-canvas dark:text-ink"
                : "text-sub hover:text-brand"
            )}
          >
            <Laptop className="size-4" />
            الكمبيوتر
          </button>
        </div>

        {/* Steps: iOS / Safari */}
        {activeTab === "ios" && (
          <div className="mt-5 space-y-3.5 animate-fade-in">
            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ١
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">افتح الموقع في متصفح Safari</p>
                <p className="text-sub">
                  تأكد من فتح الرابط عبر متصفح سفاري الرسمي لتمكين التثبيت.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٢
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="flex items-center gap-1 font-bold">
                  اضغط على زر المشاركة
                  <span className="inline-flex items-center justify-center rounded bg-brand-soft px-1.5 py-0.5 text-brand">
                    <Share className="size-3.5" />
                  </span>
                  في أسفل الشاشة
                </p>
                <p className="text-sub">
                  ستفتح لك قائمة خيارات المشاركة وإجراءات الصفحة.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٣
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="flex items-center gap-1 font-bold">
                  اختر «إضافة إلى الشاشة الرئيسية»
                  <span className="inline-flex items-center justify-center rounded bg-brand-soft px-1.5 py-0.5 text-brand">
                    <PlusSquare className="size-3.5" />
                  </span>
                </p>
                <p className="text-sub">
                  مرر لأسفل القائمة قليلاً حتى تجد خيار Add to Home Screen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٤
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">اضغط على «إضافة» (Add) في الزاوية العلوية</p>
                <p className="text-sub">
                  سيظهر تطبيق «نور» فورًا على شاشتك الرئيسية ويعمل بدون إنترنت!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Steps: Android / Chrome */}
        {activeTab === "android" && (
          <div className="mt-5 space-y-3.5 animate-fade-in">
            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ١
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">افتح الموقع عبر Google Chrome أو Edge</p>
                <p className="text-sub">
                  أو أي متصفح حديث يدعم تطبيقات الويب التقدمية (PWA).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٢
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">اضغط على زر القائمة (الثلاث نقاط ⋮) أعلى المتصفح</p>
                <p className="text-sub">
                  أو اضغط على شريط التثبيت التلقائي الذي يظهر في أسفل الشاشة.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٣
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="flex items-center gap-1 font-bold">
                  اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»
                  <span className="inline-flex items-center justify-center rounded bg-brand-soft px-1.5 py-0.5 text-brand">
                    <Download className="size-3.5" />
                  </span>
                </p>
                <p className="text-sub">
                  Install app / Add to Home screen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٤
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">اضغط «تثبيت» (Install)</p>
                <p className="text-sub">
                  يفتح التطبيق بشاشة كاملة وبسرعة فائقة حتى عند انقطاع الإنترنت.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Steps: Desktop / PC */}
        {activeTab === "desktop" && (
          <div className="mt-5 space-y-3.5 animate-fade-in">
            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ١
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">استخدم متصفح Google Chrome أو Microsoft Edge</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٢
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">ستجد أيقونة تثبيت صغيرة ⤓ في شريط العنوان أعلى المتصفح</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-canvas/60 p-3.5 dark:bg-surface-2/40">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-bold text-gold-deep dark:text-gold">
                ٣
              </span>
              <div className="text-xs leading-6 text-ink">
                <p className="font-bold">اضغط عليها ثم اختر «تثبيت نور» ليفتح كنافذة مستقلة</p>
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-surface-2 px-6 text-xs font-bold text-ink transition-colors hover:bg-line focus-visible:outline-2 focus-visible:outline-brand"
          >
            فهمت، إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Header Icon Button to trigger the install modal or direct install
 */
export function PwaInstallHeaderButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isInstalled } = usePwaInstall();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="تثبيت تطبيق نور على الهاتف"
        title="تثبيت التطبيق على الهاتف"
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 text-xs font-bold text-gold-deep transition-all hover:border-gold hover:bg-gold/20 active:scale-95 dark:text-gold",
          className
        )}
      >
        <Smartphone className="size-4" aria-hidden />
        <span className="hidden sm:inline">
          {isInstalled ? "التطبيق مثبت" : "تثبيت التطبيق"}
        </span>
      </button>

      <PwaInstallModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

/**
 * Full card for the settings page or home footer
 */
export function PwaInstallSettingsCard() {
  const [isOpen, setIsOpen] = useState(false);
  const { isInstalled } = usePwaInstall();

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-5">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-fg shadow-sm">
            <Smartphone className="size-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-ink">تطبيق نور على هاتفك</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold text-gold-deep dark:text-gold">
                <Sparkles className="size-3" />
                PWA
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-5 text-sub">
              ثبّت التطبيق على شاشة هاتفك الرئيسية لتصفح المصحف والأذكار والمواقيت
              بدون إنترنت وبسرعة فائقة.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-xs font-bold text-brand-fg shadow transition-transform hover:bg-brand-deep active:scale-95"
        >
          <Download className="size-4" />
          {isInstalled ? "خطوات التثبيت" : "تثبيت التطبيق"}
          <ChevronLeft className="size-3.5" />
        </button>
      </div>

      <PwaInstallModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
