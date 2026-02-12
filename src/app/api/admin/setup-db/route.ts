import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic' ; 

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Add clear_password column to profiles table
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clear_password TEXT;"
    });

    if (error) {
      // If RPC fails (which it might if not set up), try a direct query if possible
      // But supabase-js doesn't support raw SQL unless via RPC
      console.error("Migration error:", error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, message: "Column added successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
