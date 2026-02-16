"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Languages, BarChart3, Brain, RefreshCw, CheckCircle2, Lightbulb, TrendingUp, ExternalLink } from "lucide-react";

interface Props {
  isDark: boolean;
  t: (k: string) => string;
  setSuccess: (s: string) => void;
  setError: (s: string) => void;
}

export default function ScalingPanel({ isDark, t, setSuccess, setError }: Props) {
  const [aiLoading, setAiLoading] = useState(false);
  const [seoData, setSeoData] = useState<any>(null);

  const cardCls = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";

  const fetchSeoAdvanced = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/seo/advanced");
      const json = await res.json();
      if (json.success) { setSeoData(json.data); setSuccess("AI SEO analysis loaded!"); }
    } catch {}
    setAiLoading(false);
  };

  useEffect(() => { fetchSeoAdvanced(); }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <Globe className="w-6 h-6" /> {t("Scaling Features")}
          </CardTitle>
          <CardDescription>{t("Multi-language SEO, multi-site support, advanced analytics, and AI suggestions")}</CardDescription>
        </CardHeader>
      </Card>

      {/* Multi-language SEO */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Languages className="w-5 h-5" /> {t("Multi-Language SEO")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { lang: "English (en)", status: "active", pages: "All pages", hreflang: "en-IN", default: true },
            { lang: "Hindi (hi)", status: "active", pages: "All pages via Google Translate", hreflang: "hi-IN", default: false },
            { lang: "Gujarati (gu)", status: "active", pages: "All pages via Google Translate", hreflang: "gu-IN", default: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{item.lang}</p>
                  {item.default && <Badge className="text-[10px] bg-[#ff6b35]/10 text-[#ff6b35]">Default</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground">hreflang: {item.hreflang} | {item.pages}</p>
              </div>
              <Badge className="text-[10px] bg-green-500/10 text-green-500">{item.status}</Badge>
            </div>
          ))}
          <div className={`p-3 rounded-lg border ${cardCls}`}>
            <p className="text-xs font-medium mb-2">{t("SEO Language Features")}</p>
            <div className="space-y-1 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> hreflang tags in sitemap for all languages</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Localized meta titles and descriptions</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Language-specific structured data (JSON-LD)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Google Translate widget for dynamic translation</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Content stored in en/hi/gu variants in database</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-site Support */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Globe className="w-5 h-5" /> {t("Multi-Site Support")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`p-4 rounded-lg border ${cardCls}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">katyaayaniastrologer.com</p>
              <Badge className="text-[10px] bg-green-500/10 text-green-500">Primary</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
              <span>Platform: Next.js 15 + Vercel</span>
              <span>Database: Supabase PostgreSQL</span>
              <span>CDN: Vercel Edge Network</span>
              <span>SSL: Auto-managed</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg border border-[#ff6b35]/20 ${cardCls}`}>
            <p className="text-xs font-medium text-[#ff6b35] mb-1">{t("Architecture Ready For Multi-Site")}</p>
            <ul className="text-[10px] text-muted-foreground space-y-1 list-disc ml-4">
              <li>API-first architecture supports multiple frontends</li>
              <li>Supabase multi-schema support for site isolation</li>
              <li>Environment-based configuration for easy cloning</li>
              <li>Shared admin panel with site selector (expandable)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> {t("Advanced Analytics")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Google Tag Manager", value: "GTM-MQDMP2SL", status: "active", desc: "Tracking all page views, events, and conversions" },
            { label: "Google Search Console", value: "Verified", status: "active", desc: "Monitoring search performance and indexing" },
            { label: "Structured Data", value: "JSON-LD Schema", status: "active", desc: "Rich snippets for astrology services" },
            { label: "Core Web Vitals", value: "Monitored via Performance tab", status: "active", desc: "LCP, FID, CLS tracking" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
              <div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{item.value}</Badge>
                <Badge className="text-[10px] bg-green-500/10 text-green-500">{item.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI SEO Suggestions */}
      <Card className={cardCls}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
              <Brain className="w-5 h-5" /> {t("AI SEO Suggestions")}
            </CardTitle>
            <Button onClick={fetchSeoAdvanced} disabled={aiLoading} size="sm" variant="outline" className="border-[#ff6b35]/20 text-[#ff6b35]">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiLoading && !seoData && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" /></div>}
          {seoData?.suggestions && seoData.suggestions.map((s: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg border ${cardCls}`}>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{typeof s === "string" ? s : s.title || s.suggestion}</p>
                  {s.description && <p className="text-[10px] text-muted-foreground mt-1">{s.description}</p>}
                  {s.priority && <Badge variant="outline" className="text-[10px] mt-1">{s.priority}</Badge>}
                </div>
              </div>
            </div>
          ))}
          {seoData?.recommendations && seoData.recommendations.map((r: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg border ${cardCls}`}>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{typeof r === "string" ? r : r.title || r.recommendation}</p>
                  {r.impact && <Badge variant="outline" className="text-[10px] mt-1">{r.impact}</Badge>}
                </div>
              </div>
            </div>
          ))}
          {!seoData?.suggestions && !seoData?.recommendations && !aiLoading && (
            <div className="text-center py-6">
              <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{t("Click refresh to generate AI SEO suggestions")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
