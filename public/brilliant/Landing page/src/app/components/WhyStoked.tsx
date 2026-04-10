import { CheckCircle2, ChevronRight } from "lucide-react";

export const WhyStoked = () => {
  return (
    <section className="py-24 md:py-32 px-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 bg-[#F8FAF9] rounded-[48px] p-8 md:p-16 border border-slate-100 shadow-sm">
        
        {/* Left Text */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <h2 className="font-serif text-[40px] md:text-[48px] font-bold text-[#0A1128] tracking-tight mb-6 leading-[1.1]">
            A clear path.<br />
            <span className="text-[#00D06C]">Zero confusion.</span>
          </h2>
          <p className="text-[17px] md:text-[19px] text-slate-600 font-medium leading-relaxed mb-10">
            Instead of piecing together disconnected videos and complex articles, Stoked gives you a simple, step-by-step structure.
          </p>
          <div className="inline-flex flex-col items-start gap-4">
             <div className="flex items-center gap-3 text-slate-600 font-medium">
                <ChevronRight className="w-5 h-5 text-[#00D06C]" />
                <span>Start from the absolute basics</span>
             </div>
             <div className="flex items-center gap-3 text-slate-600 font-medium">
                <ChevronRight className="w-5 h-5 text-[#00D06C]" />
                <span>Follow a guided learning tree</span>
             </div>
             <div className="flex items-center gap-3 text-slate-600 font-medium">
                <ChevronRight className="w-5 h-5 text-[#00D06C]" />
                <span>Learn safely at your own pace</span>
             </div>
          </div>
        </div>

        {/* Right Cards */}
        <div className="flex-1 w-full max-w-lg space-y-4">
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 flex gap-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E5F9EF] text-[#00A153] flex items-center justify-center shadow-sm">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A1128] mb-1.5">Built for beginners</h3>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">We assume you know nothing about the stock market. We start from absolute zero.</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 flex gap-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E5F9EF] text-[#00A153] flex items-center justify-center shadow-sm">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A1128] mb-1.5">Short daily lessons</h3>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">Got 5 minutes? That’s all you need to complete a lesson and build your daily streak.</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 flex gap-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E5F9EF] text-[#00A153] flex items-center justify-center shadow-sm">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A1128] mb-1.5">A clear structure</h3>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">Always know exactly what to learn next. Follow a carefully designed path to confidence.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
