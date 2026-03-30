import { CinematicHero } from "@/components/ui/stoked-cinematic-hero";

export default function StokedCinematicDemo() {
  return (
    <div className="overflow-x-hidden w-[100%] min-h-screen">
      <CinematicHero
        brandLogo="/stoked logo.png"
        logoUrl="/"
      />
    </div>
  );
}
