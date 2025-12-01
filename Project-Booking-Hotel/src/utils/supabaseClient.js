import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// For Vite, use import.meta.env instead of process.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sxteddkozzqniebfstag.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dGVkZGtvenpxbmllYmZzdGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjQwMDgsImV4cCI6MjA3NzQ0MDAwOH0.FYblHTFrNTthvpcdGy6DFefjnApCe4qwcKZaHdkTiac';

// Debug log
console.log('🔐 Supabase URL:', SUPABASE_URL.substring(0, 30) + '...');

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

