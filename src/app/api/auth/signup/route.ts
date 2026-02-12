import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from 'bcryptjs';
export const dynamic = 'force-dynamic' ; 

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone, gender, dob, tob, pob } = await req.json();

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
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
