import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email.config';
import { otpEmailTemplate } from '@/lib/email-templates';
import bcrypt from 'bcryptjs';
export const dynamic = 'force-dynamic' ; 

export async function POST(req: Request) {
  try {
    const { email, fullName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);
    
    if (userExists) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP before saving to DB
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to DB (upsert to handle resends)
    const { error: dbError } = await supabaseAdmin
      .from('otps')
      .upsert(
        { 
          email, 
          code: hashedOtp, 
          expires_at: expiresAt.toISOString(), 
          type: 'signup',
          verified_at: null
        },
        { onConflict: 'email,type' }
      );

    if (dbError) {
      console.error('Database error saving signup OTP:', dbError);
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // Send email via SMTP
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Katyaayani Astrologer',
      html: otpEmailTemplate(otp, fullName || 'Seeker'),
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully to your email' 
    });
  } catch (error: any) {
    console.error('Signup OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
