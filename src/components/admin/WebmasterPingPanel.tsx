
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Send, RefreshCw, CheckCircle, XCircle, Clock, Search, Shield, Loader2, ExternalLink, Copy, AlertTriangle, Zap, FileText } from "lucide-react";

interface WebmasterPingPanelProps {
  isDark: boolean;
  t: (key: string) => string;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export default function WebmasterPingPanel({ isDark, t, setSuccess, setError }: WebmasterPingPanelProps) {
  const [bingCode, setBingCode] = useState("");
  const [googleCode, setGoogleCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingTarget, setPingTarget] = useState<string | null>(null);
  const [pingLogs, setPingLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [sitemapStatus, setSitemapStatus] = useState<{ pages: number; accessible: boolean } | null>(null);

  // IndexNow states
  const [indexNowUrls, setIndexNowUrls] = useState("");
  const [indexNowSubmitting, setIndexNowSubmitting] = useState(false);
  const [indexNowKey] = useState("4dc380408a8140fd8b67450af7964725");

  const siteUrl = "https://www.katyaayaniastrologer.com";

  useEffect(() => {
    fetchPingLogs();
    checkSitemap();
    setBingCode(localStorage.getItem("bing_verification_code") || "");
    setGoogleCode(localStorage.getItem("google_verification_code") || "");
  }, []);

    const fetchPingLogs = async () => {
      setLogsLoading(true);
      try {
        const res = await fetch("/api/admin/seo/indexnow");
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        if (data.success) setPingLogs(data.logs || []);
      } catch (err) { console.error(err); }
      finally { setLogsLoading(false); }
    };

  const checkSitemap = async () => {
    try {
      const res = await fetch("/sitemap.xml");
      const text = await res.text();
      const urlCount = (text.match(/<url>/g) || []).length + (text.match(/<sitemap>/g) || []).length;
      setSitemapStatus({ pages: urlCount, accessible: res.ok });
    } catch {
      setSitemapStatus({ pages: 0, accessible: false });
    }
  };

  const handleSaveVerification = () => {
    setSaving(true);
    try {
      localStorage.setItem("bing_verification_code", bingCode);
      localStorage.setItem("google_verification_code", googleCode);
      setSuccess(t("Verification codes saved! Update .env.local with these values for production."));
    } catch {
      setError(t("Failed to save"));
    }
    setSaving(false);
  };

  // Legacy sitemap ping
  const handlePingSitemap = async () => {
    setPinging(true);
    setPingTarget("sitemap");
    try {
      const res = await fetch("/api/admin/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping-sitemap" }),
      });
      const data = await res.json();
      if (data.success) {
        const results = data.results || [];
        const allOk = results.every((r: any) => r.status === "success");
        if (allOk) {
          setSuccess(t("Sitemap pinged to all search engines successfully!"));
        } else {
          const failed = results.filter((r: any) => r.status !== "success");
          setError(t(`Some pings failed: ${failed.map((f: any) => f.target).join(", ")}`));
        }
        fetchPingLogs();
      } else {
        setError(data.message || t("Ping failed"));
      }
    } catch {
      setError(t("Network error during ping"));
    }
    setPinging(false);
    setPingTarget(null);
  };

  // IndexNow submit
  const handleIndexNowSubmit = async (urls?: string[]) => {
    setIndexNowSubmitting(true);
    try {
      const urlList = urls || indexNowUrls.split("\n").map(u => u.trim()).filter(Boolean);
      if (urlList.length === 0) {
        setError(t("Please enter at least one URL"));
        setIndexNowSubmitting(false);
        return;
      }

      const res = await fetch("/api/admin/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlList }),
      });
      const data = await res.json();
      if (data.success) {
        const results = data.results || [];
        const anySuccess = results.some((r: any) => r.status === "success" || r.status === "accepted");
        if (anySuccess) {
          setSuccess(t(`IndexNow: ${data.urlCount} URLs submitted successfully!`));
          setIndexNowUrls("");
        } else {
          setError(t(`IndexNow submission failed. Status codes: ${results.map((r: any) => r.statusCode).join(", ")}`));
        }
        fetchPingLogs();
      } else {
        setError(data.message || t("IndexNow submission failed"));
      }
    } catch {
      setError(t("Network error during IndexNow submission"));
    }
    setIndexNowSubmitting(false);
  };

  // Submit all site pages via IndexNow
  const handleIndexNowSubmitAll = async () => {
    const allPages = [
      `${siteUrl}/`,
      `${siteUrl}/about`,
      `${siteUrl}/services`,
      `${siteUrl}/blog`,
      `${siteUrl}/booking`,
      `${siteUrl}/contact`,
      `${siteUrl}/horoscope`,
      `${siteUrl}/online-consulting`,
      `${siteUrl}/kundli`,
      `${siteUrl}/privacy`,
      `${siteUrl}/terms`,
    ];
    await handleIndexNowSubmit(allPages);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t("Copied to clipboard!"));
  };

  const cardClass = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";
  const inputClass = isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10 text-white" : "bg-white border-[#ff6b35]/20 text-black";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-[#ff6b35]">
          {t("Webmaster & IndexNow")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Manage search engine verification, IndexNow instant indexing, and sitemap pings")}
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${sitemapStatus?.accessible ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{sitemapStatus?.pages || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Sitemap URLs")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{pingLogs.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Total Pings")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{pingLogs.filter(l => l.status === "success" || l.status === "accepted").length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Successful")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{pingLogs.filter(l => l.target?.includes("IndexNow")).length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("IndexNow")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IndexNow Integration - FEATURED */}
      <Card className={`${cardClass} ring-2 ring-purple-500/30`}>
        <CardHeader>
          <CardTitle className="text-purple-500 flex items-center gap-2">
            <Zap className="w-5 h-5" /> {t("IndexNow - Instant Indexing")}
            <Badge className="bg-purple-500/10 text-purple-500 text-[10px] ml-2">RECOMMENDED</Badge>
          </CardTitle>
          <CardDescription>{t("Submit URLs directly to Bing, Yandex, Seznam & Naver for instant indexing")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* IndexNow Key Info */}
          <div className={`p-4 rounded-lg border ${isDark ? "bg-purple-900/10 border-purple-500/20" : "bg-purple-50 border-purple-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" /> {t("API Key")}
              </span>
              <Badge className="bg-green-500/10 text-green-500 text-[10px]">{t("Active")}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className={`flex-1 text-xs font-mono p-2 rounded ${isDark ? "bg-[#0a0a12]" : "bg-white"} border ${isDark ? "border-purple-500/10" : "border-purple-200"}`}>
                {indexNowKey}
              </code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(indexNowKey)} className="shrink-0">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {t("Key file")}: <code className="font-mono">{siteUrl}/{indexNowKey}.txt</code>
              </span>
            </div>
          </div>

          {/* 4-Step Visual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { step: 1, title: t("API Key"), desc: t("Generated"), icon: <Shield className="w-4 h-4" />, done: true },
              { step: 2, title: t("Key File"), desc: t("Hosted at root"), icon: <FileText className="w-4 h-4" />, done: true },
              { step: 3, title: t("Submit URLs"), desc: t("Ready below"), icon: <Send className="w-4 h-4" />, done: false },
              { step: 4, title: t("Verify"), desc: t("Bing Webmaster"), icon: <Search className="w-4 h-4" />, done: false },
            ].map((s) => (
              <div key={s.step} className={`p-3 rounded-lg border text-center ${
                s.done 
                  ? isDark ? "bg-green-900/10 border-green-500/30" : "bg-green-50 border-green-300"
                  : isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : "bg-gray-50 border-gray-200"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  s.done ? "bg-green-500/20 text-green-500" : "bg-purple-500/20 text-purple-500"
                }`}>
                  {s.done ? <CheckCircle className="w-4 h-4" /> : s.icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step {s.step}</p>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Submit URLs */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">{t("Submit URLs via IndexNow")}</label>
            <Textarea
              placeholder={`Enter URLs (one per line):\n${siteUrl}/\n${siteUrl}/blog\n${siteUrl}/services`}
              value={indexNowUrls}
              onChange={(e) => setIndexNowUrls(e.target.value)}
              className={`${inputClass} min-h-[100px] font-mono text-xs`}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleIndexNowSubmit()}
                disabled={indexNowSubmitting || !indexNowUrls.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {indexNowSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {t("Submit to IndexNow")}
              </Button>
              <Button
                onClick={handleIndexNowSubmitAll}
                disabled={indexNowSubmitting}
                variant="outline"
                className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
              >
                {indexNowSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                {t("Submit All Site Pages")}
              </Button>
            </div>
          </div>

          {/* IndexNow endpoints info */}
          <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0a0a12] border-purple-500/10" : "bg-gray-50 border-gray-200"}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("IndexNow Endpoints")}</p>
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              <p>POST https://api.indexnow.org/IndexNow</p>
              <p>POST https://www.bing.com/IndexNow</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {t("IndexNow notifies Bing, Yandex, Seznam.cz, and Naver simultaneously.")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webmaster Verification */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <Shield className="w-5 h-5" /> {t("Webmaster Verification")}
          </CardTitle>
          <CardDescription>{t("Add verification codes for search engine webmaster tools")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Verification */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" /> {t("Google Search Console")}
              {googleCode && <Badge className="bg-green-500/10 text-green-500 text-[10px]">{t("Configured")}</Badge>}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Google verification code (e.g., 2Edo_sTI7Jp85F7z7xr0y...)"
                value={googleCode}
                onChange={(e) => setGoogleCode(e.target.value)}
                className={inputClass}
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`<meta name="google-site-verification" content="${googleCode}" />`)} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("Environment variable")}: <code className="font-mono bg-muted px-1 rounded">NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION</code>
            </p>
          </div>

          {/* Bing Verification */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" /> {t("Bing Webmaster Tools")}
              {bingCode && <Badge className="bg-green-500/10 text-green-500 text-[10px]">{t("Configured")}</Badge>}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Bing verification code (msvalidate.01 content value)"
                value={bingCode}
                onChange={(e) => setBingCode(e.target.value)}
                className={inputClass}
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`<meta name="msvalidate.01" content="${bingCode}" />`)} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("Environment variable")}: <code className="font-mono bg-muted px-1 rounded">NEXT_PUBLIC_BING_VERIFICATION</code>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveVerification} disabled={saving} className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("Save Verification Codes")}
            </Button>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1">
                <ExternalLink className="w-3 h-3" /> Google Console
              </Button>
            </a>
            <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1">
                <ExternalLink className="w-3 h-3" /> Bing Webmaster
              </Button>
            </a>
          </div>

          {/* Meta Tag Preview */}
          <div className={`mt-4 p-3 rounded-lg border ${isDark ? "bg-[#0a0a12] border-[#ff6b35]/5" : "bg-gray-50 border-gray-200"}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("Meta Tags Preview (in <head>)")}</p>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{googleCode ? `<meta name="google-site-verification" content="${googleCode}" />` : "<!-- Google verification not set -->"}{"\n"}
{bingCode ? `<meta name="msvalidate.01" content="${bingCode}" />` : "<!-- Bing verification not set -->"}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Sitemap Ping */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <Send className="w-5 h-5" /> {t("Sitemap Ping")}
          </CardTitle>
          <CardDescription>{t("Notify Google & Bing about sitemap updates via legacy ping protocol")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Google Ping</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 font-mono break-all">
                google.com/ping?sitemap={siteUrl}/sitemap.xml
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-cyan-500" />
                <span className="font-semibold">Bing Ping</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 font-mono break-all">
                bing.com/ping?sitemap={siteUrl}/sitemap.xml
              </p>
            </div>
          </div>

          <Button
            onClick={handlePingSitemap}
            disabled={pinging}
            className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white font-bold py-3"
          >
            {pinging && pingTarget === "sitemap" ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
            {t("Ping Sitemap to All Search Engines")}
          </Button>

          {/* Sitemap Links */}
          <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0a0a12] border-[#ff6b35]/5" : "bg-gray-50 border-gray-200"}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("Sitemap URLs")}</p>
            <div className="space-y-1">
              {["/sitemap.xml"].map((path) => (
                <div key={path} className="flex items-center justify-between">
                  <code className="text-xs font-mono text-muted-foreground">{siteUrl}{path}</code>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(`${siteUrl}${path}`)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <a href={path} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ping & IndexNow Logs */}
      <Card className={cardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#ff6b35] flex items-center gap-2">
                <Clock className="w-5 h-5" /> {t("Ping & IndexNow History")}
              </CardTitle>
              <CardDescription>{t("Recent search engine submission activity")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPingLogs} disabled={logsLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${logsLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
            </div>
          ) : pingLogs.length === 0 ? (
            <div className="text-center py-8">
              <Send className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground italic">{t("No history yet. Submit your first URLs!")}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pingLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? "bg-[#1a1a2e] border-[#ff6b35]/5" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {log.status === "success" || log.status === "accepted" ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{log.target}</span>
                        <Badge className={`text-[9px] ${
                          log.status === "success" || log.status === "accepted" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {log.status === "success" ? "OK" : log.status === "accepted" ? "ACCEPTED" : "FAILED"}
                        </Badge>
                        {log.status_code > 0 && (
                          <Badge variant="outline" className="text-[9px]">HTTP {log.status_code}</Badge>
                        )}
                        {log.target?.includes("IndexNow") && (
                          <Badge className="bg-purple-500/10 text-purple-500 text-[9px]">IndexNow</Badge>
                        )}
                      </div>
                      {log.sitemap_url && log.sitemap_url.length < 80 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{log.sitemap_url}</p>
                      )}
                      {log.error_message && (
                        <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <ExternalLink className="w-5 h-5" /> {t("Quick Links")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "IndexNow Documentation", url: "https://www.indexnow.org/documentation", color: "purple" },
              { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", color: "cyan" },
              { label: "Google Search Console", url: "https://search.google.com/search-console", color: "blue" },
              { label: "Google PageSpeed", url: `https://pagespeed.web.dev/analysis?url=${siteUrl}`, color: "green" },
              { label: "Rich Results Test", url: `https://search.google.com/test/rich-results?url=${siteUrl}`, color: "purple" },
              { label: "Schema Validator", url: "https://validator.schema.org/", color: "rose" },
            ].map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className={`p-3 rounded-lg border transition-all hover:scale-[1.02] hover:shadow-md ${isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10 hover:border-[#ff6b35]/30" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
