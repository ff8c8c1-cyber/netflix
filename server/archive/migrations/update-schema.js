
const sql = require('msnodesqlv8');
const fs = require('fs');
const path = require('path');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const sqlFilePath = path.join(__dirname, '../database_setup.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split by GO to execute batches
const batches = sqlContent.split(/\nGO\r?\n/i).filter(b => b.trim().length > 0);

function executeBatch(batch) {
    return new Promise((resolve, reject) => {
        sql.query(connectionString, batch, (err, rows) => {
            if (err) {
                // Ignore "There is already an object named..." errors for idempotency
                if (err.message && err.message.includes('There is already an object named')) {
                    resolve();
                } else {
                    console.warn('Warning executing batch:', err.message.split('\n')[0]);
                    resolve(); // Continue anyway
                }
            } else {
                resolve();
            }
        });
    });
}

async function run() {
    console.log(`Executing ${batches.length} batches...`);
    for (let i = 0; i < batches.length; i++) {
        try {
            await executeBatch(batches[i]);
            if (i % 5 === 0) console.log(`Processed batch ${i + 1}/${batches.length}`);
        } catch (error) {
            console.error(`Failed at batch ${i + 1}:`, error);
        }
    }
    console.log('Schema update complete.');
}

run();
