"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.replace("/");
        return;
      }

      const user = session.user;
      const provider = user.app_metadata?.provider;

      if (provider === "google") {
        // Check if profile already has dob/pob filled
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("dob, tob, pob")
          .eq("id", user.id)
          .single();

        const isComplete = profile?.dob && profile?.pob;

        // Notify backend to handle Google login (save profile + send email)
        await fetch("/api/auth/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar: user.user_metadata?.avatar_url || "",
            isNew: !isComplete,
          }),
        });

        if (!isComplete) {
          router.replace("/complete-profile");
        } else {
          router.replace("/profile");
        }
      } else {
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
