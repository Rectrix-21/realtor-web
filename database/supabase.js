import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcvprmbuggkmnonkeong.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdnBybWJ1Z2drbW5vbmtlb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODQ0MTAsImV4cCI6MjA2Nzc2MDQxMH0.vhKAGTRX21bK2lM9gH4O1FarwFIYz23TVr46QemwTcc';
export const supabase = createClient(supabaseUrl, supabaseKey);
