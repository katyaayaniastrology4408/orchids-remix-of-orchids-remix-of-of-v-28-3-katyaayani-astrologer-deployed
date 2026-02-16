"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Server, Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Cloud, GitBranch, Terminal } from "lucide-react";

interface Props {
  isDark: boolean;
  t: (k: string) => string;
  setSuccess: (s: string) => void;
  setError: (s: string) => void;
}

export default function DevOpsPanel({ isDark, t, setSuccess, setError }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const cardCls = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";

  const fetchMonitoring = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/monitoring");
      const json = await res.json();
      if (json.success) { setData(json.data); setSuccess("Monitoring data loaded!"); }
      else setError(json.error || "Failed to load monitoring data");
    } catch { setError("Failed to fetch monitoring"); }
    setLoading(false);
  };

  useEffect(() => { fetchMonitoring(); }, []);

  const statusIcon = (status: string) => {
    if (status === "healthy" || status === "ok" || status === "connected" || status === "active" || status === "running") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "warning" || status === "degraded") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card className={cardCls}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#ff6b35] flex items-center gap-2">
                <Server className="w-6 h-6" /> {t("Deployment & DevOps")}
              </CardTitle>
              <CardDescription>{t("Cloud deployment, CI/CD pipeline, and monitoring & logging")}</CardDescription>
            </div>
            <Button onClick={fetchMonitoring} disabled={loading} size="sm" variant="outline" className="border-[#ff6b35]/20 text-[#ff6b35]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading && !data && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" /></div>}

      {/* Cloud Deployment */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Cloud className="w-5 h-5" /> {t("Cloud Deployment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Hosting Platform", value: "Vercel (Next.js optimized)", status: "active" },
            { label: "Database", value: "Supabase PostgreSQL (AWS us-west-2)", status: "active" },
            { label: "Storage", value: "Supabase Storage (S3-compatible CDN)", status: "active" },
            { label: "Domain", value: "katyaayaniastrologer.com (SSL/HTTPS)", status: "active" },
            { label: "CDN", value: "Vercel Edge Network (global)", status: "active" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
              <div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.value}</p>
              </div>
              {statusIcon(item.status)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CI/CD Pipeline */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <GitBranch className="w-5 h-5" /> {t("CI/CD Pipeline")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { step: "1. Code Push", desc: "Push to main branch triggers deployment", status: "configured" },
            { step: "2. Build", desc: "Next.js production build with TypeScript check", status: "configured" },
            { step: "3. Deploy", desc: "Automatic deployment to Vercel edge network", status: "configured" },
            { step: "4. DNS & SSL", desc: "Auto SSL certificate renewal and DNS propagation", status: "configured" },
            { step: "5. Health Check", desc: "Post-deploy health check via /api/admin/health-check", status: "configured" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${cardCls}`}>
              <div className="w-8 h-8 rounded-full bg-[#ff6b35]/10 flex items-center justify-center text-xs font-bold text-[#ff6b35]">{i + 1}</div>
              <div className="flex-1">
                <p className="text-xs font-medium">{item.step}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <Badge className="text-[10px] bg-green-500/10 text-green-500">{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monitoring & Logging */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Activity className="w-5 h-5" /> {t("Monitoring & Logging")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.services ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.services.map((svc: any) => (
                <div key={svc.name} className={`p-3 rounded-lg border text-center ${cardCls}`}>
                  {statusIcon(svc.status)}
                  <p className="text-xs font-medium mt-1">{svc.name}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{svc.status}</Badge>
                  {svc.latency && <p className="text-[10px] text-muted-foreground">{svc.latency}ms</p>}
                  {svc.responseTime && <p className="text-[10px] text-muted-foreground">{svc.responseTime}ms</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("Loading monitoring data...")}</p>
          )}

          <div className="mt-4 space-y-3">
            {[
              { label: "Application Logs", value: "Vercel Runtime Logs (real-time)", link: "https://vercel.com/dashboard" },
              { label: "Database Logs", value: "Supabase Dashboard (query logs, slow queries)", link: "https://supabase.com/dashboard" },
              { label: "Error Tracking", value: "Console errors + Telegram alerts", link: null },
              { label: "Audit Logs", value: "Admin actions tracked in audit_logs table", link: null },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.value}</p>
                </div>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener" className="text-[10px] text-[#ff6b35] hover:underline">{t("Open")} →</a>
                )}
              </div>
            ))}
          </div>

          {data?.uptime && (
            <div className={`p-3 rounded-lg border border-green-500/20 ${cardCls} mt-3`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-xs font-medium text-green-500">{t("System Uptime")}: {data.uptime}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
