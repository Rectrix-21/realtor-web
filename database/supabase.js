import { createClient } from "@supabase/supabase-js";
import { MockSupabaseClient } from "./mockSupabase.js";

// Check if we have real Supabase credentials
const hasRealCredentials = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
);

let supabase;

if (hasRealCredentials) {
  // Use real Supabase client
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log("✅ Using real Supabase client");
} else {
  // Use mock Supabase client for development
  supabase = new MockSupabaseClient();
  console.log("🔧 Using mock Supabase client for development");
  console.log(
    "Test credentials: admin@test.com / admin123 or user@test.com / user123"
  );
}

// Export the client (real or mock)
export { supabase };

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasRealCredentials;
