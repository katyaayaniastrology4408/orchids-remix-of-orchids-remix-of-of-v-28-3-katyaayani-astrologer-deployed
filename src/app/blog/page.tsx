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

interface BlogCategory {
  id: string;
  value: string;
  label_en: string;
  label_gu: string;
  label_hi: string;
  icon: string;
  sort_order: number;
}

const ALL_POSTS_CAT = { value: 'all', label_en: 'All Posts', label_gu: 'બધી પોસ્ટ', label_hi: 'सभी पोस्ट', icon: '📚' };

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {}
  };

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

  const getCategoryLabel = (cat: BlogCategory | typeof ALL_POSTS_CAT) => {
    if (language === 'gu') return cat.label_gu;
    if (language === 'hi') return cat.label_hi;
    return cat.label_en;
  };

  const allSidebarCats = [ALL_POSTS_CAT, ...categories];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  // Get count per category from loaded posts
  const categoryCounts = posts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Category Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className={`rounded-2xl border p-4 sticky top-24 ${theme === 'dark' ? 'bg-[#12121a] border-[#ff6b35]/10' : 'bg-white border-[#ff6b35]/15 shadow-sm'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-[#ff6b35]' : 'text-[#cc4400]'}`}>
                {language === 'gu' ? 'વિભાગ' : language === 'hi' ? 'श्रेणी' : 'Categories'}
              </p>
                <div className="flex flex-col gap-1">
                  {allSidebarCats.map((cat) => {
                    const count = cat.value === 'all' ? posts.length : (categoryCounts[cat.value] || 0);
                    const isActive = selectedCategory === cat.value;
                  // Only show categories that have posts, plus 'all' and categories with 0 posts still shown (greyed)
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                        isActive
                          ? 'bg-[#ff6b35] text-white font-bold'
                          : theme === 'dark'
                            ? 'hover:bg-white/5 text-gray-300'
                            : 'hover:bg-orange-50 text-[#4a3f35]'
                      } ${!isActive && count === 0 ? 'opacity-40' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="leading-tight">{getCategoryLabel(cat)}</span>
                      </span>
                      {count > 0 && (
                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center ${
                          isActive ? 'bg-white/20 text-white' : theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-orange-100 text-[#cc4400]'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
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

            {/* Weekly Horoscope Banner */}
            <Link href="/rashifal?tab=weekly">
              <Card className={`mb-6 overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                theme === 'dark' ? 'bg-gradient-to-r from-[#1a1224] to-[#12121a]' : 'bg-gradient-to-r from-purple-50 to-orange-50'
              } border-none shadow-xl`}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="font-[family-name:var(--font-cinzel)] text-xl md:text-2xl font-bold mb-2">
                        {language === 'gu' ? 'સાપ્તાહિક રાશિફળ' : language === 'hi' ? 'साप्ताहिक राशिफल' : 'Weekly Horoscope'}
                      </h2>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'gu' ? 'આ અઠવાડિયાનું તમારી રાશિનું ભાગ્યફળ જાણો' :
                         language === 'hi' ? 'इस सप्ताह का अपनी राशि का भाग्यफल जानें' :
                         'Know your zodiac fortune for this week'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {RASHI_DATA.slice(6, 12).map((rashi) => (
                          <div 
                            key={rashi.english}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} border-2 ${theme === 'dark' ? 'border-[#0a0a0f]' : 'border-white'}`}
                          >
                            <rashi.icon className="w-5 h-5 text-purple-500" />
                          </div>
                        ))}
                      </div>
                      <ArrowRight className="w-5 h-5 text-purple-500 ml-2" />
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

            {/* Category heading */}
              {selectedCategory !== 'all' && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{allSidebarCats.find(c => c.value === selectedCategory)?.icon}</span>
                  <h2 className={`font-[family-name:var(--font-cinzel)] text-xl font-bold ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#3d1c00]'}`}>
                    {getCategoryLabel(allSidebarCats.find(c => c.value === selectedCategory) || ALL_POSTS_CAT)}
                </h2>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({filteredPosts.length} {language === 'gu' ? 'પોસ્ટ' : language === 'hi' ? 'पोस्ट' : 'posts'})
                </span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-auto text-xs text-[#ff6b35] hover:underline"
                >
                  {language === 'gu' ? 'બધું જુઓ' : language === 'hi' ? 'सभी देखें' : 'View all'}
                </button>
              </div>
            )}

            {/* Blog Posts Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">
                  {language === 'gu' ? 'કોઈ બ્લોગ પોસ્ટ મળી નથી' : language === 'hi' ? 'कोई ब्लॉग पोस्ट नहीं मिली' : 'No blog posts found'}
                </p>
                <p className="text-gray-400 mt-2">
                  {language === 'gu' ? 'જલ્દી જ નવા લેખો ઉમેરવામાં આવશે' : language === 'hi' ? 'जल्द ही नए लेख जोड़े जाएंगे' : 'New articles will be added soon'}
                </p>
                <button onClick={() => setSelectedCategory('all')} className="mt-4 text-sm text-[#ff6b35] hover:underline">
                  {language === 'gu' ? 'બધી પોસ્ટ જુઓ' : language === 'hi' ? 'सभी पोस्ट देखें' : 'View all posts'}
                </button>
              </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5"
                >
                  {filteredPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className={`overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${
                        theme === 'dark' ? 'bg-[#12121a]' : 'bg-white'
                      } border-none shadow-lg`}>
                        <div className="flex flex-col sm:flex-row">

                          {/* LEFT — Image with category badge inside at bottom-left */}
                          {post.featured_image ? (
                            <div className="relative sm:w-56 md:w-64 flex-shrink-0 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.featured_image}
                                alt={getPostTitle(post)}
                                className="w-full h-48 sm:h-full object-cover"
                                style={{ minHeight: '160px' }}
                              />
                              {/* Category badge — inside image, bottom-left */}
                              <span className="absolute bottom-3 left-3 bg-[#ff6b35] text-white text-xs px-3 py-1 rounded-full capitalize font-semibold shadow-lg">
                                {post.category}
                              </span>
                            </div>
                          ) : (
                            /* No image fallback — show category badge only */
                            <div className={`sm:w-56 md:w-64 flex-shrink-0 flex items-end p-4 ${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-orange-50'}`}>
                              <span className="bg-[#ff6b35] text-white text-xs px-3 py-1 rounded-full capitalize font-semibold">
                                {post.category}
                              </span>
                            </div>
                          )}

                          {/* RIGHT — Title, excerpt, meta — all right-aligned */}
                          <div className="flex-1 flex flex-col justify-between p-5 text-right">
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
                            <div className={`flex items-center justify-end gap-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
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
