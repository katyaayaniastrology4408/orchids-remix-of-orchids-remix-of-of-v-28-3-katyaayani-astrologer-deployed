"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { XCircle, AlertTriangle, RefreshCw, Home, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const errorMessage =
    searchParams.get("error_message") ||
    searchParams.get("message") ||
    searchParams.get("error[description]") ||
    searchParams.get("reason") ||
    "";

  const errorCode =
    searchParams.get("error_code") ||
    searchParams.get("error[code]") ||
    "";

  const getDisplayMessage = () => {
    if (errorCode === "payment_cancelled" || errorMessage.toLowerCase().includes("cancel")) {
      return "You cancelled the payment. No charges were made to your account.";
    }
    if (errorCode === "GATEWAY_ERROR") {
      return "A payment gateway error occurred. Please try again after a few minutes.";
    }
    if (errorMessage) return errorMessage;
    return "Your payment could not be completed. Please try again.";
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0a0a0f] text-[#f5f0e8]" : "bg-[#fdfbf7] text-[#2d1810]"}`}>
      {/* Navbar */}
      <nav className={`backdrop-blur-md border-b ${theme === "dark" ? "bg-[#0a0a0f]/95 border-[#ff6b35]/20" : "bg-white/95 border-[#ff6b35]/20"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/c601c1cc-61c8-474d-bbc9-2026bfe37c34/logo_withoutname-removebg-1767251276652.png?width=8000&height=8000&resize=contain"
              alt="Logo"
              width={44}
              height={44}
              className="rounded-full"
            />
            <span className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-gradient-ancient hidden sm:inline">
              Katyaayani Astrologer
            </span>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10 h-9 w-9"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Error icon */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-red-500/15 border-4 border-red-500/30 flex items-center justify-center mb-5"
            >
              <XCircle className="w-12 h-12 text-red-500" strokeWidth={2} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl font-bold text-red-500 mb-2"
            >
              Payment Failed
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className={`text-base text-center max-w-sm ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}
            >
              The payment was not completed.
            </motion.p>
          </div>

          {/* Details card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={`${theme === "dark" ? "bg-[#12121a] border-red-500/20" : "bg-white border-red-500/20"} shadow-lg`}>
              <CardContent className="p-6 md:p-8 space-y-5">
                {/* Failure message */}
                <div className={`rounded-xl p-4 flex items-start gap-3 ${theme === "dark" ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-semibold mb-1 ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
                      Payment Failed
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-red-300/80" : "text-red-600"}`}>
                      {getDisplayMessage()}
                    </p>
                    {errorCode && (
                      <p className={`text-xs mt-1 font-mono ${theme === "dark" ? "text-red-400/60" : "text-red-400"}`}>
                        Code: {errorCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* No charge notice */}
                <div className={`rounded-xl p-4 flex items-start gap-3 ${theme === "dark" ? "bg-blue-900/20 border border-blue-600/30" : "bg-blue-50 border border-blue-200"}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${theme === "dark" ? "bg-blue-400" : "bg-blue-500"}`} />
                  <p className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                    No charges were made to your account. You can safely try the payment again.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 space-y-3"
          >
            <Link href="/booking" className="block">
              <Button className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-semibold h-12 rounded-xl text-base">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Payment Again
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10 h-12 rounded-xl text-base"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-[#ff6b35] text-lg">Loading...</div>
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
