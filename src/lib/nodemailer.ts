import nodemailer from 'nodemailer';

// Gmail SMTP as primary, Brevo SMTP as fallback
export const sendEmailViaSMTP = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const fromName = 'Katyaayani Astrologer';
  const fromEmail = process.env.GMAIL_USER || 'katyaayaniastrologer01@gmail.com';

  // Try Gmail SMTP first
  const gmailResult = await sendViaGmail({ to, subject, html, fromName, fromEmail });
  if (gmailResult.success) return gmailResult;

  console.warn('Gmail SMTP failed, trying Brevo SMTP...');

  // Fallback to Brevo SMTP
  const brevoResult = await sendViaBrevoSMTP({ to, subject, html, fromName, fromEmail });
  if (brevoResult.success) return brevoResult;

  console.warn('Brevo SMTP failed, trying Brevo API...');

  // Final fallback: Brevo HTTP API
  return sendViaBrevoAPI({ to, subject, html, fromName, fromEmail });
};

async function sendViaGmail({ to, subject, html, fromName, fromEmail }: any) {
  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) return { success: false, error: 'Gmail credentials missing' };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent via Gmail SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Gmail SMTP Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendViaBrevoSMTP({ to, subject, html, fromName, fromEmail }: any) {
  try {
    const host = process.env.BREVO_SMTP_SERVER;
    const port = parseInt(process.env.BREVO_SMTP_PORT || '587');
    const user = process.env.BREVO_SMTP_LOGIN;
    const pass = process.env.BREVO_API_KEY;
    if (!host || !user || !pass) return { success: false, error: 'Brevo SMTP credentials missing' };

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent via Brevo SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Brevo SMTP Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendViaBrevoAPI({ to, subject, html, fromName, fromEmail }: any) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return { success: false, error: 'Brevo API key missing' };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    const data = await response.json();
    console.log('Email sent via Brevo API:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error('Brevo API Error:', error);
    return { success: false, error: error.message };
  }
}
