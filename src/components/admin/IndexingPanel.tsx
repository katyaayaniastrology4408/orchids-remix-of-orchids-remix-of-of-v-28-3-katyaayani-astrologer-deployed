"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Send, RefreshCw, CheckCircle, XCircle, Clock, Loader2,
  ExternalLink, Zap, FileText, RotateCcw, AlertTriangle, Search
} from "lucide-react";
import { safeJson } from "@/lib/safe-json";

interface IndexingPanelProps {
  isDark: boolean;
  t: (key: string) => string;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

const SITE_URL = "https://www.katyaayaniastrologer.com";

const ALL_PAGES = [
  // Core pages
  `${SITE_URL}/`,
  `${SITE_URL}/about`,
  `${SITE_URL}/services`,
  `${SITE_URL}/booking`,
  `${SITE_URL}/online-consulting`,
  `${SITE_URL}/contact`,
  `${SITE_URL}/feedback`,
  // Content pages
  `${SITE_URL}/blog`,
  `${SITE_URL}/blog/why-astrology`,
  `${SITE_URL}/blog/website-successfullylaunched`,
  `${SITE_URL}/rashifal`,
  `${SITE_URL}/hindu-calendar`,
  `${SITE_URL}/important-days`,
  `${SITE_URL}/horoscope`,
  `${SITE_URL}/kundli`,
  // Legal
  `${SITE_URL}/privacy`,
  `${SITE_URL}/terms`,
  `${SITE_URL}/refund-policy`,
  `${SITE_URL}/disclaimer`,
  // Horoscope sign pages (English slugs)
  `${SITE_URL}/horoscope/aries`,
  `${SITE_URL}/horoscope/taurus`,
  `${SITE_URL}/horoscope/gemini`,
  `${SITE_URL}/horoscope/cancer`,
  `${SITE_URL}/horoscope/leo`,
  `${SITE_URL}/horoscope/virgo`,
  `${SITE_URL}/horoscope/libra`,
  `${SITE_URL}/horoscope/scorpio`,
  `${SITE_URL}/horoscope/sagittarius`,
  `${SITE_URL}/horoscope/capricorn`,
  `${SITE_URL}/horoscope/aquarius`,
  `${SITE_URL}/horoscope/pisces`,
];

type LogEntry = {
  id: string;
  target: string;
  sitemap_url: string;
  status: string;
  response_code: number | null;
  response_body: string | null;
  error_message: string | null;
  created_at: string;
};

export default function IndexingPanel({ isDark, t, setSuccess, setError }: IndexingPanelProps) {
  const [customUrls, setCustomUrls] = useState("");
  const [submitting, setSubmitting] = useState<"all" | "google" | "bing" | "custom" | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [sitemapPages, setSitemapPages] = useState(0);
  const [sitemapOk, setSitemapOk] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const cardClass = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";

  useEffect(() => {
    fetchLogs();
    checkSitemap();
  }, []);

  const checkSitemap = async () => {
    try {
      const res = await fetch("/sitemap.xml");
      const text = await res.text();
      const matches = text.match(/<loc>/g) || [];
      setSitemapPages(matches.length);
      setSitemapOk(res.ok);
    } catch {
      setSitemapOk(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/seo/indexnow");
      if (!res.ok) return;
      const data = await safeJson(res);
      if (data?.success) setLogs(data.logs || []);
    } catch {}
    finally { setLogsLoading(false); }
  };

  const submitIndexNow = async (urls: string[], label: "all" | "google" | "bing" | "custom") => {
    setSubmitting(label);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await safeJson(res);
      setLastResult(data);
      if (data?.success) {
        const results = data.results || [];
        const ok = results.filter((r: any) => r.status === "success" || r.status === "accepted").length;
        setSuccess(t(`${urls.length} URLs submitted! ${ok}/${results.length} search engines accepted.`));
        if (label === "custom") setCustomUrls("");
        fetchLogs();
      } else {
        setError(data?.message || t("Submission failed"));
      }
    } catch {
      setError(t("Network error. Try again."));
    }
    setSubmitting(null);
  };

  const pingSitemap = async (target: "Google" | "Bing" | "all") => {
    const label = target === "Google" ? "google" : target === "Bing" ? "bing" : "all";
    setSubmitting(label as any);
    try {
      const res = await fetch("/api/admin/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping-sitemap", target }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setSuccess(t(`Sitemap pinged to ${target} successfully!`));
        fetchLogs();
      } else {
        setError(data?.message || t("Ping failed"));
      }
    } catch {
      setError(t("Network error"));
    }
    setSubmitting(null);
  };

  const handleCustomSubmit = () => {
    const urls = customUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (!urls.length) { setError(t("Enter at least one valid URL starting with http")); return; }
    submitIndexNow(urls, "custom");
  };

