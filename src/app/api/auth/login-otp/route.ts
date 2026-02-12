import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email.config';
import { otpEmailTemplate } from '@/lib/email-templates';
import bcrypt from 'bcryptjs';
export const dynamic = 'force-dynamic' ; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verify user credentials first
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 2. User is valid, now generate OTP for 2FA
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP before saving to DB
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Get user's name from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', authData.user.id)
      .maybeSingle();

    const name = profile?.name || 'Seeker';

    // Save to DB
    const { error: dbError } = await supabaseAdmin
      .from('otps')
      .upsert(
        { 
          email, 
          code: hashedOtp, 
          expires_at: expiresAt.toISOString(), 
          type: 'login' 
        },
        { onConflict: 'email,type' }
      );

    if (dbError) {
      console.error('Database error saving login OTP:', dbError);
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // 3. Send email via SMTP
    const emailResult = await sendEmail({
      to: email,
      subject: 'Login Verification - Katyaayani Astrologer',
      html: otpEmailTemplate(otp, name),
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
    console.error('Login OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
