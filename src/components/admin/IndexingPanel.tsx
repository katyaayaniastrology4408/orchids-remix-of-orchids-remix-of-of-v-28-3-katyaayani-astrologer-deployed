"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe, Send, RefreshCw, CheckCircle, XCircle, Clock, Loader2,
  ExternalLink, Zap, FileText, AlertTriangle, Search, Info
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
  `${SITE_URL}/`,
  `${SITE_URL}/about`,
  `${SITE_URL}/services`,
  `${SITE_URL}/booking`,
  `${SITE_URL}/online-consulting`,
  `${SITE_URL}/contact`,
  `${SITE_URL}/feedback`,
  `${SITE_URL}/blog`,
  `${SITE_URL}/blog/why-astrology`,
  `${SITE_URL}/blog/website-successfullylaunched`,
  `${SITE_URL}/rashifal`,
  `${SITE_URL}/hindu-calendar`,
  `${SITE_URL}/important-days`,
  `${SITE_URL}/horoscope`,
  `${SITE_URL}/kundli`,
  `${SITE_URL}/privacy`,
  `${SITE_URL}/terms`,
  `${SITE_URL}/refund-policy`,
  `${SITE_URL}/disclaimer`,
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

type SubmitResult = {
  target: string;
  status: string;
  statusCode?: number;
  message?: string;
  body?: string;
};

