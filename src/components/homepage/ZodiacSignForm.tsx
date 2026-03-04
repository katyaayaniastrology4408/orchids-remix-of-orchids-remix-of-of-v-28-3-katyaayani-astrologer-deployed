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

    // Western Sun Signs
    const signs = [
      { name: "Capricorn", start: [12, 22], end: [1, 19] },
      { name: "Aquarius", start: [1, 20], end: [2, 18] },
      { name: "Pisces", start: [2, 19], end: [3, 20] },
      { name: "Aries", start: [3, 21], end: [4, 19] },
      { name: "Taurus", start: [4, 20], end: [5, 20] },
      { name: "Gemini", start: [5, 21], end: [6, 20] },
      { name: "Cancer", start: [6, 21], end: [7, 22] },
      { name: "Leo", start: [7, 23], end: [8, 22] },
      { name: "Virgo", start: [8, 23], end: [9, 22] },
      { name: "Libra", start: [9, 23], end: [10, 22] },
      { name: "Scorpio", start: [10, 23], end: [11, 21] },
      { name: "Sagittarius", start: [11, 22], end: [12, 21] }
    ];

    const sign = signs.find(s => {
      const [sm, sd] = s.start;
      const [em, ed] = s.end;
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
            ? 'તમારી જન્મ તારીખ અને સમય દાખલ કરો અને તમારી રાશિ શોધો. તમારી કુંડળી વિશે વધુ જાણવા માટે તમારો ઈમેઈલ આઈડી આપો.' 
            : language === 'hi' 
            ? 'अपनी जन्म तिथि और समय दर्ज करें और अपनी राशि जानें। अपनी कुंडली के बारे में अधिक जानने के लिए अपनी ईमेल आईडी प्रदान करें।' 
            : 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etesde dolore magna aliquapspendisse and the gravida.'}
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
                  {language === 'gu' ? 'જન્મ સમય' : language === 'hi' ? 'જન્મ સમય' : 'Time Of Birth'}
                </label>
                <Input 
                  type="time" 
                  defaultValue="08:00"
                  className={`bg-transparent border-[#ff6b35]/20 focus:border-[#ff6b35] rounded-2xl h-14 px-5 text-base font-medium focus:ring-1 focus:ring-[#ff6b35]/30 transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  onChange={(e) => setFormData({...formData, tob: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                {language === 'gu' ? 'જન્મ સ્થળ' : language === 'hi' ? 'જન્મ સ્થાન' : 'Place Of Birth'}
              </label>
              <Input 
                placeholder={language === 'gu' ? 'શહેરનું નામ દાખલ કરો' : language === 'hi' ? 'शहर का नाम दर्ज करें' : 'Enter City Name'}
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
            <div className="mt-10 p-8 rounded-[2rem] bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c5e]/5 border border-[#ff6b35]/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#ff6b35] mb-2">
                {language === 'gu' ? 'તમારી રાશિ છે' : language === 'hi' ? 'आपकी राशि है' : 'Your Zodiac Sign is'}
              </p>
              <h3 className="text-4xl md:text-5xl font-[family-name:var(--font-cinzel)] font-bold text-gradient-ancient">
                {getZodiacTranslation(result)}
              </h3>
              <div className="w-12 h-1 bg-[#ff6b35]/30 mx-auto my-4 rounded-full" />
              <p className="text-xs opacity-60 font-medium">
                {language === 'gu' 
                    ? 'તમારી કુંડળીનું વિગતવાર વિશ્લેષણ તમારા ઈમેઈલ પર મોકલવામાં આવશે.' 
                    : 'A detailed analysis of your birth chart will be sent to your email.'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
