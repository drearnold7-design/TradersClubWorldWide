// components/marketing/TopBanner.tsx
// The Sniper Investor is Daniel Gamble's trading brand — this banner
// leads the page so it's the first thing a visitor sees, ahead of the
// trip-specific Hero copy below it.
import Image from 'next/image';

export default function TopBanner() {
  return (
    <div className="relative w-full aspect-[1998/464] bg-black">
      <Image
        src="/images/sniper-investor-banner.jpg"
        alt="The Sniper Investor — Take the guesswork out of your trading and investing"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}
