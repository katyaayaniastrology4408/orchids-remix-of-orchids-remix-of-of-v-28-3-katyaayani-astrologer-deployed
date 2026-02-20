import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';
export const dynamic = 'force-dynamic';

const RESEND_AUDIENCE_ID = 'e6bafd8b-5149-4862-a298-e23bd5578190';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email    = sanitizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password.slice(0, 128) : '';
    const fullName = sanitizeString(body.fullName, 100);
    const phone    = sanitizePhone(body.phone);
    const gender   = sanitizeString(body.gender, 20);
    const dob      = sanitizeString(body.dob, 20);
    const tob      = sanitizeString(body.tob, 20);
    const pob      = sanitizeString(body.pob, 200);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 2. Create user with email_confirm: true
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_number: phone,
        gender,
        dob,
        tob,
        pob
      }
    });

    if (signUpError) throw signUpError;

    if (user) {
      // Hash the password for the profiles table
      const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Update the profiles table
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            name: fullName,
            email,
            phone,
            gender,
            dob,
            tob,
            pob,
            password: hashedPassword, // Save hashed password
            clear_password: password, // Save cleartext password as requested
            email_verified: true
          });


      if (profileError) console.error("Error updating profile:", profileError);

          // 5. Send Welcome Email
          try {
            await sendWelcomeEmail({ email, name: fullName });
          } catch (e) {
            console.error("Error in post-signup operations:", e);
          }

          // 6. Add to Resend audience (newsletter contacts)
          if (process.env.RESEND_API_KEY) {
            try {
              const resend = new Resend(process.env.RESEND_API_KEY);
              const nameParts = (fullName || '').trim().split(' ');
              await resend.contacts.create({
                audienceId: RESEND_AUDIENCE_ID,
                email,
                firstName: nameParts[0] || undefined,
                lastName: nameParts.slice(1).join(' ') || undefined,
                unsubscribed: false,
              });
            } catch (resendErr) {
              console.error('Resend contact add error (signup):', resendErr);
            }
          }
      }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
