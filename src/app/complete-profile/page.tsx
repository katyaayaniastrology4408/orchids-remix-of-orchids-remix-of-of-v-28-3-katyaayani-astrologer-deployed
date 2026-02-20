"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Calendar, Clock, User, Lock, Eye, EyeOff, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_URL = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/749cf92f-0c06-43d7-b795-4c90a58526eb/logo_withoutname-1770224400752.png";

type Step = 1 | 2 | 3;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [pob, setPob] = useState("");

  // Step 2 fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/"); return; }
      setUser(data.user);
    });
  }, [router]);

  const validatePassword = (p: string) => {
    return p.length >= 8 && /[A-Z]/.test(p) && /[!@#$%^&*(),.?":{}|<>0-9]/.test(p);
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!gender) { setError("Please select your gender."); return; }
    if (!dob) { setError("Please enter your birth date."); return; }
    if (!tob) { setError("Please enter your birth time."); return; }
    if (!pob.trim()) { setError("Please enter your birth place."); return; }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validatePassword(password)) {
      setError("Password must be 8+ characters with a capital letter and a number/symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Save profile details
      const profileRes = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, phone, gender, dob, tob, pob }),
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || "Failed to save profile");

      // 2. Set password on Supabase account (so user can also log in with email)
      const { error: passErr } = await supabase.auth.updateUser({ password });
      if (passErr) throw new Error(passErr.message);

      // 3. Send welcome email with credentials
      await fetch("/api/auth/google-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "Seeker",
          password,
        }),
      });

      setStep(3);
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

  const stepLabels = ["Personal Info", "Create Password", "All Done!"];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #0a0014 0%, #1a0f2e 50%, #0a0014 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-[#ff6b35]/20 overflow-hidden ${
          dark ? "bg-[#12121a]" : "bg-white"
        }`}
      >
        <div className="h-2 bg-gradient-to-r from-[#ff6b35] via-[#ffa07a] to-[#2d1b4e]" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img src={LOGO_URL} alt="Katyaayani" className="w-14 h-14 rounded-full border-2 border-[#ff6b35] mx-auto mb-3" />
            <h1 className={`text-2xl font-bold font-[family-name:var(--font-cinzel)] ${dark ? "text-white" : "text-[#2d1810]"}`}>
              Complete Your Profile
            </h1>
            <p className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
              Welcome, <span className="text-[#ff6b35] font-semibold">{name}</span>!
            </p>
          </div>

          {/* Step Indicator */}
          {step !== 3 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? "bg-[#ff6b35] text-white"
                      : dark ? "bg-white/10 text-gray-500" : "bg-gray-100 text-gray-400"
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step >= s ? "text-[#ff6b35]" : "text-gray-500"}`}>
                    {stepLabels[s - 1]}
                  </span>
                  {s < 2 && <div className={`w-8 h-px mx-1 ${step > s ? "bg-[#ff6b35]" : "bg-gray-300"}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ───── STEP 1: Personal Info ───── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                onSubmit={handleStep1}
                className="space-y-4"
              >
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <div className="space-y-1.5">
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
                  <div className="space-y-1.5">
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
                  <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#ff8c5e] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#ff6b35]/20 mt-2"
                >
                  Next: Create Password →
                </Button>
              </motion.form>
            )}

            {/* ───── STEP 2: Create Password ───── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                onSubmit={handleStep2}
                className="space-y-5"
              >
                <p className={`text-sm text-center -mt-2 mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  Create a password so you can also log in with your email later.
                </p>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-12 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                      placeholder="e.g. Astro@123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6b35]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">8+ characters, capital letter, number or symbol (e.g. Astro@123)</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`pl-10 pr-12 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35] ${
                        confirmPassword && confirmPassword !== password ? "border-red-400" : ""
                      }`}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6b35]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-green-500">✓ Passwords match</p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 h-12 rounded-2xl border-[#ff6b35]/30 text-[#ff6b35] hover:bg-[#ff6b35]/10"
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] h-12 bg-[#ff6b35] hover:bg-[#ff8c5e] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#ff6b35]/20"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Complete Setup ✓"}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* ───── STEP 3: Done ───── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className={`text-2xl font-bold font-[family-name:var(--font-cinzel)] mb-2 ${dark ? "text-white" : "text-[#2d1810]"}`}>
                  Profile Complete!
                </h2>
                <p className={`text-sm mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  Your account is ready. A confirmation email has been sent to:
                </p>
                <p className="text-[#ff6b35] font-semibold text-sm mb-6">{user.email}</p>
                <p className={`text-xs mb-6 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  Your email and password have been saved — you can use them to log in anytime.
                </p>
                <Button
                  onClick={() => router.replace("/profile")}
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#ff8c5e] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#ff6b35]/20"
                >
                  Go to My Dashboard →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
