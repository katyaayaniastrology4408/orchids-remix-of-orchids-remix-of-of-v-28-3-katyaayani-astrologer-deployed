// Transactional emails (OTP, booking, welcome, login, password reset) → Gmail SMTP
// Newsletter/Blog/Tips → Resend (via /api/newsletter/send)
export { sendSmtpEmail as sendEmail } from './smtp';
export type { EmailResult } from './smtp';
