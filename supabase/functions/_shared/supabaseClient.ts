// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://frzgxlawydtvppbokktg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyemd4bGF3eWR0dnBwYm9ra3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ3ODc5NCwiZXhwIjoyMDczMDU0Nzk0fQ.oLi14sYw53P8vURX16lTYLfRFJNRyNHjgtIXGMJ16FU'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
