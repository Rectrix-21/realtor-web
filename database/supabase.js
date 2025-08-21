"use client";
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "x-application": "havenly-realtor-web",
      },
    },
  }
);

// Test connection on initialization
supabase.auth
  .getSession()
  .then(({ data, error }) => {
    if (error) {
      console.warn("Supabase connection issue:", error.message);
    } else {
      console.log("✅ Supabase connection established");
    }
  })
  .catch((err) => {
    console.error("❌ Failed to establish Supabase connection:", err);
  });

// Export the client (real or mock)
export { supabase };
