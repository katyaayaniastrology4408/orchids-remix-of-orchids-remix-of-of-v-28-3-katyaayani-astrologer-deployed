"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gauge, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Image, HardDrive, Zap } from "lucide-react";

interface Props {
  isDark: boolean;
  t: (k: string) => string;
  setSuccess: (s: string) => void;
  setError: (s: string) => void;
}

export default function PerformancePanel({ isDark, t, setSuccess, setError }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const cardCls = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health-check");
      const json = await res.json();
      if (json.success) { setData(json.data); setSuccess("Health check complete!"); }
      else setError(json.error || "Health check failed");
    } catch { setError("Failed to run health check"); }
    setLoading(false);
  };

  useEffect(() => { fetchHealth(); }, []);

  const statusIcon = (status: string) => {
    if (status === "healthy" || status === "ok" || status === "connected") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "warning" || status === "degraded") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const statusBadge = (status: string) => {
    const variant = (status === "healthy" || status === "ok" || status === "connected") ? "default" : (status === "warning" || status === "degraded") ? "secondary" : "destructive";
    return <Badge variant={variant} className="text-[10px]">{status}</Badge>;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card className={cardCls}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#ff6b35] flex items-center gap-2">
                <Gauge className="w-6 h-6" /> {t("Performance Optimization")}
              </CardTitle>
              <CardDescription>{t("Image optimization, caching, and Core Web Vitals monitoring")}</CardDescription>
            </div>
            <Button onClick={fetchHealth} disabled={loading} size="sm" variant="outline" className="border-[#ff6b35]/20 text-[#ff6b35]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading && !data && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" /></div>}

      {data && (
        <>
          {/* System Status */}
          <Card className={cardCls}>
            <CardHeader><CardTitle className="text-sm font-bold text-[#ff6b35]">{t("System Status")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.services?.map((svc: any) => (
                  <div key={svc.name} className={`p-3 rounded-lg border ${cardCls} flex items-center gap-2`}>
                    {statusIcon(svc.status)}
                    <div>
                      <p className="text-xs font-medium">{svc.name}</p>
                      {statusBadge(svc.status)}
                      {svc.latency && <p className="text-[10px] text-muted-foreground">{svc.latency}ms</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image Optimization */}
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
                <Image className="w-5 h-5" /> {t("Image Optimization")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Next.js Image Component", desc: "All images use next/image with automatic WebP/AVIF conversion", status: "active" },
                  { label: "Lazy Loading", desc: "Images below the fold are lazy-loaded automatically", status: "active" },
                  { label: "Responsive Sizes", desc: "Images serve appropriate sizes for device viewport", status: "active" },
                  { label: "Supabase CDN", desc: "Images served from Supabase Storage CDN with edge caching", status: "active" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Badge className="text-[10px] bg-green-500/10 text-green-500">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Caching System */}
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
                <HardDrive className="w-5 h-5" /> {t("Caching System")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Static Page Cache", desc: "Homepage, About, Services cached at build time (ISR)", ttl: "60s revalidation" },
                  { label: "API Response Cache", desc: "Frequently accessed API endpoints cached in memory", ttl: "30-60s" },
                  { label: "Browser Cache", desc: "Static assets cached with immutable headers", ttl: "1 year" },
                  { label: "CDN Edge Cache", desc: "Vercel/Supabase CDN caching for global distribution", ttl: "Auto" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">TTL: {item.ttl}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
                <Zap className="w-5 h-5" /> {t("Core Web Vitals")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { metric: "LCP (Largest Contentful Paint)", target: "< 2.5s", tip: "Hero images preloaded, fonts optimized, critical CSS inlined" },
                  { metric: "FID (First Input Delay)", target: "< 100ms", tip: "Minimal JS bundle, code splitting, deferred non-critical scripts" },
                  { metric: "CLS (Cumulative Layout Shift)", target: "< 0.1", tip: "All images have explicit width/height, font-display: swap configured" },
                  { metric: "TTFB (Time to First Byte)", target: "< 800ms", tip: "Edge deployment, Supabase pooler, efficient DB queries" },
                  { metric: "INP (Interaction to Next Paint)", target: "< 200ms", tip: "React concurrent features, optimized event handlers" },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${cardCls}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium">{item.metric}</p>
                      <Badge className="text-[10px] bg-green-500/10 text-green-500">Target: {item.target}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.tip}</p>
                  </div>
                ))}
                <div className={`p-3 rounded-lg border border-[#ff6b35]/20 ${cardCls}`}>
                  <p className="text-xs font-medium mb-1">{t("Run Detailed Audit")}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{t("For real-time Core Web Vitals data, use Google PageSpeed Insights:")}</p>
                  <a href="https://pagespeed.web.dev/analysis?url=https://www.katyaayaniastrologer.com" target="_blank" rel="noopener"
                    className="text-xs text-[#ff6b35] hover:underline">PageSpeed Insights → katyaayaniastrologer.com</a>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.checkedAt && <p className="text-[10px] text-muted-foreground text-right">{t("Last checked")}: {new Date(data.checkedAt).toLocaleString()}</p>}
        </>
      )}
    </div>
  );
}
