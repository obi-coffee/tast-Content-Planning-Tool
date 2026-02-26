import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yfixjafskptbhjsbvxwf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaXhqYWZza3B0Ymhqc2J2eHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjI1NjUsImV4cCI6MjA4NzY5ODU2NX0.65RkBmRbnw_7lC9JK0SzHUfv2GiNpdmxgP85qQjECds'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
