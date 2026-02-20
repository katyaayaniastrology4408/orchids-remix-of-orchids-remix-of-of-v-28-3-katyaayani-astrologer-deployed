"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, RefreshCw, Loader2, Save, Palette, Phone, Globe,
  MessageCircle, Edit3, CheckCircle2, Eye, Send, Plus, Trash2,
  Code2, X, ChevronDown, ChevronUp, Users,
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

interface CustomTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  created_at: string;
}

interface Props {
  isDark: boolean;
  t: (key: string) => string;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a0f2e;border-radius:16px;overflow:hidden;border:1px solid #ff6b3530;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #ff6b3520;">
            <div style="font-size:22px;font-weight:700;color:#ff6b35;letter-spacing:3px;">✦ KATYAAYANI ASTROLOGER ✦</div>
            <div style="font-size:12px;color:#c9a87c;margin-top:6px;font-style:italic;">Your Cosmic Guide</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#e8dcc8;font-size:16px;line-height:1.8;margin:0 0 16px;">
              Dear {{{NAME}}},
            </p>
            <p style="color:#e8dcc8;font-size:15px;line-height:1.8;margin:0 0 24px;">
              Write your email content here...
            </p>
            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0;">
              <a href="https://www.katyaayaniastrologer.com" style="background:linear-gradient(135deg,#ff6b35,#c45200);color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:1px;display:inline-block;">
                Visit Website ✦
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #ff6b3520;text-align:center;">
            <p style="color:#c9a87c;font-style:italic;font-size:13px;margin:0 0 12px;">"The stars impel, they do not compel."</p>
            <p style="color:#8a7a6a;font-size:11px;margin:0 0 4px;">📞 +91 98249 29588 &nbsp;|&nbsp; 📧 katyaayaniastrologer01@gmail.com</p>
            <p style="color:#5a4a3a;font-size:10px;margin:12px 0 0;">
              <a href="{{{UNSUBSCRIBE_URL}}}" style="color:#5a4a3a;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export default function EmailTemplatesPanel({ isDark, t, setSuccess, setError }: Props) {
  // Branding config
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [form, setForm] = useState<Partial<EmailConfig>>({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);

  // Custom templates
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<CustomTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<"new" | "edit">("new");
  const [editorForm, setEditorForm] = useState({ name: "", subject: "", html: DEFAULT_HTML });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Send
  const [sending, setSending] = useState(false);
  const [sendTo, setSendTo] = useState<"test" | "all">("test");
  const [testEmail, setTestEmail] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [sendVariables, setSendVariables] = useState<Record<string, string>>({});

  // Collapsed sections
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchTemplates();
    fetchSubscriberCount();
  }, []);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = await res.json();
      if (data.config) { setConfig(data.config); setForm(data.config); }
    } catch { setError("Failed to load email config"); }
    finally { setLoadingConfig(false); }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/custom-email-templates");
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

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Branding config updated");
        setEditingConfig(false);
        setConfig(data.config);
      } else { setError(data.error || "Failed to save"); }
    } catch (e: any) { setError(e.message); }
    finally { setSavingConfig(false); }
  };

  const openNewTemplate = () => {
    setEditorForm({ name: "", subject: "", html: DEFAULT_HTML });
    setEditorMode("new");
    setShowEditor(true);
    setPreviewMode(false);
    setActiveTemplate(null);
  };

  const openEditTemplate = (tmpl: CustomTemplate) => {
    setEditorForm({ name: tmpl.name, subject: tmpl.subject, html: tmpl.html });
    setEditorMode("edit");
    setShowEditor(true);
    setPreviewMode(false);
    setActiveTemplate(tmpl);
  };

  const saveTemplate = async () => {
    if (!editorForm.name.trim() || !editorForm.subject.trim() || !editorForm.html.trim()) {
      setError("Name, subject, and HTML are required");
      return;
    }
    setSavingTemplate(true);
    try {
      const isEdit = editorMode === "edit" && activeTemplate;
      const res = await fetch("/api/admin/custom-email-templates", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: activeTemplate.id, ...editorForm } : editorForm),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(isEdit ? "Template updated" : "Template created");
        setShowEditor(false);
        fetchTemplates();
      } else { setError(data.error || "Failed to save template"); }
    } catch (e: any) { setError(e.message); }
    finally { setSavingTemplate(false); }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/admin/custom-email-templates?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setSuccess("Template deleted"); fetchTemplates(); }
      else { setError(data.error || "Failed to delete"); }
    } catch (e: any) { setError(e.message); }
  };

  const handleSend = async (tmpl: CustomTemplate) => {
    if (sendTo === "test" && !testEmail.trim()) {
      setError("Enter a test email address");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/custom-email-templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: tmpl.id,
          sendTo,
          testEmail: sendTo === "test" ? testEmail : undefined,
          variables: sendVariables,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(
          sendTo === "test"
            ? `Test email sent to ${testEmail}`
            : `Newsletter sent! ${data.sent} delivered, ${data.failed} failed.`
        );
      } else { setError(data.error || "Send failed"); }
    } catch (e: any) { setError(e.message); }
    finally { setSending(false); }
  };

  const previewHtml = `
    <div style="background:#f5f0e8;padding:20px;font-family:Georgia,serif;min-height:100px;">
      <div style="max-width:500px;margin:0 auto;background:#1a0f2e;border-radius:12px;border:1px solid ${form.brand_color || '#ff6b35'}33;overflow:hidden;">
        <div style="padding:20px;text-align:center;border-bottom:1px solid ${form.brand_color || '#ff6b35'}22;">
          ${form.logo_url ? `<img src="${form.logo_url}" width="40" height="40" style="border-radius:50%;border:2px solid ${form.brand_color || '#ff6b35'};vertical-align:middle;margin-right:10px;" />` : ""}
          <span style="color:${form.brand_color || '#ff6b35'};font-size:16px;font-weight:700;letter-spacing:3px;vertical-align:middle;">KATYAAYANI</span>
        </div>
        <div style="padding:16px 20px;text-align:center;">
          <p style="color:#e8dcc8;font-size:13px;margin:0 0 8px;">Sample email content</p>
        </div>
        <div style="padding:14px 20px;text-align:center;border-top:1px solid ${form.brand_color || '#ff6b35'}22;">
          <p style="color:#c9a87c;font-style:italic;font-size:12px;margin:0 0 6px;">"${form.footer_tagline || 'The stars impel, they do not compel.'}"</p>
          <p style="color:#e8dcc8;font-size:11px;margin:0;">${form.contact_phone || ''} · ${form.contact_email || ''}</p>
        </div>
      </div>
    </div>`;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-[#ff6b35]">
            {t("Email Templates")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("Create custom HTML templates and send via Resend to all subscribers")}
          </p>
        </div>
        <Button
          onClick={openNewTemplate}
          className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> {t("New Template")}
        </Button>
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <Card className={`border-2 border-[#ff6b35]/40 ${isDark ? "bg-[#0d0d15]" : "bg-white"}`}>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-[#ff6b35] flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                {editorMode === "new" ? t("New Email Template") : t("Edit Template")}
              </CardTitle>
              <CardDescription>{t("Write HTML directly — use {{{NAME}}} for dynamic variables")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-[#ff6b35]/20 text-[#ff6b35]"
              >
                <Eye className="w-4 h-4 mr-1" />
                {previewMode ? t("Code") : t("Preview")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditor(false)}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("Template Name")}</Label>
                <Input
                  value={editorForm.name}
                  onChange={(e) => setEditorForm({ ...editorForm, name: e.target.value })}
                  placeholder="e.g. monthly-newsletter-march"
                  className={isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("Email Subject")}</Label>
                <Input
                  value={editorForm.subject}
                  onChange={(e) => setEditorForm({ ...editorForm, subject: e.target.value })}
                  placeholder="e.g. Your March 2026 Cosmic Forecast ✨"
                  className={isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : ""}
                />
              </div>
            </div>

            {previewMode ? (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">{t("Live Preview")}</Label>
                <div
                  className="rounded-xl overflow-hidden border border-[#ff6b35]/10 bg-white"
                  dangerouslySetInnerHTML={{ __html: editorForm.html }}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{t("HTML Content")}</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {t("Variables")}: {"{{{NAME}}}"} {"{{{UNSUBSCRIBE_URL}}}"}
                  </span>
                </div>
                <textarea
                  value={editorForm.html}
                  onChange={(e) => setEditorForm({ ...editorForm, html: e.target.value })}
                  rows={20}
                  spellCheck={false}
                  className={`w-full p-4 rounded-xl border text-sm font-mono resize-y leading-relaxed ${
                    isDark
                      ? "bg-[#0a0a12] border-[#ff6b35]/10 text-green-300"
                      : "bg-gray-950 border-gray-700 text-green-400"
                  } focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30`}
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={saveTemplate}
                disabled={savingTemplate}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold"
              >
                {savingTemplate ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("Saving...")}</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />{t("Save Template")}</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditor(false)}
                className="border-red-500/20 text-red-500 hover:bg-red-500/5"
              >
                {t("Cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card className={isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-[#ff6b35] flex items-center gap-2">
              <Mail className="w-5 h-5" /> {t("Your Templates")}
            </CardTitle>
            <CardDescription>
              {templates.length} {t("template(s)")} · {subscriberCount ?? "—"} {t("subscribers")}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchTemplates} disabled={loadingTemplates} className="border-[#ff6b35]/20 text-[#ff6b35]">
            {loadingTemplates ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
            </div>
          ) : templates.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border-2 border-dashed ${isDark ? "border-white/10 text-white/40" : "border-gray-200 text-gray-400"}`}>
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-bold text-sm">{t("No templates yet")}</p>
              <p className="text-xs mt-1">{t("Click 'New Template' to create your first email")}</p>
              <Button onClick={openNewTemplate} size="sm" className="mt-4 bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                <Plus className="w-4 h-4 mr-2" /> {t("Create First Template")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((tmpl) => (
                <TemplateCard
                  key={tmpl.id}
                  tmpl={tmpl}
                  isDark={isDark}
                  t={t}
                  onEdit={() => openEditTemplate(tmpl)}
                  onDelete={() => deleteTemplate(tmpl.id)}
                  onSend={handleSend}
                  sending={sending}
                  sendTo={sendTo}
                  setSendTo={setSendTo}
                  testEmail={testEmail}
                  setTestEmail={setTestEmail}
                  subscriberCount={subscriberCount}
                  sendVariables={sendVariables}
                  setSendVariables={setSendVariables}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding Config (collapsible) */}
      <Card className={isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20"}>
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer select-none"
          onClick={() => setConfigOpen(!configOpen)}
        >
          <div>
            <CardTitle className="text-[#ff6b35] flex items-center gap-2">
              <Palette className="w-5 h-5" /> {t("Global Email Branding")}
            </CardTitle>
            <CardDescription>{t("Logo, colors, footer tagline, contact info")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!loadingConfig && config && (
              <span className="text-[10px] text-green-500 font-bold hidden sm:block">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                {t("Configured")}
              </span>
            )}
            {configOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </CardHeader>

        {configOpen && (
          <CardContent className="space-y-5 pt-0">
            {loadingConfig ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" /></div>
            ) : (
              <>
                {/* Preview */}
                <div className="rounded-xl overflow-hidden border border-[#ff6b35]/10" dangerouslySetInnerHTML={{ __html: previewHtml }} />

                <div className="flex justify-end">
                  {!editingConfig && (
                    <Button variant="outline" onClick={() => setEditingConfig(true)} className="border-[#ff6b35]/20 text-[#ff6b35]">
                      <Edit3 className="w-4 h-4 mr-2" /> {t("Edit Branding")}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-[#ff6b35]" /> {t("Brand Color")}</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.brand_color || "#ff6b35"} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} disabled={!editingConfig} className="w-12 h-10 rounded-lg border border-[#ff6b35]/20 cursor-pointer disabled:opacity-50" />
                      <Input value={form.brand_color || ""} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} disabled={!editingConfig} className={`flex-1 font-mono ${isDark ? "bg-white/5 border-white/10" : ""}`} placeholder="#ff6b35" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#ff6b35]" /> {t("Logo URL")}</Label>
                    <Input value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} disabled={!editingConfig} className={isDark ? "bg-white/5 border-white/10" : ""} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#ff6b35]" /> {t("Footer Tagline")}</Label>
                    <Input value={form.footer_tagline || ""} onChange={(e) => setForm({ ...form, footer_tagline: e.target.value })} disabled={!editingConfig} className={isDark ? "bg-white/5 border-white/10" : ""} placeholder="The stars impel, they do not compel." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#ff6b35]" /> {t("Default Preheader")}</Label>
                    <Input value={form.preheader || ""} onChange={(e) => setForm({ ...form, preheader: e.target.value })} disabled={!editingConfig} className={isDark ? "bg-white/5 border-white/10" : ""} placeholder="Your cosmic guidance awaits" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#ff6b35]" /> {t("Contact Phone")}</Label>
                    <Input value={form.contact_phone || ""} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} disabled={!editingConfig} className={isDark ? "bg-white/5 border-white/10" : ""} placeholder="+91 98249 29588" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#ff6b35]" /> {t("Contact Email")}</Label>
                    <Input type="email" value={form.contact_email || ""} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} disabled={!editingConfig} className={isDark ? "bg-white/5 border-white/10" : ""} placeholder="katyaayaniastrologer01@gmail.com" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-green-500" /> {t("WhatsApp Number")}</Label>
                    <Input value={form.whatsapp_number || ""} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} disabled={!editingConfig} className={isDark ? "bg-white/5 border-white/10" : ""} placeholder="919824929588" />
                  </div>
                </div>

                {editingConfig && (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={saveConfig} disabled={savingConfig} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold">
                      {savingConfig ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("Saving...")}</> : <><Save className="w-4 h-4 mr-2" />{t("Save Branding")}</>}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingConfig(false); setForm(config || {}); }} className="border-red-500/20 text-red-500 hover:bg-red-500/5">{t("Cancel")}</Button>
                  </div>
                )}

                {!editingConfig && config && (
                  <div className={`p-3 rounded-lg text-xs ${isDark ? "bg-green-500/5 border border-green-500/10 text-green-400" : "bg-green-50 border border-green-200 text-green-700"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
                    {t("Last updated")}: {new Date(config.updated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ── Template Card with inline send panel ──────────────────────────────────────
function TemplateCard({
  tmpl, isDark, t, onEdit, onDelete, onSend, sending,
  sendTo, setSendTo, testEmail, setTestEmail, subscriberCount,
  sendVariables, setSendVariables,
}: {
  tmpl: CustomTemplate;
  isDark: boolean;
  t: (k: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onSend: (tmpl: CustomTemplate) => void;
  sending: boolean;
  sendTo: "test" | "all";
  setSendTo: (v: "test" | "all") => void;
  testEmail: string;
  setTestEmail: (v: string) => void;
  subscriberCount: number | null;
  sendVariables: Record<string, string>;
  setSendVariables: (v: Record<string, string>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0d0d15] border-[#ff6b35]/10" : "bg-[#fcfaf7] border-[#ff6b35]/15"}`}>
      {/* Top row */}
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
            <p className="font-bold text-sm truncate">{tmpl.name}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate pl-6 mt-0.5">{tmpl.subject}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-8 text-xs text-muted-foreground hover:text-[#ff6b35]">
            <Eye className="w-3.5 h-3.5 mr-1" /> {showPreview ? t("Hide") : t("Preview")}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="h-8 text-xs border-[#ff6b35]/20 text-[#ff6b35]">
            <Edit3 className="w-3.5 h-3.5 mr-1" /> {t("Edit")}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-red-500 hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className={`h-8 text-xs font-bold text-white ${expanded ? "bg-gray-600 hover:bg-gray-700" : "bg-[#ff6b35] hover:bg-[#e55a2b]"}`}
          >
            <Send className="w-3.5 h-3.5 mr-1" /> {expanded ? t("Close") : t("Send")}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="border-t border-[#ff6b35]/10 p-4 bg-white">
          <div
            className="rounded-xl overflow-hidden border border-gray-100 max-h-[400px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: tmpl.html }}
          />
        </div>
      )}

      {/* Send panel */}
      {expanded && (
        <div className={`border-t p-4 space-y-4 ${isDark ? "border-[#ff6b35]/10 bg-[#12121a]" : "border-[#ff6b35]/10 bg-white"}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("Send Options")}</p>

          {/* Send to toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setSendTo("test")}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${sendTo === "test" ? "border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]" : isDark ? "border-white/10 text-white/50 hover:border-[#ff6b35]/30" : "border-gray-200 text-gray-400 hover:border-[#ff6b35]/30"}`}
            >
              🧪 {t("Test Email")}
            </button>
            <button
              onClick={() => setSendTo("all")}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${sendTo === "all" ? "border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]" : isDark ? "border-white/10 text-white/50 hover:border-[#ff6b35]/30" : "border-gray-200 text-gray-400 hover:border-[#ff6b35]/30"}`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {t("All Subscribers")} ({subscriberCount ?? "?"})
            </button>
          </div>

          {sendTo === "test" && (
            <div className="space-y-1.5">
              <Label>{t("Test Email Address")}</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className={isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : ""}
              />
            </div>
          )}

          {sendTo === "all" && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${isDark ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : "border-amber-400/30 bg-amber-50 text-amber-700"}`}>
              <span className="text-base flex-shrink-0">⚠️</span>
              <span>{t("This will send to ALL")} {subscriberCount ?? 0} {t("active subscribers via Resend.")}</span>
            </div>
          )}

          {/* Optional variable overrides */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("Variable Override")} <span className="opacity-60">({"{{{NAME}}}"} = subscriber name by default)</span>
            </Label>
            <Input
              placeholder={`NAME = Devotee (default)`}
              value={sendVariables["NAME"] || ""}
              onChange={(e) => setSendVariables({ ...sendVariables, NAME: e.target.value })}
              className={`text-xs ${isDark ? "bg-[#1a1a2e] border-[#ff6b35]/10" : ""}`}
            />
          </div>

          <Button
            onClick={() => onSend(tmpl)}
            disabled={sending}
            className="w-full h-11 font-black bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("Sending...")}</>
            ) : sendTo === "test" ? (
              <><Send className="w-4 h-4 mr-2" />{t("Send Test Email")}</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />{t("Send to All Subscribers")}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
