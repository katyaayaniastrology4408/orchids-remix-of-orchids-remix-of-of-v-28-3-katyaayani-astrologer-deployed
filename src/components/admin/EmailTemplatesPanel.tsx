"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  RefreshCw,
  Loader2,
  Save,
  Palette,
  Phone,
  Globe,
  MessageCircle,
  Edit3,
  CheckCircle2,
  Eye,
} from "lucide-react";

interface EmailConfig {
  id: string;
  label: string;
  footer_tagline: string;
  brand_color: string;
  logo_url: string;
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  preheader: string;
  updated_at: string;
}

interface Props {
  isDark: boolean;
  t: (key: string) => string;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}

export default function EmailTemplatesPanel({ isDark, t, setSuccess, setError }: Props) {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [form, setForm] = useState<Partial<EmailConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setForm(data.config);
      }
    } catch {
      setError("Failed to load email template config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Email template config updated successfully");
        setEditing(false);
        setConfig(data.config);
      } else {
        setError(data.error || "Failed to update");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  const previewHtml = `
    <div style="background:linear-gradient(180deg,#0a0612 0%,#1a0f2e 50%,#0a0612 100%);padding:30px 20px;font-family:Georgia,serif;min-height:200px;">
      <div style="max-width:500px;margin:0 auto;background:linear-gradient(145deg,#12081f,#0d0618);border-radius:20px;border:1px solid ${form.brand_color || '#ff6b35'}33;overflow:hidden;">
        <div style="padding:24px;text-align:center;border-bottom:1px solid ${form.brand_color || '#ff6b35'}22;">
          <img src="${form.logo_url}" width="44" height="44" style="border-radius:50%;border:2px solid ${form.brand_color || '#ff6b35'};vertical-align:middle;margin-right:10px;" />
          <span style="color:${form.brand_color || '#ff6b35'};font-size:18px;font-weight:700;letter-spacing:3px;vertical-align:middle;">KATYAAYANI</span>
        </div>
        <div style="padding:20px;text-align:center;">
          <p style="color:#e8dcc8;font-size:14px;margin:0 0 10px;">Sample email content will appear here with the above branding.</p>
        </div>
        <div style="padding:16px 24px;text-align:center;border-top:1px solid ${form.brand_color || '#ff6b35'}22;">
          <p style="color:#c9a87c;font-style:italic;font-size:13px;margin:0 0 8px;">"${form.footer_tagline || ''}"</p>
          <p style="color:#e8dcc8;font-size:12px;margin:0 0 4px;">${form.contact_phone || ''}</p>
          <p style="color:#b8a896;font-size:11px;margin:0;">${form.contact_email || ''}</p>
        </div>
      </div>
    </div>
  `;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-[#ff6b35]">
            {t("Email Templates")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("Customize email branding — logo, colors, footer text, contact info")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            className="border-[#ff6b35]/20 text-[#ff6b35]"
          >
            <Eye className="w-4 h-4 mr-2" />
            {preview ? t("Hide Preview") : t("Preview")}
          </Button>
          <Button
            variant="outline"
            onClick={fetchConfig}
            className="border-[#ff6b35]/20 text-[#ff6b35]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      {preview && (
        <Card className={isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}>
          <CardHeader>
            <CardTitle className="text-[#ff6b35] flex items-center gap-2 text-base">
              <Eye className="w-4 h-4" /> {t("Live Email Preview")}
            </CardTitle>
            <CardDescription>{t("How your emails will look to recipients")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl overflow-hidden border border-[#ff6b35]/10"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </CardContent>
        </Card>
      )}

      {/* Config form */}
      <Card className={isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#ff6b35] flex items-center gap-2">
              <Palette className="w-5 h-5" /> {t("Global Email Branding")}
            </CardTitle>
            <CardDescription>{t("These settings apply to all email templates")}</CardDescription>
          </div>
          {!editing && (
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="border-[#ff6b35]/20 text-[#ff6b35]"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {t("Edit")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Brand Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-[#ff6b35]" />
                {t("Brand Color")}
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.brand_color || "#ff6b35"}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  disabled={!editing}
                  className="w-12 h-10 rounded-lg border border-[#ff6b35]/20 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                />
                <Input
                  value={form.brand_color || ""}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  disabled={!editing}
                  className={`flex-1 font-mono ${isDark ? "bg-white/5 border-white/10" : ""}`}
                  placeholder="#ff6b35"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#ff6b35]" />
                {t("Logo URL")}
              </Label>
              <Input
                value={form.logo_url || ""}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                disabled={!editing}
                className={isDark ? "bg-white/5 border-white/10" : ""}
                placeholder="https://..."
              />
              {form.logo_url && (
                <img src={form.logo_url} alt="logo preview" className="w-10 h-10 rounded-full border-2 border-[#ff6b35]/30 object-contain" />
              )}
            </div>

            {/* Footer Tagline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ff6b35]" />
                {t("Footer Tagline")}
              </Label>
              <Input
                value={form.footer_tagline || ""}
                onChange={(e) => setForm({ ...form, footer_tagline: e.target.value })}
                disabled={!editing}
                className={isDark ? "bg-white/5 border-white/10" : ""}
                placeholder="The stars impel, they do not compel."
              />
            </div>

            {/* Preheader text */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ff6b35]" />
                {t("Default Preheader Text")}
              </Label>
              <Input
                value={form.preheader || ""}
                onChange={(e) => setForm({ ...form, preheader: e.target.value })}
                disabled={!editing}
                className={isDark ? "bg-white/5 border-white/10" : ""}
                placeholder="Your cosmic guidance awaits"
              />
              <p className="text-[10px] text-muted-foreground">{t("Short text shown in inbox preview")}</p>
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ff6b35]" />
                {t("Contact Phone")}
              </Label>
              <Input
                value={form.contact_phone || ""}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                disabled={!editing}
                className={isDark ? "bg-white/5 border-white/10" : ""}
                placeholder="+91 98249 29588"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#ff6b35]" />
                {t("Contact Email")}
              </Label>
              <Input
                type="email"
                value={form.contact_email || ""}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                disabled={!editing}
                className={isDark ? "bg-white/5 border-white/10" : ""}
                placeholder="katyaayaniastrologer01@gmail.com"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                {t("WhatsApp Number (with country code, no +)")}
              </Label>
              <Input
                value={form.whatsapp_number || ""}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                disabled={!editing}
                className={isDark ? "bg-white/5 border-white/10" : ""}
                placeholder="919824929588"
              />
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("Saving...")}</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />{t("Save Changes")}</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setEditing(false); setForm(config || {}); }}
                className="border-red-500/20 text-red-500 hover:bg-red-500/5"
              >
                {t("Cancel")}
              </Button>
            </div>
          )}

          {!editing && config && (
            <div className={`mt-2 p-3 rounded-lg text-xs ${isDark ? "bg-green-500/5 border border-green-500/10 text-green-400" : "bg-green-50 border border-green-200 text-green-700"}`}>
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
              {t("Last updated")}: {new Date(config.updated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            </div>
          )}
        </CardContent>
      </Card>

      {/* Which emails use this config */}
      <Card className={isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5" /> {t("Affected Email Templates")}
          </CardTitle>
          <CardDescription>{t("The branding above applies to all these emails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: "🔐", label: "OTP Verification", provider: "SMTP" },
              { emoji: "🌟", label: "Welcome Email", provider: "SMTP" },
              { emoji: "🔑", label: "Password Reset", provider: "SMTP" },
              { emoji: "🔒", label: "Login Alert", provider: "SMTP" },
              { emoji: "📅", label: "Booking Confirmation", provider: "SMTP" },
              { emoji: "📧", label: "Enquiry Confirmation", provider: "SMTP" },
              { emoji: "📝", label: "Blog Updates", provider: "Resend" },
              { emoji: "☀️", label: "Daily Rashifal", provider: "Resend" },
              { emoji: "📰", label: "Newsletter", provider: "Resend" },
            ].map((item) => (
              <div
                key={item.label}
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${isDark ? "bg-white/5 border-white/10" : "bg-[#fcfaf7] border-[#ff6b35]/10"}`}
              >
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <p className="text-xs font-bold leading-tight">{t(item.label)}</p>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${item.provider === "SMTP" ? "bg-blue-500/10 text-blue-500" : "bg-[#ff6b35]/10 text-[#ff6b35]"}`}>
                    {item.provider}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
