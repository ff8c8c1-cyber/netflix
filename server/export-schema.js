const { query } = require('./db');

async function exportSchema() {
    try {
        const tablesResult = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = 'TienGioiDB'
        `);

        const tables = tablesResult.recordset.map(r => r.TABLE_NAME);
        const schema = {};

        for (const table of tables) {
            if (table === 'sysdiagrams') continue;

            const columnsResult = await query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${table}'
            `);

            schema[table] = columnsResult.recordset;
        }

        console.log(JSON.stringify(schema, null, 2));
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

exportSchema();
