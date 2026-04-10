import logo from 'figma:asset/1c45f40a27beb735d1abf761e649b78f447f17f7.png';

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:py-6 max-w-6xl mx-auto w-full z-10 relative">
      <div className="flex items-center h-7 md:h-8">
        <img src={logo} alt="Stoked Logo" className="h-full object-contain" />
      </div>
      <div className="flex items-center gap-5 md:gap-8">
        <button className="hidden sm:block text-[14px] md:text-[15px] font-semibold text-slate-500 hover:text-[#0A1128] transition-colors">
          Sign in
        </button>
        <button className="bg-[#0A1128] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full text-[14px] md:text-[15px] font-semibold hover:bg-[#1A2442] transition-colors shadow-md shadow-slate-900/10">
          Get early access
        </button>
      </div>
    </header>
  );
};
