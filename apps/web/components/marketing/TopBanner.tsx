// components/marketing/TopBanner.tsx
import Image from 'next/image';

export default function TopBanner() {
  return (
    <div className="relative w-full overflow-hidden border-b border-gold-400/20 bg-ink-900">
      <Image
        src="/images/sniper-investor-banner.jpg"
        alt="The Sniper Investor — Take the guesswork out of your trading/investing"
        width={1998}
        height={396}
        priority
        className="h-20 w-full object-cover sm:h-24 md:h-28"
      />
    </div>
  );
}
