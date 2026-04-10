import { PhoneMockupHero, PhoneMockupLesson, PhoneMockupProfile } from "./PhoneMockup";

export const ProductPreview = () => {
  return (
    <section className="py-24 md:py-40 w-full overflow-hidden bg-white relative">
      {/* Background soft glow behind the phones to anchor them */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-[#E5F9EF] rounded-full blur-[120px] opacity-40 -z-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 text-center mb-20 md:mb-24">
        <h2 className="font-serif text-[40px] md:text-[48px] font-bold text-[#0A1128] tracking-tight mb-6">
          Built for your phone
        </h2>
        <p className="text-lg md:text-[21px] text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Short interactive lessons, a clear path to follow, and easy progress tracking—all in your pocket.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 px-6 w-full pb-10">
        <div className="w-full md:w-auto transform md:rotate-[-3deg] md:-translate-x-4 md:translate-y-10 opacity-90 hover:opacity-100 hover:rotate-[-1deg] hover:translate-y-6 transition-all duration-500 hover:z-20 relative">
          <PhoneMockupLesson />
        </div>
        <div className="w-full md:w-auto z-10 transform md:scale-105 shadow-2xl relative shadow-slate-900/10 rounded-[40px]">
          <PhoneMockupHero />
        </div>
        <div className="w-full md:w-auto transform md:rotate-[3deg] md:translate-x-4 md:translate-y-10 opacity-90 hover:opacity-100 hover:rotate-[1deg] hover:translate-y-6 transition-all duration-500 hover:z-20 relative">
          <PhoneMockupProfile />
        </div>
      </div>
    </section>
  );
};
