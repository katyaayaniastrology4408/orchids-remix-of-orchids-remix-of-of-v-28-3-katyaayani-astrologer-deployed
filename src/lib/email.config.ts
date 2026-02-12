import { sendEmailViaSMTP } from './nodemailer';
import { supabase } from './supabase';

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

// All transactional emails via Gmail SMTP only
export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }): Promise<EmailResult> => {
  const smtpResult = await sendEmailViaSMTP({ to, subject, html });
  if (smtpResult.success) {
    await logEmail(to, subject, 'sent', 'gmail');
    return smtpResult;
  }
  await logEmail(to, subject, 'failed', 'gmail', smtpResult.error);
  console.error('Gmail SMTP failed:', smtpResult.error);
  return smtpResult;
};
