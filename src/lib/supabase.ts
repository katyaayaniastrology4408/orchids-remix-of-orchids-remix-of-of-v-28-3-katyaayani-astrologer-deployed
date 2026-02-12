import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialize the main supabase client to avoid crashes if env vars are missing
let supabaseClient: any = null;

// Noop auth object so the app never crashes if credentials are absent
const noopAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
  signOut: async () => {},
  getUser: async () => ({ data: { user: null }, error: null }),
};

export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    if (!supabaseClient) {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Missing Supabase Public credentials – auth features disabled');
        // Return a safe noop so the app renders instead of crashing
        if (prop === 'auth') return noopAuth;
        return () => ({ data: null, error: new Error('Supabase not configured') });
      }
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }) },
        });
    }
    return supabaseClient[prop];
  }
});

// Helper for admin client - only call this from server-side code
export const getSupabaseAdmin = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }) },
  });
};

// For backward compatibility in server-side code - lazy initialize to avoid env var issues at build/module load
let adminClient: any = null;
export const supabaseAdmin = typeof window === 'undefined' 
  ? new Proxy({} as any, {
      get: (target, prop) => {
        if (!adminClient) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.error('Missing Supabase Admin credentials:', { 
              url: !!supabaseUrl, 
              key: !!supabaseServiceRoleKey 
            });
            throw new Error('Supabase Admin client failed to initialize: Missing credentials');
          }
          
            adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
              global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }) },
            });
        }
        return adminClient[prop];
      }
    })
  : null as any;

export type Booking = {
  id?: string;
  created_at?: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  service_type: 'home' | 'office' | 'online';
  booking_date: string;
  booking_time: string;
  special_requests?: string;
  payment_status?: 'pending' | 'completed' | 'failed';
  payment_intent_id?: string;
  amount?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

export type Availability = {
  id?: string;
  date: string;
  is_available: boolean;
  blocked_times?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Feedback = {
  id?: string;
  created_at?: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  is_approved?: boolean;
};
