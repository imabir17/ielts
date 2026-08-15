import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fdemhbxrfaejbzzozecd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZW1oYnhyZmFlamJ6em96ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3Nzc0NDQsImV4cCI6MjEwMjM1MzQ0NH0.FyM69KMh8xhHjpZLVII0a9-r60ydHUXh1qTtWWjqiQ4'
);

async function patch() {
  const { data, error } = await supabase.from('students').select('*').is('password', null);
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No students found with null password.');
    return;
  }

  console.log(`Found ${data.length} students with null password. Patching...`);

  for (const student of data) {
    const { error: updateError } = await supabase
      .from('students')
      .update({ password: '123' })
      .eq('id', student.id);
      
    if (updateError) {
      console.error(`Failed to patch student ${student.id}:`, updateError);
    } else {
      console.log(`Patched student ${student.id} with password '123'`);
    }
  }
}

patch();
