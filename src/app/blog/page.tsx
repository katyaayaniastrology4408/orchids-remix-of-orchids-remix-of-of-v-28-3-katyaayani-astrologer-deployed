"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Eye, ArrowRight, Star, Sparkles } from "lucide-react";
import { 
  GiRam, GiBull, GiLovers, GiCrab, GiLion, GiFemale, 
  GiScales, GiScorpion, GiArcher, GiCrocJaws, GiAmphora, GiDoubleFish
} from "react-icons/gi";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/components/GoogleTranslateWidget";
import Navbar from "@/components/homepage/Navbar";
import Footer from "@/components/homepage/Footer";
import dynamic from "next/dynamic";

const RashifalSection = dynamic(() => import("@/components/homepage/RashifalSection"), { ssr: false });

interface BlogPost {
  id: string;
  title: string;
  title_gujarati?: string;
  title_hindi?: string;
  slug: string;
  excerpt: string;
  excerpt_gujarati?: string;
  excerpt_hindi?: string;
  featured_image: string;
  category: string;
  tags: string[];
  author_name: string;
  published_at: string;
  view_count: number;
}

const RASHI_DATA = [
  { english: 'aries', gujarati: 'મેષ', icon: GiRam },
  { english: 'taurus', gujarati: 'વૃષભ', icon: GiBull },
  { english: 'gemini', gujarati: 'મિથુન', icon: GiLovers },
  { english: 'cancer', gujarati: 'કર્ક', icon: GiCrab },
  { english: 'leo', gujarati: 'સિંહ', icon: GiLion },
  { english: 'virgo', gujarati: 'કન્યા', icon: GiFemale },
  { english: 'libra', gujarati: 'તુલા', icon: GiScales },
  { english: 'scorpio', gujarati: 'વૃશ્ચિક', icon: GiScorpion },
  { english: 'sagittarius', gujarati: 'ધન', icon: GiArcher },
  { english: 'capricorn', gujarati: 'મકર', icon: GiCrocJaws },
  { english: 'aquarius', gujarati: 'કુંભ', icon: GiAmphora },
  { english: 'pisces', gujarati: 'મીન', icon: GiDoubleFish },
];

