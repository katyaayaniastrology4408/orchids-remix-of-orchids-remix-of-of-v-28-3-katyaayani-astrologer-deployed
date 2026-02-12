// Uses Brevo HTTP API for all transactional emails
export const sendEmailViaSMTP = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ BREVO_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email configuration missing' };
    }

    const fromName = 'Katyaayani Astrologer';
    const fromEmail = process.env.GMAIL_USER || 'katyaayaniastrologer01@gmail.com';

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
};
