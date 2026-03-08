"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, Home, User, Mail, Phone, CreditCard, Hash, Calendar, IndianRupee, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // Payment details from URL params (passed by Uropay redirect or our callback)
  const name = searchParams.get("name") || searchParams.get("customer_name") || "";
  const email = searchParams.get("email") || searchParams.get("customer_email") || "";
  const mobile = searchParams.get("mobile") || searchParams.get("customer_mobile") || searchParams.get("phone") || "";
  const amount = searchParams.get("amount") || "501";
  const transactionId = searchParams.get("transaction_id") || searchParams.get("uropay_order_id") || "";
  const referenceNumber = searchParams.get("reference_number") || searchParams.get("order_id") || searchParams.get("client_order_id") || "";
  const paymentDate = searchParams.get("payment_date") || new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Fetch payment data from DB if we have a transaction ID
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (transactionId || referenceNumber) {
      fetch(`/api/payments/verify?transaction_id=${transactionId}&reference_number=${referenceNumber}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data?.payment) setPaymentData(data.payment); })
        .catch(() => {});
    }
  }, [transactionId, referenceNumber]);

  const displayName = paymentData?.name || name;
  const displayEmail = paymentData?.email || email;
  const displayMobile = paymentData?.mobile || mobile;
  const displayAmount = paymentData?.amount || amount;
  const displayTxnId = paymentData?.transaction_id || transactionId;
  const displayRef = paymentData?.id || referenceNumber;
  const displayDate = paymentData?.payment_date
    ? new Date(paymentData.payment_date).toLocaleString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : paymentDate;

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
          className="w-full max-w-xl"
        >
          {/* Success icon */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-green-500/15 border-4 border-green-500/30 flex items-center justify-center mb-5"
            >
              <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={2} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl font-bold text-green-500 mb-2"
            >
              Payment Successful
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className={`text-base ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}
            >
              Your payment has been completed successfully.
            </motion.p>
          </div>

          {/* Details card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={`${theme === "dark" ? "bg-[#12121a] border-green-500/20" : "bg-white border-green-500/20"} shadow-lg`}>
              <CardContent className="p-6 md:p-8 space-y-5">
                {/* Section: Customer info */}
                <div>
                  <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                    Customer Details
                  </h2>
                  <div className="space-y-3">
                    {displayName && (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                          <User className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Full Name</p>
                          <p className={`font-semibold ${theme === "dark" ? "text-[#f5f0e8]" : "text-[#2d1810]"}`}>{displayName}</p>
                        </div>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                          <Mail className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Email</p>
                          <p className={`font-semibold break-all ${theme === "dark" ? "text-[#f5f0e8]" : "text-[#2d1810]"}`}>{displayEmail}</p>
                        </div>
                      </div>
                    )}
                    {displayMobile && (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                          <Phone className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Mobile Number</p>
                          <p className={`font-semibold ${theme === "dark" ? "text-[#f5f0e8]" : "text-[#2d1810]"}`}>{displayMobile}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                        <IndianRupee className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Amount Paid</p>
                        <p className="font-bold text-lg text-green-500">₹{displayAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className={`border-t ${theme === "dark" ? "border-white/10" : "border-gray-100"}`} />

                {/* Section: Payment info */}
                <div>
                  <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                    Payment Details
                  </h2>
                  <div className="space-y-3">
                    {displayRef && (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                          <Hash className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Payment Reference Number</p>
                          <p className={`font-mono font-semibold text-sm ${theme === "dark" ? "text-[#f5f0e8]" : "text-[#2d1810]"}`}>{displayRef}</p>
                        </div>
                      </div>
                    )}
                    {displayTxnId && (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                          <CreditCard className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Transaction ID</p>
                          <p className={`font-mono font-semibold text-sm break-all ${theme === "dark" ? "text-[#f5f0e8]" : "text-[#2d1810]"}`}>{displayTxnId}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-500/10" : "bg-green-50"}`}>
                        <Calendar className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className={`text-xs ${theme === "dark" ? "text-[#a0998c]" : "text-[#75695e]"}`}>Payment Date / Time</p>
                        <p className={`font-semibold text-sm ${theme === "dark" ? "text-[#f5f0e8]" : "text-[#2d1810]"}`}>{displayDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className={`rounded-xl p-4 flex items-center gap-3 ${theme === "dark" ? "bg-green-500/10 border border-green-500/20" : "bg-green-50 border border-green-200"}`}>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-green-300" : "text-green-700"}`}>
                    Payment completed successfully. Thank you for choosing Katyaayani Astrologer!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6"
          >
            <Link href="/">
              <Button className="w-full bg-[#ff6b35] hover:bg-[#ff8c5e] text-white font-semibold h-12 rounded-xl text-base">
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-[#ff6b35] text-lg">Loading...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
