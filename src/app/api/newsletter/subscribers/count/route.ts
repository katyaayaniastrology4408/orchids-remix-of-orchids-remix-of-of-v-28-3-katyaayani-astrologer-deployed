import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    return NextResponse.json({ success: true, count: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ success: false, count: 0 });
  }
}
