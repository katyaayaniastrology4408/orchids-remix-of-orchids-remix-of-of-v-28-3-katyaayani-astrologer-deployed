"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Eye, Star, BookOpen, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";

// --- Inline template HTML generators (same as API, for preview) ---

const BASE_URL = "https://www.katyaayaniastrologer.com";

function rashifalHtml(vars: Record<string, string>) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rashifal</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#22100a;border-radius:16px;overflow:hidden;border:1px solid #8b3a0f;">
        <tr><td style="background:linear-gradient(135deg,#8b1a00,#c45200);padding:32px 24px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🔯</div>
          <h1 style="margin:0;color:#ffd700;font-size:26px;letter-spacing:2px;font-family:'Georgia',serif;">Katyaayani Astrologer</h1>
          <p style="margin:8px 0 0;color:#ffb347;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Weekly Rashifal</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;text-align:center;">
          <p style="color:#ffd700;font-size:18px;margin:0;">Namaste ${vars.NAME || "Devotee"} 🙏</p>
          <p style="color:#d4a574;font-size:14px;margin:10px 0 0;">Here is your cosmic guidance for the week ahead</p>
          <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#2d1208;border:1px solid #8b3a0f;border-radius:12px;padding:20px 24px;">
              <p style="color:#ffd700;font-size:13px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Your Rashi Forecast</p>
              <p style="color:#e8d5b7;font-size:16px;line-height:1.8;margin:0;">${vars.RASHIFAL_TEXT || "This week the planets align to bring you positive cosmic energy. Stay focused on your goals and trust the divine timing of the universe."}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="padding:4px;"><div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:10px;padding:14px;text-align:center;"><p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Lucky Number</p><p style="color:#ffb347;font-size:22px;font-weight:bold;margin:0;">${vars.LUCKY_NUMBER || "7"}</p></div></td>
              <td width="33%" style="padding:4px;"><div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:10px;padding:14px;text-align:center;"><p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Lucky Color</p><p style="color:#ffb347;font-size:15px;font-weight:bold;margin:0;">${vars.LUCKY_COLOR || "Golden"}</p></div></td>
              <td width="33%" style="padding:4px;"><div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:10px;padding:14px;text-align:center;"><p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Period</p><p style="color:#ffb347;font-size:12px;font-weight:bold;margin:0;">${vars.PERIOD || "This Week"}</p></div></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${BASE_URL}/booking" style="display:inline-block;background:linear-gradient(135deg,#c45200,#ff6b35);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Book Personal Consultation</a>
        </td></tr>
        <tr><td style="background:#0d0600;padding:20px 32px;text-align:center;border-top:1px solid #8b3a0f;">
          <p style="color:#8b5e3c;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
          <p style="color:#5a3a2a;font-size:10px;margin:0;"><a href="${BASE_URL}" style="color:#8b5e3c;text-decoration:none;">katyaayaniastrologer.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function blogUpdateHtml(vars: Record<string, string>) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Blog Post</title></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0800;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1000;border-radius:16px;overflow:hidden;border:1px solid #8b1a00;">
        <tr><td style="background:linear-gradient(135deg,#8b1a00,#c45200);padding:28px 24px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">📖</div>
          <h1 style="margin:0;color:#ffd700;font-size:22px;letter-spacing:2px;font-family:'Georgia',serif;">Katyaayani Astrologer</h1>
          <p style="margin:8px 0 0;color:#ffb347;font-size:12px;letter-spacing:4px;text-transform:uppercase;">New Blog Post</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;text-align:center;">
          <p style="color:#ffd700;font-size:17px;margin:0;">Namaste ${vars.NAME || "Devotee"} 🙏</p>
          <p style="color:#d4a574;font-size:13px;margin:10px 0 0;">A new article has been published for you</p>
          <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:20px 32px 0;text-align:center;">
          <span style="display:inline-block;background:#8b1a00;color:#ffd700;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:50px;">${vars.CATEGORY || "Vedic Astrology"}</span>
        </td></tr>
        <tr><td style="padding:16px 32px 0;text-align:center;">
          <h2 style="color:#ffd700;font-size:22px;margin:0;line-height:1.4;">${vars.BLOG_TITLE || "New Cosmic Article Published"}</h2>
        </td></tr>
        <tr><td style="padding:20px 32px;">
          <div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:12px;padding:22px 24px;">
            <p style="color:#e8d5b7;font-size:15px;line-height:1.9;margin:0;">${vars.BLOG_EXCERPT || "Discover the ancient wisdom of Vedic astrology and how the celestial bodies influence your daily life and spiritual journey."}</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#0d0600;border-left:3px solid #ffd700;border-radius:0 8px 8px 0;padding:16px 20px;">
            <p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Key Takeaway</p>
            <p style="color:#d4a574;font-size:14px;line-height:1.7;margin:0;">${vars.KEY_TAKEAWAY || "The wisdom of the stars guides our path forward."}</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${vars.BLOG_URL || BASE_URL + "/blog"}" style="display:inline-block;background:linear-gradient(135deg,#c45200,#ff6b35);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Read Full Article</a>
        </td></tr>
        <tr><td style="background:#080500;padding:20px 32px;text-align:center;border-top:1px solid #8b1a00;">
          <p style="color:#6b3a1a;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
          <p style="color:#4a2a10;font-size:10px;margin:0;"><a href="${BASE_URL}" style="color:#6b3a1a;text-decoration:none;">katyaayaniastrologer.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function astroTipsHtml(vars: Record<string, string>) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Astro Tips</title></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0800;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1000;border-radius:16px;overflow:hidden;border:1px solid #8b6914;">
        <tr><td style="background:linear-gradient(135deg,#78350f,#d97706);padding:32px 24px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">⭐</div>
          <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">Katyaayani Astrologer</h1>
          <p style="margin:8px 0 0;color:#fde68a;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Astrology Tips &amp; Guidance</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;text-align:center;">
          <p style="color:#fbbf24;font-size:18px;margin:0;">Namaste ${vars.NAME || "Devotee"} 🙏</p>
          <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#fbbf24,transparent);margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:24px 32px 12px;text-align:center;">
          <h2 style="color:#ffd700;font-size:22px;margin:0;">${vars.TIP_TITLE || "Weekly Cosmic Insight"}</h2>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#261800;border:1px solid #8b6914;border-radius:12px;padding:24px;">
            <p style="color:#e8d5b7;font-size:15px;line-height:1.9;margin:0;">${vars.TIP_CONTENT || "The planets are beautifully aligned this week to bring you divine blessings. Embrace the cosmic energy flowing toward you and use it for spiritual growth and material success."}</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding:4px;"><div style="background:#261800;border:1px solid #8b6914;border-radius:10px;padding:16px;text-align:center;"><p style="color:#fbbf24;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Graha</p><p style="color:#ffd700;font-size:18px;font-weight:bold;margin:0;">${vars.PLANET || "Shukra"}</p></div></td>
              <td width="50%" style="padding:4px;"><div style="background:#261800;border:1px solid #8b6914;border-radius:10px;padding:16px;text-align:center;"><p style="color:#fbbf24;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Upay (Remedy)</p><p style="color:#fde68a;font-size:13px;font-weight:bold;margin:0;">${vars.REMEDY || "Wear white on Friday"}</p></div></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${BASE_URL}/booking" style="display:inline-block;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Book Your Consultation</a>
        </td></tr>
        <tr><td style="background:#080500;padding:20px 32px;text-align:center;border-top:1px solid #8b6914;">
          <p style="color:#6b4c0a;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
          <p style="color:#4a330a;font-size:10px;margin:0;"><a href="${BASE_URL}" style="color:#6b4c0a;text-decoration:none;">katyaayaniastrologer.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const TEMPLATES = [
  {
    id: "rashifal",
    label: "Weekly Rashifal",
    emoji: "🔯",
    description: "Sent to newsletter subscribers with weekly horoscope, lucky number & color",
    color: "#c45200",
    badge: "Newsletter",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    variables: [
      { key: "NAME", label: "Name", default: "Priya" },
      { key: "RASHIFAL_TEXT", label: "Forecast Text", default: "This week Shukra strengthens your relationships. Financial matters improve after Wednesday. Avoid conflicts on Tuesday.", type: "textarea" },
      { key: "LUCKY_NUMBER", label: "Lucky Number", default: "3" },
      { key: "LUCKY_COLOR", label: "Lucky Color", default: "Royal Blue" },
      { key: "PERIOD", label: "Period", default: "Feb 20–26, 2026" },
    ],
    getHtml: rashifalHtml,
  },
  {
    id: "blog",
    label: "Blog Update",
    emoji: "📖",
    description: "Sent to all registered users when a new blog post is published",
    color: "#c45200",
    badge: "Auto-send",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    variables: [
      { key: "NAME", label: "Name", default: "Rahul" },
      { key: "CATEGORY", label: "Category", default: "Vedic Astrology" },
      { key: "BLOG_TITLE", label: "Blog Title", default: "Shani Sade Sati 2026: What Every Zodiac Must Know" },
      { key: "BLOG_EXCERPT", label: "Blog Excerpt", default: "Shani Sade Sati is a 7.5-year period that brings transformation and karmic lessons. Learn how to navigate this powerful transit with grace.", type: "textarea" },
      { key: "KEY_TAKEAWAY", label: "Key Takeaway", default: "Stay patient and trust the process — Saturn rewards consistent effort." },
      { key: "BLOG_URL", label: "Blog URL", default: `${BASE_URL}/blog/shani-sade-sati-2026` },
    ],
    getHtml: blogUpdateHtml,
  },
  {
    id: "tips",
    label: "Astrology Tips",
    emoji: "⭐",
    description: "Sent to newsletter subscribers with planetary tips & remedies",
    color: "#d97706",
    badge: "Newsletter",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    variables: [
      { key: "NAME", label: "Name", default: "Anjali" },
      { key: "TIP_TITLE", label: "Tip Title", default: "Shukra's Blessings This Week" },
      { key: "TIP_CONTENT", label: "Tip Content", default: "Venus is exalted this week bringing harmony in love, beauty, and finances. This is an excellent time to strengthen relationships and start new creative projects.", type: "textarea" },
      { key: "PLANET", label: "Graha (Planet)", default: "Shukra (Venus)" },
      { key: "REMEDY", label: "Upay (Remedy)", default: "Wear white on Friday & donate curd" },
    ],
    getHtml: astroTipsHtml,
  },
];

export default function EmailTemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState("rashifal");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const template = TEMPLATES.find((t) => t.id === activeTemplate)!;

  // Build vars with defaults
  const resolvedVars: Record<string, string> = {};
  template.variables.forEach((v) => {
    resolvedVars[v.key] = variables[v.key] ?? v.default;
  });

  const previewHtml = template.getHtml(resolvedVars);

  const handleVarChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const resetVars = () => setVariables({});

  return (
    <div className="min-h-screen bg-[#0a0612]">
      {/* Header */}
      <div className="border-b border-[#ff6b35]/10 bg-[#0d0618]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#ff6b35]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Email Templates</h1>
              <p className="text-[#b8a896] text-xs">Katyaayani Astrologer — Resend</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-full px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-xs font-semibold">3 Templates Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#ff6b35]" />
            <span className="text-[#ff6b35] text-xs font-semibold tracking-widest uppercase">Resend Email Templates</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Live Email Templates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#b8a896] max-w-xl mx-auto text-sm"
          >
            Preview and customize the 3 email templates used by Katyaayani Astrologer for newsletters, blog notifications, and astrology tips.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
          {/* Left Panel — Template Selector + Variable Editor */}
          <div className="space-y-4">
            {/* Template Cards */}
            <div className="space-y-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => { setActiveTemplate(tmpl.id); resetVars(); }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    activeTemplate === tmpl.id
                      ? "border-[#ff6b35] bg-[#ff6b35]/10"
                      : "border-white/5 bg-white/3 hover:border-[#ff6b35]/30 bg-[#12081f]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{tmpl.emoji}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${tmpl.badgeColor}`}>
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm">{tmpl.label}</p>
                  <p className="text-[11px] text-[#b8a896] mt-1 leading-relaxed">{tmpl.description}</p>
                </button>
              ))}
            </div>

            {/* Variable Editor */}
            <div className="bg-[#12081f] border border-[#ff6b35]/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-[#ff6b35] uppercase tracking-widest">Customize Preview</p>
                <button onClick={resetVars} className="text-[10px] text-[#b8a896] hover:text-white transition-colors">
                  Reset
                </button>
              </div>
              {template.variables.map((v) => (
                <div key={v.key} className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#c9a87c]">
                    {v.label}
                    <span className="ml-1.5 font-mono text-[9px] text-[#b8a896]/50">{`{{{${v.key}}}}`}</span>
                  </label>
                  {(v as any).type === "textarea" ? (
                    <textarea
                      value={variables[v.key] ?? v.default}
                      onChange={(e) => handleVarChange(v.key, e.target.value)}
                      rows={3}
                      className="w-full bg-[#0d0618] border border-[#ff6b35]/10 rounded-lg px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-[#ff6b35]/40 placeholder-[#b8a896]/30"
                    />
                  ) : (
                    <input
                      type="text"
                      value={variables[v.key] ?? v.default}
                      onChange={(e) => handleVarChange(v.key, e.target.value)}
                      className="w-full bg-[#0d0618] border border-[#ff6b35]/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6b35]/40 placeholder-[#b8a896]/30"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-[#12081f] border border-[#ff6b35]/10 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#ff6b35] uppercase tracking-widest mb-2">How it works</p>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] mt-1.5 flex-shrink-0" />
                <p className="text-xs text-[#b8a896]"><span className="text-white font-semibold">Weekly Rashifal</span> — Admin sends manually from admin panel to all newsletter subscribers</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-[#b8a896]"><span className="text-white font-semibold">Blog Update</span> — Auto-sent to all registered users when admin publishes a new blog post</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-[#b8a896]"><span className="text-white font-semibold">Astrology Tips</span> — Admin sends manually from admin panel for planetary tips & remedies</p>
              </div>
            </div>
          </div>

          {/* Right Panel — Email Preview */}
          <div className="space-y-4">
            {/* Preview Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#ff6b35]" />
                <span className="text-white font-semibold text-sm">Live Preview</span>
                <span className="text-[#b8a896] text-xs">— {template.label}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#12081f] border border-[#ff6b35]/10 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${previewMode === "desktop" ? "bg-[#ff6b35] text-white" : "text-[#b8a896] hover:text-white"}`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${previewMode === "mobile" ? "bg-[#ff6b35] text-white" : "text-[#b8a896] hover:text-white"}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Email Frame */}
            <div className={`bg-[#12081f] border border-[#ff6b35]/10 rounded-2xl overflow-hidden`}>
              {/* Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-3 bg-[#0d0618] rounded-md px-3 py-1.5 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[#b8a896]" />
                  <span className="text-[11px] text-[#b8a896]">katyaayaniastrologer01@gmail.com — {template.label}</span>
                </div>
              </div>

              {/* Preview Container */}
              <div className="p-4 flex justify-center bg-[#0a0612]" style={{ minHeight: "600px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTemplate + JSON.stringify(resolvedVars)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ width: previewMode === "mobile" ? "375px" : "100%", maxWidth: "680px" }}
                    className="rounded-xl overflow-hidden border border-white/5"
                  >
                    <iframe
                      srcDoc={previewHtml}
                      style={{ width: "100%", height: "700px", border: "none", display: "block" }}
                      title={`${template.label} Preview`}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
