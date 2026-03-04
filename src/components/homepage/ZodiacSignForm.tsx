"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/components/GoogleTranslateWidget";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";

export default function ZodiacSignForm() {
  const { theme } = useTheme();
  const { language } = useTranslation();
  const [formData, setFormData] = useState({
    dob: "",
    tob: "08:00 AM",
    pob: "",
    email: ""
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

    const calculateZodiac = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.getMonth() + 1;

      // Vedic Sun Signs (Nirayana - Surya Rashi) - Approximate dates
      const signs = [
        { name: "Capricorn", start: [1, 14], end: [2, 12] },
        { name: "Aquarius", start: [2, 13], end: [3, 13] },
        { name: "Pisces", start: [3, 14], end: [4, 13] },
        { name: "Aries", start: [4, 14], end: [5, 14] },
        { name: "Taurus", start: [5, 15], end: [6, 14] },
        { name: "Gemini", start: [6, 15], end: [7, 15] },
        { name: "Cancer", start: [7, 16], end: [8, 16] },
        { name: "Leo", start: [8, 17], end: [9, 16] },
        { name: "Virgo", start: [9, 17], end: [10, 16] },
        { name: "Libra", start: [10, 17], end: [11, 15] },
        { name: "Scorpio", start: [11, 16], end: [12, 15] },
        { name: "Sagittarius", start: [12, 16], end: [1, 13] }
      ];

      const sign = signs.find(s => {
        const [sm, sd] = s.start;
        const [em, ed] = s.end;
        if (sm === 12 && em === 1) { // Sagittarius to Capricorn transition
            return (month === 12 && day >= sd) || (month === 1 && day <= ed);
        }
        return (month === sm && day >= sd) || (month === em && day <= ed);
      });

      return sign ? sign.name : "Capricorn";
    };


  const getZodiacTranslation = (sign: string) => {
    const translations: Record<string, { gu: string, hi: string }> = {
      "Aries": { gu: "મેષ", hi: "मेष" },
      "Taurus": { gu: "વૃષભ", hi: "वृषभ" },
      "Gemini": { gu: "મિથુન", hi: "मिथुन" },
      "Cancer": { gu: "કર્ક", hi: "કર્ક" },
      "Leo": { gu: "સિંહ", hi: "सिंह" },
      "Virgo": { gu: "કન્યા", hi: "कन्या" },
      "Libra": { gu: "તુલા", hi: "તુલા" },
      "Scorpio": { gu: "વૃશ્ચિક", hi: "वृश्चिक" },
      "Sagittarius": { gu: "ધનુ", hi: "ધનુ" },
      "Capricorn": { gu: "મકર", hi: "મકર" },
      "Aquarius": { gu: "કુંભ", hi: "कुंभ" },
      "Pisces": { gu: "મીન", hi: "मीन" }
    };
    if (language === 'gu') return translations[sign]?.gu || sign;
    if (language === 'hi') return translations[sign]?.hi || sign;
    return sign;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sign = calculateZodiac(formData.dob);
    setResult(sign);
    
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Zodiac Checker User",
          email: formData.email,
          subject: "Know Your Zodiac Sign Lead",
          message: `User checked zodiac sign.\nDOB: ${formData.dob}\nTOB: ${formData.tob}\nPOB: ${formData.pob}\nResult: ${sign}`
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`py-24 px-6 relative overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#fdfbf7]'}`}>
      {/* Astrological Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 border border-[#ff6b35] rounded-full" />
        <div className="absolute top-20 left-20 w-72 h-72 border border-[#ff6b35] rounded-full" />
        <div className="absolute top-40 left-40 w-32 h-32 border border-[#ff6b35] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-[#ff6b35] rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#ff6b35] rounded-full animate-spin-slow" />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[#ff6b35]/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#ff6b35]/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-[#ff6b35]" />
          </div>
        </div>
        
        <h2 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl font-bold mb-6 text-gradient-ancient leading-tight">
          {language === 'gu' ? 'તમારી રાશિ જાણો' : language === 'hi' ? 'अपनी राशि जानें' : 'Know Your Zodiac Sign'}
        </h2>
        <p className={`mb-12 text-lg leading-relaxed opacity-80 ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>
          {language === 'gu' 
            ? 'તમારી જન્મ તારીખ અને સમય દાખલ કરો અને તમારી રાશિ શોધો.' 
            : language === 'hi' 
            ? 'अपनी जन्म तिथि और समय दर्ज करें और अपनी राशि जानें।' 
            : 'Enter your birth details to discover your zodiac sign.'}
        </p>

          <Card className={`${theme === 'dark' ? 'bg-[#12121a]/80 backdrop-blur-md border-[#ff6b35]/20' : 'bg-[#fffdf9]/80 backdrop-blur-md border-[#ff6b35]/30'} p-8 md:p-12 rounded-[3rem] shadow-[0_25px_60px_rgba(255,107,53,0.15)] border-t-4 border-t-[#ff6b35] transition-all duration-500`}>
            <form onSubmit={handleSubmit} className="space-y-10 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35] ml-1">
                    {language === 'gu' ? 'જન્મ તારીખ' : language === 'hi' ? 'जन्म तिथि' : 'Date Of Birth'}
                  </label>
                  <Input 
                    type="date" 
                    required
                    className={`bg-transparent border-[#ff6b35]/30 focus:border-[#ff6b35] rounded-2xl h-16 px-6 text-base font-bold focus:ring-2 focus:ring-[#ff6b35]/20 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35] ml-1">
                    {language === 'gu' ? 'જન્મ સમય' : language === 'hi' ? 'जन्म समय' : 'Time Of Birth'}
                  </label>
                  <Input 
                    type="time" 
                    defaultValue="08:00"
                    required
                    className={`bg-transparent border-[#ff6b35]/30 focus:border-[#ff6b35] rounded-2xl h-16 px-6 text-base font-bold focus:ring-2 focus:ring-[#ff6b35]/20 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    onChange={(e) => setFormData({...formData, tob: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35] ml-1">
                  {language === 'gu' ? 'જન્મ સ્થળ' : language === 'hi' ? 'जन्म स्थान' : 'Place Of Birth'}
                </label>
                <Input 
                  placeholder={language === 'gu' ? 'શહેરનું નામ દાખલ કરો' : language === 'hi' ? 'शहर का नाम दर्ज करें' : 'Enter City Name'}
                  required
                  className={`bg-transparent border-[#ff6b35]/30 focus:border-[#ff6b35] rounded-2xl h-16 px-6 text-base font-bold focus:ring-2 focus:ring-[#ff6b35]/20 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  onChange={(e) => setFormData({...formData, pob: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35] ml-1">
                  {language === 'gu' ? 'ઈમેઈલ આઈડી (જરૂરી)' : language === 'hi' ? 'ईमेल आईडी (आवश्यक)' : 'Email ID (Important)'}
                </label>
                  <Input 
                    type="email"
                    required
                    placeholder="example@mail.com"
                    className={`bg-transparent border-[#ff6b35]/40 focus:border-[#ff6b35] rounded-2xl h-16 px-6 text-base font-bold focus:ring-2 focus:ring-[#ff6b35]/20 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-black py-8 rounded-[1.5rem] text-2xl shadow-[0_15px_30px_rgba(255,107,53,0.3)] active:scale-[0.98] transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>CALCULATING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 tracking-[0.1em]">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                    {language === 'gu' ? 'હમણાં જ ગણો' : language === 'hi' ? 'अभी गणना करें' : 'CALCULATE NOW'}
                  </div>
                )}
              </Button>
            </form>

            {result && (
              <div className="mt-12 p-10 md:p-12 rounded-[3rem] bg-gradient-to-br from-[#ff6b35]/20 via-[#ff8c5e]/10 to-transparent border-2 border-[#ff6b35]/40 text-center animate-in fade-in zoom-in duration-1000 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6b35]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ff8c5e]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl animate-pulse" />
                
                    <div className="relative z-10">
                      <p className="text-xs uppercase tracking-[0.4em] font-black text-[#ff6b35] mb-6">
                        {language === 'gu' ? 'તમારી સૂર્ય રાશિ (Surya Rashi) છે' : language === 'hi' ? 'आपकी सूर्य राशि है' : 'YOUR SUN SIGN (SURYA RASHI)'}
                      </p>
                      <h3 className="text-6xl md:text-8xl font-[family-name:var(--font-cinzel)] font-black text-gradient-ancient mb-8 drop-shadow-sm">
                        {getZodiacTranslation(result)}
                      </h3>
                      
                      <div className="max-w-md mx-auto space-y-8">
                        <div className="p-7 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl ring-1 ring-[#ff6b35]/20 transition-all hover:scale-[1.02] duration-300">
                          <p className="text-[11px] uppercase tracking-[0.25em] font-black text-[#ff6b35] mb-3">
                            {language === 'gu' ? 'નામ પાડવા માટે (ચંદ્ર રાશિ)' : 'FOR NAMING (CHANDRA RASHI)'}
                          </p>
                          <p className="text-base md:text-lg font-bold leading-relaxed opacity-90">
                            {language === 'gu' 
                                ? 'નામ પાડવા અને સચોટ ભવિષ્ય માટે જન્મની "ચંદ્ર રાશિ" (Janma Rashi) જાણવી અનિવાર્ય છે. સચોટ કુંડળી વિશ્લેષણ માટે અત્યારે જ સંપર્ક કરો.' 
                                : 'For naming and accurate predictions, knowing your "Chandra Rashi" (Moon Sign) is essential. Contact now for precise Kundali analysis.'}
                          </p>
                        </div>
    
                        <div className="pt-8 border-t-2 border-[#ff6b35]/10">
                          <p className="text-lg md:text-xl font-black text-[#ff6b35] mb-6 tracking-tight">
                            {language === 'gu' 
                                ? 'ચંદ્ર રાશિ અને કુંડળી માટે અત્યારે જ પૂછો.' 
                                : 'Ask for Chandra Rashi & Kundali now.'}
                          </p>
                          <a 
                            href={`https://wa.me/919824929588?text=${encodeURIComponent(`Namaste, I want to know my accurate Janma Rashi (Chandra Rashi) for naming/horoscope.\n\nDetails:\nDOB: ${formData.dob}\nTOB: ${formData.tob}\nPOB: ${formData.pob}`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-black px-10 py-5 rounded-3xl transition-all shadow-[0_20px_40px_rgba(37,211,102,0.4)] active:scale-95 group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-7 h-7 invert relative z-10 animate-bounce-slow" />
                            <span className="text-lg relative z-10 tracking-wider">{language === 'gu' ? 'વોટ્સએપ પર પૂછો' : 'ASK ON WHATSAPP'}</span>
                          </a>
                        </div>
                      </div>
                    </div>
              </div>
            )}

        </Card>

      </div>
    </section>
  );
}
