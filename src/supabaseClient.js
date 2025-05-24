// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijhtqqptmjovjinguxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamh0cXFwdG1qb3ZqaW5ndXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDE0OTUsImV4cCI6MjA2MzY3NzQ5NX0.I3SPtNBeY-KU7ZwXyW8i5WhXXkpegWSS4a0LSH6PXes';

export const supabase = createClient(supabaseUrl, supabaseKey);
