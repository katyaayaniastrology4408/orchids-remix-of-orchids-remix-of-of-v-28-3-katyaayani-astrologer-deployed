"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/components/GoogleTranslateWidget";

// ─── Static template data ─────────────────────────────────────────────────────

const rashiData = {
  en: {
    badge: "Daily Horoscope",
    title: "Today's Rashifal",
    subtitle: "Cosmic guidance for all 12 zodiac signs",
    rashis: [
      { name: "Aries",       symbol: "♈", color: "#ef4444", tip: "A powerful day for new beginnings. Channel your energy wisely and trust your instincts in career matters.", lucky: "Red", number: "9" },
      { name: "Taurus",      symbol: "♉", color: "#f59e0b", tip: "Financial stability is on the horizon. Avoid impulsive decisions and focus on long-term investments.", lucky: "Green", number: "6" },
      { name: "Gemini",      symbol: "♊", color: "#3b82f6", tip: "Communication brings opportunities today. Express yourself clearly and connections will flourish.", lucky: "Yellow", number: "5" },
      { name: "Cancer",      symbol: "♋", color: "#8b5cf6", tip: "Family ties strengthen today. A nurturing approach resolves old conflicts and brings harmony home.", lucky: "White", number: "2" },
      { name: "Leo",         symbol: "♌", color: "#f97316", tip: "Your confidence shines bright. Leadership roles and creative projects receive cosmic support today.", lucky: "Gold", number: "1" },
      { name: "Virgo",       symbol: "♍", color: "#10b981", tip: "Attention to detail pays off. Health improvements and work recognition arrive through diligence.", lucky: "Blue", number: "3" },
      { name: "Libra",       symbol: "♎", color: "#ec4899", tip: "Balance is your strength today. Relationships deepen and artistic pursuits bring joy and recognition.", lucky: "Pink", number: "7" },
      { name: "Scorpio",     symbol: "♏", color: "#dc2626", tip: "Hidden truths surface now. Trust your intuition and let go of what no longer serves your growth.", lucky: "Black", number: "8" },
      { name: "Sagittarius", symbol: "♐", color: "#7c3aed", tip: "Expansion and adventure call. A journey — physical or spiritual — opens new perspectives today.", lucky: "Purple", number: "3" },
      { name: "Capricorn",   symbol: "♑", color: "#6b7280", tip: "Discipline brings rewards. Career milestones are within reach — stay consistent and determined.", lucky: "Brown", number: "4" },
      { name: "Aquarius",    symbol: "♒", color: "#06b6d4", tip: "Innovation sparks today. Unconventional ideas receive support; your unique vision is your power.", lucky: "Sky Blue", number: "11" },
      { name: "Pisces",      symbol: "♓", color: "#8b5cf6", tip: "Dreams and intuition guide you. Spiritual practices and creative work flow with cosmic ease today.", lucky: "Sea Green", number: "7" },
    ]
  },
  hi: {
    badge: "दैनिक राशिफल",
    title: "आज का राशिफल",
    subtitle: "सभी 12 राशियों के लिए ब्रह्मांडीय मार्गदर्शन",
    rashis: [
      { name: "मेष",      symbol: "♈", color: "#ef4444", tip: "नई शुरुआत के लिए शक्तिशाली दिन। करियर में अपनी प्रवृत्ति पर भरोसा करें और ऊर्जा का सही उपयोग करें।", lucky: "लाल", number: "9" },
      { name: "वृषभ",    symbol: "♉", color: "#f59e0b", tip: "आर्थिक स्थिरता नज़दीक है। आवेशपूर्ण निर्णयों से बचें और दीर्घकालिक निवेश पर ध्यान दें।", lucky: "हरा", number: "6" },
      { name: "मिथुन",   symbol: "♊", color: "#3b82f6", tip: "संवाद से अवसर मिलते हैं। आज स्पष्ट रूप से व्यक्त करें, संबंध प्रगाढ़ होंगे।", lucky: "पीला", number: "5" },
      { name: "कर्क",    symbol: "♋", color: "#8b5cf6", tip: "पारिवारिक बंधन मज़बूत होते हैं। पुराने विवाद सुलझते हैं और घर में सुकून आता है।", lucky: "सफेद", number: "2" },
      { name: "सिंह",    symbol: "♌", color: "#f97316", tip: "आत्मविश्वास चमकता है। नेतृत्व और रचनात्मक कार्यों को आज ब्रह्मांडीय समर्थन मिलता है।", lucky: "सोना", number: "1" },
      { name: "कन्या",   symbol: "♍", color: "#10b981", tip: "विस्तार पर ध्यान देने से फल मिलता है। स्वास्थ्य सुधार और कार्यस्थल पर मान्यता मिलती है।", lucky: "नीला", number: "3" },
      { name: "तुला",    symbol: "♎", color: "#ec4899", tip: "संतुलन आपकी शक्ति है। संबंध गहरे होते हैं और कलात्मक प्रयास खुशी लाते हैं।", lucky: "गुलाबी", number: "7" },
      { name: "वृश्चिक", symbol: "♏", color: "#dc2626", tip: "छुपे सत्य सामने आते हैं। अपनी अंतरात्मा पर भरोसा करें और जो आगे न बढ़ाए उसे छोड़ें।", lucky: "काला", number: "8" },
      { name: "धनु",     symbol: "♐", color: "#7c3aed", tip: "विस्तार और रोमांच बुलाता है। शारीरिक या आध्यात्मिक यात्रा नए दृष्टिकोण खोलती है।", lucky: "बैंगनी", number: "3" },
      { name: "मकर",     symbol: "♑", color: "#6b7280", tip: "अनुशासन से पुरस्कार मिलते हैं। करियर में मील का पत्थर पहुंच के भीतर है।", lucky: "भूरा", number: "4" },
      { name: "कुंभ",    symbol: "♒", color: "#06b6d4", tip: "नवाचार जागता है। अपरंपरागत विचारों को समर्थन मिलता है; आपकी अनूठी दृष्टि शक्ति है।", lucky: "आसमानी", number: "11" },
      { name: "मीन",     symbol: "♓", color: "#8b5cf6", tip: "सपने और अंतर्ज्ञान मार्गदर्शन करते हैं। आध्यात्मिक अभ्यास और रचनात्मक कार्य आसानी से चलते हैं।", lucky: "समुद्री हरा", number: "7" },
    ]
  },
  gu: {
    badge: "દૈનિક રાશિફળ",
    title: "આજનું રાશિફળ",
    subtitle: "12 રાશિઓ માટે કોસ્મિક માર્ગદર્શન",
    rashis: [
      { name: "મેષ",     symbol: "♈", color: "#ef4444", tip: "નવી શરૂઆત માટે શક્તિશાળી દિવસ. કારકિર્દીમાં તમારી સૂઝ પર ભરોસો રાખો.", lucky: "લાલ", number: "9" },
      { name: "વૃષભ",   symbol: "♉", color: "#f59e0b", tip: "આર્થિક સ્થિરતા નજીક છે. આવેગપૂર્ણ નિર્ણયો ટાળો અને લાંબા ગાળાના રોકાણ પર ધ્યાન આપો.", lucky: "લીલો", number: "6" },
      { name: "મિથુન",  symbol: "♊", color: "#3b82f6", tip: "સંચાર તકો લાવે છે. આજે સ્પષ્ટ રીતે વ્યક્ત થાઓ, સંબંધો ફૂલે-ફળે.", lucky: "પીળો", number: "5" },
      { name: "કર્ક",   symbol: "♋", color: "#8b5cf6", tip: "પારિવારિક સ્નેહ ગાઢ થાય છે. જૂના ઝઘડા ઉકેલાય છે અને ઘરમાં સૌહાર્દ આવે છે.", lucky: "સફેદ", number: "2" },
      { name: "સિંહ",   symbol: "♌", color: "#f97316", tip: "આત્મવિશ્વાસ ચમકે છે. નેતૃત્વ અને સર્જનાત્મક કાર્યોને આજે કોસ્મિક સહાય મળે છે.", lucky: "સોનેરી", number: "1" },
      { name: "કન્યા",  symbol: "♍", color: "#10b981", tip: "વિગત પર ધ્યાન આપવાથી ફળ મળે છે. સ્વાસ્થ્ય સુધાર અને કાર્યસ્થળ પર માન્યતા આવે છે.", lucky: "વાદળી", number: "3" },
      { name: "તુલા",   symbol: "♎", color: "#ec4899", tip: "સંતુલન તમારી શક્તિ છે. સંબંધો ઊંડા થાય છે અને કલાત્મક પ્રયાસ ખુશી લાવે છે.", lucky: "ગુલાબી", number: "7" },
      { name: "વૃશ્ચિક", symbol: "♏", color: "#dc2626", tip: "છૂપા સત્ય સામે આવે છે. અંતઃકરણ પર ભરોસો રાખો અને જે આગળ ન વધારે તે છોડો.", lucky: "કાળો", number: "8" },
      { name: "ધનુ",    symbol: "♐", color: "#7c3aed", tip: "વિસ્તાર અને સાહસ બોલાવે છે. શારીરિક અથવા આધ્યાત્મિક યાત્રા નવા દ્રષ્ટિકોણ ખોલે છે.", lucky: "જાંબુડિયો", number: "3" },
      { name: "મકર",    symbol: "♑", color: "#6b7280", tip: "શિસ્ત પ્રતિફળ આપે છે. કારકિર્દીનો મોટો સીમાચિહ્ન પહોંચ ભીતર છે.", lucky: "ભૂરો", number: "4" },
      { name: "કુંભ",   symbol: "♒", color: "#06b6d4", tip: "નવીનતા જાગે છે. બિન-પ્રચલિત વિચારોને સહાય મળે છે; તમારી અનોખી દ્રષ્ટિ તાકાત છે.", lucky: "આકાશી", number: "11" },
      { name: "મીન",    symbol: "♓", color: "#8b5cf6", tip: "સ્વપ્ન અને અંતઃપ્રેરણા માર્ગ ચીંધે છે. આધ્યાત્મિક અભ્યાસ અને સર્જનાત્મક કાર્ય સહેલાઈથી ચાલે છે.", lucky: "દરિયાઈ લીલો", number: "7" },
    ]
  }
};

