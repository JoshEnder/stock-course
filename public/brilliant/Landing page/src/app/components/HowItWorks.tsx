import { motion } from "motion/react";
import { BookOpen, Hand, Target } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Learn one concept at a time",
      desc: "No overwhelming jargon. Just bite-sized lessons that focus on the essentials you need to know today.",
      icon: BookOpen
    },
    {
      num: "02",
      title: "Interact instead of just reading",
      desc: "Active learning makes it stick. Answer questions, solve real-world scenarios, and learn by doing.",
      icon: Hand
    },
    {
      num: "03",
      title: "Build your path daily",
      desc: "Connect the dots. Follow a clear roadmap that builds your confidence and knowledge step by step.",
      icon: Target
    }
  ];

  return (
    <section className="py-24 md:py-32 px-6 max-w-6xl mx-auto w-full bg-white relative">
      <div className="absolute inset-0 bg-[#F8FAF9] rounded-[48px] -z-10"></div>
      <div className="text-center mb-16 pt-12">
        <h2 className="font-serif text-[40px] md:text-[48px] font-bold text-[#0A1128] tracking-tight mb-4">
          How it works
        </h2>
        <p className="text-lg md:text-[21px] text-slate-500 font-medium">A structured path to understanding stocks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-12">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-[#0A1128]/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="w-14 h-14 rounded-2xl bg-[#E5F9EF] text-[#00A153] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00D06C] group-hover:text-white transition-all duration-500">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-slate-300 font-serif font-bold text-4xl opacity-50 group-hover:text-[#00D06C] group-hover:opacity-20 transition-all duration-500">
                  {step.num}
                </div>
              </div>
              <h3 className="text-[22px] font-bold text-[#0A1128] mb-4 leading-tight">
                {step.title}
              </h3>
              <p className="text-[16px] text-slate-500 font-medium leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
