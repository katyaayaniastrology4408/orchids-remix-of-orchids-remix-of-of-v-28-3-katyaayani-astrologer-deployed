"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, MapPin, Calendar, Clock, Phone,
  Lock, Eye, EyeOff, CheckCircle2, ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_URL =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/749cf92f-0c06-43d7-b795-4c90a58526eb/logo_withoutname-1770224400752.png";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
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
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  const pwdValid = (p: string) =>
    p.length >= 8 && /[A-Z]/.test(p) && /[0-9!@#$%^&*(),.?":{}|<>]/.test(p);

  const pwdMatch = password && confirmPassword && password === confirmPassword;

  // ── Step 1 submit ──
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (!gender) { setError("Please select your gender."); return; }
    if (!dob) { setError("Please enter your birth date."); return; }
    if (!tob) { setError("Please enter your birth time."); return; }
    if (!pob.trim()) { setError("Please enter your birth place."); return; }
    setStep(2);
  };

  // ── Step 2 submit ──
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pwdValid(password)) {
      setError("Password must be 8+ characters with a capital letter and a number/symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save profile details to DB
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
          clear_password: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile.");

      // 2. Set password on Supabase auth account
      const { error: passErr } = await supabase.auth.updateUser({ password });
      if (passErr) throw new Error(passErr.message);

      // 3. Send welcome email
      await fetch("/api/auth/google-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Seeker",
          password,
        }),
      });

      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0014]">
        <Loader2 className="w-10 h-10 text-[#ff6b35] animate-spin" />
      </div>
    );
  }

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Seeker";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(180deg, #0a0014 0%, #1a0f2e 50%, #0a0014 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg rounded-[2rem] shadow-2xl border border-[#ff6b35]/20 overflow-hidden ${
          dark ? "bg-[#12121a]" : "bg-white"
        }`}
      >
        {/* Top progress bar */}
        <div className="h-1.5 bg-gray-200/10 w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ffa07a]"
            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="p-8">
          {/* Logo + title */}
          <div className="text-center mb-6">
            <img
              src={LOGO_URL}
              alt="Katyaayani"
              className="w-14 h-14 rounded-full border-2 border-[#ff6b35] mx-auto mb-3 object-contain"
            />
            <h1
              className={`text-2xl font-bold font-[family-name:var(--font-cinzel)] ${
                dark ? "text-white" : "text-[#2d1810]"
              }`}
            >
              {step === 3 ? "You're All Set!" : "Complete Your Profile"}
            </h1>
            <p className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
              Welcome,{" "}
              <span className="text-[#ff6b35] font-semibold">{userName}</span>!
            </p>
          </div>

          {/* Step pills */}
          {step !== 3 && (
            <div className="flex items-center justify-center gap-3 mb-7">
              {[
                { n: 1, label: "Birth Details" },
                { n: 2, label: "Set Password" },
              ].map(({ n, label }, i) => (
                <div key={n} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-8 h-px ${
                        step > 1 ? "bg-[#ff6b35]" : "bg-gray-600"
                      }`}
                    />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step > n
                          ? "bg-green-500 text-white"
                          : step === n
                          ? "bg-[#ff6b35] text-white"
                          : dark
                          ? "bg-white/10 text-gray-500"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step > n ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        step >= n ? "text-[#ff6b35]" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ───────────── STEP 1: Birth Details ───────────── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStep1}
                className="space-y-4"
              >
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+91 98765 43210"
                      className="pl-10 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Gender
                  </Label>
                  <div className="flex gap-3">
                    {["Male", "Female", "Other"].map((g) => (
                      <label
                        key={g}
                        className={`flex-1 flex items-center justify-center py-3 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${
                          gender === g.toLowerCase()
                            ? "bg-[#ff6b35] border-[#ff6b35] text-white"
                            : dark
                            ? "border-[#ff6b35]/30 text-gray-400 hover:border-[#ff6b35]/60"
                            : "border-[#ff6b35]/30 text-gray-500 hover:border-[#ff6b35]/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g.toLowerCase()}
                          checked={gender === g.toLowerCase()}
                          onChange={(e) => setGender(e.target.value)}
                          className="hidden"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                {/* DOB + TOB */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Birth Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Birth Time
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Birth Place
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      value={pob}
                      onChange={(e) => setPob(e.target.value)}
                      required
                      placeholder="e.g. Surat, Gujarat"
                      className="pl-10 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#ff8c5e] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#ff6b35]/20 flex items-center justify-center gap-2 mt-2"
                >
                  Next: Set Password <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.form>
            )}

            {/* ───────────── STEP 2: Set Password ───────────── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStep2}
                className="space-y-5"
              >
                <p className={`text-sm text-center -mt-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  Create a password so you can also sign in with your email later.
                </p>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="e.g. Astro@2025"
                      className="pl-10 pr-12 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6b35]"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 pl-1">
                    8+ characters · 1 capital letter · 1 number or symbol
                  </p>
                  {password && (
                    <p className={`text-xs pl-1 ${pwdValid(password) ? "text-green-500" : "text-red-400"}`}>
                      {pwdValid(password) ? "✓ Strong password" : "✗ Doesn't meet requirements"}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter your password"
                      className={`pl-10 pr-12 h-12 rounded-xl border-[#ff6b35]/30 focus:border-[#ff6b35] ${
                        confirmPassword && !pwdMatch ? "border-red-400 focus:border-red-400" : ""
                      } ${confirmPassword && pwdMatch ? "border-green-500 focus:border-green-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6b35]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && !pwdMatch && (
                    <p className="text-xs text-red-400 pl-1">✗ Passwords do not match</p>
                  )}
                  {confirmPassword && pwdMatch && (
                    <p className="text-xs text-green-500 pl-1">✓ Passwords match</p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 h-12 rounded-2xl border-[#ff6b35]/40 text-[#ff6b35] hover:bg-[#ff6b35]/10 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] h-12 bg-[#ff6b35] hover:bg-[#ff8c5e] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#ff6b35]/20"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Complete Setup ✓"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* ───────────── STEP 3: All Done ───────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.55, delay: 0.15 }}
                  className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>

                <h2
                  className={`text-2xl font-bold font-[family-name:var(--font-cinzel)] mb-2 ${
                    dark ? "text-white" : "text-[#2d1810]"
                  }`}
                >
                  Profile Complete!
                </h2>
                <p className={`text-sm mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  A confirmation email has been sent to:
                </p>
                <p className="text-[#ff6b35] font-semibold text-sm mb-3">
                  {user?.email}
                </p>
                <p className={`text-xs mb-7 max-w-xs mx-auto ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  You can now sign in with your Google account or with your email &amp; password.
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
