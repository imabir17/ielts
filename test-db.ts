import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fdemhbxrfaejbzzozecd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZW1oYnhyZmFlamJ6em96ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3Nzc0NDQsImV4cCI6MjEwMjM1MzQ0NH0.FyM69KMh8xhHjpZLVII0a9-r60ydHUXh1qTtWWjqiQ4'
);

async function test() {
  const { data, error } = await supabase
    .from('exam_logs')
    .select('answers, scores')
    .limit(1);
    
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
