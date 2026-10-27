import { getActiveAds, type PublicAd } from "@/db/queries";
import AdCard from "./ad-card";

/**
 * Server-rendered ad slot. Renders nothing when no live ad exists —
 * the site never shows fake or placeholder ads.
 */
export default async function AdSlot({
  placement,
  className,
}: {
  placement: string;
  className?: string;
}) {
  let ads: PublicAd[] = [];
  try {
    ads = await getActiveAds(placement);
  } catch {
    return null;
  }
  if (ads.length === 0) return null;

  return (
    <section aria-label="إعلان" className={className}>
      <div className="space-y-3">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}
