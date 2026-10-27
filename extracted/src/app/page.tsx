import Hero from "@/components/home/hero";
import QuickActions from "@/components/home/quick-actions";
import QuranSection from "@/components/home/quran-section";
import AdhkarSection from "@/components/home/adhkar-section";
import PrayerSection from "@/components/home/prayer-section";
import ToolsSection from "@/components/home/tools-section";
import AskSection from "@/components/home/ask-section";
import AdSlot from "@/components/ads/ad-slot";
import AdSenseSlot from "@/components/ads/adsense-slot";
import { getAdSenseConfig } from "@/lib/adsense";

export default async function HomePage() {
  const adsense = await getAdSenseConfig();
  const clientId = adsense.clientId;
  const isEnabled = adsense.enabled && clientId.startsWith("ca-pub-");

  return (
    <>
      {isEnabled && (
        <div className="wrap my-2 hidden px-4 md:block">
          <AdSenseSlot
            clientId={clientId}
            slot="1112223334"
            format="auto"
            className="w-full border-none"
          />
        </div>
      )}
      <Hero />
      <QuickActions />
      <QuranSection />
      <AdhkarSection />
      <AdSlot placement="homepage" className="wrap max-w-3xl py-2" />
      {isEnabled && (
        <div className="wrap max-w-3xl py-4">
          <AdSenseSlot
            clientId={clientId}
            slot="1112223335"
            format="rectangle"
            className="w-full outline-none"
          />
        </div>
      )}
      <PrayerSection />
      <ToolsSection />
      <AskSection />
    </>
  );
}
