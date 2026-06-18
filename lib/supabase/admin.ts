import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (typeof window !== 'undefined') {
  throw new Error('Supabase admin client should not be used on the client-side.');
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase admin credentials missing. Check environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