export default function IndexingPanel({ isDark, t, setSuccess, setError }: IndexingPanelProps) {
  const [customUrls, setCustomUrls] = useState("");
  const [submitting, setSubmitting] = useState<"all" | "bing" | "custom" | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [sitemapPages, setSitemapPages] = useState(0);
  const [sitemapOk, setSitemapOk] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<{ success: boolean; results: SubmitResult[]; urlCount?: number } | null>(null);

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

  const submitIndexNow = async (urls: string[], label: "all" | "bing" | "custom") => {
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
        const results: SubmitResult[] = data.results || [];
        const ok = results.filter(r => r.status === "success").length;
        setSuccess(`${urls.length} URLs submitted to Bing via IndexNow! (${ok} accepted)`);
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

  const handleCustomSubmit = () => {
    const urls = customUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (!urls.length) { setError(t("Enter at least one valid URL starting with http")); return; }
    submitIndexNow(urls, "custom");
  };

  const statusColor = (s: string) => {
    if (s === "success") return "bg-green-500/10 text-green-500 border-green-500/20";
    if (s === "failed" || s === "error") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (s === "info") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  const statusIcon = (s: string) => {
    if (s === "success") return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (s === "failed" || s === "error") return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    if (s === "info") return <Info className="w-3.5 h-3.5 text-blue-500" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
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
              {t("Submit pages to Bing via IndexNow · Google via Search Console")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              sitemapOk === null ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
              : sitemapOk ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
              {sitemapOk === null ? <Clock className="w-3 h-3" /> : sitemapOk ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              Sitemap {sitemapOk === null ? "..." : sitemapOk ? `${sitemapPages} pages` : "Error"}
            </div>
          </div>
        </div>
      </div>

      {/* Google info banner */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? "bg-[#4285f4]/5 border-[#4285f4]/20" : "bg-[#4285f4]/5 border-[#4285f4]/20"}`}>
        <Info className="w-4 h-4 text-[#4285f4] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#4285f4]">Google Indexing — Search Console Required</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Google deprecated its sitemap ping API in January 2024. To index pages on Google, submit your sitemap manually via Google Search Console.
          </p>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#4285f4] hover:underline"
          >
            Open Google Search Console <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Submit All to Bing via IndexNow */}
        <Card className={cardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00b4d8]/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#00b4d8]" />
              </div>
              Submit All Pages via IndexNow
            </CardTitle>
            <CardDescription>Submits {ALL_PAGES.length} pages to Bing &amp; partners instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {ALL_PAGES.slice(0, 6).map(u => (
                <span key={u} className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "bg-white/5 border-white/10 text-muted-foreground" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                  {u.replace(SITE_URL, "") || "/"}
                </span>
              ))}
              {ALL_PAGES.length > 6 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/20">
                  +{ALL_PAGES.length - 6} more
                </span>
              )}
            </div>
            <Button
              className="w-full bg-[#00b4d8] hover:bg-[#0096b4] text-white font-bold"
              disabled={!!submitting}
              onClick={() => submitIndexNow(ALL_PAGES, "all")}
            >
              {submitting === "all"
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</>
                : <><Send className="w-4 h-4 mr-2" />Submit All to Bing (IndexNow)</>}
            </Button>
          </CardContent>
        </Card>

        {/* Google Search Console card */}
        <Card className={cardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#4285f4]/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#4285f4]" />
              </div>
              Google Search Console
            </CardTitle>
            <CardDescription>Submit sitemap &amp; request URL indexing manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Submit Sitemap", url: `https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Akatyaayaniastrologer.com` },
              { label: "Request URL Indexing", url: `https://search.google.com/search-console/inspect?resource_id=sc-domain%3Akatyaayaniastrologer.com` },
              { label: "Coverage Report", url: `https://search.google.com/search-console/index?resource_id=sc-domain%3Akatyaayaniastrologer.com` },
            ].map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-sm font-semibold text-[#4285f4] transition-colors ${isDark ? "bg-[#4285f4]/5 border-[#4285f4]/15 hover:border-[#4285f4]/30" : "bg-[#4285f4]/5 border-[#4285f4]/20 hover:border-[#4285f4]/40"}`}
              >
                {link.label}
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            ))}
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
            Submit Specific URLs to Bing
          </CardTitle>
          <CardDescription>One URL per line — submits to Bing via IndexNow</CardDescription>
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
            {submitting === "custom"
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</>
              : <><Send className="w-4 h-4 mr-2" />Submit to Bing (IndexNow)</>}
          </Button>
        </CardContent>
      </Card>

      {/* Last Result */}
      {lastResult && (
        <Card className={`${cardClass} border-2 ${lastResult.success ? "border-green-500/30" : "border-red-500/30"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {lastResult.success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              Last Submission Result
              {lastResult.urlCount && <span className="text-muted-foreground font-normal">— {lastResult.urlCount} URLs</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(lastResult.results || []).map((r, i) => (
                <div key={i} className={`p-2.5 rounded-lg border text-xs ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{r.target}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusColor(r.status)}`}>
                      {statusIcon(r.status)} {r.status}
                      {r.statusCode ? ` · HTTP ${r.statusCode}` : ""}
                    </span>
                  </div>
                  {(r.message || r.body) && r.status === "info" && (
                    <p className="text-muted-foreground mt-1 leading-relaxed">{r.message || r.body}</p>
                  )}
                </div>
              ))}
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
              Indexing History
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
              No indexing submissions yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 20).map((log) => (
                <div key={log.id} className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold">{log.target}</span>
                      {log.response_body && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
                          {log.response_body}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {log.sitemap_url?.substring(0, 70)}{(log.sitemap_url?.length || 0) > 70 ? "..." : ""}
                    </p>
                    {log.error_message && log.status !== "info" && (
                      <p className="text-[10px] text-red-400 mt-0.5 truncate">{log.error_message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(log.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusColor(log.status)}`}>
                      {statusIcon(log.status)} {log.status}
                    </span>
                    {log.response_code && (
                      <span className="text-[9px] text-muted-foreground">HTTP {log.response_code}</span>
                    )}
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
          <CardTitle className="text-sm">SEO Tools &amp; Webmaster Panels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Google Search Console", url: "https://search.google.com/search-console", color: "text-[#4285f4]" },
              { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", color: "text-[#00b4d8]" },
              { label: "Google PageSpeed Insights", url: `https://pagespeed.web.dev/analysis?url=${SITE_URL}`, color: "text-orange-500" },
              { label: "Google Rich Results Test", url: `https://search.google.com/test/rich-results?url=${SITE_URL}`, color: "text-green-500" },
              { label: "IndexNow Check Tool", url: `https://www.bing.com/indexnow`, color: "text-[#00b4d8]" },
              { label: "Google Mobile Test", url: `https://search.google.com/test/mobile-friendly?url=${SITE_URL}`, color: "text-purple-500" },
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
