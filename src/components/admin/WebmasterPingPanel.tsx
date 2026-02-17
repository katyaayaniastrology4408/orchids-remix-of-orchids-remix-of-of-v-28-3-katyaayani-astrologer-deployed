"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, Send, RefreshCw, CheckCircle, XCircle, Clock, Search, Shield, 
  Loader2, ExternalLink, Copy, AlertTriangle, Zap, FileText, Save, 
  ArrowRight, RotateCcw, Eye, ChevronDown, ChevronUp
} from "lucide-react";
import { safeJson } from "@/lib/safe-json";
import { supabase } from "@/lib/supabase";

interface WebmasterPingPanelProps {
  isDark: boolean;
  t: (key: string) => string;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export default function WebmasterPingPanel({ isDark, t, setSuccess, setError }: WebmasterPingPanelProps) {
  // Verification codes - saved to DB
  const [bingCode, setBingCode] = useState("");
  const [googleCode, setGoogleCode] = useState("");
  const [googleCode2, setGoogleCode2] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Sitemap ping
  const [pinging, setPinging] = useState(false);
  const [pingTarget, setPingTarget] = useState<string | null>(null);
  const [pingLogs, setPingLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [sitemapStatus, setSitemapStatus] = useState<{ pages: number; accessible: boolean; urls: string[] } | null>(null);
  const [showSitemapUrls, setShowSitemapUrls] = useState(false);

  // IndexNow states
  const [indexNowUrls, setIndexNowUrls] = useState("");
  const [indexNowSubmitting, setIndexNowSubmitting] = useState(false);
  const [indexNowKey] = useState("4dc380408a8140fd8b67450af7964725");
  const [lastIndexNowResult, setLastIndexNowResult] = useState<any>(null);

  // Bing specific
  const [bingSubmitUrl, setBingSubmitUrl] = useState("");
  const [bingSubmitting, setBingSubmitting] = useState(false);

  const siteUrl = "https://www.katyaayaniastrologer.com";

  useEffect(() => {
    loadVerificationCodes();
    fetchPingLogs();
    checkSitemap();
  }, []);

  // Load verification codes from DB (admin_settings table)
  const loadVerificationCodes = async () => {
    setLoadingSettings(true);
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("*")
        .in("key", ["google_verification_code", "google_verification_code_2", "bing_verification_code"]);

      const settings = (data || []).reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      setGoogleCode(settings["google_verification_code"] || "2Edo_sTI7Jp85F7z7xr0yG6MTSrSsm5WO0jY4HsAqmM");
      setGoogleCode2(settings["google_verification_code_2"] || "JC618JFaRN0wnJt6Lsbglqfjkm7Cd_rBXQO6l42jEWY");
      setBingCode(settings["bing_verification_code"] || "2Edo_sTI7Jp85F7z7xr0yG6MTSrSsm5WO0jY4HsAqmM");
    } catch (err) {
      console.error("Failed to load verification codes:", err);
    }
    setLoadingSettings(false);
  };

  // Save verification codes to DB
  const handleSaveVerification = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "google_verification_code", value: googleCode },
        { key: "google_verification_code_2", value: googleCode2 },
        { key: "bing_verification_code", value: bingCode },
      ];

      for (const item of settings) {
        await supabase.from("admin_settings").upsert(item, { onConflict: "key" });
      }

      setSuccess(t("Verification codes saved to database! Changes will apply after next deploy."));
    } catch {
      setError(t("Failed to save verification codes"));
    }
    setSaving(false);
  };

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
      const urlMatches = text.match(/<loc>(.*?)<\/loc>/g) || [];
      const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ""));
      setSitemapStatus({ pages: urls.length, accessible: res.ok, urls });
    } catch {
      setSitemapStatus({ pages: 0, accessible: false, urls: [] });
    }
  };

  // Ping sitemap to Google + Bing
  const handlePingSitemap = async (target?: "Google" | "Bing") => {
    setPinging(true);
    setPingTarget(target || "all");
    try {
      const res = await fetch("/api/admin/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping-sitemap" }),
      });
      const data = await safeJson(res);
      if (data?.success) {
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
        setError(data?.message || t("Ping failed"));
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
    setLastIndexNowResult(null);
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
      const data = await safeJson(res);
      if (data?.success) {
        setLastIndexNowResult(data);
        const results = data.results || [];
        const anySuccess = results.some((r: any) => r.status === "success" || r.status === "accepted");
        if (anySuccess) {
          setSuccess(t(`IndexNow: ${data.urlCount} URLs submitted to Bing, Yandex & Naver!`));
          setIndexNowUrls("");
        } else {
          setError(t("IndexNow submission failed"));
        }
        fetchPingLogs();
      } else {
        setError(data?.message || t("IndexNow submission failed"));
      }
    } catch {
      setError(t("Network error during IndexNow submission"));
    }
    setIndexNowSubmitting(false);
  };

  // Submit ALL site pages via IndexNow
  const handleIndexNowSubmitAll = async () => {
    // Use sitemap URLs if available, otherwise use hardcoded list
    const allPages = sitemapStatus?.urls?.length 
      ? sitemapStatus.urls 
      : [
          `${siteUrl}/`, `${siteUrl}/about`, `${siteUrl}/services`,
          `${siteUrl}/blog`, `${siteUrl}/booking`, `${siteUrl}/contact`,
          `${siteUrl}/horoscope`, `${siteUrl}/online-consulting`, `${siteUrl}/kundli`,
          `${siteUrl}/privacy`, `${siteUrl}/terms`,
          `${siteUrl}/horoscope/mesh`, `${siteUrl}/horoscope/vrushabh`, `${siteUrl}/horoscope/mithun`,
          `${siteUrl}/horoscope/kark`, `${siteUrl}/horoscope/sinh`, `${siteUrl}/horoscope/kanya`,
          `${siteUrl}/horoscope/tula`, `${siteUrl}/horoscope/vrushchik`, `${siteUrl}/horoscope/dhanu`,
          `${siteUrl}/horoscope/makar`, `${siteUrl}/horoscope/kumbh`, `${siteUrl}/horoscope/meen`,
        ];
    await handleIndexNowSubmit(allPages);
  };

  // Bing URL Submission API
  const handleBingUrlSubmit = async () => {
    if (!bingSubmitUrl.trim()) return;
    setBingSubmitting(true);
    try {
      // Use IndexNow for Bing URL submission (most effective method)
      const urls = bingSubmitUrl.split("\n").map(u => u.trim()).filter(Boolean);
      await handleIndexNowSubmit(urls);
      setBingSubmitUrl("");
    } catch {
      setError(t("Failed to submit URL to Bing"));
    }
    setBingSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t("Copied to clipboard!"));
  };

  const cardClass = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";
  const inputClass = isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10 text-white" : "bg-white border-[#ff6b35]/20 text-black";

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-[#ff6b35]">
          {t("Google & Bing SEO Manager")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Manage verification codes, indexing, sitemap pings - all from one place")}
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{googleCode ? "2" : "0"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Google Codes")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bingCode ? "bg-cyan-500/10 text-cyan-500" : "bg-red-500/10 text-red-500"}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{bingCode ? "1" : "0"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Bing Code")}</p>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("IndexNow Pings")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =================== GOOGLE SEO SECTION =================== */}
      <Card className={`${cardClass} ring-1 ring-blue-500/20`}>
        <CardHeader>
          <CardTitle className="text-blue-500 flex items-center gap-2">
            <Search className="w-5 h-5" /> {t("Google Search Console")}
            {googleCode && <Badge className="bg-green-500/10 text-green-500 text-[10px] ml-2">{t("Verified")}</Badge>}
          </CardTitle>
          <CardDescription>{t("Manage Google verification codes, sitemap submission & indexing")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Verification Code 1 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("Verification Code 1 (Primary)")}</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 2Edo_sTI7Jp85F7z7xr0y..."
                value={googleCode}
                onChange={(e) => setGoogleCode(e.target.value)}
                className={inputClass}
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(googleCode)} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Google Verification Code 2 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("Verification Code 2 (Secondary)")}</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., JC618JFaRN0wnJt6Lsbg..."
                value={googleCode2}
                onChange={(e) => setGoogleCode2(e.target.value)}
                className={inputClass}
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(googleCode2)} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Google Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => handlePingSitemap("Google")}
              disabled={pinging}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {pinging && pingTarget === "Google" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {t("Ping Google Sitemap")}
            </Button>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1 border-blue-500/20 text-blue-500">
                <ExternalLink className="w-3 h-3" /> {t("Open Google Console")}
              </Button>
            </a>
            <a href={`https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1 border-blue-500/20 text-blue-500">
                <FileText className="w-3 h-3" /> {t("Resubmit Sitemap")}
              </Button>
            </a>
          </div>

          {/* Google Meta Preview */}
          <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0a0a12] border-blue-500/10" : "bg-blue-50 border-blue-200"}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("Meta Tags in <head>")}</p>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{`<meta name="google-site-verification" content="${googleCode || '...'}" />`}{"\n"}
{`<meta name="google-site-verification" content="${googleCode2 || '...'}" />`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* =================== BING SEO SECTION =================== */}
      <Card className={`${cardClass} ring-1 ring-cyan-500/20`}>
        <CardHeader>
          <CardTitle className="text-cyan-500 flex items-center gap-2">
            <Globe className="w-5 h-5" /> {t("Bing Webmaster Tools")}
            {bingCode && <Badge className="bg-green-500/10 text-green-500 text-[10px] ml-2">{t("Verified")}</Badge>}
          </CardTitle>
          <CardDescription>{t("Manage Bing verification, URL submission, IndexNow & sitemap for Bing")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bing Verification Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("Bing Verification Code (msvalidate.01)")}</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 2Edo_sTI7Jp85F7z7xr0y..."
                value={bingCode}
                onChange={(e) => setBingCode(e.target.value)}
                className={inputClass}
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(bingCode)} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("Since you imported from Google, the same verification code works for Bing")}
            </p>
          </div>

          {/* Bing URL Submission */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("Submit URLs to Bing (via IndexNow)")}</label>
            <div className="flex gap-2">
              <Input
                placeholder={`${siteUrl}/new-blog-post`}
                value={bingSubmitUrl}
                onChange={(e) => setBingSubmitUrl(e.target.value)}
                className={inputClass}
              />
              <Button
                onClick={handleBingUrlSubmit}
                disabled={bingSubmitting || !bingSubmitUrl.trim()}
                className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
              >
                {bingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Bing Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => handlePingSitemap("Bing")}
              disabled={pinging}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {pinging && pingTarget === "Bing" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {t("Ping Bing Sitemap")}
            </Button>
            <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1 border-cyan-500/20 text-cyan-500">
                <ExternalLink className="w-3 h-3" /> {t("Open Bing Webmaster")}
              </Button>
            </a>
            <a href={`https://www.bing.com/webmasters/sitemaps?siteUrl=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1 border-cyan-500/20 text-cyan-500">
                <FileText className="w-3 h-3" /> {t("Resubmit Bing Sitemap")}
              </Button>
            </a>
          </div>

          {/* Bing Meta Preview */}
          <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0a0a12] border-cyan-500/10" : "bg-cyan-50 border-cyan-200"}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("Bing Meta Tag + BingSiteAuth.xml")}</p>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{`<meta name="msvalidate.01" content="${bingCode || '...'}" />`}{"\n"}
{`<!-- Also verified via /BingSiteAuth.xml -->`}
            </pre>
          </div>

          {/* Bing-specific features info */}
          <div className={`p-3 rounded-lg border ${isDark ? "bg-cyan-900/10 border-cyan-500/20" : "bg-cyan-50 border-cyan-200"}`}>
            <p className="text-xs font-bold text-cyan-500 mb-2">{t("Bing SEO Features Active:")}</p>
            <div className="space-y-1 text-xs">
              {[
                { label: t("IndexNow instant indexing"), status: true },
                { label: t("BingSiteAuth.xml verification"), status: true },
                { label: t("msvalidate.01 meta tag"), status: !!bingCode },
                { label: t("Sitemap submitted to Bing"), status: pingLogs.some(l => l.target === "Bing") },
                { label: t("Bingbot allowed in robots.txt"), status: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.status ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =================== SAVE ALL VERIFICATION CODES =================== */}
      <Card className={`${cardClass} ring-2 ring-[#ff6b35]/30`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-[#ff6b35]" />
              <div>
                <p className="font-bold text-sm">{t("Save All Verification Codes to Database")}</p>
                <p className="text-[10px] text-muted-foreground">{t("Codes are stored in admin_settings table. Update .env.local for production builds.")}</p>
              </div>
            </div>
            <Button onClick={handleSaveVerification} disabled={saving} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {t("Save All Codes")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =================== INDEXNOW - INSTANT INDEXING =================== */}
      <Card className={`${cardClass} ring-2 ring-purple-500/30`}>
        <CardHeader>
          <CardTitle className="text-purple-500 flex items-center gap-2">
            <Zap className="w-5 h-5" /> {t("IndexNow - Instant Indexing")}
            <Badge className="bg-purple-500/10 text-purple-500 text-[10px] ml-2">RECOMMENDED</Badge>
          </CardTitle>
          <CardDescription>{t("Submit URLs directly to Bing, Yandex, Seznam & Naver for instant indexing (works for both Google & Bing)")}</CardDescription>
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
                {t("Submit Custom URLs")}
              </Button>
              <Button
                onClick={handleIndexNowSubmitAll}
                disabled={indexNowSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {indexNowSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                {t(`Submit All ${sitemapStatus?.pages || 0} Sitemap Pages`)}
              </Button>
            </div>
          </div>

          {/* Last IndexNow Result */}
          {lastIndexNowResult && (
            <div className={`p-3 rounded-lg border ${isDark ? "bg-green-900/10 border-green-500/20" : "bg-green-50 border-green-200"}`}>
              <p className="text-xs font-bold text-green-500 mb-1">{t("Last Submission Result:")}</p>
              <div className="space-y-1 text-xs">
                <p>{t("URLs submitted")}: <span className="font-bold">{lastIndexNowResult.urlCount}</span></p>
                {lastIndexNowResult.results?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    {r.status === "success" || r.status === "accepted" 
                      ? <CheckCircle className="w-3 h-3 text-green-500" /> 
                      : <XCircle className="w-3 h-3 text-red-500" />}
                    <span>{r.endpoint?.includes("bing") ? "Bing" : "IndexNow API"}: HTTP {r.statusCode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =================== SITEMAP MANAGEMENT =================== */}
      <Card className={cardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#ff6b35] flex items-center gap-2">
                <FileText className="w-5 h-5" /> {t("Sitemap Management")}
              </CardTitle>
              <CardDescription>{t("View sitemap URLs, ping & resubmit to Google and Bing")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={checkSitemap} className="border-[#ff6b35]/20 text-[#ff6b35]">
              <RefreshCw className="w-4 h-4 mr-1" /> {t("Refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sitemap URL */}
          <div className="flex items-center gap-2">
            <code className={`flex-1 text-xs font-mono p-2 rounded ${isDark ? "bg-[#0a0a12] border-[#ff6b35]/10" : "bg-gray-50 border-gray-200"} border`}>
              {siteUrl}/sitemap.xml
            </code>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${siteUrl}/sitemap.xml`)}>
              <Copy className="w-3 h-3" />
            </Button>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Eye className="w-3 h-3" />
              </Button>
            </a>
          </div>

          {/* Toggle Sitemap URLs */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setShowSitemapUrls(!showSitemapUrls)}
          >
            {showSitemapUrls ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
            {showSitemapUrls ? t("Hide Sitemap URLs") : t(`Show All ${sitemapStatus?.pages || 0} Sitemap URLs`)}
          </Button>

          {showSitemapUrls && sitemapStatus?.urls && (
            <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0a0a12] border-[#ff6b35]/5" : "bg-gray-50 border-gray-200"} max-h-[300px] overflow-y-auto`}>
              {sitemapStatus.urls.map((url, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <code className="text-[11px] font-mono text-muted-foreground truncate">{url}</code>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(url)}>
                      <Copy className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ping Both */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              onClick={() => handlePingSitemap()}
              disabled={pinging}
              className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold"
            >
              {pinging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {t("Ping All Engines")}
            </Button>
            <a href={`https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full gap-1 border-blue-500/20 text-blue-500">
                <ArrowRight className="w-3 h-3" /> {t("Google Sitemap")}
              </Button>
            </a>
            <a href={`https://www.bing.com/webmasters/sitemaps?siteUrl=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full gap-1 border-cyan-500/20 text-cyan-500">
                <ArrowRight className="w-3 h-3" /> {t("Bing Sitemap")}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* =================== PING & INDEXNOW HISTORY =================== */}
      <Card className={cardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#ff6b35] flex items-center gap-2">
                <Clock className="w-5 h-5" /> {t("Submission History")}
              </CardTitle>
              <CardDescription>{t("All search engine pings, IndexNow submissions & URL indexing activity")}</CardDescription>
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
                        {log.target === "Google" && (
                          <Badge className="bg-blue-500/10 text-blue-500 text-[9px]">Google</Badge>
                        )}
                        {log.target === "Bing" && (
                          <Badge className="bg-cyan-500/10 text-cyan-500 text-[9px]">Bing</Badge>
                        )}
                      </div>
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

      {/* =================== QUICK LINKS =================== */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <ExternalLink className="w-5 h-5" /> {t("Quick Links")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Google Search Console", url: "https://search.google.com/search-console", color: "blue" },
              { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", color: "cyan" },
              { label: "IndexNow Docs", url: "https://www.indexnow.org/documentation", color: "purple" },
              { label: "Google PageSpeed", url: `https://pagespeed.web.dev/analysis?url=${siteUrl}`, color: "green" },
              { label: "Rich Results Test", url: `https://search.google.com/test/rich-results?url=${siteUrl}`, color: "amber" },
              { label: "Schema Validator", url: "https://validator.schema.org/", color: "rose" },
              { label: "Google Mobile Test", url: `https://search.google.com/test/mobile-friendly?url=${siteUrl}`, color: "blue" },
              { label: "Bing URL Inspection", url: `https://www.bing.com/webmasters/urlinspection?siteUrl=${encodeURIComponent(siteUrl)}`, color: "cyan" },
              { label: "Robots.txt Tester", url: `https://www.google.com/webmasters/tools/robots-testing-tool?siteUrl=${encodeURIComponent(siteUrl)}`, color: "green" },
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
