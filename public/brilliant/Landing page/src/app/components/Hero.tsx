import { motion } from "motion/react";
import { PhoneMockupHero } from "./PhoneMockup";
import { Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="px-6 pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
      {/* Left Content */}
      <motion.div 
        className="flex-1 max-w-xl flex flex-col items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5F9EF] text-[#00A153] text-[13px] font-bold mb-6 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D06C]"></span>
          EARLY ACCESS
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] font-bold text-[#0A1128] leading-[1.05] tracking-tight mb-6">
          Learn stocks.<br />
          <span className="text-[#00D06C]">Made simple.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-lg font-medium">
          Short interactive lessons. A clear path from zero to confident. Designed for your phone.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <button className="bg-[#0A1128] text-white px-8 py-4 rounded-full text-[17px] font-bold hover:bg-[#1A2442] hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] w-full sm:w-auto text-center flex-shrink-0">
            Get early access
          </button>
          
          <button className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-[17px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto flex-shrink-0">
            See how it works
          </button>
        </div>
        
        <div className="mt-12 flex flex-wrap items-center gap-y-3 gap-x-6 text-[13px] font-bold text-slate-400 tracking-wide uppercase">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D06C]"></span>
            100+ Lessons
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D06C]"></span>
            10 Modules
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D06C]"></span>
            5 Min/Day
          </span>
        </div>
      </motion.div>

      {/* Right Content / Hero Visual */}
      <motion.div 
        className="flex-1 w-full max-w-md relative flex justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
      >
        <div className="absolute inset-0 bg-[#E5F9EF] rounded-full blur-[100px] opacity-60 scale-75 transform -translate-y-12"></div>
        <PhoneMockupHero />
      </motion.div>
    </section>
  );
};
