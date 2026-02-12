"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      if (data.success) {
        setPosts(data.data || []);
      }
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

        {/* Daily Horoscope Banner */}
        <Link href="/rashifal">
          <Card className={`mb-6 overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
            theme === 'dark' ? 'bg-gradient-to-r from-[#12121a] to-[#1a1a24]' : 'bg-gradient-to-r from-orange-50 to-purple-50'
          } border-none shadow-xl`}>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-cinzel)] text-xl md:text-2xl font-bold mb-2">
                    {language === 'gu' ? 'દૈનિક રાશિફળ' : language === 'hi' ? 'दैनिक राशिफल' : 'Daily Horoscope'}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'gu' ? 'આજનું તમારી રાશિનું ભાગ્યફળ જાણો' :
                     language === 'hi' ? 'आज का अपनी राशि का भाग्यफल जानें' :
                     'Know your zodiac fortune for today'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {RASHI_DATA.slice(0, 6).map((rashi) => (
                      <div 
                        key={rashi.english}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'} border-2 ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}
                      >
                        <rashi.icon className="w-5 h-5 text-[#ff6b35]" />
                      </div>
                    ))}
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#ff6b35] ml-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Hindu Calendar Banner */}
        <Link href="/hindu-calendar">
          <Card className={`mb-8 overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
            theme === 'dark' ? 'bg-gradient-to-r from-[#1a1a24] to-[#12121a]' : 'bg-gradient-to-r from-purple-50 to-orange-50'
          } border-none shadow-xl`}>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-cinzel)] text-xl md:text-2xl font-bold mb-2">
                    {language === 'gu' ? 'હિન્દુ પંચાંગ' : language === 'hi' ? 'हिन्दू पंचांग' : 'Hindu Calendar'}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'gu' ? 'તહેવારો, વ્રત, તિથિ અને મહત્વના દિવસો જાણો' :
                     language === 'hi' ? 'त्योहार, व्रत, तिथि और महत्वपूर्ण दिन जानें' :
                     'Know festivals, fasts, tithis and important days'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} border-2 ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}>
                      <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'} border-2 ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}>
                      <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'} border-2 ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#ff6b35] ml-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className={`animate-pulse ${theme === 'dark' ? 'bg-[#12121a]' : 'bg-white'} border-none`}>
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </CardContent>
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
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className={`h-full overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                  theme === 'dark' ? 'bg-[#12121a]' : 'bg-white'
                } border-none shadow-lg`}>
                  {post.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featured_image}
                        alt={getPostTitle(post)}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#ff6b35] text-white text-xs px-3 py-1 rounded-full capitalize">
                          {post.category}
                        </span>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{getPostTitle(post)}</h3>
                    {getPostExcerpt(post) && (
                      <p className={`text-sm line-clamp-2 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getPostExcerpt(post)}
                      </p>
                    )}
                    <div className={`flex items-center gap-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.published_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.view_count || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
