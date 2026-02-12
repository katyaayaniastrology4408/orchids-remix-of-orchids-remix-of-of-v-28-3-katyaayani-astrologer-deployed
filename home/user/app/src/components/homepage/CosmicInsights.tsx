"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Calendar, Zap, Target, Sparkles } from "lucide-react";
import { 
  GiRam, GiBull, GiLovers, GiCrab, GiLion, GiFemale, 
  GiScales, GiScorpion, GiArcher, GiCrocJaws, GiAmphora, GiDoubleFish 
} from "react-icons/gi";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/components/GoogleTranslateWidget";
import { contentData } from "@/data/homepage";

const rashiIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  aries: GiRam,
  taurus: GiBull,
  gemini: GiLovers,
  cancer: GiCrab,
  leo: GiLion,
  virgo: GiFemale,
  libra: GiScales,
  scorpio: GiScorpion,
  sagittarius: GiArcher,
  capricorn: GiCrocJaws,
  aquarius: GiAmphora,
  pisces: GiDoubleFish,
};

const zodiacData = [
  { id: "aries", color: "#FF5A28" },
  { id: "taurus", color: "#4CAF50" },
  { id: "gemini", color: "#FFC107" },
  { id: "cancer", color: "#2196F3" },
  { id: "leo", color: "#FF9800" },
  { id: "virgo", color: "#9E9E9E" },
  { id: "libra", color: "#E91E63" },
  { id: "scorpio", color: "#673AB7" },
  { id: "sagittarius", color: "#3F51B5" },
  { id: "capricorn", color: "#795548" },
  { id: "aquarius", color: "#00BCD4" },
  { id: "pisces", color: "#009688" },
];

