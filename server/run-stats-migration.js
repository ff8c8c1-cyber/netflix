const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const connectionString = "server=D81AB2F93CA\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

async function runMigration() {
    try {
        console.log('🚀 Starting Character Stats Migration...\n');

        // Read migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', 'add_character_stats_sqlserver.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Migration file loaded:', migrationPath);
        console.log('📊 SQL size:', migrationSQL.length, 'characters\n');

        // Connect to database
        console.log('🔌 Connecting to SQL Server...');
        await sql.connect(connectionString);
        console.log('✅ Connected to TienGioiDB\n');

        // Split by GO statements (SQL Server batch separator)
        const batches = migrationSQL
            .split(/^\s*GO\s*$/gim)
            .map(batch => batch.trim())
            .filter(batch => batch.length > 0);

        console.log(`📦 Found ${batches.length} SQL batches to execute\n`);

        // Execute each batch
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];

            // Skip comments-only batches
            if (batch.startsWith('--') && !batch.includes('\n')) {
                continue;
            }

            try {
                console.log(`⚙️  Executing batch ${i + 1}/${batches.length}...`);
                const result = await sql.query(batch);

                // Show success message if batch has SELECT or PRINT
                if (result.recordset && result.recordset.length > 0) {
                    console.log('   ✓', result.recordset[0]);
                } else {
                    console.log('   ✓ Success');
                }
            } catch (error) {
                // Check if it's a "already exists" error - not critical
                if (error.message.includes('already exists') ||
                    error.message.includes('already an object')) {
                    console.log('   ⚠️  Already exists, skipping...');
                } else {
                    console.error('   ❌ Error:', error.message);
                    throw error;
                }
            }
        }

        console.log('\n✨ Migration completed successfully!\n');

        // Verify installation
        console.log('🔍 Verifying installation...\n');

        // Check columns
        const columnsCheck = await sql.query`
            SELECT TOP 1 MaxHp, CurrentHp, BaseAtk, BaseDef, BaseSpd, BaseCri 
            FROM Users
        `;
        console.log('✅ Stats columns:', columnsCheck.recordset[0]);

        // Check UserBuffs table
        const tableCheck = await sql.query`
            SELECT COUNT(*) as Count FROM UserBuffs
        `;
        console.log('✅ UserBuffs table exists, records:', tableCheck.recordset[0].Count);

        // Check stored procedures
        const spCheck = await sql.query`
            SELECT name FROM sys.procedures 
            WHERE name LIKE 'sp_%Stats%' OR name LIKE 'sp_%Buff%'
            ORDER BY name
        `;
        console.log('✅ Stored procedures created:');
        spCheck.recordset.forEach(sp => {
            console.log('   -', sp.name);
        });

        console.log('\n🎉 All systems ready!\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await sql.close();
        console.log('🔌 Database connection closed');
    }
}

runMigration();
