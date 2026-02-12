import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingNotification } from "@/lib/email";
export const dynamic = 'force-dynamic' ; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("UroPay Webhook Payload:", payload);

    // Common parameters in UroPay/UPI gateways
    const order_id = payload.order_id || payload.client_order_id;
    const status = payload.status;

    if (!order_id) {
      return NextResponse.json({ success: false, message: "Missing order_id" }, { status: 400 });
    }

    // Fetch booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", order_id)
      .single();

    if (fetchError || !booking) {
      console.error("Booking not found for order_id:", order_id);
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    if (status === "success" || status === "confirmed" || status === "PAID") {
      // Handle Payment Success
        const { error: updateError } = await supabase
          .from("bookings")
          .update({ 
            status: "confirmed",
            payment_status: "completed",
            payment_intent_id: payload.transaction_id || payload.uropay_order_id
          })
          .eq("id", order_id);

      if (updateError) {
        console.error("Supabase update error (webhook success):", updateError);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      // Notify Telegram Bot
      const botToken = process.env.TELEGRAM_BOOKING_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_BOOKING_CHAT_ID;

      if (botToken && chatId) {
        try {
          const text = `🕉️ *New Successful Consultation Booking*\n\n` +
            `🆔 *Booking ID:* \`${order_id}\`\n` +
            `👤 *Seeker Name:* ${booking.full_name}\n` +
            `📧 *Email:* ${booking.email}\n` +
            `📱 *Phone:* ${booking.phone}\n` +
            `🏙️ *City:* ${booking.city || 'N/A'}\n\n` +
            `🔮 *Service:* ${booking.service_type}\n` +
            `📅 *Date:* ${booking.booking_date}\n` +
            `⏰ *Time:* ${booking.booking_time}\n` +
            `💵 *Amount Paid:* ₹${formatCurrency(booking.amount)}\n\n` +
            `📜 *Birth Details:*\n` +
            `📅 Date: ${booking.date_of_birth}\n` +
            `⏰ Time: ${booking.time_of_birth}\n` +
            `📍 Place: ${booking.place_of_birth}\n\n` +
            `💬 *Special Questions:* \n${booking.special_requests || 'None'}\n\n` +
            `💳 *Transaction ID:* \`${payload.transaction_id || payload.uropay_order_id || 'N/A'}\`\n` +
            `✅ *Status:* PAID & CONFIRMED`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: 'Markdown',
            }),
          });
        } catch (tgError) {
          console.error('Telegram notification failed:', tgError);
        }
      }

      // Send Email Notification to User (Success)
      await sendBookingNotification(booking, 'payment_success');

      return NextResponse.json({ success: true, message: "Payment success processed" });

    } else if (status === "failure" || status === "failed" || status === "FAILED") {
      // Handle Payment Failure
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          payment_status: "failed",
          status: "pending" // Keep it pending so they can try again if they want, or mark as cancelled
        })
        .eq("id", order_id);

      if (updateError) {
        console.error("Supabase update error (webhook failure):", updateError);
      }

      // Send Email Notification to User (Failure)
      await sendBookingNotification(booking, 'payment_failed');

      return NextResponse.json({ success: true, message: "Payment failure processed" });
    }

    return NextResponse.json({ success: true, message: "No specific action for this status: " + status });
  } catch (error) {
    console.error("UroPay callback error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
