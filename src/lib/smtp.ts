import nodemailer from 'nodemailer';

export type EmailResult = { success: boolean; messageId?: string; error?: string };

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export const sendSmtpEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"Katyaayani Astrologer" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('SMTP send error:', err);
    return { success: false, error: err.message };
  }
};

export const testSmtpConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
