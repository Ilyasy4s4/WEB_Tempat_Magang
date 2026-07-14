import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fading out at 2.2 seconds
    const fadeTimeout = setTimeout(() => {
      setFade(true);
    }, 2200);

    // Call onFinish at 2.6 seconds
    const finishTimeout = setTimeout(() => {
      onFinish();
    }, 2600);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(finishTimeout);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 bg-[#0f172a] z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
        fade ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        {/* Glowing logo container */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#3b82f6]/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 relative z-10 animate-bounce-slow">
            <GraduationCap className="h-16 w-16 text-[#3b82f6]" />
          </div>
        </div>

        {/* Branding text */}
        <div className="flex items-center mt-2">
          <span className="text-4xl lg:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#3b82f6] animate-pulse">
            TegangKu
          </span>
        </div>

        {/* Loading Indicator */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 bg-[#3b82f6] rounded-full animate-loading-bar w-1/2"></div>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse mt-1 font-bold">
            Memuat Portal Karir
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
