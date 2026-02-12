"use client";

import Link from "next/link";
import { Moon, Phone, Mail, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/components/GoogleTranslateWidget";
import { contentData } from "@/data/homepage";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const { theme } = useTheme();
  const { language, t } = useTranslation();
  const content = contentData[language];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className={`py-16 px-6 ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-background'} border-t border-[#ff6b35]/20`}>
      <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
            <div className="md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <Image 
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/c601c1cc-61c8-474d-bbc9-2026bfe37c34/logo_withoutname-removebg-1767251276652.png?width=80&height=80&resize=contain"
                    alt="Katyaayani Astrologer"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-gradient-ancient">
                {content.brandName}
              </span>
            </div>
            <p className={theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}>
              {content.footerDesc}
            </p>
            {/* Newsletter */}
            <div className="mt-6">
              <h5 className={`font-[family-name:var(--font-cinzel)] text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}`}>
                {content.newsletterTitle}
              </h5>
              <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}`}>
                {content.newsletterDesc}
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.newsletterPlaceholder}
                  required
                  className={`flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border transition-colors outline-none ${
                    theme === 'dark'
                      ? 'bg-[#1a1a2e] border-[#ff6b35]/30 text-[#f5f0e8] placeholder:text-[#6b5847] focus:border-[#ff6b35]'
                      : 'bg-white border-[#ff6b35]/30 text-[#2d1810] placeholder:text-[#a0998c] focus:border-[#ff6b35]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                    status === "success"
                      ? 'bg-green-600 text-white'
                      : 'bg-[#ff6b35] text-white hover:bg-[#e55a2b] disabled:opacity-60'
                  }`}
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "success" && <CheckCircle className="w-4 h-4" />}
                  {status === "idle" && <Send className="w-4 h-4" />}
                  {status === "error" && <Send className="w-4 h-4" />}
                  {status === "success" ? content.newsletterSuccess : content.newsletterButton}
                </button>
              </form>
              {status === "error" && (
                <p className="text-red-500 text-xs mt-1">{content.newsletterError}</p>
              )}
            </div>
          </div>
          <div>
              <h4 className={`font-[family-name:var(--font-cinzel)] text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}`}>
                {content.quickLinks}
              </h4>
              <div className="flex flex-col gap-2">
                <Link href="/services" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Services")}</Link>
                <Link href="/booking" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Book")}</Link>
                <Link href="/feedback" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Feedback")}</Link>
                <Link href="/about" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("About")}</Link>
              </div>
            </div>
            <div>
              <h4 className={`font-[family-name:var(--font-cinzel)] text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}`}>
                {t("Policies")}
              </h4>
              <div className="flex flex-col gap-2">
                      <Link href="/terms" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Terms")}</Link>
                        <Link href="/privacy" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Privacy")}</Link>
                        <Link href="/refund-policy" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Refund Policy")}</Link>
                      <Link href="/disclaimer" className={`${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'} hover:text-[#ff6b35] transition-colors`}>{t("Disclaimer")}</Link>
              </div>
            </div>
          <div>
            <h4 className={`font-[family-name:var(--font-cinzel)] text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}`}>
              {content.contact}
            </h4>
              <div className="flex flex-col gap-3">
                    <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}`}>
                      <Phone className="w-4 h-4 text-[#ff6b35]" />
                          <a 
                            href="https://wa.me/919824929588"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#ff6b35] transition-colors"
                          >
                            +91 98249 29588
                          </a>
                      </div>
                        <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}`}>
                          <Mail className="w-4 h-4 text-[#ff6b35]" />
                                <span className="text-sm break-all font-normal">katyaayaniastrologer01@gmail.com</span>
                        </div>
                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}`}>
                  <MapPin className="w-4 h-4 text-[#ff6b35]" />
                  <span>Ahmedabad, Gujarat</span>
                </div>
            </div>
          </div>
          <div>
            <h4 className={`font-[family-name:var(--font-cinzel)] text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}`}>
              {content.timing}
            </h4>
            <div className={theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}>
              {content.timingDetails.map((detail, i) => (
                <p key={i}>{detail}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#ff6b35]/20 text-center">
          <p className={theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}>
            {content.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
