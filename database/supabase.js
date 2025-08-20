import { createClient } from "@supabase/supabase-js";

// Use placeholder values if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcvprmbuggkmnonkeong.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdnBybWJ1Z2drbW5vbmtlb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODQ0MTAsImV4cCI6MjA2Nzc2MDQxMH0.vhKAGTRX21bK2lM9gH4O1FarwFIYz23TVr46QemwTcc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
