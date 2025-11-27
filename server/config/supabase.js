const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://egogmnztjvhgsnlysuyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnb2dtbnp0anZoZ3NubHlzdXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4MzU5MSwiZXhwIjoyMDc5NTU5NTkxfQ.uGXThd4OcONIBy07h91F7iTY1EQxzP5EwPxvX42OdAY';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
