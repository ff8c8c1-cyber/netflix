const { query } = require('./db');
const fs = require('fs');
const path = require('path');

const run = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../create_sect_missions.sql'), 'utf8');
        const statements = sql.split('GO'); // Basic split, though the file doesn't use GO. 
        // Since the file uses IF NOT EXISTS blocks, we can run it as one or split by semi-colons if needed.
        // But msnodesqlv8 usually handles batches. Let's try running the whole thing or split by END.

        // Actually, let's just run the whole file content as one query if possible, or split by 'END' to separate blocks.
        // The file has multiple blocks. Let's split by 'END' + newline.

        const blocks = sql.split('END');

        for (const block of blocks) {
            if (block.trim()) {
                await query(block + ' END'); // Re-add END
                console.log('Executed block');
            }
        }

        console.log('Mission tables created successfully');
    } catch (err) {
        console.error(err);
    }
};

run();
