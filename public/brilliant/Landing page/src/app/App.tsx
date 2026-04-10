import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { ProductPreview } from "./components/ProductPreview";
import { WhyStoked } from "./components/WhyStoked";
import { FinalCTA } from "./components/FinalCTA";

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#00D06C]/20 selection:text-[#0A1128] overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ProductPreview />
        <WhyStoked />
        <FinalCTA />
      </main>
      <footer className="py-8 md:py-12 px-6 border-t border-slate-100 text-center text-[14px] font-medium text-slate-400 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between">
         <p>© {new Date().getFullYear()} Stoked. All rights reserved.</p>
         <div className="flex gap-6 mt-4 md:mt-0 font-semibold uppercase tracking-wider text-[12px]">
           <a href="#" className="hover:text-[#0A1128] transition-colors">Privacy</a>
           <a href="#" className="hover:text-[#0A1128] transition-colors">Terms</a>
           <a href="#" className="hover:text-[#0A1128] transition-colors">Contact</a>
         </div>
      </footer>
    </div>
  );
}
