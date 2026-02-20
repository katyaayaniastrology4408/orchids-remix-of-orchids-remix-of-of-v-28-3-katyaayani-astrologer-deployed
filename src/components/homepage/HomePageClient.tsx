"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Star, Moon, Sun, Sparkles, Home, Video, ChevronRight, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/components/GoogleTranslateWidget";
import Navbar from "@/components/homepage/Navbar";
const Footer = dynamic(() => import("@/components/homepage/Footer"), { ssr: false });
const CosmicInsights = dynamic(() => import("@/components/homepage/CosmicInsights"), { ssr: false });
const StarField = dynamic(() => import("@/components/homepage/StarField"), { ssr: false });
import { testimonialsData, contentData } from "@/data/homepage";
import "@/styles/homepage.css";

export default function HomePageClient() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { language } = useTranslation();
  const { user, showAuthModal, showEnquiryModal } = useAuth();
  const [panchangTimes, setPanchangTimes] = useState({ sunrise: "--", sunset: "--" });
  const [panchangApiData, setPanchangApiData] = useState<any>(null);
  const [hinduCalendar, setHinduCalendar] = useState({ month: "--", tithi: "--", vaara: "--", paksha: "--" });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [dbReviews, setDbReviews] = useState<{ name: string; text: string; rating: number }[]>([]);

  useEffect(() => {
    setMounted(true);

    // Fetch approved DB reviews (3+ stars)
    fetch('/api/feedback?minRating=3')
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setDbReviews(json.data.map((f: any) => ({ name: f.name, text: f.comment, rating: f.rating })));
        }
      })
      .catch(() => {});
    
    let lastFetchDate = '';

    const fetchPanchangData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
          const res = await fetch(`/api/panchang?t=${today}`, { cache: 'no-store' });
          if (!res.ok) return;
          const data = await res.json();
        if (data.success) {
          lastFetchDate = today;
          setPanchangApiData(data.data);
          const to12h = (time24: string) => {
            const [hStr, mStr] = time24.split(':');
            let h = parseInt(hStr);
            const period = h >= 12 ? 'PM' : 'AM';
            if (h > 12) h -= 12;
            if (h === 0) h = 12;
            return `${h}:${mStr} ${period}`;
          };
          setPanchangTimes({
            sunrise: to12h(data.data.sunrise),
            sunset: to12h(data.data.sunset)
          });
          const getLang = (item: { english: string; hindi: string; gujarati: string }) => {
            if (language === 'gu') return item.gujarati;
            if (language === 'hi') return item.hindi;
            return item.english;
          };
          setHinduCalendar({
            month: getLang(data.data.hinduMonth),
            tithi: getLang(data.data.tithi),
            vaara: getLang(data.data.vaara),
            paksha: getLang(data.data.paksha),
          });
        }
      } catch (err) {
        console.error("Error fetching panchang:", err);
      }
    };
    fetchPanchangData();

    const intervalId = setInterval(() => {
      const now = new Date().toISOString().split('T')[0];
      if (now !== lastFetchDate) {
        fetchPanchangData();
      }
    }, 60 * 1000);
    const refreshId = setInterval(fetchPanchangData, 30 * 60 * 1000);
    return () => { clearInterval(intervalId); clearInterval(refreshId); };
  }, [language]);

  if (!mounted) {
    // Render a minimal skeleton to avoid blank screen and improve LCP
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b bg-[#f5f0e8]/95 border-[#ff6b35]/20">
          <div className="max-w-7xl mx-auto px-4 py-3 h-[64px]" />
        </nav>
        <section className="min-h-[60vh] flex items-center justify-center py-24">
          <div className="text-center px-6 max-w-4xl">
            <div className="flex justify-center gap-4 mb-6">
              <Sun className="w-12 h-12 text-[#ff6b35]" />
              <Moon className="w-12 h-12 text-[#ffa07a]" />
              <Star className="w-12 h-12 text-[#ff6b35]" />
            </div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient-ancient">
              Katyaayani Astrologer
            </h2>
          </div>
        </section>
      </div>
    );
  }

  const content = contentData[language];
  const staticTestimonials = testimonialsData[language];
  // Merge DB reviews (approved, 3-5 stars) with static ones — DB reviews appear first
  const testimonials = [...dbReviews, ...staticTestimonials];

  const handleBookClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      showAuthModal('signin');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f] text-[#f5f0e8]' : 'bg-[#fdfbf7] text-[#4a3f35]'}`}>
      <Navbar />

      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-24">
        <StarField />
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-[#2d1b4e]/30 via-transparent to-[#0a0a0f]'
            : 'bg-gradient-to-b from-[#ffecd9]/20 via-transparent to-[#fdfbf7]'
        }`} />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="fade-in-up">
            <div className="flex justify-center gap-4 mb-6">
              <Sun className="w-12 h-12 text-[#ff6b35]" />
              <Moon className="w-12 h-12 text-[#ffa07a]" />
              <Star className="w-12 h-12 text-[#ff6b35]" />
            </div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient-ancient">
              {content.heroTitle}
            </h2>
            <p className={`text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>
              {content.heroDesc}
            </p>

            <div className={`inline-flex items-center gap-6 px-6 py-3 rounded-2xl border mb-10 ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ff6b35]/5 border-[#ff6b35]/20'
            }`}>
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#ff6b35]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {language === 'gu' ? 'સૂર્યોદય' : language === 'hi' ? 'सूर्योदय' : 'SUNRISE'}
                  </p>
                  <p className="text-sm font-bold">{panchangTimes.sunrise}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#ff6b35]/20" />
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-[#ffa07a]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {language === 'gu' ? 'સૂર્યાસ્ત' : language === 'hi' ? 'सूर्यास्त' : 'SUNSET'}
                  </p>
                  <p className="text-sm font-bold">{panchangTimes.sunset}</p>
                </div>
              </div>
            </div>

            <div className={`inline-flex flex-wrap items-center justify-center gap-4 px-5 py-2.5 rounded-2xl border mb-10 ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ff6b35]/5 border-[#ff6b35]/20'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff6b35]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {language === 'gu' ? 'હિંદુ માસ' : language === 'hi' ? 'हिंदू मास' : 'HINDU MONTH'}
                  </p>
                  <p className="text-sm font-bold">{hinduCalendar.month}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#ff6b35]/20" />
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#ffa07a]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {language === 'gu' ? 'તિથિ' : language === 'hi' ? 'तिथि' : 'TITHI'}
                  </p>
                  <p className="text-sm font-bold">{hinduCalendar.tithi}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#ff6b35]/20" />
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#ff6b35]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {language === 'gu' ? 'પક્ષ' : language === 'hi' ? 'पक्ष' : 'PAKSHA'}
                  </p>
                  <p className="text-sm font-bold">{hinduCalendar.paksha}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#ff6b35]/20" />
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#ffa07a]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {language === 'gu' ? 'વાર' : language === 'hi' ? 'वार' : 'DAY'}
                  </p>
                  <p className="text-sm font-bold">{hinduCalendar.vaara}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="no-underline hover:no-underline">
                <Button 
                  onClick={handleBookClick}
                  size="lg" 
                  className="cursor-pointer bg-[#ff6b35] hover:bg-[#ff8c5e] hover:no-underline text-white font-semibold text-lg px-6 py-5 w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {content.beginJourney}
                </Button>
              </Link>
              <Button 
                onClick={() => showEnquiryModal()}
                size="lg" 
                variant="outline"
                className="cursor-pointer border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10 hover:no-underline text-lg px-6 py-5 w-full sm:w-auto"
              >
                Enquire Now
              </Button>
              {!user && (
                <Button 
                  onClick={() => showAuthModal('signin')}
                  size="lg" 
                  variant="ghost" 
                  className="cursor-pointer text-[#ff6b35] hover:bg-[#ff6b35]/10 hover:no-underline text-lg px-6 py-5 w-full sm:w-auto"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scroll-hint">
          <span>Scroll</span>
          <div className="chevrons">
            <ChevronDown />
            <ChevronDown />
          </div>
        </div>
      </section>

      {/* Mobile & Tablet Only Sign-in Section */}
      <section className={`lg:hidden py-6 px-4 flex justify-center ${(!mounted || user) ? 'hidden' : 'block'}`}>
        <div className={`fade-in-up max-w-sm w-full p-5 rounded-2xl text-center relative overflow-hidden ${
          theme === 'dark' 
            ? 'bg-[#1a1a2e] border border-[#ff6b35]/20 shadow-lg shadow-[#ff6b35]/10' 
            : 'bg-[#fffdf9] border border-[#ff6b35]/30 shadow-lg shadow-[#ff6b35]/10'
        }`}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ff6b35]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#ff8c5e]/10 rounded-full blur-3xl" />
          
          <Sparkles className="w-7 h-7 text-[#ff6b35] mx-auto mb-3" />
          
          <h3 className="font-[family-name:var(--font-cinzel)] text-xl font-bold mb-2 text-gradient-ancient">
            Unlock Your Destiny
          </h3>
          <p className={`mb-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>
            Sign in for personalized horoscopes and premium cosmic insights.
          </p>
          <Button 
            onClick={() => showAuthModal('signin')}
            className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-bold py-5 rounded-xl text-base shadow-md shadow-[#ff6b35]/20 active:scale-95 transition-all"
          >
            Sign In Now
          </Button>
        </div>
      </section>

      <section className={`py-24 px-6 ${theme === 'dark' ? 'bg-gradient-to-b from-[#0a0a0f] to-[#12121a]' : 'bg-gradient-to-b from-[#fdfbf7] to-[#f8f4ee]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center gap-2 mb-6">
              <Sun className="w-8 h-8 text-[#ff6b35]" />
              <Star className="w-8 h-8 text-[#ff8c5e]" />
              <Moon className="w-8 h-8 text-[#ff6b35]" />
            </div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl font-bold mb-4 text-gradient-ancient">
              {content.servicesTitle}
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>
              {content.servicesDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <Card 
                onClick={() => showEnquiryModal()}
                className={`${theme === 'dark' ? 'bg-[#12121a] border-[#ff6b35]/20' : 'bg-[#fffdf9] border-[#ff6b35]/30'} hover:border-[#ff6b35]/50 transition-all duration-300 h-full group cursor-pointer`}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff6b35]/20 transition-colors">
                    <Home className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <h3 className={`font-[family-name:var(--font-cinzel)] text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#4a3f35]'}`}>
                    {content.homeConsultation}
                  </h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>
                    {content.homeConsultationDesc}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Link href="/online-consulting" className="block h-full no-underline">
                <Card 
                  className={`${theme === 'dark' ? 'bg-[#12121a] border-[#ff6b35]/20' : 'bg-[#fffdf9] border-[#ff6b35]/30'} hover:border-[#ff6b35]/50 transition-all duration-300 h-full group cursor-pointer relative overflow-hidden`}
                >
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                      {language === 'gu' ? 'વિશ્વભરમાં' : language === 'hi' ? 'विश्वव्यापी' : 'Worldwide'}
                    </span>
                  </div>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff6b35]/20 transition-colors">
                      <Video className="w-8 h-8 text-[#ff6b35]" />
                    </div>
                    <h3 className={`font-[family-name:var(--font-cinzel)] text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#4a3f35]'}`}>
                      {content.onlineMeeting}
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>
                      {content.onlineMeetingDesc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="cursor-pointer border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10 text-xl px-8 py-6">
              <Link href="/services" className="no-underline">
                {content.viewAllServices}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-12 scroll-hint mx-auto">
            <span>Scroll</span>
            <div className="chevrons">
              <ChevronDown />
              <ChevronDown />
            </div>
          </div>
        </div>
      </section>

      <CosmicInsights panchangApiData={panchangApiData} />

      <section className={`py-24 px-6 ${theme === 'dark' ? 'bg-[#12121a]' : 'bg-[#fffdf9]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl font-bold mb-4 text-gradient-ancient">
              {content.testimonialsTitle}
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>{content.testimonialsDesc}</p>
            {/* Review count badge */}
            <div className="flex justify-center mt-4">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${theme === 'dark' ? 'bg-[#ff6b35]/10 border-[#ff6b35]/30 text-[#ff8c5e]' : 'bg-[#ff6b35]/10 border-[#ff6b35]/30 text-[#ff6b35]'}`}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {language === 'gu' ? 'સમીક્ષાઓ' : language === 'hi' ? 'समीक्षाएं' : 'Reviews'}
              </span>
            </div>
          </div>

          {/* First 3 reviews always visible */}
          <div className="grid md:grid-cols-3 gap-8 mb-4">
            {testimonials.slice(0, 3).map((testimonial) => (
              <div key={testimonial.name}>
                <Card className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20' : 'bg-[#f8f4ee] border-[#ff6b35]/30'} h-full`}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#ff6b35] text-[#ff6b35]" />
                          ))}
                        </div>
                        <p className={`font-[family-name:var(--font-cinzel)] font-semibold text-sm ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#4a3f35]'}`}>
                          {testimonial.name}
                        </p>
                      </div>
                    </div>
                    <p className={`italic text-sm ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>&ldquo;{testimonial.text}&rdquo;</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Remaining reviews - blurred preview row + expand */}
          {!showAllReviews ? (
            <div className="relative">
              {/* Blurred preview of next 3 */}
                <div className="grid md:grid-cols-3 gap-8 blur-[2px] pointer-events-none select-none">
                {testimonials.slice(3, 6).map((testimonial) => (
                  <div key={testimonial.name}>
                    <Card className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20' : 'bg-[#f8f4ee] border-[#ff6b35]/30'} h-full`}>
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <div className="flex gap-0.5 mb-1">
                              {Array.from({ length: testimonial.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#ff6b35] text-[#ff6b35]" />
                              ))}
                            </div>
                            <p className={`font-[family-name:var(--font-cinzel)] font-semibold text-sm ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#4a3f35]'}`}>
                              {testimonial.name}
                            </p>
                          </div>
                        </div>
                        <p className={`italic text-sm ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>&ldquo;{testimonial.text}&rdquo;</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              {/* Gradient overlay + Read More button */}
              <div className={`absolute inset-0 flex flex-col items-center justify-end pb-4 ${theme === 'dark' ? 'bg-gradient-to-t from-[#12121a] via-[#12121a]/80 to-transparent' : 'bg-gradient-to-t from-[#fffdf9] via-[#fffdf9]/80 to-transparent'}`}>
                <Button
                  onClick={() => setShowAllReviews(true)}
                  size="lg"
                  className="cursor-pointer bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-semibold px-8 py-5 shadow-lg shadow-[#ff6b35]/20"
                >
                  <Star className="w-4 h-4 mr-2 fill-white" />
                  {language === 'gu' ? `બધી ${testimonials.length} સમીક્ષાઓ જુઓ` : language === 'hi' ? `सभी ${testimonials.length} समीक्षाएं देखें` : `Read All ${testimonials.length} Reviews`}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.slice(3).map((testimonial) => (
                  <div key={testimonial.name}>
                    <Card className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20' : 'bg-[#f8f4ee] border-[#ff6b35]/30'} h-full`}>
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <div className="flex gap-0.5 mb-1">
                              {Array.from({ length: testimonial.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#ff6b35] text-[#ff6b35]" />
                              ))}
                            </div>
                            <p className={`font-[family-name:var(--font-cinzel)] font-semibold text-sm ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#4a3f35]'}`}>
                              {testimonial.name}
                            </p>
                          </div>
                        </div>
                        <p className={`italic text-sm ${theme === 'dark' ? 'text-[#c4bdb3]' : 'text-[#5a4f44]'}`}>&ldquo;{testimonial.text}&rdquo;</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setShowAllReviews(false)}
                  size="lg"
                  variant="outline"
                  className="cursor-pointer border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10 px-8 py-5"
                >
                  {language === 'gu' ? 'ઓછું જુઓ' : language === 'hi' ? 'कम दिखाएं' : 'Show Less'}
                  <ChevronDown className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </>
          )}

          <div className="mt-12 scroll-hint mx-auto">
            <span>Scroll</span>
            <div className="chevrons">
              <ChevronDown />
              <ChevronDown />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
