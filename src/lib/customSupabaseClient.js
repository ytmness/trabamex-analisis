import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frzgxlawydtvppbokktg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyemd4bGF3eWR0dnBwYm9ra3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzg3OTQsImV4cCI6MjA3MzA1NDc5NH0.3X9RUHPMEe8lu-q6be7EutCLB3j1S__aSpqAiJAqpio'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase