"use client";
import { useState, useEffect } from "react";
import { Loader2, Send, Mail, Users, CheckCircle2, AlertCircle, RefreshCw, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  isDark: boolean;
  t: (key: string) => string;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}

const TEMPLATE_DEFS = [
  {
    id: "rashifal",
    name: "katyaayani-rashifal",
    label: "Weekly Rashifal",
    emoji: "🔯",
    description: "Rashifal + Lucky Number + Color",
    color: "#c45200",
    fields: [
      { key: "NAME", label: "Subscriber Name", placeholder: "Devotee", type: "text" },
      { key: "RASHIFAL_TEXT", label: "Rashifal Content", placeholder: "This week planets bring...", type: "textarea" },
      { key: "LUCKY_NUMBER", label: "Lucky Number", placeholder: "7", type: "text" },
      { key: "LUCKY_COLOR", label: "Lucky Color", placeholder: "Golden Yellow", type: "text" },
      { key: "PERIOD", label: "Period", placeholder: "Feb 20 - Feb 26", type: "text" },
    ],
  },
  {
    id: "festival",
    name: "katyaayani-festival",
    label: "Festival & Muhurat",
    emoji: "🪔",
    description: "Festival dates + Shubh Muhurat + Puja Vidhi",
    color: "#7c3aed",
    fields: [
      { key: "FESTIVAL_EMOJI", label: "Festival Emoji", placeholder: "🪔", type: "text" },
      { key: "FESTIVAL_NAME", label: "Festival Name", placeholder: "Maha Shivratri", type: "text" },
      { key: "FESTIVAL_DATE", label: "Festival Date", placeholder: "February 26, 2026", type: "text" },
      { key: "FESTIVAL_DESCRIPTION", label: "Description", placeholder: "Maha Shivratri is the great night of Shiva...", type: "textarea" },
      { key: "MUHURAT_TIME", label: "Shubh Muhurat Time", placeholder: "12:00 AM - 6:00 AM", type: "text" },
      { key: "MUHURAT_DETAILS", label: "Muhurat Details", placeholder: "Nishita kaal puja is most auspicious", type: "text" },
      { key: "REMEDY", label: "Puja Vidhi / Upay", placeholder: "Offer bilva leaves, milk abhishek...", type: "textarea" },
    ],
  },
  {
    id: "tips",
    name: "katyaayani-astro-tips",
    label: "Astrology Tips",
    emoji: "⭐",
    description: "Planetary tips + Graha + Upay (Remedy)",
    color: "#d97706",
    fields: [
      { key: "NAME", label: "Subscriber Name", placeholder: "Devotee", type: "text" },
      { key: "TIP_TITLE", label: "Tip Title", placeholder: "Shukra's Blessing This Week", type: "text" },
      { key: "TIP_CONTENT", label: "Tip Content", placeholder: "Venus is strong this week...", type: "textarea" },
      { key: "PLANET", label: "Graha (Planet)", placeholder: "Shukra (Venus)", type: "text" },
      { key: "REMEDY", label: "Upay (Remedy)", placeholder: "Wear white on Friday, donate curd...", type: "text" },
    ],
  },
];

export default function NewsletterPanel({ isDark, t, setSuccess, setError }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("rashifal");
  const [subject, setSubject] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const activeDef = TEMPLATE_DEFS.find((t) => t.id === selectedTemplate)!;

  useEffect(() => {
    fetchTemplates();
    fetchSubscriberCount();
  }, []);

  // Reset variables when template changes
  useEffect(() => {
    setVariables({});
    setSendResult(null);
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/newsletter/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch { /* ignore */ }
    finally { setLoadingTemplates(false); }
  };

  const fetchSubscriberCount = async () => {
    try {
      const res = await fetch("/api/newsletter/subscribers/count");
      const data = await res.json();
      if (data.count !== undefined) setSubscriberCount(data.count);
    } catch { /* ignore */ }
  };

  const setupTemplates = async () => {
    setSettingUp(true);
    try {
      const res = await fetch("/api/newsletter/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("All 3 templates created & published on Resend!");
        fetchTemplates();
      } else {
        setError(data.error || "Setup failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSettingUp(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { setError("Subject is required"); return; }

    const templateName = activeDef.name;
    const resendTemplates = templates.filter((t) => t.name === templateName);
    if (resendTemplates.length === 0) {
      setError("Template not found on Resend. Please click 'Setup Templates' first.");
      return;
    }

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          templateName,
          variables,
          secretKey: localStorage.getItem("admin_auth"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ sent: data.sent, failed: data.failed });
        setSuccess(`Newsletter sent! ${data.sent} delivered, ${data.failed} failed.`);
        setSubject("");
        setVariables({});
      } else {
        setError(data.error || "Send failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const knownNames = TEMPLATE_DEFS.map((t) => t.name);
  const publishedTemplates = templates.filter((t) => knownNames.includes(t.name));
  const allSetup = publishedTemplates.length >= 3;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border text-center ${isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}`}>
          <Users className="w-5 h-5 text-[#ff6b35] mx-auto mb-2" />
          <p className="text-2xl font-black text-[#ff6b35]">{subscriberCount ?? "—"}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Subscribers</p>
        </div>
        <div className={`p-4 rounded-xl border text-center ${isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}`}>
          <Mail className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-amber-500">100</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Daily Limit</p>
        </div>
        <div className={`p-4 rounded-xl border text-center ${isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}`}>
          <Star className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-green-500">{loadingTemplates ? "..." : publishedTemplates.length}/3</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Templates Ready</p>
        </div>
      </div>

      {/* Setup Banner */}
      {!loadingTemplates && !allSetup && (
        <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400/40 bg-amber-50"}`}>
          <div>
            <p className="font-bold text-amber-500 text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Templates not setup yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Setup Templates" to create all 3 Resend templates once.</p>
          </div>
          <Button
            onClick={setupTemplates}
            disabled={settingUp}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold whitespace-nowrap"
          >
            {settingUp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Setup Templates
          </Button>
        </div>
      )}

      {allSetup && (
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? "border-green-500/20 bg-green-500/5" : "border-green-400/30 bg-green-50"}`}>
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-xs text-green-600 font-medium">All 3 templates are live on Resend.</p>
          <button onClick={() => { fetchTemplates(); fetchSubscriberCount(); }} className="ml-auto text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Template Selector */}
      <Card className={isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2"><Mail className="w-5 h-5" /> Send Newsletter</CardTitle>
          <CardDescription>Choose a template, fill content, and send to all subscribers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Cards */}
          <div>
            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3 block">Choose Template</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TEMPLATE_DEFS.map((tmpl) => {
                const isActive = selectedTemplate === tmpl.id;
                const isOnResend = templates.some((t) => t.name === tmpl.name);
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? "border-[#ff6b35] bg-[#ff6b35]/10"
                        : isDark
                        ? "border-white/10 bg-white/5 hover:border-[#ff6b35]/40"
                        : "border-gray-200 bg-gray-50 hover:border-[#ff6b35]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{tmpl.emoji}</span>
                      {isOnResend ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold">LIVE</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">NOT SET</span>
                      )}
                    </div>
                    <p className="font-bold text-sm">{tmpl.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{tmpl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                placeholder={`e.g. Your ${activeDef.label} - Feb 2026`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className={isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground block">
                {activeDef.label} Content Variables
              </Label>
              {activeDef.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {field.label}
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground opacity-60">{`{{{${field.key}}}}`}</span>
                  </Label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={variables[field.key] || ""}
                      onChange={(e) => setVariables({ ...variables, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className={`w-full p-3 rounded-md border text-sm resize-none ${isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10 text-white" : "bg-white border-[#ff6b35]/20 text-black"} focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30`}
                    />
                  ) : (
                    <Input
                      value={variables[field.key] || ""}
                      onChange={(e) => setVariables({ ...variables, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Send Result */}
            {sendResult && (
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${isDark ? "border-green-500/20 bg-green-500/5" : "border-green-400/30 bg-green-50"}`}>
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-600 text-sm">Newsletter sent successfully!</p>
                  <p className="text-xs text-muted-foreground">{sendResult.sent} delivered · {sendResult.failed} failed</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={sending || !allSetup}
              className="w-full h-12 font-black rounded-xl text-white"
              style={{ background: allSetup ? `linear-gradient(135deg, ${activeDef.color}, #ff6b35)` : undefined }}
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending to all subscribers...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send {activeDef.label} Newsletter</>
              )}
            </Button>
            {!allSetup && (
              <p className="text-xs text-amber-500 text-center">Setup templates first before sending.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
