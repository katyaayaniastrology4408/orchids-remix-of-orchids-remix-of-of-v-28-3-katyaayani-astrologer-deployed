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
            ? 'તમારી જન્મ તારીખ અને સમય દાખલ કરો અને તમારી રાશિ શોધો. તમારા જન્મ ચાર્ટનું વિગતવાર વિશ્લેષણ તમારા ઈમેલ પર મોકલવામાં આવશે.' 
            : language === 'hi' 
            ? 'अपनी जन्म तिथि और समय दर्ज करें और अपनी राशि जानें। आपके जन्म चार्ट का विस्तृत विश्लेषण आपकी ईमेल पर भेजा जाएगा।' 
            : 'Enter your birth details to discover your zodiac sign. A detailed analysis of your birth chart will be sent to your email.'}
        </p>

        <Card className={`${theme === 'dark' ? 'bg-[#12121a]/80 backdrop-blur-md border-[#ff6b35]/20' : 'bg-[#fffdf9]/80 backdrop-blur-md border-[#ff6b35]/30'} p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-[#ff6b35]/10 border-t-4 border-t-[#ff6b35]`}>
          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                  {language === 'gu' ? 'જન્મ તારીખ' : language === 'hi' ? 'जन्म तिथि' : 'Date Of Birth'}
                </label>
                <Input 
                  type="date" 
                  required
                  className={`bg-transparent border-[#ff6b35]/20 focus:border-[#ff6b35] rounded-2xl h-14 px-5 text-base font-medium focus:ring-1 focus:ring-[#ff6b35]/30 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                  {language === 'gu' ? 'જન્મ સમય' : language === 'hi' ? 'जन्म समय' : 'Time Of Birth'}
                </label>
                <Input 
                  type="time" 
                  defaultValue="08:00"
                  required
                  className={`bg-transparent border-[#ff6b35]/20 focus:border-[#ff6b35] rounded-2xl h-14 px-5 text-base font-medium focus:ring-1 focus:ring-[#ff6b35]/30 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  onChange={(e) => setFormData({...formData, tob: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                {language === 'gu' ? 'જન્મ સ્થળ' : language === 'hi' ? 'जन्म स्थान' : 'Place Of Birth'}
              </label>
              <Input 
                placeholder={language === 'gu' ? 'શહેરનું નામ દાખલ કરો' : language === 'hi' ? 'शहर का नाम दर्ज करें' : 'Enter City Name'}
                required
                className={`bg-transparent border-[#ff6b35]/20 focus:border-[#ff6b35] rounded-2xl h-14 px-5 text-base font-medium focus:ring-1 focus:ring-[#ff6b35]/30 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                onChange={(e) => setFormData({...formData, pob: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] ml-1">
                {language === 'gu' ? 'ઈમેઈલ આઈડી (જરૂરી)' : language === 'hi' ? 'ईमेल आईडी (आवश्यक)' : 'Email ID (Important)'}
              </label>
              <Input 
                type="email"
                required
                placeholder="example@mail.com"
                className={`bg-transparent border-[#ff6b35]/40 focus:border-[#ff6b35] rounded-2xl h-14 px-5 text-base font-medium focus:ring-1 focus:ring-[#ff6b35]/30 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <p className="text-[10px] opacity-40 italic ml-1">
                {language === 'gu' ? '* તમારા જન્મ ચાર્ટનું વિશ્લેષણ આ ઈમેઈલ પર મોકલવામાં આવશે.' : '* A detailed analysis of your birth chart will be sent to this email.'}
              </p>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-bold py-7 rounded-[1.25rem] text-xl shadow-xl shadow-[#ff6b35]/30 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  {language === 'gu' ? 'હમણાં જ ગણો' : language === 'hi' ? 'अभी गणना करें' : 'Calculate Now'}
                </>
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-10 p-10 rounded-[2.5rem] bg-gradient-to-br from-[#ff6b35]/15 to-[#ff8c5e]/10 border-2 border-[#ff6b35]/30 text-center animate-in fade-in zoom-in duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff8c5e]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
              
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#ff6b35] mb-4">
                  {language === 'gu' ? 'તમારી રાશિ છે' : language === 'hi' ? 'आपकी राशि है' : 'Your Zodiac Sign is'}
                </p>
                <h3 className="text-5xl md:text-6xl font-[family-name:var(--font-cinzel)] font-bold text-gradient-ancient mb-6">
                  {getZodiacTranslation(result)}
                </h3>
                
                <div className="max-w-md mx-auto space-y-6">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-sm md:text-base font-medium leading-relaxed">
                      {language === 'gu' 
                          ? 'તમારા જન્મ ચાર્ટનું વિગતવાર વિશ્લેષણ તમારા ઈમેઈલ પર મોકલવામાં આવશે.' 
                          : 'A detailed analysis of your birth chart will be sent to your email.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#ff6b35]/20">
                    <p className="text-base font-bold text-[#ff6b35] mb-4">
                      {language === 'gu' 
                          ? 'વધુ વિગતો માટે કુંડળી અને મેચમેકિંગ માટે અમારો સંપર્ક કરો.' 
                          : 'For more details, contact us for Kundali & Matchmaking.'}
                    </p>
                    <a 
                      href="https://wa.me/917383636404" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5 invert" />
                      {language === 'gu' ? 'વોટ્સએપ પર પૂછો' : 'Ask on WhatsApp'}
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