export default function CosmicInsights() {
  const { theme } = useTheme();
  const { language } = useTranslation();
  const content = contentData[language].cosmic;
  
  const zodiacSigns = zodiacData.map(sign => ({
    ...sign,
    Icon: rashiIcons[sign.id],
    name: content.zodiacSigns[sign.id as keyof typeof content.zodiacSigns].name,
    energy: content.zodiacSigns[sign.id as keyof typeof content.zodiacSigns].energy,
    focus: content.zodiacSigns[sign.id as keyof typeof content.zodiacSigns].focus,
  }));

  const [selectedZodiac, setSelectedZodiac] = useState(zodiacSigns[0]);
  
  useEffect(() => {
    setSelectedZodiac(zodiacSigns.find(s => s.id === selectedZodiac.id) || zodiacSigns[0]);
  }, [language]);

  const [panchang, setPanchang] = useState({
    moonPhase: content.moonPhase,
    tithi: content.tithi,
    nakshatra: content.nakshatra,
    yoga: content.yoga,
    karana: content.karana,
    sunrise: (content as any).sunriseTime || "7:21 AM",
    sunset: (content as any).sunsetTime || "5:56 PM"
  });

  const [panchangApi, setPanchangApi] = useState<any>(null);

  useEffect(() => {
    const fetchPanchangData = async () => {
      try {
        const res = await fetch('/api/panchang');
        const data = await res.json();
        if (data.success) {
          setPanchangApi(data.data);
        }
      } catch (err) {
        console.error("Error fetching panchang data:", err);
      }
    };

    fetchPanchangData();
  }, []);

  useEffect(() => {
    if (panchangApi) {
      const to12h = (time24: string) => {
        const [hStr, mStr] = time24.split(':');
        let h = parseInt(hStr);
        const period = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h}:${mStr} ${period}`;
      };

      const getPanchangLabel = (item: { english: string; hindi: string; gujarati: string }) => {
        if (language === 'gu') return item.gujarati;
        if (language === 'hi') return item.hindi;
        return item.english;
      };

      const pakshaLabel = getPanchangLabel(panchangApi.paksha);

      setPanchang({
        moonPhase: pakshaLabel,
        tithi: getPanchangLabel(panchangApi.tithi),
        nakshatra: getPanchangLabel(panchangApi.nakshatra),
        yoga: getPanchangLabel(panchangApi.yoga),
        karana: getPanchangLabel(panchangApi.karana),
        sunrise: to12h(panchangApi.sunrise),
        sunset: to12h(panchangApi.sunset),
      });
    } else {
      setPanchang(prev => ({
        ...prev,
        moonPhase: content.moonPhase,
        tithi: content.tithi,
        nakshatra: content.nakshatra,
        yoga: content.yoga,
        karana: content.karana,
      }));
    }
  }, [language, content, panchangApi]);

  return (
    <section className={`py-20 px-6 overflow-hidden ${theme === 'dark' ? 'bg-[#05030a]' : 'bg-[#fffcf8]'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/5 mb-6">
            <Sparkles className="w-4 h-4 text-[#ff6b35]" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#ff6b35]">{content.badge}</span>
          </div>
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg md:text-2xl font-bold text-gradient-ancient mb-6 uppercase tracking-widest">
            {content.title}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Sacred Panchang */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6"
          >
<div className={`relative h-full p-8 md:p-10 rounded-[40px] border transition-all duration-500 overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-[#0d0d1a] border-white/5 shadow-2xl shadow-orange-500/5' 
                  : 'bg-white border-[#ff6b35]/10 shadow-xl'
              }`}>
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/10 rounded-full blur-[100px]" />
                
<div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-5 mb-12 text-center md:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                    <Calendar className="w-7 h-7 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cinzel)] text-3xl font-bold tracking-wider">{content.panchangTitle}</h3>
                    <p className="text-sm uppercase tracking-[0.3em] opacity-60 font-medium">{content.alignment}</p>
                  </div>
                </div>

              {/* Current Moon Phase Card */}
              <div className={`p-8 rounded-3xl mb-10 flex flex-col items-center justify-center text-center transition-all ${
                theme === 'dark' ? 'bg-white/5 border border-white/5 shadow-inner' : 'bg-orange-50'
              }`}>
                <div className="relative mb-6">
                  <div className="absolute inset-0 blur-2xl bg-orange-500/20 rounded-full animate-pulse" />
                  <Moon className="w-14 h-14 text-orange-400 relative z-10" />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400 font-bold mb-2">{content.moonPhaseLabel}</p>
                <h4 className="text-3xl font-bold tracking-tight">{panchang.moonPhase}</h4>
              </div>

              {/* Panchang Details */}
              <div className="space-y-5">
                <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'border-white/5 bg-white/2 hover:bg-white/5' : 'border-orange-100 hover:bg-orange-50/50'}`}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2">{content.tithiLabel}</p>
                  <p className="text-base font-semibold text-orange-400 leading-relaxed">{panchang.tithi}</p>
                </div>
                
                <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'border-white/5 bg-white/2 hover:bg-white/5' : 'border-orange-100 hover:bg-orange-50/50'}`}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2">{content.nakshatraLabel}</p>
                  <p className="text-base font-semibold text-orange-400 leading-relaxed">{panchang.nakshatra}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'border-white/5 bg-white/2 hover:bg-white/5' : 'border-orange-100 hover:bg-orange-50/50'}`}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2">{content.yogaLabel}</p>
                    <p className="text-xs font-semibold leading-relaxed">{panchang.yoga}</p>
                  </div>
                  <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'border-white/5 bg-white/2 hover:bg-white/5' : 'border-orange-100 hover:bg-orange-50/50'}`}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2">{content.karanaLabel}</p>
                    <p className="text-xs font-semibold leading-relaxed">{panchang.karana}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10 mt-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Sun className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{content.sunriseLabel}</p>
                      <p className="text-sm font-black">{panchang.sunrise}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Moon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{content.sunsetLabel}</p>
                      <p className="text-sm font-black">{panchang.sunset}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Zodiac Grid & Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 h-full"
          >
            <div className={`relative p-8 md:p-12 rounded-[32px] border h-full transition-all duration-500 ${
              theme === 'dark' 
                ? 'bg-[#0d0d1a] border-white/5 shadow-2xl' 
                : 'bg-white border-[#ff6b35]/10 shadow-xl'
            }`}>
              <div className="flex flex-col gap-12">
                {/* Zodiac Grid - Now at the top, centered */}
                <div className="max-w-2xl mx-auto w-full">
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                    {zodiacSigns.map((sign) => (
                      <motion.button
                        key={sign.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedZodiac(sign)}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-2xl md:text-3xl transition-all relative overflow-hidden group ${
                          selectedZodiac.id === sign.id
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/50'
                            : theme === 'dark'
                              ? 'bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10'
                              : 'bg-orange-50 text-orange-900/40 hover:text-orange-900/80 hover:bg-orange-100'
                        }`}
                      >
                        <sign.Icon className={`w-8 h-8 md:w-10 md:h-10 transition-transform duration-500 group-hover:scale-110 ${
                          selectedZodiac.id === sign.id ? 'text-white' : 'text-orange-500/60'
                        }`} />
                        {selectedZodiac.id === sign.id && (
                          <motion.div
                            layoutId="activeZodiac"
                            className="absolute inset-0 bg-orange-500 -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Zodiac Detail - Now below the grid, fully vertical */}
                <div className="max-w-xl mx-auto w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedZodiac.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center space-y-10"
                    >
                      {/* Header: Symbol & Name */}
                      <div className="space-y-6">
                        <div className={`w-28 h-28 mx-auto rounded-[32px] flex items-center justify-center shadow-inner transition-all duration-500 ${
                          theme === 'dark' ? 'bg-white/10' : 'bg-orange-50'
                        }`}>
                          <selectedZodiac.Icon className="w-16 h-16 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl font-bold tracking-tight uppercase">
                            {selectedZodiac.name}
                          </h3>
                          <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em]">{content.auraLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Vertical Stack: Energy and Focus */}
                      <div className="w-full space-y-6">
                        <div className={`p-8 rounded-[32px] border transition-all flex flex-col items-center justify-center ${
                          theme === 'dark' ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-orange-50/50 border-orange-100 shadow-lg'
                        }`}>
                          <div className="flex items-center gap-3 mb-4 opacity-70">
                            <Zap className="w-6 h-6 text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-[0.4em]">{content.energyLabel}</span>
                          </div>
                          <p className="text-3xl font-bold tracking-tight text-orange-400">{selectedZodiac.energy}</p>
                        </div>

                        <div className={`p-8 rounded-[32px] border transition-all flex flex-col items-center justify-center ${
                          theme === 'dark' ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-orange-50/50 border-orange-100 shadow-lg'
                        }`}>
                          <div className="flex items-center gap-3 mb-4 opacity-70">
                            <Target className="w-6 h-6 text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-[0.4em]">{content.focusLabel}</span>
                          </div>
                          <p className="text-3xl font-bold tracking-tight text-orange-400">{selectedZodiac.focus}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
