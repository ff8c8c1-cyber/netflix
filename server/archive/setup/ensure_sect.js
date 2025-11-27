const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSect() {
    try {
        console.log('Checking for Sect 1...');
        const { data, error } = await supabase
            .from('Sects')
            .select('*')
            .eq('Id', 1)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            console.log('Sect 1 not found. Creating default sect...');
            const { error: insertError } = await supabase
                .from('Sects')
                .insert({
                    Id: 1,
                    Name: 'Thanh Vân Môn',
                    Description: 'Tông môn mặc định cho tân thủ',
                    Level: 1,
                    Exp: 0,
                    ContributionPoints: 0
                });

            if (insertError) throw insertError;
            console.log('Default sect created successfully.');
        } else {
            console.log('Sect 1 exists:', data.Name);
        }
    } catch (err) {
        console.error('Error checking sect:', err);
    }
}

checkSect();
