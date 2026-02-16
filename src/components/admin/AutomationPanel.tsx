"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, Globe, Zap, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Code } from "lucide-react";

interface Props {
  isDark: boolean;
  t: (k: string) => string;
  setSuccess: (s: string) => void;
  setError: (s: string) => void;
}

export default function AutomationPanel({ isDark, t, setSuccess, setError }: Props) {
  const [brokenLinks, setBrokenLinks] = useState<any>(null);
  const [brokenLoading, setBrokenLoading] = useState(false);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapResult, setSitemapResult] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaResult, setSchemaResult] = useState<any>(null);

  const cardCls = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";

  const scanBrokenLinks = async () => {
    setBrokenLoading(true);
    try {
      const res = await fetch("/api/admin/seo/broken-links");
      const data = await res.json();
      if (data.success) { setBrokenLinks(data.data); setSuccess(`Scan complete! Found ${data.data.brokenLinks?.length || 0} broken links`); }
      else setError(data.error || "Scan failed");
    } catch { setError("Failed to scan broken links"); }
    setBrokenLoading(false);
  };

  const regenerateSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch("/api/admin/sitemap", { method: "POST" });
      const data = await res.json();
      if (data.success) { setSitemapResult(data); setSuccess("Sitemap regenerated!"); }
      else setError(data.error || "Sitemap generation failed");
    } catch { setError("Failed to regenerate sitemap"); }
    setSitemapLoading(false);
  };

  const generateSchema = async () => {
    setSchemaLoading(true);
    try {
      const res = await fetch("/api/admin/seo/advanced");
      const data = await res.json();
      if (data.success) { setSchemaResult(data.data); setSuccess("Schema data generated!"); }
      else setError(data.error || "Schema generation failed");
    } catch { setError("Failed to generate schema"); }
    setSchemaLoading(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <Zap className="w-6 h-6" /> {t("Advanced Automation")}
          </CardTitle>
          <CardDescription>{t("Auto sitemap scheduler, broken link scanner, and auto schema generation")}</CardDescription>
        </CardHeader>
      </Card>

      {/* Auto Sitemap */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Globe className="w-5 h-5" /> {t("Auto Sitemap Scheduler")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{t("Regenerate your sitemap.xml with all current pages, blogs, and dynamic routes.")}</p>
          <Button onClick={regenerateSitemap} disabled={sitemapLoading} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
            {sitemapLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("Generating...")}</> : <><RefreshCw className="w-4 h-4 mr-2" /> {t("Regenerate Sitemap Now")}</>}
          </Button>
          {sitemapResult && (
            <div className={`p-4 rounded-xl border ${cardCls}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">{t("Sitemap Generated Successfully")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("URLs included")}: {sitemapResult.urlCount || "All pages"}</p>
              <a href="/sitemap.xml" target="_blank" className="text-xs text-[#ff6b35] hover:underline mt-1 inline-block">{t("View Sitemap →")}</a>
            </div>
          )}
          <div className={`p-3 rounded-lg border ${cardCls}`}>
            <p className="text-xs font-medium mb-1">{t("Auto-Schedule Info")}</p>
            <p className="text-[10px] text-muted-foreground">{t("Sitemap is automatically regenerated when you publish new blog posts, add pages, or update redirects. You can also manually trigger it here anytime.")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Broken Link Scanner */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Link2 className="w-5 h-5" /> {t("Broken Link Scanner")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{t("Scan all internal and external links on your site for 404s and broken references.")}</p>
          <Button onClick={scanBrokenLinks} disabled={brokenLoading} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
            {brokenLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("Scanning...")}</> : <><Link2 className="w-4 h-4 mr-2" /> {t("Scan Broken Links")}</>}
          </Button>
          {brokenLinks && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border text-center ${cardCls}`}>
                  <p className="text-xl font-bold">{brokenLinks.totalLinks || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("Total Links")}</p>
                </div>
                <div className={`p-3 rounded-lg border text-center ${cardCls}`}>
                  <p className="text-xl font-bold text-green-500">{brokenLinks.healthyLinks || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("Healthy")}</p>
                </div>
                <div className={`p-3 rounded-lg border text-center ${cardCls}`}>
                  <p className="text-xl font-bold text-red-500">{brokenLinks.brokenLinks?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("Broken")}</p>
                </div>
              </div>
              {brokenLinks.brokenLinks?.length > 0 && (
                <div className="space-y-2">
                  {brokenLinks.brokenLinks.map((link: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${cardCls}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="text-xs font-mono truncate">{link.url}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="destructive" className="text-[10px]">{link.status || "timeout"}</Badge>
                        <span className="text-[10px] text-muted-foreground">{t("on")} {link.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {brokenLinks.brokenLinks?.length === 0 && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> {t("No broken links found!")}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Schema Generation */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Code className="w-5 h-5" /> {t("Auto Schema Generation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{t("Generate structured data (JSON-LD) schemas for all your pages automatically.")}</p>
          <Button onClick={generateSchema} disabled={schemaLoading} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
            {schemaLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("Generating...")}</> : <><Code className="w-4 h-4 mr-2" /> {t("Generate Schema Data")}</>}
          </Button>
          {schemaResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle2 className="w-4 h-4" /> {t("Schema data generated for all pages")}
              </div>
              {schemaResult.schemas?.map((s: any, i: number) => (
                <div key={i} className={`p-3 rounded-lg border ${cardCls}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{s.page}</span>
                    <Badge className="text-[10px]">{s.type}</Badge>
                  </div>
                  <pre className={`text-[10px] p-2 rounded overflow-x-auto max-h-32 ${isDark ? "bg-black/30" : "bg-gray-50"}`}>
                    {JSON.stringify(s.schema, null, 2).slice(0, 500)}...
                  </pre>
                </div>
              ))}
              <div className={`p-3 rounded-lg border ${cardCls}`}>
                <p className="text-xs font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-500" /> {t("Active Schemas")}</p>
                <p className="text-[10px] text-muted-foreground">{t("Organization, LocalBusiness, WebSite, BreadcrumbList, and Article schemas are already embedded in your pages automatically via layout.tsx")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
