import { Resend } from 'resend';
import { supabase } from './supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailResult = { success: boolean; messageId?: string; error?: string };

// Log email to database
const logEmail = async (recipient: string, subject: string, status: 'sent' | 'failed', provider: string, errorMessage?: string) => {
  try {
    await supabase.from('email_logs').insert([{
      recipient,
      subject,
      status,
      provider,
      error_message: errorMessage || null
    }]);
  } catch (err) {
    console.error('Failed to log email:', err);
  }
};

// All transactional emails via Resend
export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }): Promise<EmailResult> => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Katyaayani Astrologer <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      await logEmail(to, subject, 'failed', 'resend', error.message);
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    await logEmail(to, subject, 'sent', 'resend');
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    await logEmail(to, subject, 'failed', 'resend', err.message);
    console.error('Resend exception:', err);
    return { success: false, error: err.message };
  }
};
