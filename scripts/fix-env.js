import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

const content = `VITE_GEMINI_API_KEY=AIzaSyB-5ImSJd39nAH6gdy5XIZFl5obOyNd6XQ
VITE_SUPABASE_URL=https://solqffklofxklsxavfuf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_JKwAFMkj9TfopCuj1czcbA_1BpZyVnf`;

fs.writeFileSync(envPath, content, 'utf8');
console.log('.env file updated successfully');
