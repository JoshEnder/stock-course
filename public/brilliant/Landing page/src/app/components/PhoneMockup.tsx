import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, BarChart3, TrendingUp, BookOpen, User, Flame, ArrowUpRight, Lock } from "lucide-react";

export const PhoneMockupHero = () => {
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-[9/19] bg-white rounded-[40px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(0,0,0,0.05)] border-[8px] border-white overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-6 bg-white flex justify-center z-20">
        <div className="w-32 h-6 bg-[#F8FAF9] rounded-b-3xl"></div>
      </div>
      <div className="h-full w-full bg-[#F8FAF9] pt-12 pb-8 px-5 flex flex-col relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center justify-between mb-8 z-10">
          <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
             <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex gap-1.5 items-center bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-slate-100 text-xs font-bold text-[#00D06C] tracking-wide">
            <Flame className="w-4 h-4 fill-current" />
            <span>12 DAY STREAK</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 relative flex flex-col items-center">
           <div className="relative w-full flex-1 mt-4">
             <div className="absolute left-1/2 top-4 bottom-24 w-1.5 -ml-[3px] bg-slate-200/60 z-0 rounded-full"></div>
             <div className="relative z-10 w-full flex flex-col gap-10 items-center">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-[#00D06C]/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-20 h-20 rounded-full bg-[#00D06C] shadow-[0_8px_20px_-6px_rgba(0,208,108,0.6)] flex items-center justify-center border-[5px] border-[#F8FAF9] transition-transform group-hover:scale-105 relative z-10">
                     <BookOpen className="text-white w-8 h-8" />
                  </div>
                  <div className="absolute -right-1 -top-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border-[2px] border-[#F8FAF9] z-20">
                    <CheckCircle2 className="w-5 h-5 text-[#00D06C]" />
                  </div>
                  <div className="absolute top-full mt-3 w-max left-1/2 -translate-x-1/2 text-center">
                    <p className="text-[14px] font-bold text-[#0A1128] tracking-wide">The Basics</p>
                  </div>
                </div>

                <div className="relative ml-16 mt-2 group cursor-pointer">
                  <div className="w-[72px] h-[72px] rounded-full bg-white border-[5px] border-[#F8FAF9] shadow-sm flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 z-10 ring-1 ring-slate-200">
                     <div className="absolute inset-0 bg-[#00D06C]/10 origin-bottom scale-y-[0.3]"></div>
                     <TrendingUp className="text-[#00D06C] w-7 h-7 relative z-10" />
                  </div>
                  <div className="absolute top-full mt-3 w-max left-1/2 -translate-x-1/2 text-center">
                    <p className="text-[14px] font-bold text-slate-400 tracking-wide">Growth</p>
                  </div>
                </div>

                <div className="relative -ml-16 mt-2 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border-[4px] border-[#F8FAF9] shadow-inner flex items-center justify-center ring-1 ring-slate-200/50">
                     <Lock className="text-slate-400 w-5 h-5" />
                  </div>
                </div>
             </div>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="absolute bottom-6 left-5 right-5 z-20">
          <button className="w-full bg-[#0A1128] text-white py-4 rounded-[20px] font-bold text-[17px] shadow-lg flex items-center justify-center gap-2 hover:bg-[#1A2442] transition-colors active:scale-95">
            Continue learning
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export const PhoneMockupLesson = () => {
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-[9/19] bg-white rounded-[40px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(0,0,0,0.05)] border-[8px] border-white overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-6 bg-white flex justify-center z-20">
        <div className="w-32 h-6 bg-white border-b border-slate-100 rounded-b-3xl"></div>
      </div>
      <div className="h-full w-full bg-white pt-12 pb-8 px-5 flex flex-col relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-8">
           <div className="flex-1 h-2.5 bg-[#F8FAF9] rounded-full overflow-hidden shadow-inner">
              <div className="w-2/3 h-full bg-[#00D06C] rounded-full relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
              </div>
           </div>
           <span className="text-[13px] font-bold text-slate-400">4/6</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-[24px] font-serif font-bold text-[#0A1128] mb-4 leading-tight">
            What is an ETF?
          </h3>
          <p className="text-[15px] text-slate-600 mb-10 leading-relaxed font-medium">
            Think of it like a basket. Instead of buying one stock, you buy a basket that holds pieces of many companies.
          </p>

          <div className="space-y-3 mt-auto">
            <button className="w-full p-4 rounded-[16px] border-2 border-[#F8FAF9] text-left hover:border-slate-200 transition-colors bg-white shadow-sm">
              <span className="text-[15px] font-semibold text-slate-600">A single company's stock</span>
            </button>
            <button className="w-full p-4 rounded-[16px] border-2 border-[#00D06C] bg-[#E5F9EF]/50 text-left relative shadow-[0_4px_12px_-4px_rgba(0,208,108,0.2)]">
              <span className="text-[15px] font-semibold text-[#0A1128]">A basket of many stocks</span>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#00D06C] rounded-full flex items-center justify-center shadow-sm">
                 <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </button>
            <button className="w-full p-4 rounded-[16px] border-2 border-[#F8FAF9] text-left hover:border-slate-200 transition-colors bg-white shadow-sm">
              <span className="text-[15px] font-semibold text-slate-600">A government bond</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
           <button className="w-full bg-[#00D06C] text-white py-4 rounded-[20px] font-bold text-[17px] flex items-center justify-center gap-2 hover:bg-[#00B85E] transition-colors active:scale-95 shadow-[0_8px_20px_-6px_rgba(0,208,108,0.5)]">
             Check Answer
           </button>
        </div>
      </div>
    </div>
  );
};

export const PhoneMockupProfile = () => {
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-[9/19] bg-white rounded-[40px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(0,0,0,0.05)] border-[8px] border-white overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-6 bg-white flex justify-center z-20">
        <div className="w-32 h-6 bg-[#F8FAF9] rounded-b-3xl"></div>
      </div>
      <div className="h-full w-full bg-[#F8FAF9] pt-14 pb-8 px-5 flex flex-col relative overflow-hidden">
        
        <div className="flex flex-col items-center mb-8">
           <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00D06C] to-emerald-200 p-[3px] mb-4 shadow-sm relative group">
              <div className="absolute inset-0 bg-[#00D06C] blur-md opacity-20 scale-110"></div>
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-[3px] border-white relative z-10 overflow-hidden">
                <span className="text-[32px] font-serif text-[#0A1128] font-bold">JD</span>
              </div>
           </div>
           <h3 className="text-[20px] font-bold text-[#0A1128] tracking-tight">John Doe</h3>
           <p className="text-[14px] font-medium text-slate-500 mt-0.5">Beginner Investor</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1 hover:shadow-md transition-shadow">
              <Flame className="w-6 h-6 text-[#00D06C] mb-1" />
              <span className="text-[28px] font-bold text-[#0A1128] leading-none">12</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Day Streak</span>
           </div>
           <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1 hover:shadow-md transition-shadow">
              <CheckCircle2 className="w-6 h-6 text-[#0A1128] mb-1" />
              <span className="text-[28px] font-bold text-[#0A1128] leading-none">45</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Lessons</span>
           </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 mb-auto flex-1">
           <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-5">Recent Badges</h4>
           <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center shadow-sm">
                 <ArrowUpRight className="w-5 h-5 text-amber-500" />
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200/50 flex items-center justify-center shadow-sm">
                 <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div className="w-12 h-12 rounded-full bg-[#F8FAF9] border-[2px] border-slate-100 border-dashed flex items-center justify-center">
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