  const statusColor = (s: string) => {
    if (s === "success" || s === "accepted") return "bg-green-500/10 text-green-500 border-green-500/20";
    if (s === "failed" || s === "error") return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* Header */}
      <div className={`p-5 rounded-2xl border ${cardClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#ff6b35] flex items-center gap-2">
              <Search className="w-5 h-5" /> {t("Google & Bing Indexing")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Submit your pages to Google and Bing for faster indexing")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sitemapOk === null ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : sitemapOk ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
              {sitemapOk === null ? <Clock className="w-3 h-3" /> : sitemapOk ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              Sitemap {sitemapOk === null ? "..." : sitemapOk ? `${sitemapPages} pages` : "Error"}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Submit All to Google + Bing */}
        <Card className={cardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ff6b35]/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#ff6b35]" />
              </div>
              {t("Submit All Pages")}
            </CardTitle>
            <CardDescription>{t("Submit all")}{" "}{ALL_PAGES.length}{" "}{t("pages to Google & Bing at once")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {ALL_PAGES.slice(0, 6).map(u => (
                <span key={u} className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "bg-white/5 border-white/10 text-muted-foreground" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                  {u.replace(SITE_URL, "")||"/"}
                </span>
              ))}
              {ALL_PAGES.length > 6 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/20">
                  +{ALL_PAGES.length - 6} {t("more")}
                </span>
              )}
            </div>
            <Button
              className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold"
              disabled={!!submitting}
              onClick={() => submitIndexNow(ALL_PAGES, "all")}
            >
              {submitting === "all" ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("Submitting...")}</> : <><Send className="w-4 h-4 mr-2" />{t("Submit All to Google & Bing")}</>}
            </Button>
          </CardContent>
        </Card>

        {/* Ping Sitemap */}
        <Card className={cardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              {t("Ping Sitemap")}
            </CardTitle>
            <CardDescription>{t("Notify search engines your sitemap has updated")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-3 rounded-lg text-xs ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
              <p className="font-mono text-[11px] text-muted-foreground break-all">{SITE_URL}/sitemap.xml</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#4285f4]/30 text-[#4285f4] hover:bg-[#4285f4]/10 font-bold"
                disabled={!!submitting}
                onClick={() => pingSitemap("Google")}
              >
                {submitting === "google" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                Google
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10 font-bold"
                disabled={!!submitting}
                onClick={() => pingSitemap("Bing")}
              >
                {submitting === "bing" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                Bing
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#ff6b35]/30 text-[#ff6b35] hover:bg-[#ff6b35]/10 font-bold"
              disabled={!!submitting}
              onClick={() => pingSitemap("all")}
            >
              {submitting === "all" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />}
              {t("Ping Both")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Custom URL Submit */}
      <Card className={cardClass}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-500" />
            </div>
            {t("Submit Specific URLs")}
          </CardTitle>
          <CardDescription>{t("Submit individual pages — one URL per line")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={customUrls}
            onChange={e => setCustomUrls(e.target.value)}
            placeholder={`${SITE_URL}/blog/your-post\n${SITE_URL}/services`}
            rows={4}
            className={`font-mono text-xs ${isDark ? "bg-white/5 border-white/10" : ""}`}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            disabled={!!submitting || !customUrls.trim()}
            onClick={handleCustomSubmit}
          >
            {submitting === "custom" ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("Submitting...")}</> : <><Send className="w-4 h-4 mr-2" />{t("Submit to Google & Bing")}</>}
          </Button>
        </CardContent>
      </Card>

      {/* Last Result */}
      {lastResult && (
        <Card className={`${cardClass} border-2 ${lastResult.success ? "border-green-500/30" : "border-red-500/30"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {lastResult.success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              {t("Last Submission Result")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(lastResult.results || []).map((r: any, i: number) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <span className="font-bold">{r.target || r.engine}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(r.status)}`}>{r.status}</span>
                </div>
              ))}
              {lastResult.urlCount && (
                <p className="text-xs text-muted-foreground pt-1">{lastResult.urlCount} {t("URLs submitted")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Logs */}
      <Card className={cardClass}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {t("Indexing History")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={logsLoading}>
              <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {t("No indexing submissions yet")}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 20).map((log) => (
                <div key={log.id} className={`flex items-center justify-between p-3 rounded-xl border text-xs ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold truncate">{log.target}</span>
                      {log.response_body && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>{log.response_body}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{log.sitemap_url?.substring(0, 60)}{log.sitemap_url?.length > 60 ? "..." : ""}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                  </div>
                  <div className="ml-2 shrink-0 flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(log.status)}`}>
                      {log.status}
                    </span>
                    {log.response_code && <span className="text-[9px] text-muted-foreground">HTTP {log.response_code}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t("Open in Search Console")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {[
                { label: "Google Search Console", url: "https://search.google.com/search-console", color: "text-[#4285f4]" },
                { label: "Google URL Inspection", url: `https://search.google.com/search-console/inspect?resource_id=sc-domain%3Akatyaayaniastrologer.com`, color: "text-[#4285f4]" },
                { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", color: "text-[#00b4d8]" },
                { label: "Bing URL Submission", url: `https://www.bing.com/webmasters/indexnow?siteUrl=${encodeURIComponent(SITE_URL)}`, color: "text-[#00b4d8]" },
                { label: "Google Rich Results Test", url: `https://search.google.com/test/rich-results?url=${SITE_URL}`, color: "text-green-500" },
                { label: "Google PageSpeed", url: `https://pagespeed.web.dev/analysis?url=${SITE_URL}`, color: "text-orange-500" },
              ].map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                <span className={`text-sm font-semibold ${link.color}`}>{link.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