export default function BlogPage() {
  const { theme } = useTheme();
  const { language, t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?limit=20`);
      const data = await res.json();
      if (data.success) setPosts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocale = () => {
    if (language === 'gu') return 'gu-IN';
    if (language === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPostTitle = (post: BlogPost) => {
    if (language === 'gu' && post.title_gujarati) return post.title_gujarati;
    if (language === 'hi' && post.title_hindi) return post.title_hindi;
    return post.title;
  };

  const getPostExcerpt = (post: BlogPost) => {
    if (language === 'gu' && post.excerpt_gujarati) return post.excerpt_gujarati;
    if (language === 'hi' && post.excerpt_hindi) return post.excerpt_hindi;
    return post.excerpt;
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#0a0a0f] text-[#f5f0e8]' : 'bg-[#fdfbf7] text-[#4a3f35]'}`}>
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl font-bold text-gradient-ancient mb-4">
            {t("Blog")}
          </h1>
          <p className={`text-base md:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'gu' ? 'દૈનિક રાશિફળ, હિન્દુ પંચાંગ અને જ્યોતિષ જ્ઞાન' :
             language === 'hi' ? 'दैनिक राशिफल, हिन्दू पंचांग और ज्योतिष ज्ञान' :
             'Daily Horoscope, Hindu Calendar and Astrology Knowledge'}
          </p>
        </div>

          {/* Two-column layout: Left = posts, Right = banners+highlights */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* RIGHT — Highlight Banners (rendered after posts in DOM but shown right via order) */}
            <aside className="lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-5 lg:order-2">

            {/* Daily Horoscope Banner */}
            <Link href="/rashifal">
              <Card className={`overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                theme === 'dark' ? 'bg-gradient-to-br from-[#12121a] to-[#1a1a24]' : 'bg-gradient-to-br from-orange-50 to-purple-50'
              } border-none shadow-lg`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <Star className="w-4 h-4 text-[#ff6b35]" />
                    </div>
                    <h2 className="font-[family-name:var(--font-cinzel)] text-base font-bold">
                      {language === 'gu' ? 'દૈનિક રાશિફળ' : language === 'hi' ? 'दैनिक राशिफल' : 'Daily Horoscope'}
                    </h2>
                  </div>
                  <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'gu' ? 'આજનું તમારી રાશિનું ભાગ્યફળ જાણો' :
                     language === 'hi' ? 'आज का अपनी राशि का भाग्यफल जानें' :
                     'Know your zodiac fortune for today'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {RASHI_DATA.slice(0, 6).map((rashi) => (
                        <div
                          key={rashi.english}
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'} border ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}
                        >
                          <rashi.icon className="w-3.5 h-3.5 text-[#ff6b35]" />
                        </div>
                      ))}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#ff6b35]" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Weekly Horoscope Banner */}
            <Link href="/rashifal?tab=weekly">
              <Card className={`overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                theme === 'dark' ? 'bg-gradient-to-br from-[#1a1224] to-[#12121a]' : 'bg-gradient-to-br from-purple-50 to-orange-50'
              } border-none shadow-lg`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                    <h2 className="font-[family-name:var(--font-cinzel)] text-base font-bold">
                      {language === 'gu' ? 'સાપ્તાહિક રાશિફળ' : language === 'hi' ? 'साप्ताहिक राशिफल' : 'Weekly Horoscope'}
                    </h2>
                  </div>
                  <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'gu' ? 'આ અઠવાડિયાનું તમારી રાશિનું ભાગ્યફળ જાણો' :
                     language === 'hi' ? 'इस सप्ताह का अपनी राशि का भाग्यफल जानें' :
                     'Know your zodiac fortune for this week'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {RASHI_DATA.slice(6, 12).map((rashi) => (
                        <div
                          key={rashi.english}
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} border ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}
                        >
                          <rashi.icon className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                      ))}
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Hindu Calendar Banner */}
            <Link href="/hindu-calendar">
              <Card className={`overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                theme === 'dark' ? 'bg-gradient-to-br from-[#1a1a24] to-[#12121a]' : 'bg-gradient-to-br from-yellow-50 to-orange-50'
              } border-none shadow-lg`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                      <Calendar className="w-4 h-4 text-yellow-500" />
                    </div>
                    <h2 className="font-[family-name:var(--font-cinzel)] text-base font-bold">
                      {language === 'gu' ? 'હિન્દુ પંચાંગ' : language === 'hi' ? 'हिन्दू पंचांग' : 'Hindu Calendar'}
                    </h2>
                  </div>
                  <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'gu' ? 'તહેવારો, વ્રત, તિથિ અને મહત્વના દિવસો જાણો' :
                     language === 'hi' ? 'त्योहार, व्रत, तिथि और महत्वपूर्ण दिन जानें' :
                     'Know festivals, fasts, tithis and important days'}
                  </p>
                  <div className="flex items-center justify-end">
                    <ArrowRight className="w-4 h-4 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Recent post images preview */}
            {posts.length > 0 && (
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'bg-[#12121a] border-[#ff6b35]/10' : 'bg-white border-[#ff6b35]/15 shadow-sm'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme === 'dark' ? 'text-[#ff6b35]' : 'text-[#cc4400]'}`}>
                  {language === 'gu' ? 'તાજી પોસ્ટ' : language === 'hi' ? 'हाल की पोस्ट' : 'Recent Posts'}
                </p>
                <div className="flex flex-col gap-3">
                  {posts.slice(0, 4).map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-center gap-3 group">
                      {post.featured_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featured_image}
                          alt={getPostTitle(post)}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-orange-50'}`} />
                      )}
                      <p className={`text-xs font-medium line-clamp-2 group-hover:text-[#ff6b35] transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-[#4a3f35]'}`}>
                        {getPostTitle(post)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

            {/* LEFT — Blog Posts */}
            <div className="flex-1 min-w-0 lg:order-1">
            {loading ? (
              <div className="flex flex-col gap-5">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className={`animate-pulse ${theme === 'dark' ? 'bg-[#12121a]' : 'bg-white'} border-none`}>
                    <div className="flex">
                      <div className="w-48 h-36 bg-gray-200 dark:bg-gray-700 rounded-l-xl flex-shrink-0" />
                      <CardContent className="p-5 flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">
                  {language === 'gu' ? 'કોઈ બ્લોગ પોસ્ટ મળી નથી' : language === 'hi' ? 'कोई ब्लॉग पोस्ट नहीं मिली' : 'No blog posts found'}
                </p>
                <p className="text-gray-400 mt-2">
                  {language === 'gu' ? 'જલ્દી જ નવા લેખો ઉમેરવામાં આવશે' : language === 'hi' ? 'जल्द ही नए लेख जोड़े जाएंगे' : 'New articles will be added soon'}
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-5"
              >
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className={`overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${
                      theme === 'dark' ? 'bg-[#12121a]' : 'bg-white'
                    } border-none shadow-lg`}>
                      <div className="flex flex-col sm:flex-row">

                        {/* LEFT inside card — Image */}
                        {post.featured_image ? (
                          <div className="relative sm:w-52 md:w-60 flex-shrink-0 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.featured_image}
                              alt={getPostTitle(post)}
                              className="w-full h-48 sm:h-full object-cover"
                              style={{ minHeight: '160px' }}
                            />
                          </div>
                        ) : (
                          <div className={`sm:w-52 md:w-60 flex-shrink-0 ${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-orange-50'}`} style={{ minHeight: '160px' }} />
                        )}

                        {/* RIGHT inside card — Details */}
                        <div className="flex-1 flex flex-col justify-between p-5">
                          <div>
                            <h3 className="font-bold text-lg mb-2 leading-snug line-clamp-2">
                              {getPostTitle(post)}
                            </h3>
                            {getPostExcerpt(post) && (
                              <p className={`text-sm line-clamp-3 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {getPostExcerpt(post)}
                              </p>
                            )}
                          </div>
                          <div className={`flex items-center gap-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.view_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.published_at)}
                            </div>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>

        </div>
      </main>

      <RashifalSection />
      <Footer />
    </div>
  );
}