type Rashi = { name: string; symbol: string; color: string; tip: string; lucky: string; number: string };
// lucky and number kept in data but not rendered in UI

function RashiModal({ rashi, isDark, onClose }: { rashi: Rashi; isDark: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl shadow-2xl p-6 ${
          isDark ? "bg-[#0d0b1a] border border-white/10" : "bg-white border border-orange-100"
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? "bg-white/5 hover:bg-white/10 text-white/60" : "bg-black/5 hover:bg-black/10 text-black/50"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Symbol */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4"
          style={{ background: rashi.color + "20", color: rashi.color }}
        >
          {rashi.symbol}
        </div>

        {/* Name */}
          <h3
            className="text-center text-xl font-bold font-[family-name:var(--font-cinzel)] mb-5"
            style={{ color: rashi.color }}
          >
            {rashi.name}
          </h3>

          {/* Divider */}
          <div className="h-px mb-5" style={{ background: rashi.color + "30" }} />

          {/* Tip */}
          <p className={`text-sm leading-relaxed text-center ${isDark ? "text-white/70" : "text-black/60"}`}>
            {rashi.tip}
          </p>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function RashifalSection() {
  const { theme } = useTheme();
  const { language } = useTranslation();
  const isDark = theme === "dark";

  const lang = (language as "en" | "hi" | "gu") in rashiData ? (language as "en" | "hi" | "gu") : "en";
  const content = rashiData[lang];

  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className={`py-20 px-6 ${isDark ? "bg-[#07040e]" : "bg-[#fffaf4]"}`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/5 mb-5">
            <Sparkles className="w-4 h-4 text-[#ff6b35]" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#ff6b35]">
              {content.badge}
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl md:text-3xl font-bold text-gradient-ancient uppercase tracking-widest mb-3">
            {content.title}
          </h2>
          <p className={`text-sm ${isDark ? "text-white/50" : "text-black/40"}`}>
            {content.subtitle}
          </p>
        </div>

        {/* 12 Rashi Grid — click opens popup */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {content.rashis.map((rashi, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`rounded-2xl border p-4 flex items-center gap-3 text-left transition-all duration-200 w-full group ${
                isDark
                  ? "bg-[#0d0b1a] border-white/5 hover:border-white/20 hover:bg-white/5"
                  : "bg-white border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: rashi.color + "20", color: rashi.color }}
              >
                {rashi.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isDark ? "text-white/90" : "text-black/80"}`}>
                  {rashi.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      {selected !== null && (
        <RashiModal
          rashi={content.rashis[selected]}
          isDark={isDark}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
