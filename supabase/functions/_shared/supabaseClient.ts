import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://frzgxlawydtvppbokktg.supabase.co'
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
