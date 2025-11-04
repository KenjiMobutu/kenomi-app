import { createClient } from '@supabase/supabase-js';

// Ce client utilise la clé SERVICE_ROLE et ne doit JAMAIS être exposé au client (navigateur).
// Il ne doit être utilisé que dans les routes API, les Server Actions, ou les pages SSR (getServerSideProps).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Il est recommandé de désactiver l'auto-refresh du token pour le client admin
    autoRefreshToken: false,
    persistSession: false
  }
});
