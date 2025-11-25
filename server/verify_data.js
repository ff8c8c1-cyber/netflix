const { supabase } = require('./supabase');

async function verifyData() {
    console.log('🔍 Verifying Supabase Data Integrity (Round 2)...\n');

    try {
        // 1. Check Row Counts
        const tables = [
            'Users', 'Pets', 'Sects', 'SectMembers',
            'Movies', 'Episodes', 'Comments',
            'Items', 'Inventory', 'SectBuildings'
        ];

        console.log('📊 Table Row Counts:');
        for (const table of tables) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error(`   ❌ ${table}: Error - ${error.message}`);
            } else {
                console.log(`   ✅ ${table}: ${count} rows`);
            }
        }

        console.log('\n----------------------------------------\n');

        // 2. Check Sample Data (Admin User)
        console.log('👤 Sample User (Admin):');
        const { data: user } = await supabase
            .from('Users')
            .select('*')
            .eq('Username', 'admin')
            .maybeSingle();

        if (user) {
            console.log(`   ID: ${user.Id}`);
            console.log(`   Username: ${user.Username}`);
            console.log(`   Stones: ${user.Stones}`);
        } else {
            console.log('   ❌ Admin user not found');
        }

        console.log('\n----------------------------------------\n');

        // 3. Check Sect Data (Simple Fetch)
        console.log('🏰 Sample Sect (No Join):');
        const { data: sectSimple, error: sectError } = await supabase
            .from('Sects')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (sectSimple) {
            console.log(`   Name: ${sectSimple.Name}`);
            console.log(`   LeaderId: ${sectSimple.LeaderId}`);
            console.log(`   Resources: ${sectSimple.Resources}`);

            // Try Join now
            console.log('   (Testing Join...)');
            const { data: sectJoin, error: joinError } = await supabase
                .from('Sects')
                .select('*, Users!LeaderId(Username)')
                .eq('Id', sectSimple.Id)
                .maybeSingle();

            if (sectJoin) {
                console.log(`   ✅ Join Success: Leader Name = ${sectJoin.Users?.Username}`);
            } else {
                console.log(`   ❌ Join Failed: ${joinError?.message}`);
            }

        } else {
            console.log(`   ❌ No sects found! Error: ${sectError?.message}`);
        }

        console.log('\n----------------------------------------\n');

        // 4. Check Inventory / UserItems
        console.log('🎒 Inventory Check:');

        // Try Inventory first
        const { data: inv, error: invError } = await supabase
            .from('Inventory')
            .select('*')
            .limit(1);

        if (!invError) {
            console.log(`   ✅ Inventory table found (${inv.length} rows sample)`);
        } else {
            console.log(`   ❌ Inventory table missing. Checking UserItems...`);
            const { data: userItems, error: uiError } = await supabase
                .from('UserItems')
                .select('*')
                .limit(1);

            if (!uiError) {
                console.log(`   ✅ UserItems table found (${userItems.length} rows sample)`);
            } else {
                console.log(`   ❌ UserItems table also missing: ${uiError.message}`);
            }
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

verifyData();
