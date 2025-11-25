import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// Simple .env parser
const envConfig = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    console.log('Raw .env content length:', envFile.length);
    envFile.split('\n').forEach(line => {
        console.log('Processing line:', line.substring(0, 20) + '...');
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            envConfig[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env file:', e.message);
    process.exit(1);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Try to fetch movies
        console.log('\nFetching movies...');
        const { data: movies, error: moviesError } = await supabase
            .from('movies')
            .select('*')
            .limit(5);

        if (moviesError) {
            console.error('❌ Error fetching movies:', moviesError.message);
            if (moviesError.code === '42501') {
                console.error('   -> This is a PERMISSION DENIED error. Check RLS policies.');
            }
        } else {
            console.log(`✅ Successfully fetched ${movies.length} movies.`);
            if (movies.length > 0) {
                console.log('Sample movie:', movies[0].title);
            } else {
                console.log('⚠️ No movies found in the table.');
            }
        }

        // Try to fetch profiles to check auth/public access
        console.log('\nFetching profiles...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);

        if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError.message);
        } else {
            console.log(`✅ Successfully fetched ${profiles.length} profiles.`);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
