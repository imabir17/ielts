import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdemhbxrfaejbzzozecd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZW1oYnhyZmFlamJ6em96ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3Nzc0NDQsImV4cCI6MjEwMjM1MzQ0NH0.FyM69KMh8xhHjpZLVII0a9-r60ydHUXh1qTtWWjqiQ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
