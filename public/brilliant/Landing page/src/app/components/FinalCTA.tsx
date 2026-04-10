import { Play } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section className="py-24 md:py-40 px-6 max-w-4xl mx-auto w-full text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-[#E5F9EF] rounded-full blur-[120px] opacity-40 -z-10 pointer-events-none"></div>
      
      <h2 className="font-serif text-[48px] md:text-6xl lg:text-[72px] font-bold text-[#0A1128] tracking-tight mb-6 leading-[1.05]">
        Start learning stocks<br />
        <span className="text-[#00D06C]">the simple way.</span>
      </h2>
      <p className="text-xl md:text-[21px] text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
        Join thousands of beginners getting early access to the easiest way to understand the stock market.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg mx-auto bg-white p-2 rounded-[32px] sm:rounded-full border border-slate-200 shadow-xl shadow-slate-900/5 relative z-10">
        <input 
          type="email" 
          placeholder="Enter your email address" 
          className="w-full h-14 px-6 rounded-full bg-transparent outline-none text-lg text-[#0A1128] placeholder-slate-400 font-medium"
        />
        <button className="w-full sm:w-auto shrink-0 bg-[#0A1128] text-white px-8 h-14 rounded-full text-[16px] font-bold hover:bg-[#1A2442] hover:-translate-y-[1px] transition-all shadow-md active:scale-[0.98]">
          Get early access
        </button>
      </div>
      <p className="text-[14px] text-slate-400 mt-6 font-semibold uppercase tracking-wider">Free at launch • No credit card required</p>
    </section>
  );
};
