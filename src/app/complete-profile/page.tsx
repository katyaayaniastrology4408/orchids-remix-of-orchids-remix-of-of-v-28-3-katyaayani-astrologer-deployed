"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, MapPin, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_URL = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/749cf92f-0c06-43d7-b795-4c90a58526eb/logo_withoutname-1770224400752.png";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [pob, setPob] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/");
        return;
      }
      setUser(data.user);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) { setError("Please select your gender."); return; }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          phone,
          gender,
          dob,
          tob,
          pob,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setSuccess(true);
      setTimeout(() => router.replace("/profile"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0014]">
        <Loader2 className="w-10 h-10 text-[#ff6b35] animate-spin" />
      </div>
    );
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Seeker";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #0a0014 0%, #1a0f2e 50%, #0a0014 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-[#ff6b35]/20 overflow-hidden ${
          theme === "dark" ? "bg-[#12121a]" : "bg-white"
        }`}
      >
        <div className="h-2 bg-gradient-to-r from-[#ff6b35] via-[#ffa07a] to-[#2d1b4e]" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Katyaayani" className="w-16 h-16 rounded-full border-2 border-[#ff6b35] mx-auto mb-4" />
            <h1 className={`text-2xl font-bold font-[family-name:var(--font-cinzel)] ${theme === "dark" ? "text-white" : "text-[#2d1810]"}`}>
              Complete Your Profile
            </h1>
            <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Namaste <span className="text-[#ff6b35] font-semibold">{name}</span>! Astrological readings need your birth details.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-4xl">✓</motion.div>
              </div>
              <h3 className="text-xl font-bold text-green-500">Profile Complete!</h3>
              <p className="text-gray-400 mt-2 text-sm">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gender</Label>
                <div className="flex gap-3">
                  {["male", "female", "other"].map((g) => (
                    <label
                      key={g}
                      className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-sm font-bold capitalize ${
                        gender === g
                          ? "bg-[#ff6b35] border-[#ff6b35] text-white"
                          : "border-[#ff6b35]/30 text-gray-500 hover:border-[#ff6b35]/60"
                      }`}
                    >
                      <input type="radio" name="gender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} className="hidden" />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* DOB + TOB */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Birth Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="pl-9 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Birth Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="time"
                      value={tob}
                      onChange={(e) => setTob(e.target.value)}
                      required
                      className="pl-9 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    />
                  </div>
                </div>
              </div>

              {/* POB */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Birth Place</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={pob}
                    onChange={(e) => setPob(e.target.value)}
                    required
                    className="pl-10 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    placeholder="e.g. Surat, Gujarat"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 bg-[#ff6b35] hover:bg-[#ff8c5e] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#ff6b35]/20 mt-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Save & Continue to Dashboard"}
              </Button>

              <p className={`text-center text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                These details help us provide accurate astrological readings.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
