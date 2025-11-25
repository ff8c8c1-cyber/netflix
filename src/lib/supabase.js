import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://egogmnztjvhgsnlysuyw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnb2dtbnp0anZoZ3NubHlzdXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODM1OTEsImV4cCI6MjA3OTU1OTU5MX0.RWVf8wbJhPRBqXnB7dCyBv3cE_Wd-UvWSI3mCPo7F9Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
