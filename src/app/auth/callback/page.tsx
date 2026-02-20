"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for Supabase to exchange the code for a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.replace("/");
        return;
      }

      const user = session.user;
      const provider = user.app_metadata?.provider;

      if (provider === "google") {
        // Step 1: Ensure profile row exists (insert if new user)
        await fetch("/api/auth/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar: user.user_metadata?.avatar_url || "",
          }),
        });

        // Step 2: Check if profile is complete (has dob + pob filled)
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("dob, pob, phone, gender, tob")
          .eq("id", user.id)
          .single();

        const isComplete =
          profile?.dob && profile?.pob && profile?.phone && profile?.gender;

        if (!isComplete) {
          // New user or incomplete profile — go fill details
          router.replace("/complete-profile");
        } else {
          // Returning user — go straight to profile
          router.replace("/profile");
        }
      } else {
        // Email/password login — go to profile
        router.replace("/profile");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0014]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">Signing you in...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}
