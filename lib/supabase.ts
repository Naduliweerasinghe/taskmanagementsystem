// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Access the environment variables from the .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase client with the URL and key from the environment variables
export const supabase = createClient(supabaseUrl, supabaseKey);
