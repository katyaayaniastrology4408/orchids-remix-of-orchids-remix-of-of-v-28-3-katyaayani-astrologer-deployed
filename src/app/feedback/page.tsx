"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import dynamic from "next/dynamic";
import { useTranslation } from "@/components/GoogleTranslateWidget";
import Navbar from "@/components/homepage/Navbar";
import Footer from "@/components/homepage/Footer";

const CrispChat = dynamic(() => import("@/components/CrispChat"), { ssr: false });

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    consultationType: "",
    astrologer: "",
    feedback: "",
    wouldRecommend: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            rating: rating,
            consultation_type: formData.consultationType,
            astrologer: formData.astrologer,
            comment: formData.feedback,
            would_recommend: formData.wouldRecommend,
          }),
        });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#0a0a0f] text-[#f5f0e8]' : 'bg-background text-[#2d1810]'}`}>
          <CrispChat />
          <Navbar />

          <main className="flex-1 flex items-center justify-center px-6 py-16 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <Card className={theme === 'dark' ? 'bg-[#12121a] border-[#ff6b35]/20' : 'bg-white border-[#ff6b35]/20'}>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="font-[family-name:var(--font-cinzel)] text-3xl font-bold mb-4 text-gradient-ancient">
                  {t("Thank You")}
                </h1>
                <p className={`mb-8 ${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}`}>
                  {t("Feedback received")}
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/">
                    <Button className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-semibold">
                      {t("Return to Home")}
                    </Button>
                  </Link>
                  <Link href="/booking">
                    <Button
                      variant="outline"
                      className="w-full border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10"
                    >
                      {t("Book Another Session")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </main>
          <Footer />
        </div>
      );
    }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f] text-[#f5f0e8]' : 'bg-background text-[#2d1810]'}`}>
        <CrispChat />
        <Navbar />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-[#ff6b35]" />
            </div>
            <h1 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl font-bold mb-4 text-gradient-ancient">
              {t("Share Your Experience")}
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-[#a0998c]' : 'text-[#6b5847]'}`}>
              {t("Your feedback helps us")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={theme === 'dark' ? 'bg-[#12121a] border-[#ff6b35]/20' : 'bg-white border-[#ff6b35]/20'}>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-8">
                    <Label className={`text-xl mb-4 block ${theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}`}>
                      {t("How would you rate your experience")}
                    </Label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 transition-colors ${
                              star <= (hoveredRating || rating)
                                ? "fill-[#ff6b35] text-[#ff6b35]"
                                : theme === 'dark' 
                                  ? "text-[#a0998c]/30"
                                  : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-[#ff6b35] mt-2">
                        {rating === 5
                          ? t("Exceptional")
                          : rating === 4
                          ? t("Very Good")
                          : rating === 3
                          ? t("Good")
                          : rating === 2
                          ? t("Fair")
                          : t("Needs Improvement")}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className={theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}>
                        {t("Your Name")}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20 text-[#f5f0e8]' : 'bg-white border-[#ff6b35]/20 text-[#2d1810]'} focus:border-[#ff6b35]`}
                        placeholder={t("Enter your name")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className={theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}>
                        {t("Email")}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20 text-[#f5f0e8]' : 'bg-white border-[#ff6b35]/20 text-[#2d1810]'} focus:border-[#ff6b35]`}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="consultationType" className={theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}>
                        {t("Consultation Type")}
                      </Label>
                      <Select
                        value={formData.consultationType}
                        onValueChange={(value) => handleSelectChange("consultationType", value)}
                      >
                        <SelectTrigger className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20 text-[#f5f0e8]' : 'bg-white border-[#ff6b35]/20 text-[#2d1810]'}`}>
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                          <SelectContent className={theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20' : 'bg-white border-[#ff6b35]/20'}>
                            <SelectItem value="home">{t("Home Consultation")}</SelectItem>
                            <SelectItem value="online">{t("Online Meeting")}</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="astrologer" className={theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}>
                        {t("Your Astrologer")}
                      </Label>
                      <Select
                        value={formData.astrologer}
                        onValueChange={(value) => handleSelectChange("astrologer", value)}
                      >
                        <SelectTrigger className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20 text-[#f5f0e8]' : 'bg-white border-[#ff6b35]/20 text-[#2d1810]'}`}>
                          <SelectValue placeholder={t("Select astrologer")} />
                        </SelectTrigger>
                        <SelectContent className={theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20' : 'bg-white border-[#ff6b35]/20'}>
                          <SelectItem value="rudram">
                            <span className="notranslate">Rudram Joshi | रुद्रम जोशी </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback" className={theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}>
                      {t("Your Feedback")} *
                    </Label>
                    <Textarea
                      id="feedback"
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      required
                      className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#ff6b35]/20 text-[#f5f0e8]' : 'bg-white border-[#ff6b35]/20 text-[#2d1810]'} focus:border-[#ff6b35] min-h-[150px]`}
                      placeholder={t("Share your experience with our astrology services")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={theme === 'dark' ? 'text-[#f5f0e8]' : 'text-[#2d1810]'}>
                      {t("Would you recommend us")}
                    </Label>
                    <div className="grid grid-cols-2 md:flex gap-4">
                      {[
                        { key: "Definitely", label: t("Definitely") },
                        { key: "Maybe", label: t("Maybe") },
                        { key: "Not Sure", label: t("Not Sure") },
                        { key: "No", label: t("No") }
                      ].map((option) => (
                        <Button
                          key={option.key}
                          type="button"
                          variant="outline"
                          onClick={() => handleSelectChange("wouldRecommend", option.key)}
                          className={`flex-1 ${
                            formData.wouldRecommend === option.key
                              ? "bg-[#ff6b35] text-white border-[#ff6b35]"
                              : theme === 'dark'
                                ? "border-[#ff6b35]/20 text-[#a0998c] hover:border-[#ff6b35]"
                                : "border-[#ff6b35]/20 text-[#6b5847] hover:border-[#ff6b35]"
                          }`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !formData.feedback}
                    className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-semibold py-6 text-xl"
                  >
                    {isLoading ? (
                      t("Submitting")
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {t("Submit Feedback")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }